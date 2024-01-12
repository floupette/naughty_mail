import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import AdminRoutes from './routes/AdminRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/admin', AdminRoutes);

export default app;