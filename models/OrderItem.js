import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    order: {
      type: String,
      ref: "Order",
      required: true,
    },
    item: { type: String, ref: "Item", required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // unit price from item table
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("OrderItem", orderItemSchema);
