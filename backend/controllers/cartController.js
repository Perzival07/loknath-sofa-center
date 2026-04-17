import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

const totalQtyForProductInCart = (cartData, itemId) => {
    const byDim = cartData[itemId];
    if (!byDim) return 0;
    return Object.values(byDim).reduce((sum, n) => sum + (Number(n) || 0), 0);
};

// add products to user cart
const addToCart = async (req, res) => {
    try {
        const { userId, itemId, dimensions } = req.body;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        let cartData = userData.cartData || {};
        const currentTotal = totalQtyForProductInCart(cartData, itemId);
        const available = product.stock ?? 0;
        if (currentTotal + 1 > available) {
            return res.json({
                success: false,
                message: available <= 0 ? "This product is out of stock" : `Only ${available} item(s) in stock`,
            });
        }

        if (cartData[itemId]) {
            if (cartData[itemId][dimensions]) {
                cartData[itemId][dimensions] += 1;
            } else {
                cartData[itemId][dimensions] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][dimensions] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Item added to cart successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}









// update user cart
const updateCart = async (req, res) => {
    try {

        const { userId, itemId, dimensions, quantity } = req.body; // dimensions is a string like "LxBxH"

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        let cartData = userData.cartData || {};

        // Validate that itemId exists in cart
        if (!cartData[itemId]) {
            return res.json({ success: false, message: "Item not found in cart" });
        }

        // If quantity is 0 or less, remove the item
        if (quantity <= 0) {
            delete cartData[itemId][dimensions];
            // If no dimensions left for this item, remove the item entirely
            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            const product = await productModel.findById(itemId);
            if (!product) {
                return res.json({ success: false, message: "Product not found" });
            }
            let newTotal = 0;
            for (const dim of Object.keys(cartData[itemId])) {
                if (dim === dimensions) {
                    newTotal += quantity;
                } else {
                    newTotal += cartData[itemId][dim] || 0;
                }
            }
            const available = product.stock ?? 0;
            if (newTotal > available) {
                return res.json({
                    success: false,
                    message: `Only ${available} item(s) in stock for this product`,
                });
            }
            cartData[itemId][dimensions] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}






// get user cart data
const getUserCart = async (req, res) => {
    try {
        const { userId } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        res.json({ success: true, cartData });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}



export { addToCart, updateCart, getUserCart };
