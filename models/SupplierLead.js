import mongoose from "mongoose";

const supplierLeadSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    facebookName: { type: String, trim: true },
    facebookPage: { type: String, trim: true },
    district: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    productType: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    source: {
      type: String,
      enum: [
        "manual",
        "google_places",
        "facebook",
        "directory",
        "csv_import",
        "other",
      ],
      default: "manual",
    },
    sourceUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
    leadType: {
      type: String,
      enum: ["supplier", "customer"],
      default: "supplier",
    },
    outreachStatus: {
      type: String,
      enum: ["pending", "messaged", "called", "closed"],
      default: "pending",
    },
    messageSent: { type: Boolean, default: false },
    messageSentAt: { type: Date },
    called: { type: Boolean, default: false },
    calledAt: { type: Date },
    contactAttempts: { type: Number, default: 0, min: 0 },
    contactNote: { type: String, trim: true },
    verifiedStatus: {
      type: String,
      enum: ["unverified", "verified", "invalid"],
      default: "unverified",
    },
    isBlocked: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

supplierLeadSchema.index({ createdBy: 1, district: 1, productType: 1 });
supplierLeadSchema.index({ createdBy: 1, leadType: 1, district: 1 });
supplierLeadSchema.index({ createdBy: 1, businessName: 1 });
supplierLeadSchema.index({ createdBy: 1, whatsappNumber: 1 });

const SupplierLead = mongoose.model("SupplierLead", supplierLeadSchema);

export default SupplierLead;
