import mongoose from "mongoose";
import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.json({ success: false, message: "Invalid product" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const r = Number(rating);
        if (!Number.isInteger(r) || r < 1 || r > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const text = String(comment || "").trim();
        if (text.length < 3) {
            return res.json({ success: false, message: "Comment is too short" });
        }

        const user = await userModel.findById(userId).select("name");
        const userName = user?.name?.trim() || "Customer";

        const existing = await reviewModel.findOne({
            productId: String(productId),
            userId: String(userId),
        });
        if (existing) {
            return res.json({
                success: false,
                message: "You have already reviewed this product",
            });
        }

        await reviewModel.create({
            productId: String(productId),
            userId: String(userId),
            userName,
            rating: r,
            comment: text,
        });

        res.json({ success: true, message: "Review added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.json({ success: false, message: "Invalid product" });
        }

        const reviews = await reviewModel
            .find({ productId: String(productId) })
            .sort({ createdAt: -1 })
            .lean();

        const total = reviews.length;
        const avgRating =
            total === 0
                ? 0
                : reviews.reduce((sum, doc) => sum + doc.rating, 0) / total;

        res.json({
            success: true,
            reviews,
            avgRating: Math.round(avgRating * 10) / 10,
            total,
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addReview, getProductReviews };
