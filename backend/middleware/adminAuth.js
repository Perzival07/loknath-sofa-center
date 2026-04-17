import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }
        if (!process.env.ADMIN_JWT_SECRET) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (!decoded.admin) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Again" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ success: false, message: error.message });
    }
};

export default adminAuth;
