import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";
import customerRouter from "./routes/customer.route.js";
import itemRouter from "./routes/item.route.js";
import orderRouter from "./routes/order.route.js";
import orderItemRouter from "./routes/orderItem.route.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import { verifyToken } from "./utils/verifyToken.js";
import dashRouter from "./routes/dash.route.js";

dotenv.config();

const app = express();

// CORS configuration - fixed the typo and formatting
app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // Fixed typo: ethods → methods
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // allows to parse incoming requests:req:body
app.use(cookieParser());


// Add debugging middleware here - after other middleware but before routes
app.use((req, res, next) => {
  console.log('=== Request Details ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Cookies:', req.cookies);
  console.log('Auth Header:', req.headers.authorization);
  console.log('=======================');
  next();
});


  app.get("/api/validate-token", verifyToken, (req, res) => {
    res.json({
      valid: true,
      user: req.user,
      message: "Token is valid",
    });
  });

  app.get("/api/debug-token", (req, res) => {
    const token = req.cookies.access_token;

    if (!token) {
      return res.json({ error: "No token found" });
    }

    // Add this to your server file, after your middleware but before your routes
    app.get("/api/test-verify", verifyToken, (req, res) => {
      res.json({
        success: true,
        message: "Token verification successful!",
        user: req.user,
      });
    });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        token: token,
        decoded: decoded,
        valid: true,
      });
    } catch (error) {
      res.json({
        token: token,
        error: error.message,
        valid: false,
      });
    }
  });
// Server listening
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected!!!");
  })
  .catch((err) => {
    console.log(err);
  });

// Route handlers
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/items", itemRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-items", orderItemRouter);
app.use("/api/dashboard", dashRouter);
