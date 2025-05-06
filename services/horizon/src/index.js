import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// __dirname shim for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/', routes);

// Serve generated files
app.use("/generated", express.static(path.join(__dirname, "..", "generated")));

app.listen(port, () => {
    console.log(`horizon running on http://localhost:${port}`);
});
