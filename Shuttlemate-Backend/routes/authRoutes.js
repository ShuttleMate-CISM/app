import express from 'express';
import {register, login,getUsers, deleteUser} from '../controllers/authController.js'
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.delete("/delete/:id", deleteUser);


export default router;