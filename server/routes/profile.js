const express = require("express");
const router = express.Router();
const { Profile, validateProfile } = require("../models/profileModel");
const auth = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("../service/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const mongoose = require("mongoose");
const { User } = require("../models/userModel");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_photos",
    format: async (req, file) => "png",
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage: storage });

router.get("/", auth, async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.user.userId);
    console.log("Fetching profile for tenant:", req.user.tenantId);

    const profile = await Profile.findOne({
      user: req.user.userId,
      tenant: req.user.tenantId,
    });

    console.log("Found profile:", profile);

    if (!profile) {
      console.log("Profile not found");
      return res.status(404).send("Profile not found");
    }

    res.send(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/", auth, upload.single("photo"), async (req, res) => {
  try {
    console.log("Creating/updating profile for user:", req.user.userId);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const { error } = validateProfile(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message);
      return res.status(400).send(error.details[0].message);
    }

    let profile = await Profile.findOne({ user: req.user.userId });
    console.log("Existing profile:", profile);

    const user = await User.findById(req.user.userId);
    console.log("User:", user);

    if (!user) {
      console.log("User not found");
      return res.status(404).send("User not found");
    }

    if (req.file) {
      console.log("File uploaded:", req.file);
      req.body.photo = req.file.path;
    }

    if (profile) {
      console.log("Updating existing profile");

      const updatedFields = req.body.fullName
        ? { ...req.body, fullName: req.body.fullName }
        : req.body;

      profile = await Profile.findByIdAndUpdate(
        profile._id,
        {
          ...updatedFields,
          email: user.email,
          tenant: req.user.tenantId,
        },
        { new: true }
      );
    } else {
      console.log("Creating new profile");

      profile = new Profile({
        ...req.body,
        user: req.user.userId,
        email: user.email,
        tenant: req.user.tenantId,
      });
      await profile.save();
    }

    console.log("Updated profile:", profile);
    res.send(profile);
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
