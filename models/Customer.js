import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // manual id
    name: { type: String, required: true, trim: true },
    NIC: {
      type: String,
      required: true,
      unique: true,
      match: [/^(?:[0-9]{9}[VXvx]|[0-9]{12})$/, "Invalid NIC format"],
    },
    address: { type: String, required: true },
    contactNo: { type: String, required: true, match: /^[0-9]{10}$/ },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, _id: false }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
