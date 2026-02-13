import express from "express";

import { createMatch, deleteMatch, getAllMatches,updateMatch } from "../controllers/MatchesController.js";

const router = express.Router();

// http://localhost:5000/api/matches/
router.post("/", createMatch);
router.get("/", getAllMatches);
router.delete("/:id",deleteMatch);
router.put("/match/:id", updateMatch);

export default router;