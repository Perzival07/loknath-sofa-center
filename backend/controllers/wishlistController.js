import mongoose from "mongoose";
import wishlistModel from "../models/wishlistModel.js";
import productModel from "../models/productModel.js";

const expectedDimensionsKey = (product) => {
    if (!product?.dimensions) return null;
    const { length, breadth, height } = product.dimensions;
    return `${length}x${breadth}x${height}`;
};

const getWishlist = async (req, res) => {
    try {
        const { userId } = req.body;
        const wishlist = await wishlistModel.findOne({ userId }).lean();

        if (!wishlist) {
            return res.json({ success: true, wishlist: { items: [] } });
        }

        const populatedItems = await Promise.all(
            wishlist.items.map(async (item) => {
                if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                    return { ...item, product: null };
                }
                const product = await productModel
                    .findById(item.productId)
                    .lean();
                return { ...item, product };
            })
        );

        res.json({ success: true, wishlist: { items: populatedItems } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { userId, productId, dimensions } = req.body;

        if (!productId || !dimensions) {
            return res.json({
                success: false,
                message: "productId and dimensions are required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.json({ success: false, message: "Invalid product" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const expected = expectedDimensionsKey(product);
        if (!expected || dimensions !== expected) {
            return res.json({
                success: false,
                message: "Dimensions do not match this product",
            });
        }

        let wishlist = await wishlistModel.findOne({ userId });
        if (!wishlist) {
            wishlist = new wishlistModel({ userId, items: [] });
        }

        const exists = wishlist.items.some(
            (item) =>
                String(item.productId) === String(productId) &&
                item.dimensions === dimensions
        );

        if (exists) {
            return res.json({
                success: false,
                message: "Item already in wishlist",
            });
        }

        wishlist.items.push({ productId: String(productId), dimensions });
        await wishlist.save();

        res.json({ success: true, message: "Added to wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId, dimensions } = req.body;

        if (!productId || !dimensions) {
            return res.json({
                success: false,
                message: "productId and dimensions are required",
            });
        }

        const wishlist = await wishlistModel.findOne({ userId });
        if (!wishlist) {
            return res.json({ success: false, message: "Wishlist not found" });
        }

        wishlist.items = wishlist.items.filter(
            (item) =>
                !(
                    String(item.productId) === String(productId) &&
                    item.dimensions === dimensions
                )
        );
        await wishlist.save();

        res.json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getWishlist, addToWishlist, removeFromWishlist };
