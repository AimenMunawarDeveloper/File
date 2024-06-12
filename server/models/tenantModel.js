const mongoose = require("mongoose");

// Define the schema for tenants
const tenantSchema = new mongoose.Schema({
  // Name of the tenant
  name: {
    type: String,
    required: true,
  },
});

// Create the Tenant model based on the schema
const Tenant = mongoose.model("Tenant", tenantSchema);

// Export the Tenant model
module.exports = Tenant;
