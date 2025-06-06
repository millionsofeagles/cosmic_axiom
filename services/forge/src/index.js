import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', routes);

app.listen(port, () => {
    console.log(`forge running on http://localhost:${port}`);
});
