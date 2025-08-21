import express from "express";

import{
createOrder,
getOrders,
getOrderById,
updateOrder,
deleteOrder
}
from "../Controllers/order.controller.js"


import {verifyToken} from "../utils/verifyToken.js";


const router=express.Router();

router.post("/", verifyToken, createOrder); 
router.get("/", verifyToken, getOrders); 
router.get("/:id", verifyToken, getOrderById); 
router.put("/:id", verifyToken, updateOrder); // Update order
router.delete("/:id", verifyToken, deleteOrder); // Delete order

export default router;
