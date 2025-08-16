import express from 'express';
import { PrismaClient } from '@prisma/client';
import  authenticate from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Get responses for user's forms
router.get('/responses', authenticate, async (req, res) => {
  try {
    console.log('User from token for responses:', req.user);
    
    // First get all forms belonging to this user
    const forms = await prisma.form.findMany({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    const formIds = forms.map((form) => form.id);
    console.log('User form IDs:', formIds);

    // Handle case where user has no forms
    if (formIds.length === 0) {
      console.log('User has no forms, returning empty array');
      return res.json([]);
    }

    // Get responses without specifying select to see all available fields
    const responses = await prisma.response.findMany({
      where: { 
        formId: { in: formIds } 
      }
    });

    console.log('Found responses:', responses.length);
    console.log('Sample response fields:', responses[0] ? Object.keys(responses[0]) : 'No responses');
    res.json(responses);
  } catch (error) {
    console.error('Responses error:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Create a new response (for form submissions)
router.post('/responses', async (req, res) => {
  try {
    const { formId } = req.body;

    // Verify form exists
    const form = await prisma.form.findFirst({
      where: {
        id: formId
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Create response with minimal data first
    const response = await prisma.response.create({
      data: {
        formId
      }
    });

    res.status(201).json(response);
  } catch (error) {
    console.error('Response creation error:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
});

// Get responses for a specific form
router.get('/responses/:formId', authenticate, async (req, res) => {
  try {
    // Verify the form belongs to the user
    const form = await prisma.form.findFirst({
      where: {
        id: req.params.formId,
        userId: req.user.userId
      }
    });

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const responses = await prisma.response.findMany({
      where: { formId: req.params.formId }
    });

    res.json(responses);
  } catch (error) {
    console.error('Form responses error:', error);
    res.status(500).json({ error: 'Failed to fetch form responses' });
  }
});

export default router;