import express from "express";

import {createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser} from "../controllers/userController.js";

const router = express.Router();

// http://localhost:5000/api/user/
router.post('/', createUser);         
router.get('/', getAllUsers);           
router.get('/:firebaseUid', getUserById);      
router.put('/:firebaseUid', updateUser);     
router.delete('/:id', deleteUser);   



export default router;