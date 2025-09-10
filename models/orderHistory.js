import mongoose from "mongoose";

const orderHistorySchema = new mongoose.Schema(
  {
    originalOrderId: { type: String, required: true }, // link to original order
    orderDate: { type: Date, required: true },

    customerId: {
      type: String,
      ref: "Customer",
      required: true,
    },
    customerName: { type: String, required: true }, // snapshot name

    items: [
      {
        itemId: {
          type: String,
          ref: "Item",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }, // snapshot price
      },
    ],
    totalValue: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: { type: Date, default: Date.now }, // when archived
  },
  { timestamps: true }
);

export default mongoose.model("OrderHistory", orderHistorySchema);
