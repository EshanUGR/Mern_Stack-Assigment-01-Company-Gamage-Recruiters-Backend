import Order from "../models/Order.js";

import OrderItem from "../models/OrderItem.js";

import Item from "../models/Item.js";

import { errorHandler } from "../utils/error.js";

export const createOrder = async (req, res) => {
  try {
    const { _id, customerId, items, discountPercent } = req.body;

    if (!_id || !customerId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order ID, customer, and items are required" });
    }

    let totalValue = 0;

    // Calculate total value from quantity × item price
    for (const i of items) {
      const itemData = await Item.findById(i.itemId);
      if (!itemData)
        return res.status(404).json({ message: `Item ${i.itemId} not found` });

      if (i.quantity > itemData.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${itemData.name}` });

      totalValue += itemData.price * i.quantity;
    }

    // Calculate final amount after discount
    const finalAmount =
      totalValue - (totalValue * (discountPercent || 0)) / 100;

    // Create Order
    const order = await Order.create({
      _id,
      customer: customerId,
      totalValue,
      discountPercent,
      finalAmount,
      createdBy: req.user._id,
    });

    // Create order items
    for (const i of items) {
      const itemData = await Item.findById(i.itemId);
      await OrderItem.create({
        order: order._id,
        item: i.itemId,
        itemName: itemData.name,
        quantity: i.quantity,
        price: itemData.price,
        createdBy: req.user._id,
      });

      // Optional: reduce stock
      await Item.findByIdAndUpdate(i.itemId, {
        $inc: { quantity: -i.quantity },
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// Get all orders
// GET ALL ORDERS
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("createdBy");
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get order by ID with items

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("createdBy");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderItems = await OrderItem.find({ order: order._id }).populate(
      "item"
    );
    res.status(200).json({ order, orderItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { discountPercent } = req.body; // Only get discountPercent from user
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update discountPercent only if provided
    if (discountPercent !== undefined) {
      order.discountPercent = discountPercent;
      // Recalculate finalAmount
      order.finalAmount =
        order.totalValue - (order.totalValue * discountPercent) / 100;
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order and its items
// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Delete all order items
    await OrderItem.deleteMany({ order: order._id });

    // Restore stock
    const orderItems = await OrderItem.find({ order: order._id });
    for (const i of orderItems) {
      await Item.findByIdAndUpdate(i.item, { $inc: { quantity: i.quantity } });
    }

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
