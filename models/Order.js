import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Manual order ID
    orderDate: { type: Date, default: Date.now },
    customer: {
      type: String,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        itemId: {
          type: String,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }, // price at time of order
      },
    ],
    totalValue: { type: Number, required: true }, // calculated from order items
    discountPercent: { type: Number, default: 0 }, // percentage entered by shop owner
    finalAmount: { type: Number, required: true }, // calculated total - discount
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
