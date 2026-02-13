import express from "express";
import mongoose from "mongoose";
import Matches from "../models/matches.js";
import { getRegisteredTokens } from './notificationController.js';
import admin from '../firebase/firebaseAdmin.js';

const router = express.Router();

// CREATE a new match
export const createMatch = async (req, res, next) => {
  try {
    const newMatch = await Matches.create(req.body);
    
    const tokens = getRegisteredTokens();
    
    if (tokens && tokens.length > 0) {
      const message = {
        notification: {
          title: 'New Match Added!',
          body: `A new match has been scheduled: ${newMatch.title || newMatch.name || 'Check it out!'}`,
        },
        data: {
          screen: 'match', 
          matchId: newMatch._id.toString(), 
          type: 'new_match',
          
        },
      };

      const notifications = tokens.map(async (token) => {
        try {
          return await admin.messaging().send({
            ...message,
            token,
          });
        } catch (error) {
          console.error(`Failed to send notification to token ${token}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(notifications);
      
      const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
      const failed = results.length - successful;
      
      
    } else {
      console.log('No registered tokens found for notifications');
    }

    res.status(201).json({ success: true, match: newMatch });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ success: false, message: "Failed to create match" });
    next(error);
  }
};

// GET all matches
export const getAllMatches = async (req, res, next) => {
  try {
    const matches = await Matches.find();
    res.status(200).json({ success: true, matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ success: false, message: "Failed to fetch matches" });
    next(error);
  }
};

// GET a single match by ID
export const getMatchById = async (req, res, next) => {
  try {
    const match = await Matches.findById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.status(200).json({ success: true, match });
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ success: false, message: "Failed to fetch match" });
    next(error);
  }
};

// UPDATE a match by ID
export const updateMatch = async (req, res, next) => {
  try {
    const match = await Matches.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.status(200).json({ success: true, match });
  } catch (error) {
    console.error("Error updating match:", error);
    res.status(500).json({ success: false, message: "Failed to update match" });
    next(error);
  }
};

// DELETE a match by ID
export const deleteMatch = async (req, res, next) => {
  try {
    const match = await Matches.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.status(200).json({ success: true, message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    res.status(500).json({ success: false, message: "Failed to delete match" });
    next(error);
  }
};

export default router;
