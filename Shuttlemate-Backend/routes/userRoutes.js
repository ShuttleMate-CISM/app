// routes/protectedRoutes.js
import express from "express";
import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/admin", (req, res) => {
    res.json({ message: "Welcome Admin" });
});

router.get("/coach", verifyToken, checkRole("coach"), (req, res) => {
    res.json({ message: "Welcome Coach" });
});

router.get("/courtowner", verifyToken, checkRole("courtowner"), (req, res) => {
    res.json({ message: "Welcome Court Owner" });
});

router.get("/shopowner", verifyToken, checkRole("shopowner"), (req, res) => {
    res.json({ message: "Welcome Shop Owner" });
});

export default router;
