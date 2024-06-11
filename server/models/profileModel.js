const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./userModel");
const { Tenant } = require("./tenantModel");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
  },
  bio: {
    type: String,
  },
  photo: {
    type: String,
  },
});

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

const Profile = mongoose.model("Profile", profileSchema);

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
