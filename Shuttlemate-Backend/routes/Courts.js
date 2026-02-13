import express from "express";

import { createcourt, deleteCourt, getCourts,UpdateCourt } from "../controllers/CourtsController.js";

const router = express.Router();

// http://localhost:5000/api/courts/
router.post("/", createcourt);
router.get("/", getCourts);
router.delete("/:id",deleteCourt);
router.put("/court/:id", UpdateCourt);

export default router;