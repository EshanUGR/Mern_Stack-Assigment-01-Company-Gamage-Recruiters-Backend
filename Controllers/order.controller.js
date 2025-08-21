import Order from "../models/Order.js";

import OrderItem from "../models/OrderItem.js";

import Item from "../models/Item.js";

import { errorHandler } from "../utils/error.js";



export const createOrder = async (req, res) => {
  try {
    const { _id, customerId, items, discountAmount } = req.body;

    if (!_id || !customerId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order ID, customer, and items are required" });
    }

    let totalValue = 0;

    // Validate item quantities and calculate totalValue
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

    // Create Order
    const order = await Order.create({
      _id,
      customer: customerId,
      totalValue,
      discountAmount,
      createdBy: req.user.id,
    });

    // Create OrderItems and reduce stock
    for (const i of items) {
      await OrderItem.create({
        _id: i.orderItemId,
        order: order._id,
        item: i.itemId,
        quantity: i.quantity,
        createdBy: req.user.id,
      });

      await Item.findByIdAndUpdate(i.itemId, {
        $inc: { quantity: -i.quantity },
      });
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("createdBy");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// Get order by ID with items
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("createdBy");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderItem.find({ order: order._id })
      .populate("item")
      .populate("createdBy");
    res.json({ order, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params; // Order _id
    const { customerId, discountAmount, status, items } = req.body;

    // Find order created by this user
    const order = await Order.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!order) {
      return next(errorHandler(400, "Order not found or not authorized"));
    }

    // Update main order info
    if (customerId) order.customer = customerId;
    if (discountAmount !== undefined) order.discountAmount = discountAmount;
    if (status) order.status = status;

    // Update order items if provided
    if (items && items.length > 0) {
      for (const i of items) {
        const orderItem = await OrderItem.findOne({
          _id: i.orderItemId,
          order: order._id,
          createdBy: req.user._id,
        });

        if (!orderItem) continue; // skip if not found

        // Validate stock before updating quantity
        const itemData = await Item.findById(i.itemId);
        if (!itemData)
          return next(errorHandler(404, `Item ${i.itemId} not found`));

        if (i.quantity > itemData.quantity + orderItem.quantity)
          return next(
            errorHandler(400, `Not enough stock for ${itemData.name}`)
          );

        // Adjust stock: add back old quantity, subtract new quantity
        const stockChange = orderItem.quantity - i.quantity;
        await Item.findByIdAndUpdate(i.itemId, {
          $inc: { quantity: stockChange },
        });

        // Update order item quantity
        orderItem.quantity = i.quantity;
        await orderItem.save();
      }

      // Recalculate totalValue
      const orderItems = await OrderItem.find({ order: order._id });
      let totalValue = 0;
      for (const oi of orderItems) {
        const itemData = await Item.findById(oi.item);
        totalValue += itemData.price * oi.quantity;
      }
      order.totalValue = totalValue;
    }

    await order.save();

    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete order and its items
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await OrderItem.deleteMany({ order: req.params.id });
    res.json({ message: "Order and its items deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};