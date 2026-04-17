import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Array, required: true },
    category:{ type: String, required: true },
    subCategory:{ type: String, required: true},
    dimensions:{ 
        length: { type: Number, required: true },
        breadth: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    bestseller:{ type: Boolean, default: false },
    date:{ type: Date, required: true },
    stock: { type: Number, default: 0, min: 0 },
});

const productModel = mongoose.models.product || mongoose.model('product', productSchema); 

export default productModel;