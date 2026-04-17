import express from "express";
import { addReview, getProductReviews } from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/product/:productId", getProductReviews);
reviewRouter.post("/add", authUser, addReview);

export default reviewRouter;
