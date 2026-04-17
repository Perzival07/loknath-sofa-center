import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/userModel.js';
import refreshTokenModel from '../models/refreshTokenModel.js';
import passwordResetModel from '../models/passwordResetModel.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Initialize Google OAuth client (only if GOOGLE_CLIENT_ID is provided)
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}


const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const signAccessToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

const persistRefreshSession = async (userId) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        console.warn('JWT_REFRESH_SECRET is not set; refresh tokens are disabled.');
        return { refreshToken: null };
    }
    const uid = String(userId);
    const refreshToken = jwt.sign({ id: uid }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES,
    });
    const expiresAt = new Date(Date.now() + REFRESH_MS);
    await refreshTokenModel.deleteMany({ userId: uid });
    await refreshTokenModel.create({ token: refreshToken, userId: uid, expiresAt });
    return { refreshToken };
};

const issueAuthResponse = async (userId) => {
    const token = signAccessToken(userId);
    const { refreshToken } = await persistRefreshSession(userId);
    return { token, refreshToken };
};



// Route for user login
const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        // Check if user exists or not
        if (!user) {
            return res.status(401).json({ success: false, message: 'User does not exist' });
        }

        // Check if user has a password (OAuth users don't have passwords)
        if (!user.password) {
            return res.status(401).json({ success: false, message: 'This account uses Google sign-in. Please use Google to login.' });
        }

        const isMatch = await bcryptjs.compare(password, user.password);


        // if password is matched
        if (isMatch) {
            const { token, refreshToken } = await issueAuthResponse(user._id);
            res.json({
                success: true,
                token,
                ...(refreshToken ? { refreshToken } : {}),
            });
        }

        // if password is not matched
        else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }

}


// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists or not

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: 'User already exists' });
        }

        // Hashing password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);


        // Creating new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();

        const { token, refreshToken } = await issueAuthResponse(user._id);

        res.json({
            success: true,
            token,
            ...(refreshToken ? { refreshToken } : {}),
        });



    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}




// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!process.env.ADMIN_JWT_SECRET) {
            console.error("ADMIN_JWT_SECRET is not set");
            return res.status(503).json({ success: false, message: "Server configuration error" });
        }
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                {
                    admin: true,
                    email: process.env.ADMIN_EMAIL,
                    iat: Math.floor(Date.now() / 1000),
                },
                process.env.ADMIN_JWT_SECRET,
                { expiresIn: "24h" }
            );
            res.json({ success: true, token });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Route for Google OAuth authentication
const googleAuth = async (req, res) => {
    try {
        if (!googleClient) {
            return res.json({ success: false, message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.' });
        }

        const { tokenId } = req.body;

        if (!tokenId) {
            return res.json({ success: false, message: 'Google token is required' });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        if (!email) {
            return res.json({ success: false, message: 'Email not provided by Google' });
        }

        // Check if user already exists
        let user = await userModel.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId, update it
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            const { token, refreshToken } = await issueAuthResponse(user._id);
            return res.json({
                success: true,
                token,
                ...(refreshToken ? { refreshToken } : {}),
                user: { name: user.name, email: user.email },
            });
        } else {
            // Create new user with Google account
            const newUser = new userModel({
                name: name || email.split('@')[0],
                email,
                googleId,
                password: '', // No password for OAuth users
            });

            user = await newUser.save();
            const { token, refreshToken } = await issueAuthResponse(user._id);
            return res.json({
                success: true,
                token,
                ...(refreshToken ? { refreshToken } : {}),
                user: { name: user.name, email: user.email },
            });
        }

    } catch (error) {
        console.log('Google Auth Error:', error);
        res.json({ success: false, message: 'Google authentication failed: ' + error.message });
    }
}

// Route to get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select('-password -googleId');
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, profile } = req.body;

        // Build update object
        const updateData = { profile: profile };
        
        // Update name if firstName and lastName are provided
        if (profile.firstName && profile.lastName) {
            updateData.name = `${profile.firstName} ${profile.lastName}`;
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password -googleId');

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to get all customers (admin only)
const getAllCustomers = async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get all users, excluding password and googleId
        const customers = await userModel.find({})
            .select('-password -googleId -cartData')
            .sort({ createdAt: -1 }); // Sort by creation date (newest first)

        res.json({ success: true, customers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route to remove a customer (admin only)
const removeCustomer = async (req, res) => {
    try {
        const { customerId } = req.body;

        if (!customerId) {
            return res.json({ success: false, message: "Customer ID is required" });
        }

        const customer = await userModel.findByIdAndDelete(customerId);

        if (!customer) {
            return res.json({ success: false, message: "Customer not found" });
        }

        await refreshTokenModel.deleteMany({ userId: String(customerId) });

        res.json({ success: true, message: "Customer removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                success: true,
                message:
                    "If an account exists for this email, you will receive a password reset link shortly.",
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await passwordResetModel.deleteMany({ userId: String(user._id) });
        await passwordResetModel.create({
            userId: String(user._id),
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        });

        const base =
            process.env.FRONTEND_URL ||
            (process.env.NODE_ENV !== 'production' ? 'http://localhost:5173' : '');
        if (!base) {
            return res.status(503).json({
                success: false,
                message: 'FRONTEND_URL is not configured on the server',
            });
        }

        const resetLink = `${base.replace(/\/$/, '')}/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, user.name, resetLink);

        res.json({
            success: true,
            message:
                'If an account exists for this email, you will receive a password reset link shortly.',
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const resetEntry = await passwordResetModel.findOne({ token });
        if (!resetEntry || resetEntry.expiresAt < new Date()) {
            return res.json({ success: false, message: 'Invalid or expired token' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        await userModel.findByIdAndUpdate(resetEntry.userId, { password: hashedPassword });
        await passwordResetModel.findByIdAndDelete(resetEntry._id);

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }
        if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_SECRET) {
            return res.status(503).json({ success: false, message: 'Server configuration error' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        const stored = await refreshTokenModel.findOne({
            token: refreshToken,
            userId: String(decoded.id),
        });
        if (!stored) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const token = signAccessToken(decoded.id);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    adminLogin,
    googleAuth,
    getUserProfile,
    updateUserProfile,
    getAllCustomers,
    removeCustomer,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
};
