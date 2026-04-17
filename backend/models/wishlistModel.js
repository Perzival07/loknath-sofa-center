import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true },
        dimensions: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const wishlistSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        items: [wishlistItemSchema],
    },
    { timestamps: true }
);

const wishlistModel =
    mongoose.models.wishlist || mongoose.model("wishlist", wishlistSchema);

export default wishlistModel;
