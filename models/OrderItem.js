import mongoose from "mongoose";
import Item from "./Item.js"; // Import Item to validate stock

const orderItemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Manual order item ID
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, required: true, min: 1 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // user who added item
    price: { type: Number }, // Price per item at the time of order (copied from Item table)
  },
  { timestamps: true }
);

// Pre-save hook to validate quantity and copy item price
orderItemSchema.pre("save", async function (next) {
  try {
    const itemData = await Item.findById(this.item);
    if (!itemData) return next(new Error("Item not found"));

    if (this.quantity > itemData.quantity) {
      return next(new Error(`Not enough stock for ${itemData.name}`));
    }

    this.price = itemData.price; // Store current price
    next();
  } catch (err) {
    next(err);
  }
});

const OrderItem = mongoose.model("OrderItem", orderItemSchema);
export default OrderItem;
