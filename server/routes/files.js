const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const File = require("../models/fileModel"); // Assuming you have a File model
const multer = require("multer");
const AWS = require("aws-sdk");
const mongoose = require("mongoose");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", auth, upload.single("file"), async (req, res) => {
  let uploadResult;
  try {
    const { originalname, buffer } = req.file;
    const { name } = req.body;

    if (!buffer) {
      return res.status(400).send({ message: "No file data provided" });
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${originalname}`,
      Body: buffer,
    };

    uploadResult = await s3.upload(params).promise();

    const file = new File({
      name: name,
      data: buffer,
      user: req.user.userId,
      tenant: req.user.tenantId,
      url: uploadResult.Location,
    });

    await file.save();

    res.status(201).send(file);
  } catch (error) {
    console.error("Error uploading file:", error);

    // Cleanup: delete the file from S3 if it was uploaded
    if (uploadResult) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uploadResult.Key || `${Date.now()}-${req.file.originalname}`,
      };
      try {
        await s3.deleteObject(params).promise();
        console.log("File deleted from S3 due to error:", params.Key);
      } catch (s3Error) {
        console.error("Error deleting file from S3 during cleanup:", s3Error);
      }
    }

    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    console.log("User ID:", req.user.userId);
    console.log("Tenant ID:", req.user.tenantId);

    const files = await File.find({
      user: new mongoose.Types.ObjectId(req.user.userId),
      tenant: new mongoose.Types.ObjectId(req.user.tenantId),
    });

    // console.log("Fetched files:", files);
    res.status(200).send(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Delete request for file ID:", req.params.id);

    const file = await File.findById(req.params.id);
    if (!file) {
      console.log("File not found:", req.params.id);
      return res.status(404).send({ message: "File not found" });
    }

    console.log("File found:", file);

    if (!file.url) {
      console.error("File URL is missing");
      return res.status(500).send({ message: "File URL is missing" });
    }

    const s3Key = decodeURIComponent(file.url.split("/").pop());

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    };
    console.log("S3 delete parameters:", params);

    try {
      const deleteResult = await s3.deleteObject(params).promise();
      console.log("S3 delete result:", deleteResult);

      // Check if the file still exists in S3
      try {
        await s3.headObject(params).promise();
        console.error("File still exists in S3 after delete attempt:", s3Key);
        return res
          .status(500)
          .send({ message: "Failed to delete file from S3" });
      } catch (headErr) {
        if (headErr.code !== "NotFound") {
          console.error("Error checking file existence in S3:", headErr);
          return res
            .status(500)
            .send({ message: "Error verifying file deletion" });
        }
      }

      console.log("File deleted from S3:", s3Key);

      // Use deleteOne to remove the file document from MongoDB
      await File.deleteOne({ _id: req.params.id });
      console.log("File removed from database:", req.params.id);

      res.status(200).send({ message: "File deleted" });
    } catch (s3Error) {
      console.error("Error deleting file from S3:", s3Error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:id", auth, upload.single("file"), async (req, res) => {
  let uploadResult;
  try {
    const { name } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    // If a new file is provided, upload it to S3 and delete the old one
    if (req.file) {
      const { originalname, buffer } = req.file;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${Date.now()}-${originalname}`,
        Body: buffer,
      };

      uploadResult = await s3.upload(params).promise();

      // Delete the old file from S3
      const oldS3Key = decodeURIComponent(file.url.split("/").pop());
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: oldS3Key,
      };

      try {
        await s3.deleteObject(deleteParams).promise();
        console.log("Old file deleted from S3:", oldS3Key);
      } catch (s3Error) {
        console.error("Error deleting old file from S3:", s3Error);
      }

      // Update file details
      file.url = uploadResult.Location;
      file.data = buffer;
    }

    file.name = name || file.name;
    await file.save();

    res.status(200).send(file);
  } catch (error) {
    console.error("Error updating file:", error);

    // Cleanup: delete the new file from S3 if there was an error
    if (uploadResult) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uploadResult.Key,
      };
      try {
        await s3.deleteObject(params).promise();
        console.log("New file deleted from S3 during cleanup:", params.Key);
      } catch (s3Error) {
        console.error("Error deleting file from S3 during cleanup:", s3Error);
      }
    }

    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/stats", auth, async (req, res) => {
  console.log("GET /api/files/stats invoked");
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const tenantId = new mongoose.Types.ObjectId(req.user.tenantId);

    console.log(
      "Fetching stats for user ID:",
      userId,
      "and tenant ID:",
      tenantId
    );

    const stats = await File.aggregate([
      { $match: { user: userId, tenant: tenantId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    console.log("Stats fetched:", stats);

    res.status(200).send({ stats });
  } catch (error) {
    console.error("Error fetching stats and recent files:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
