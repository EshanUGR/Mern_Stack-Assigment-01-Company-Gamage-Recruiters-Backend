// routes/dashboard.routes.js
import express from "express";
import { getDashboardStats } from "../Controllers/Dash.controller.js";
import { verifyToken } from "../utils/verifyToken.js";
const router = express.Router();

router.get("/counts", verifyToken, getDashboardStats);

export default router;
