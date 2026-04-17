import { log, error } from "../utils/logger.js";

const OPTIONAL_WARN = [
    "STRIPE_SECRET_KEY",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "GOOGLE_CLIENT_ID",
    "EMAIL_USER",
    "EMAIL_PASS",
    "JWT_REFRESH_SECRET",
];

export const validateEnv = () => {
    const coreRequired = ["MONGODB_URL", "JWT_SECRET"];
    const missingCore = coreRequired.filter((k) => !process.env[k]);
    if (missingCore.length) {
        error(
            `Missing required environment variables: ${missingCore.join(", ")}`
        );
        process.exit(1);
    }

    const prodOnly = [
        "CLOUDINARY_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_SECRET_KEY",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "ADMIN_JWT_SECRET",
    ];

    if (process.env.NODE_ENV === "production") {
        const missingProd = prodOnly.filter((k) => !process.env[k]);
        if (missingProd.length) {
            error(
                `Missing production environment variables: ${missingProd.join(", ")}`
            );
            process.exit(1);
        }
    } else {
        prodOnly.forEach((k) => {
            if (!process.env[k]) {
                console.warn(`[env] Optional for local dev: ${k} is not set`);
            }
        });
    }

    OPTIONAL_WARN.forEach((k) => {
        if (!process.env[k]) {
            console.warn(`[env] Optional env var not set: ${k}`);
        }
    });

    log("Environment validation passed");
};
