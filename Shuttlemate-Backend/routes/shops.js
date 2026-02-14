import express from "express";
import { 
  createShop, 
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  addCategoryToShop,
  addItemToCategory,
  removeItemFromShop,
  searchItems,
} from "../controllers/shopController.js";

const router = express.Router();

//http://localhost:5000/api/shops/
// Shop routes
router.get("/search", searchItems); // Search with NoSQL injection prevention
router.post("/", createShop);
router.get("/", getAllShops);
router.get("/shop/:id", getShopById);
router.put("/shop/:id", updateShop);
router.delete("/shop/:id", deleteShop);

// Category routes within a shop
router.post("/:id/categories", addCategoryToShop);

// Item routes within a shop and category
//http://localhost:5000/api/shops/shop/67b9fde6db167a4d865c7b4b/categories/64b8ef99c5e9c1d234567890/items
router.post("/shop/:id/categories/:categoryId/items", addItemToCategory);

//http://localhost:5000/api/shops/67b9fde6db167a4d865c7b4b/items/67b9fde6db167a4d865c7b4e
router.delete("/:id/items/:itemId", removeItemFromShop);


export default router;
