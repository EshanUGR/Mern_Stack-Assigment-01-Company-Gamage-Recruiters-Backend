import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // manual item id
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to the user who created the item
      required: true,
    },
  },
  { timestamps: true, _id: false } // disable default ObjectId
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
