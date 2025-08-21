// controllers/orderItem.controller.js
import OrderItem from "../models/OrderItem.js"
import Item from "../models/Item.js";
import { errorHandler } from "../utils/error.js";

// ✅ Create Order Item
export const createOrderItem = async (req, res, next) => {
  try {
    const { order, item, quantity } = req.body;

    if (!order || !item || !quantity) {
      return next(errorHandler(400, "Order, Item, and Quantity are required"));
    }

    // check if item exists
    const itemData = await Item.findById(item);
    if (!itemData) {
      return next(errorHandler(404, "Item not found"));
    }

    const orderItem = await OrderItem.create({
      order,
      item,
      itemName: itemData.name,
      quantity,
      createdBy: req.user._id, // ✅ fix here
    });

    res.status(201).json({
      success: true,
      message: "Order Item created successfully",
      data: orderItem,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get all Order Items
export const getOrderItems = async (req, res, next) => {
  try {
    const orderItems = await OrderItem.find()
      .populate("order")
      .populate("item");

    res.status(200).json({
      success: true,
      data: orderItems,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get Single Order Item
export const getOrderItemById = async (req, res, next) => {
  try {
    const orderItem = await OrderItem.findById(req.params.id)
      .populate("order")
      .populate("item");

    if (!orderItem) {
      return next(errorHandler(404, "Order Item not found"));
    }

    res.status(200).json({
      success: true,
      data: orderItem,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Order Item
// Update Order
export const updateOrderItem = async (req, res) => {
  try {
    const { discountPercent, status, customer, totalValue } = req.body;

    // Find order by ID
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Update only if user provided values, otherwise keep old ones
    order.discountPercent = discountPercent !== undefined ? discountPercent : order.discountPercent;
    order.status = status !== undefined ? status : order.status;
    order.customer = customer !== undefined ? customer : order.customer;
    order.totalValue = totalValue !== undefined ? totalValue : order.totalValue;

    // ✅ Recalculate finalAmount if discountPercent or totalValue is updated
    if (discountPercent !== undefined || totalValue !== undefined) {
      order.finalAmount = order.totalValue - (order.totalValue * order.discountPercent) / 100;
    }

    // Save updated order
    await order.save();

    res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Delete Order Item
export const deleteOrderItem = async (req, res, next) => {
  try {
    const orderItem = await OrderItem.findByIdAndDelete(req.params.id);

    if (!orderItem) {
      return next(errorHandler(404, "Order Item not found"));
    }

    res.status(200).json({
      success: true,
      message: "Order Item deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
