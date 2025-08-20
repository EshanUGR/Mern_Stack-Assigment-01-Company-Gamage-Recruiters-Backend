import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route.js";
import customerRouter from "./routes/customer.route.js";

import cookieParser from "cookie-parser";
dotenv.config();

const app=express();
app.use(express.json()); // allows to parse incoming requests:req:body
app.use(cookieParser());


app.listen(process.env.PORT,()=>{
console.log(`Server is running on port ${process.env.PORT}`);
})




mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB is connected!!!");
  })
  .catch((err) => {
    console.log(err);
  });






  //auth routes signin and signup
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);