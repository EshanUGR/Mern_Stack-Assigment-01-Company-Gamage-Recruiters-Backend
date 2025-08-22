import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
  // 1. Generate JWT with userId
  const token = jwt.sign(
    { userId }, // payload
    process.env.JWT_SECRET, // secret
    { expiresIn: "7d" } // expiry
  );

  // 2. Store in cookie
  res.cookie("access_token", token, {
    httpOnly: true, // frontend JS cannot read cookie (safe)
    secure: process.env.NODE_ENV === "production", // only https in prod
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // available everywhere
  });

  return token;
};
