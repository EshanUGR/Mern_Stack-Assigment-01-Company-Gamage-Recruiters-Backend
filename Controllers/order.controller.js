import Order from "../models/Order.js";

import OrderItem from "../models/OrderItem.js";

import Item from "../models/Item.js";

import { errorHandler } from "../utils/error.js";


// Create Order


export const createOrder = async (req, res) => {
  try {
    const { _id, customerId, items, discountPercent } = req.body;

    if (!_id || !customerId || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order ID, customer, and items are required" });
    }

    let orderItems = [];
    let totalValue = 0;

    // Process each item
    for (const i of items) {
      const itemData = await Item.findById(i.itemId);
      if (!itemData)
        return res.status(404).json({ message: `Item ${i.itemId} not found` });

      if (i.quantity > itemData.quantity)
        return res
          .status(400)
          .json({ message: `Not enough stock for ${itemData.name}` });

      // Calculate total
      totalValue += itemData.price * i.quantity;

      // Push to order items array
      orderItems.push({
        itemId: itemData._id, // store as ObjectId for populate()
        quantity: i.quantity,
        name: itemData.name,
        price: itemData.price,
      });

      // Reduce stock
      await Item.findByIdAndUpdate(i.itemId, {
        $inc: { quantity: -i.quantity },
      });
    }

    // Final amount after discount
    const finalAmount =
      totalValue - (totalValue * (discountPercent || 0)) / 100;

    // Create order
    const order = await Order.create({
      _id,
      customer: customerId,
      items: orderItems,
      totalValue,
      discountPercent,
      finalAmount,
      createdBy: req.user._id,
    });

    // Populate items for response
    const populatedOrder = await Order.findById(order._id)
      .populate("customer")
      .populate("items.itemId")
      .populate("createdBy");

    res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get All Orders
export const getOrders = async (req, res) => {
  try {
    // Fetch orders with customer and createdBy populated
    const orders = await Order.find()
      .populate("customer")
      .populate("createdBy");

    // Map each order to include all its order items in a single array
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItem.find({ order: order._id }).select(
          "itemId itemName quantity price"
        );

        return {
          ...order.toObject(),
          items: orderItems, // all items of this order
        };
      })
    );

    res.status(200).json(ordersWithItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// Get Single Order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("items.itemId")
      .populate("createdBy");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Order (only discountPercent)
export const updateOrder = async (req, res) => {
  try {
    const { discountPercent } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (discountPercent !== undefined) {
      order.discountPercent = discountPercent;
      order.finalAmount =
        order.totalValue - (order.totalValue * discountPercent) / 100;
    }

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restore stock
    for (const i of order.items) {
      await Item.findByIdAndUpdate(i.itemId, {
        $inc: { quantity: i.quantity },
      });
    }

    await order.deleteOne();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
