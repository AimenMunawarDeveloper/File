const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

// Define the schema for users
const userSchema = new mongoose.Schema({
  // First name of the user
  firstName: {
    type: String,
    required: true,
  },
  // Last name of the user
  lastName: {
    type: String,
    required: true,
  },
  // Email of the user
  email: {
    type: String,
    required: true,
  },
  // Password of the user
  password: {
    type: String,
    required: true,
  },
  // Reference to the tenant the user belongs to
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
});

// Method to generate authentication token for the user
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, tenantId: this.tenantId },
    process.env.JWTPRIVATEKEY,
    {
      expiresIn: "7d",
    }
  );
  return token;
};

// Create the User model based on the schema
const User = mongoose.model("User", userSchema);

// Validation function for user data
const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
  });
  return schema.validate(data);
};

// Export the User model and validation function
module.exports = { User, validate };
