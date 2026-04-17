import express from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlistController.js";
import authUser from "../middleware/auth.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/get", authUser, getWishlist);
wishlistRouter.post("/add", authUser, addToWishlist);
wishlistRouter.post("/remove", authUser, removeFromWishlist);

export default wishlistRouter;
