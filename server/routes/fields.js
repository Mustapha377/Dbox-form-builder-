import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

const validFieldTypes = [
  'TEXT',
  'SHORT_ANSWER',
  'PARAGRAPH',
  'MULTIPLE_CHOICE',
  'CHECKBOXES',
  'DROPDOWN',
  'LINEAR_SCALE',
  'DATE',
  'EMAIL',
  'FILE_UPLOAD',
  'PAYMENT',
  'CALCULATED'
];

router.get('/:formId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for fields:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formId = parseInt(req.params.formId);

    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID', details: 'formId must be a valid integer' });
    }

    const fields = await prisma.field.findMany({
      where: {
        formId,
        form: {
          userId: decoded.userId,
        },
      },
      select: {
        id: true,
        type: true,
        question: true,
        description: true,
        required: true,
        options: true,
        calculation: true,
        amount: true,
        currency: true,
        conditions: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    res.json(fields);
  } catch (error) {
    console.error('Error fetching fields:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      error: 'Failed to fetch fields',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for field creation:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { formId, type, question, description, required, options, calculation, amount, currency, conditions } = req.body;

    // Log incoming payload for debugging
    console.log('Received field data:', req.body);

    // Validate required fields
    if (!formId || isNaN(parseInt(formId))) {
      console.error('Invalid formId:', formId);
      return res.status(400).json({ error: 'Invalid form ID', details: `formId must be a valid integer, received: ${formId}` });
    }
    if (!type || typeof type !== 'string' || !validFieldTypes.includes(type)) {
      console.error('Invalid type:', type);
      return res.status(400).json({ error: 'Invalid field type', details: `type must be one of ${validFieldTypes.join(', ')}, received: ${type}` });
    }
    if (!question || typeof question !== 'string' || question.trim() === '') {
      console.error('Invalid question:', question);
      return res.status(400).json({ error: 'Invalid question', details: `question must be a non-empty string, received: ${question}` });
    }

    // Validate form existence
    const form = await prisma.form.findFirst({
      where: {
        id: parseInt(formId),
        userId: decoded.userId,
      },
    });

    if (!form) {
      console.error('Form not found for formId:', formId, 'userId:', decoded.userId);
      return res.status(404).json({ error: 'Form not found or you do not have permission', details: `No form found with id ${formId} for user ${decoded.userId}` });
    }

    // Validate optional fields
    const fieldData = {
      formId: parseInt(formId),
      type,
      question,
      description: description || '',
      required: required || false,
      options: options ? options : null,
      calculation: calculation ? calculation : null,
      amount: amount !== undefined ? Number(amount) : null,
      currency: currency || null,
      conditions: conditions ? conditions : null,
    };

    console.log('Creating field with data:', fieldData);

    const field = await prisma.field.create({
      data: fieldData,
      select: {
        id: true,
        formId: true,
        type: true,
        question: true,
        description: true,
        required: true,
        options: true,
        calculation: true,
        amount: true,
        currency: true,
        conditions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(field);
  } catch (error) {
    console.error('Field creation error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: 'Invalid field data',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Validation error in database operation',
      });
    }
    res.status(500).json({
      error: 'Failed to create field',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for field delete:', token);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fieldId = parseInt(req.params.id);

    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      select: {
        form: {
          select: { userId: true },
        },
      },
    });

    if (!field || field.form.userId !== decoded.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this field' });
    }

    await prisma.field.delete({ where: { id: fieldId } });

    res.status(204).send();
  } catch (error) {
    console.error('Field delete error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      error: 'Failed to delete field',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;