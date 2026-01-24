import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactNo: { type: String, required: true },
  email: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  businessType: {
    type: String,
    enum: [
      "Concrete Work",
      "Shop",
      "Other"
    ],
    required: true,
  },
  detailsSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Campaign = mongoose.model("Campaign", campaignSchema);
