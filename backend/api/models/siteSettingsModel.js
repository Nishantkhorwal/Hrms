import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    enum: ["Insignia Park-1", "Insignia Park-2", "Pravasa", "Sukoon", "I-City", "Ambliss","Dlf Phase-1", "Wazirpur", "Hayatpur", "Head Office"],
    required: true,
    unique: true
  },
  dailyLimit: {
    type: Number,
    required: true,
    default: 0 // 0 = unlimited
  }
}, { timestamps: true });

export default mongoose.model("HrmsSiteSettings", siteSettingsSchema);
