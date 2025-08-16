import express from 'express';
     import { PrismaClient } from '@prisma/client';
     import jwt from 'jsonwebtoken';

     const prisma = new PrismaClient();
     const router = express.Router();

     router.post('/', async (req, res) => {
       try {
         const token = req.headers.authorization?.split(' ')[1];
         if (!token) return res.status(401).json({ error: 'No token provided' });
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const { formId, ...fieldData } = req.body;
         const field = await prisma.field.create({
           data: {
             ...fieldData,
             formId: parseInt(formId),
           },
         });
         res.json(field);
       } catch (error) {
         console.error('Error creating field:', error);
         res.status(500).json({ error: 'Failed to create field' });
       }
     });

     router.patch('/:id', async (req, res) => {
       try {
         const token = req.headers.authorization?.split(' ')[1];
         if (!token) return res.status(401).json({ error: 'No token provided' });
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         const { id } = req.params;
         const field = await prisma.field.update({
           where: { id: parseInt(id) },
           data: req.body,
         });
         res.json(field);
       } catch (error) {
         console.error('Error updating field:', error);
         res.status(500).json({ error: 'Failed to update field' });
       }
     });

     export default router;