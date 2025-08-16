import express from 'express';
     import Stripe from 'stripe';
     import { PrismaClient } from '@prisma/client';
     import jwt from 'jsonwebtoken';

     const prisma = new PrismaClient();
     const router = express.Router();
     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

     router.post('/stripe', async (req, res) => {
       try {
         const token = req.headers.authorization?.split(' ')[1];
         if (!token) return res.status(401).json({ error: 'No token provided' });
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const { amount, currency, formId } = req.body;
         const paymentIntent = await stripe.paymentIntents.create({
           amount,
           currency,
           metadata: { userId: decoded.userId, formId },
         });
         res.json({ clientSecret: paymentIntent.client_secret });
       } catch (error) {
         console.error('Payment error:', error);
         res.status(500).json({ error: 'Payment processing failed' });
       }
     });

     export default router;