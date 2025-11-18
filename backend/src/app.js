'use strict';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';

dotenv.config(); // Loads variables from a .env file into process.env

const app = express();

// Global middlewares
app.use(cors()); // Frontend on another port) can access the backend
app.use(express.json()); // Parses incoming JSON request bodies (access via req.body)

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use(transactionRoutes);
app.use(eventRoutes);
app.use(promotionRoutes);

export default app;