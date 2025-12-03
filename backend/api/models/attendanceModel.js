import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    vendor: {
      type: String,
      enum: ["High Stuff Services Pvt Ltd", "V Secure Services", "L4S Security Services Pvt Ltd", "High Level Security & Labour Suppliers","Om Security Servicers", "SLV Security Services","Enviro Facility"],
      required: true,
    },

    siteName: {
      type: String,
      enum: ["Insignia Park-1", "Insignia Park-2", "Pravasa", "Sukoon", "I-City", "Ambliss","Dlf Phase-1", "Wazirpur", "Hayatpur", "Head Office"],
      required: true,
    },

    department: {
  type: String,
  enum: [
    // TECHNICAL
    "Estate Manager",
    "AFM",
    "Fire & Safety Officier",
    "Shift Engineer",
    "Accountant",
    "Help Desk",
    "Technical Supervisor",
    "MST/ Electrician",
    "Machine Operator",
    "Plumber",
    "Mason",
    "Carpanter",
    "Painter",
    "Fire Technician",
    "Lift Operator",
    "STP Operator",
    "Technical Assistant",

    // SOFT SERVICE
    "HouseKeeping Sup.",
    "Pentry Boy",
    "Housekeeping Boy",
    "Head Gardner",
    "Gardner",

    // SECURITY
    "Security Supervisor",
    "Lady Guard",
    "Guards",
  ],
  required: true,
},

     mainCategory: {
      type: String,
      enum: ["Technical", "Soft Service", "Security"],
      required: true,
    },

    inTime: {
      type: Date,
      required: true,
    },

    outTime: {
      type: Date,
      required: false,
    },

    inPhoto: {
      type: String,  // image URL
      required: true,
    },

    outPhoto: {
      type: String,  // image URL
      required: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HrmsModel",
      required: true,
    },


    extraManpower: {
      type: Boolean,
      default: false,
    },

    extraStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none", 
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HrmsModel",
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HrmsModel",
      default: null,
    },

  },
  { timestamps: true }
);

const HrmsAttendance = mongoose.model("HrmsAttendance", AttendanceSchema);
export default HrmsAttendance;
