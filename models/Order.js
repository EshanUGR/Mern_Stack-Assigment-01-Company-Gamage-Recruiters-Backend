import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Manual order ID
    orderDate: { type: Date, default: Date.now },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    totalValue: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // user who created the order
    notes: { type: String }, // Optional notes for order
  },
  { timestamps: true }
);

// Pre-save hook to ensure finalAmount is always correct
orderSchema.pre("save", function (next) {
  this.finalAmount = this.totalValue - (this.discountAmount || 0);
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
