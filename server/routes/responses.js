import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/:formId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for responses:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formId = parseInt(req.params.formId);

    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }

    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: decoded.userId,
      },
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found or you do not have permission' });
    }

    const responses = await prisma.response.findMany({
      where: {
        formId,
      },
      select: {
        id: true,
        email: true,
        data: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    res.json(responses);
  } catch (error) {
    console.error('Responses error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      error: 'Failed to fetch responses',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;