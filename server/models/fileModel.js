const mongoose = require("mongoose");

// Define the schema for files
const fileSchema = new mongoose.Schema({
  // File name
  name: {
    type: String,
    required: true,
  },
  // File data (binary content)
  data: {
    type: Buffer,
    required: true,
  },
  // Reference to the user who uploaded the file
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Reference to the tenant associated with the file
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  // URL for accessing the file (optional, could be generated dynamically)
  url: {
    type: String,
    required: true,
  },
  // Timestamp for when the file was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the File model based on the schema
const File = mongoose.model("File", fileSchema);

module.exports = File;
