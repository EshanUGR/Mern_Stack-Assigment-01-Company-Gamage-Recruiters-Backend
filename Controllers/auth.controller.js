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
    // 1. Check if user exists
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found!"));

    // 2. Validate password
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));

    // 3. Generate JWT token
    const token = jwt.sign(
      { userId: validUser._id.toString() }, // always store string
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 4. Remove password from user object
    const { password: pass, ...rest } = validUser.toObject();

    // 5. Set token in cookie + return user
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only https in prod
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 60 * 60 * 1000, // 1h in ms
        path: "/", // cookie is valid for all routes
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: rest, // return safe user data
      });
  } catch (error) {
    console.error("Signin error:", error);
    next(error);
  }
};



export const checkAuth = async (req, res, next) => {
  try {
    console.log("Checking auth for user:", req.user);
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log("User not found");
      return next(errorHandler(401, "User not authenticated"));
    }

    console.log("User found:", user);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error checking auth:", error);
    return next(
      errorHandler(500, "Server error while checking authentication")
    );
  }
};
