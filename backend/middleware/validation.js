import { body, validationResult } from "express-validator";

const PRODUCT_CATEGORIES = [
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Office",
    "Outdoor",
    "Storage",
];

const PRODUCT_SUBCATEGORIES = [
    "Sofas",
    "Tables",
    "Chairs",
    "Beds",
    "Wardrobes",
    "Desks",
    "Shelving",
    "Storage",
    "Lighting",
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const list = errors.array();
        return res.status(400).json({
            success: false,
            message: list[0]?.msg || "Validation failed",
            errors: list,
        });
    }
    next();
};

export const validateRegister = [
    body("name")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Name must be 2–100 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be 8–128 characters"),
    handleValidationErrors,
];

export const validateLogin = [
    body("email").trim().isEmail().withMessage("Valid email required"),
    body("password")
        .notEmpty()
        .isLength({ max: 128 })
        .withMessage("Password required"),
    handleValidationErrors,
];

export const validateProduct = [
    body("name")
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage("Product name must be 3–200 characters"),
    body("description")
        .trim()
        .isLength({ min: 10, max: 8000 })
        .withMessage("Description must be 10–8000 characters"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("category").isIn(PRODUCT_CATEGORIES).withMessage("Invalid category"),
    body("subCategory")
        .isIn(PRODUCT_SUBCATEGORIES)
        .withMessage("Invalid subCategory"),
    body("length").isFloat({ min: 0.1 }).withMessage("Length must be greater than 0"),
    body("breadth").isFloat({ min: 0.1 }).withMessage("Breadth must be greater than 0"),
    body("height").isFloat({ min: 0.1 }).withMessage("Height must be greater than 0"),
    body("stock")
        .optional({ values: "falsy" })
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),
    body("bestseller")
        .optional({ values: "falsy" })
        .isIn(["true", "false"])
        .withMessage("bestseller must be true or false"),
    handleValidationErrors,
];

export const validateForgotPassword = [
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email required"),
    handleValidationErrors,
];

export const validateResetPassword = [
    body("token").trim().notEmpty().withMessage("Reset token required"),
    body("newPassword")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be 8–128 characters"),
    handleValidationErrors,
];
