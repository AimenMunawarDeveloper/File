// users.js
const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/userModel");
const Tenant = require("../models/tenantModel");
const bcrypt = require("bcrypt");
const { Profile } = require("../models/profileModel");

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    const defaultTenantId = process.env.DEFAULT_TENANT_ID;

    const tenant = await Tenant.findById(defaultTenantId);
    if (!tenant) {
      return res.status(400).send({ message: "Invalid Default Tenant ID." });
    }

    const user = await User.findOne({
      email: req.body.email,
      tenantId: defaultTenantId,
    });
    if (user) {
      return res.status(409).send({
        message: "User with given email already exists for this tenant.",
      });
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await new User({
      ...req.body,
      password: hashPassword,
      tenantId: defaultTenantId,
    }).save();

    // Create default profile for the user
    const { firstName, lastName, email } = req.body;
    const fullName = `${firstName} ${lastName}`;

    const profile = new Profile({
      fullName,
      phoneNumber: "", // Set default or leave empty as needed
      email,
      username: "", // Set default or leave empty as needed
      bio: "", // Set default or leave empty as needed
      photo: "", // Set default or leave empty as needed
      user: newUser._id,
      tenant: defaultTenantId,
    });
    console.log("Creating profile:", profile);

    await profile.save();
    console.log("Created profile:", profile);

    // Fetch the newly created profile and send it in the response
    const newProfile = await Profile.findOne({ user: newUser._id });
    if (!newProfile) {
      return res
        .status(500)
        .send({ message: "Failed to create profile for the user." });
    }

    res.status(201).send({ message: "User created successfully.", profile });
  } catch (error) {
    console.error("Error creating user:", error); // Log the detailed error
    res.status(500).send({ message: "Internal Server Error." });
  }
});

module.exports = router;
