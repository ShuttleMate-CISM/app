import express from "express";
import { getAllItems, getItemsByShopId,getAllItemsByCategoryId,getItemById } from "../controllers/itemcontroller.js";

const router = express.Router();

//http://localhost:5000/api/items/
router.get("/", getAllItems); 


//http://localhost:5000/api/items/shop/67bb5c19df773fdb10ffa92d

router.get("/shop/:shopId", getItemsByShopId);
router.get("/category/:categoryId", getAllItemsByCategoryId);
router.get("/:itemId", getItemById);






export default router;
