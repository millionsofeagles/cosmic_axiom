import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', routes);

app.listen(port, '0.0.0.0', () => {
    console.log(`singularity running on http://0.0.0.0:${port}`);
});
