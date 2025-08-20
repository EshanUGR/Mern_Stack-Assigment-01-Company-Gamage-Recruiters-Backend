import express from "express";
import { createCustomer,getCustomers,updateCustomer,deleteCustomer } from "../Controllers/customer.controller.js";
import { verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

router.post("/", verifyToken,createCustomer);
router.get("/",verifyToken ,getCustomers);
router.put("/:id",verifyToken ,updateCustomer);
router.delete("/:id", verifyToken, deleteCustomer);

export default router;