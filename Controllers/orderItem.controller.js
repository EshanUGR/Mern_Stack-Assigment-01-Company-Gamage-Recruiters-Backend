import OrderItem from "../models/OrderItem.js";

import Item from "../models/Item.js";


import { errorHandler } from "../utils/error.js";


// Create a single order item
export const createOrderItem = async (req, res) => {
  try {
    const { _id, orderId, itemId, quantity } = req.body;

    const itemData = await Item.findById(itemId);
    if (!itemData) return res.status(404).json({ message: "Item not found" });
    if (quantity > itemData.quantity) return res.status(400).json({ message: "Not enough stock" });

    const orderItem = await OrderItem.create({
      _id,
      order: orderId,
      item: itemId,
      quantity,
      createdBy: req.user._id,
    });

    await Item.findByIdAndUpdate(itemId, { $inc: { quantity: -quantity } });

    res.status(201).json(orderItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// Get all order items
export const getOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.find()
      .populate("item")
      .populate("order")
      .populate("createdBy");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get order item by ID
export const getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItem.findById(req.params.id)
      .populate("item")
      .populate("order")
      .populate("createdBy");
    if (!item) return res.status(404).json({ message: "Order item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};






export const updateOrderItem = async (req, res, next) => {
  try {
    const { id } = req.params; // OrderItem _id
    const { quantity } = req.body;

    // Find the order item created by this user
    const orderItem = await OrderItem.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!orderItem)
      return next(errorHandler(404, "Order item not found or not authorized"));

    // Validate stock
    const itemData = await Item.findById(orderItem.item);
    if (!itemData) return next(errorHandler(404, "Item not found"));

    if (quantity > itemData.quantity + orderItem.quantity)
      return next(errorHandler(400, `Not enough stock for ${itemData.name}`));

    // Adjust stock: add back old quantity, subtract new quantity
    const stockChange = orderItem.quantity - quantity;
    await Item.findByIdAndUpdate(orderItem.item, {
      $inc: { quantity: stockChange },
    });

    // Update the quantity in OrderItem
    orderItem.quantity = quantity;
    await orderItem.save();

    res
      .status(200)
      .json({ message: "Order item updated successfully", orderItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





// Delete order item
export const deleteOrderItem = async (req, res) => {
  try {
    const item = await OrderItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Order item not found" });
    res.json({ message: "Order item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};