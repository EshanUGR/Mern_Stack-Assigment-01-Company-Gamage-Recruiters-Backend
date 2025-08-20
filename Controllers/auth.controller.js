import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const signup = async (req, res, next) => {
  try {
    const {name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
      return next(errorHandler(400, "All details are required"));
    }

    // Check if the user already exists
    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      return next(errorHandler(400, "User already exists"));
    }

    // Hash the password
    const hashedPassword = bcryptjs.hashSync(password, 10);

    let newUser = new User({
      name,
      email,
      password: hashedPassword,
     
    });

    // Save user to the database
    await newUser.save();

    // Generate JWT token and set cookie
    const restToken = generateTokenAndSetCookie(res, newUser._id);
res.status(201).json({
  success: true,
  message: "User created successfully!",
  userId: newUser._id,
});
  } catch (error) {
    console.error("Signup Error:", error);

    // If Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ errors });
    }

    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const validUser = await User.findOne({ email: email });
    if (!validUser) return next(errorHandler(404, "User not found!"));

    // Compare passwords
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));

    // Generate JWT token
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Optional: Add expiration time for security
    });

    // Exclude password from the response
    const { password: pass, ...rest } = validUser.toObject();

    // Send the token as an HTTP-only cookie and respond with user data
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Must be true in production (HTTPS required)
        sameSite: "strict", // Protects against CSRF
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};
