import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
});

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const passwordResetModel =
    mongoose.models.passwordReset ||
    mongoose.model("passwordReset", passwordResetSchema);

export default passwordResetModel;
