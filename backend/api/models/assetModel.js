import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    /* ---------------- ASSET DETAILS ---------------- */
    assetType: {
      type: String,
      enum: ["Laptop", "Desktop", "Mouse", "Keyboard", "Monitor", "Other"],
      required: true,
    },
    assetName: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    purchaseDate: {
      type: Date,
    },
    condition: {
      type: String,
      enum: ["New", "Good", "Fair", "Poor"],
      default: "New",
    },

    /* ---------------- ASSIGNMENT STATUS ---------------- */
    assetStatus: {
      type: String,
      enum: ["Issued", "Available", "Under Repair", "Retired"],
      default: "Available",
    },
    issuedDate: {
      type: Date,
    },
    returnedDate: {
      type: Date,
    },

    /* ---------------- EMPLOYEE DETAILS ---------------- */
    employeeName: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    department: {
      type: String,
    },
    employeeMobile: {
      type: String,
    },
    employeeEmail: {
      type: String,
    },
    history: [
      {
        employeeName: { type: String },
        employeeId: { type: String },
        department: { type: String },
        employeeMobile: { type: String },
        employeeEmail: { type: String },
        issuedDate: { type: Date },
        returnedDate: { type: Date },
      },
    ],

    /* ---------------- EXTRA TRACKING ---------------- */
    remarks: {
      type: String,
    },
    createdBy: {
      type: String, // Admin / HR name or ID
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.model("Asset", assetSchema);
