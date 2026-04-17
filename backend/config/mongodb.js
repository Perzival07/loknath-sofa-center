import mongoose from "mongoose";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

let listenersBound = false;

const bindConnectionListeners = () => {
    if (listenersBound) return;
    listenersBound = true;

    mongoose.connection.on("connected", () => {
        console.log("✅ MongoDB Connected Successfully");
    });

    mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err.message);
        if (err.message.includes("IP")) {
            console.error("💡 Whitelist your IP in MongoDB Atlas → Network Access");
        }
    });

    mongoose.connection.on("reconnected", () => {
        console.log("✅ MongoDB Reconnected");
    });

    mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected. Scheduling reconnect…");
        setTimeout(() => connectDB(0), 2000);
    });
};

const connectDB = async (retryCount = 0) => {
    bindConnectionListeners();

    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL not set");
        }

        const options = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true,
            maxPoolSize: 10,
            minPoolSize: 0,
        };

        const connectionString = `${process.env.MONGODB_URL}/e-commerce`;
        if (retryCount === 0) {
            console.log("🔄 Attempting to connect to MongoDB…");
        }

        await mongoose.connect(connectionString, options);
        console.log("✅ MongoDB connection established");
    } catch (error) {
        console.error(
            `❌ MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`,
            error.message
        );

        if (retryCount < MAX_RETRIES - 1) {
            const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
            console.log(`Retrying in ${delay / 1000}s…`);
            await new Promise((r) => setTimeout(r, delay));
            return connectDB(retryCount + 1);
        }

        console.error("❌ All MongoDB connection retries exhausted.");
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

const reconnectDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("🔄 Closed existing MongoDB connection");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await connectDB(0);
    } catch (error) {
        console.error("❌ Failed to reconnect to MongoDB:", error.message);
    }
};

export default connectDB;
export { reconnectDB };
