import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import Coachers from '../models/Coach.js';
import { getRegisteredTokens } from "./notificationController.js";
import admin from '../firebase/firebaseAdmin.js';

export const createcoach = async (req, res, next) => {
  const { CoachPhoto, CoachName, Tel, TrainingType, Certifications, Courts, Experiance, hourlyRate } = req.body;

  try {
    // Whitelist and validate required fields
    const allowedFields = ['CoachPhoto', 'CoachName', 'CoachEmail', 'CoachPhone', 'CoachBio', 'CoachExperience'];
    const coachData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        coachData[field] = String(req.body[field]).trim();
      }
    });
    
    // Validate required fields
    if (!coachData.CoachName || !coachData.CoachEmail) {
      return res.status(400).json({ 
        error: "Missing required fields" 
      });
    }
    
    const coach = await Coachers.create(coachData);
    res.status(201).json(coach);
  } catch (error) {
    next(error);
  }
};

//get method
export const getCoachers = async (req, res, next) => {
  try {
    const coachers = await Coachers.find().populate('Courts');;

    const formattedCoache = coachers.map(coach => ({
      ...coach._doc,
    }));

    res.status(200).json({
      success: true,
      coachers: formattedCoache,
    });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coaches" });
    next(error);
  }
};

// Get single coach by ID with populated Courts
export const getSingleCoach = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Coach ID format" });
  }

  try {
    const coach = await Coachers.findById(id).populate('Courts');

    if (!coach) {
      return res.status(404).json({ success: false, message: "Coach not found" });
    }

    res.status(200).json({
      success: true,
      coach,
    });
  } catch (error) {
    console.error("Error fetching coach:", error);
    res.status(500).json({ success: false, message: "Failed to fetch coach" });
    next(error);
  }
};

//Update Coach
export const updateCoach = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updateCoach = await Coachers.findByIdAndUpdate(id, updateData, { new: true });
    if (!updateCoach) {
      return res.status(404).json({ success: false, message: "coach not found" });
    }
    res.status(200).json({ success: true, coach: updateCoach });
  } catch (error) {
    console.error("Error updating coach :", error);
    res.status(500).json({ success: false, message: "Failed to update coach" });
    next(error);
  }
}


//Delete coach
export const deleteCoach = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Coach ID format" });
  }

  try {
    const deletecoach = await Coachers.findByIdAndDelete(new mongoose.Types.ObjectId(id));

    if (!deletecoach) {
      return res.status(404).json({ success: false, message: "Coach not found" });
    }

    res.status(200).json({ success: true, message: "Coach deleted successfully" });
  } catch (error) {
    console.error("Error deleting coach:", error);
    res.status(500).json({ success: false, message: "Failed to delete coach" });
    next(error);
  }
};

export const searchCoachers = async (req, res) => {
  const { search } = req.query;

  try {
    // Sanitize and validate search input
    const search = String(req.query.search || '').trim();
    
    if (search.length > 100) {
      return res.status(400).json({ 
        error: "Search query too long" 
      });
    }
    
    // Escape regex special characters
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const coachers = await Coachers.find({
      CoachName: { $regex: escapedSearch, $options: 'i' }
    });
    
    res.json(coachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};