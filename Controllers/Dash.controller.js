// controllers/dashboard.controller.js
import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Item from "../models/Item.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalItems = await Item.countDocuments();

    res.status(200).json({
      totalOrders,
      totalCustomers,
      totalItems,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

