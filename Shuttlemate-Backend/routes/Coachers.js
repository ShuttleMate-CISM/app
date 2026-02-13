import express from "express";
import {   createcoach, 
    getCoachers, 
    updateCoach, 
    deleteCoach,
    getSingleCoach,
    searchCoachers} from "../controllers/CoachersController.js";

const router = express.Router();

// http://localhost:5000/api/Coachers/


router.post('/', createcoach);
router.get('/', getCoachers);
router.get('/search', searchCoachers);
router.get('/:id', getSingleCoach);
router.put('/:id', updateCoach);
router.delete('/coach/:id', deleteCoach);





export default router;

