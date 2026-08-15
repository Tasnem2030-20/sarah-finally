import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            family: 4, // يمنع التعليق بين IPv6 و IPv4
        });
        console.log("Database connected successfully 🍃");
    } catch (error) {
        console.error("Failed to connect to Database ", error);
    }
};