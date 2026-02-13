import express from "express";
import { createVideo ,getVideos,deleteVideo, updateVideo,searchVideos} from "../controllers/videoController.js";

const router = express.Router();

// http://localhost:5000/api/videos/
router.post("/", createVideo);
router.get("/", getVideos);
router.delete("/:id", deleteVideo);
router.put("/video/:id", updateVideo);
router.get('/search', searchVideos);

export default router;