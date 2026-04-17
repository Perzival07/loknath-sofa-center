import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        userId: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const refreshTokenModel =
    mongoose.models.refreshToken ||
    mongoose.model("refreshToken", refreshTokenSchema);

export default refreshTokenModel;
