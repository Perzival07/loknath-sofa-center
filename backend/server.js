import 'dotenv/config';
import { installProductionConsole, log } from './utils/logger.js';
import { validateEnv } from './config/validateEnv.js';

installProductionConsole();
validateEnv();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import wishlistRouter from './routes/wishlistRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import deliveryRouter from './routes/deliveryRoute.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use((req, res, next) => {
    if (
        process.env.NODE_ENV === 'production' &&
        req.headers['x-forwarded-proto'] !== 'https'
    ) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
});

const connectSrc = [
    "'self'",
    'https://api.stripe.com',
    'https://r.stripe.com',
    'https://checkout.razorpay.com',
    'https://api.razorpay.com',
    process.env.BACKEND_URL,
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
].filter(Boolean);

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://checkout.razorpay.com',
                    'https://www.google.com',
                    'https://www.gstatic.com',
                    'https://js.stripe.com',
                ],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'blob:'],
                connectSrc,
                frameSrc: ["'self'", 'https://checkout.razorpay.com', 'https://js.stripe.com'],
            },
        },
        crossOriginEmbedderPolicy: false,
    })
);

app.use(express.json());

const devOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
];

const prodOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (process.env.NODE_ENV !== 'production') {
                const localOk =
                    !origin ||
                    devOrigins.includes(origin) ||
                    /^http:\/\/localhost:\d+$/.test(origin || '') ||
                    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin || '');
                if (localOk) {
                    return callback(null, true);
                }
                return callback(new Error('Not allowed by CORS'));
            }
            if (!origin || prodOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    })
);

/** Rate limit everything under /api (includes /api/v1/...). */
app.use('/api', generalLimiter);

function mountApiRoutes(prefix) {
    app.use(`${prefix}/user`, userRouter);
    app.use(`${prefix}/product`, productRouter);
    app.use(`${prefix}/cart`, cartRouter);
    app.use(`${prefix}/order`, orderRouter);
    app.use(`${prefix}/wishlist`, wishlistRouter);
    app.use(`${prefix}/review`, reviewRouter);
    app.use(`${prefix}/delivery`, deliveryRouter);
}

mountApiRoutes('/api/v1');
mountApiRoutes('/api');

app.get('/', (req, res) => {
    res.send('API Is Working Properly');
});

app.use((err, req, res, next) => {
    if (err?.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
    }
    if (res.headersSent) {
        return next(err);
    }
    console.error(err);
    res.status(500).json({ success: false, message: err?.message || 'Internal error' });
});

export default app;

(async () => {
    try {
        await connectDB();
        connectCloudinary();
    } catch (error) {
        console.error('Initialization error:', error.message);
    }
})();

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(port, () => log('Server is running on port : ' + port));
}
