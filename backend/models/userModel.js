import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    googleId: { type: String, required: false, unique: true, sparse: true }, // For Google OAuth
    cartData: { type: Object, default: {} },
    profile: {
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        phone: { type: String, required: false },
        address: {
            street: { type: String, required: false },
            city: { type: String, required: false },
            state: { type: String, required: false },
            zipcode: { type: String, required: false },
            country: { type: String, required: false },
        },
        defaultDistance: { type: Number, required: false } // Default distance from store in km
    }
},{minimize: false, timestamps: true}); // Enable timestamps for createdAt and updatedAt


const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;