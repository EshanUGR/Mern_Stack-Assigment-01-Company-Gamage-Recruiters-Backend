import { errorHandler } from "./error.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    let token;

    // ✅ 1. Check if token exists in cookies
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
      console.log("Token from cookies:", token);
    }

    // ✅ 2. Otherwise, check if token exists in Authorization header
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from header:", token);
    }

    // ✅ 3. If no token found
    if (!token) {
      return next(errorHandler(401, "Unauthorized: No token provided"));
    }

    // ✅ 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Attach user info to req.user (so controllers can access it)
    req.user = {
      _id: decoded.userId,
    };

    next();
  } catch (error) {
    console.error("Error in verifyToken:", error);

    if (error.name === "JsonWebTokenError") {
      res.clearCookie("access_token");
      return next(errorHandler(401, "Unauthorized: Invalid token"));
    }

    if (error.name === "TokenExpiredError") {
      res.clearCookie("access_token");
      return next(errorHandler(401, "Unauthorized: Token expired"));
    }

    return next(errorHandler(500, "Server error during token verification"));
  }
};
