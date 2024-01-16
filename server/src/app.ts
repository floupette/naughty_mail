import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import AdminRoutes from './routes/AdminRoutes';
import { adminConnected } from './middlewares/Auth';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/admin', adminConnected, AdminRoutes);

export default app;