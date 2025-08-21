import express from "express";

import { createItem,getItems,updateItem,deleteItem } from "../Controllers/Item.controller.js";

import { verifyToken } from "../utils/verifyToken.js";

const router=express.Router();

router.post("/", verifyToken, createItem);
router.get("/", verifyToken, getItems);
router.put("/:id", verifyToken, updateItem);
router.delete("/:id", verifyToken, deleteItem);

export default router;
