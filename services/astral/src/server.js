import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import morgan from 'morgan';
import tokenRoutes from "./routes/token.js";
import usersRoutes from "./routes/users.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/token', tokenRoutes);
app.use('/users', usersRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Astral service running on port ${PORT}`));
