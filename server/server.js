import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import uploadRoutes from './routes/upload.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';
import paymentsRoutes from './routes/payment.js';
import fieldsRoutes from './routes/fields.js';
import webhooksRoutes from './routes/webhooks.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));


// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api', formRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', responsesRoutes); 
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));