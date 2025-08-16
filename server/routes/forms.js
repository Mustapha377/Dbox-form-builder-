import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/forms', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for forms:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token for forms:', decoded);
    const forms = await prisma.form.findMany({
      where: { userId: decoded.userId },
      select: {
        id: true,
        title: true,
        description: true,
        fields: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        responses: req.query.includeResponses === 'true' ? {
          select: {
            id: true,
            email: true,
            submittedAt: true,
            data: true,
            createdAt: true,
            updatedAt: true,
          },
        } : false,
      },
    });
    res.json(forms);
  } catch (error) {
    console.error('Forms error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/forms', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for form creation:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { title, description, fields, settings } = req.body;

    if (!title || !fields) {
      return res.status(400).json({ error: 'Title and fields are required' });
    }

    const form = await prisma.form.create({
      data: {
        userId: decoded.userId,
        title: title || 'Untitled Form',
        description: description || '',
        fields: fields || [],
        settings: settings || {},
        views: 0,
      },
      select: {
        id: true,
        title: true,
        description: true,
        fields: true,
        settings: true,
        views: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error('Form creation error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/forms/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for form delete:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formId = parseInt(req.params.id);

    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { userId: true },
    });

    if (!form || form.userId !== decoded.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this form' });
    }

    await prisma.response.deleteMany({ where: { formId } });
    await prisma.form.delete({ where: { id: formId } });

    res.status(204).send();
  } catch (error) {
    console.error('Form delete error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;