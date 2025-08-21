import express from "express";


import{
createOrderItem,
getOrderItemById,
getOrderItems,
updateOrderItem,
deleteOrderItem

}

from "../Controllers/orderItem.controller.js";  


import { verifyToken } from "../utils/verifyToken.js";


const router=express.Router();


router.post("/", verifyToken, createOrderItem); // Create a new order item
router.get("/", verifyToken, getOrderItems); // Get all order items
router.get("/:id", verifyToken, getOrderItemById); // Get order item by ID
router.put("/:id", verifyToken, updateOrderItem); // Update order item
router.delete("/:id", verifyToken, deleteOrderItem); // Delete order item

    export default router;