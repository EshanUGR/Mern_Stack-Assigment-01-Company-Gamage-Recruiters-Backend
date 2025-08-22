import express from "express";
import { signin, signup ,checkAuth} from "../Controllers/auth.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();
router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup);
router.post("/signin", signin);


export default router;
