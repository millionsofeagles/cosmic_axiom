import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Astral service running on port ${PORT}`));
