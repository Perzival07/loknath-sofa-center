import express from 'express';
import { loginUser, registerUser, adminLogin, googleAuth, getUserProfile, updateUserProfile, getAllCustomers, removeCustomer, refreshAccessToken, forgotPassword, resetPassword } from '../controllers/userController.js';    
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../middleware/validation.js';

const userRouter = express.Router();

userRouter.post('/register', validateRegister, registerUser); // Route for user registration
userRouter.post('/login', loginLimiter, validateLogin, loginUser); // Route for user login
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/forgot-password', validateForgotPassword, forgotPassword);
userRouter.post('/reset-password', validateResetPassword, resetPassword);
userRouter.post('/admin', loginLimiter, adminLogin); // Route for admin login
userRouter.post('/google-auth', googleAuth); // Route for Google OAuth authentication
userRouter.post('/profile', authUser, getUserProfile); // Route to get user profile
userRouter.post('/update-profile', authUser, updateUserProfile); // Route to update user profile
userRouter.post('/customers', adminAuth, getAllCustomers); // Route to get all customers (admin only)
userRouter.post('/remove-customer', adminAuth, removeCustomer); // Route to remove a customer (admin only)

export default userRouter;
