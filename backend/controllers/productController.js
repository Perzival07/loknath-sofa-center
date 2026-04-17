import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';
import mongoose from 'mongoose';



// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, length, breadth, height, bestseller } = req.body;

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];
        const image5 = req.files.image5 && req.files.image5[0];
        const image6 = req.files.image6 && req.files.image6[0];
        const image7 = req.files.image7 && req.files.image7[0];
        const image8 = req.files.image8 && req.files.image8[0];
        const image9 = req.files.image9 && req.files.image9[0];
        const image10 = req.files.image10 && req.files.image10[0];

        const images = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10].filter((item) => item !== undefined);

        // Validate at least one image is uploaded
        if (images.length === 0) {
            return res.json({ success: false, message: "Please upload at least one image" });
        }

        console.log("Filtered images:", images);

        let imagesUrl = await Promise.all(

            images.map(async (item) => {
                const dataUri = `data:${item.mimetype};base64,${item.buffer.toString("base64")}`;
                const result = await cloudinary.uploader.upload(dataUri, { resource_type: "image" });
                return result.secure_url;
            })
        )

        console.log(name, description, price, category, subCategory, length, breadth, height, bestseller);
        console.log(imagesUrl);

        const numLength = Number(length);
        const numBreadth = Number(breadth);
        const numHeight = Number(height);

        const stockRaw = Number(req.body.stock);
        const stockNum = Number.isFinite(stockRaw) ? Math.max(0, Math.floor(stockRaw)) : 0;

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            dimensions: {
                length: numLength,
                breadth: numBreadth,
                height: numHeight
            },
            image: imagesUrl,
            date: Date.now(),
            stock: stockNum,
        }

        console.log(productData);
        const product = new productModel(productData);
        await product.save();

        res.json({ success: true, message: "Product added successfully" });


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}





// function for list product (paginated)
const listProducts = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: false,
                message: "Database connection not available. Please wait and try again.",
            });
        }

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitRaw) && limitRaw > 0
            ? Math.min(limitRaw, 100)
            : 20;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.subCategory) filter.subCategory = req.query.subCategory;

        const [products, totalProducts] = await Promise.all([
            productModel
                .find(filter)
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit)
                .maxTimeMS(5000)
                .lean(),
            productModel.countDocuments(filter, { maxTimeMS: 5000 }),
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit) || 1,
                totalProducts,
                limit,
            },
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message || "Failed to fetch products. Please check database connection.",
        });
    }
};





// function for removing product 
const removeProduct = async (req, res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Product Removed Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}




// function for single product info
const singleProduct = async (req, res) => {

    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId);
        res.json({ success: true, product });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    } 
}



// function to update bestseller status
const updateBestseller = async (req, res) => {
    try {
        const { id, bestseller } = req.body;

        if (!id) {
            return res.json({ success: false, message: "Product ID is required" });
        }

        const product = await productModel.findByIdAndUpdate(
            id,
            { bestseller: bestseller === true || bestseller === "true" },
            { new: true }
        );

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ 
            success: true, 
            message: `Product ${bestseller === true || bestseller === "true" ? "marked as" : "removed from"} bestseller`,
            product 
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateBestseller };
