import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import AdminRoutes from './routes/AdminRoutes';
import { adminConnected, userConnected } from './middlewares/Auth';

import ClientsRoutes from './routes/ClientsRoutes';

import AuthRoutes from './routes/AuthRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/admin', adminConnected, AdminRoutes);
app.use('/client', userConnected, ClientsRoutes);
app.use('/auth', AuthRoutes);

export default app;