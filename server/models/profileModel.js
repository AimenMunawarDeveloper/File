const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./userModel");
const { Tenant } = require("./tenantModel");

// Define the schema for user profiles
const profileSchema = new mongoose.Schema({
  // Reference to the user associated with the profile
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Reference to the tenant associated with the profile
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  // Full name of the user
  fullName: {
    type: String,
    required: true,
  },
  // Phone number of the user
  phoneNumber: {
    type: String,
  },
  // Email of the user
  email: {
    type: String,
    required: true,
  },
  // Username of the user
  username: {
    type: String,
  },
  // Biography of the user
  bio: {
    type: String,
  },
  // URL or path to the user's profile photo
  photo: {
    type: String,
  },
});

// Middleware to populate fullName and email fields based on associated user
profileSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("user")) {
    const user = await User.findById(this.user);
    if (user) {
      this.fullName = `${user.firstName} ${user.lastName}`;
      this.email = user.email;
    } else {
      throw new Error("User not found");
    }
  }
  next();
});

// Create the Profile model based on the schema
const Profile = mongoose.model("Profile", profileSchema);

// Validation function using Joi
const validateProfile = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().required().label("Full Name"),
    phoneNumber: Joi.string().required().label("Phone Number"),
    email: Joi.string().email().required().label("Email"),
    username: Joi.string().required().label("Username"),
    bio: Joi.string().allow("").label("Bio"),
    photo: Joi.string().allow("").label("Photo"),
  });
  return schema.validate(data);
};

module.exports = { Profile, validateProfile };
