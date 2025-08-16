// routes/debug.js

import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/schema', async (req, res) => {
  try {
    // This will show us the actual structure
    const forms = await prisma.form.findMany({
      take: 1 // Just get one record to see structure
    });
    
    const responses = await prisma.response.findMany({
      take: 1
    });

    res.json({
      formSample: forms[0] || 'No forms found',
      responseSample: responses[0] || 'No responses found',
      formFields: forms[0] ? Object.keys(forms[0]) : 'No forms',
      responseFields: responses[0] ? Object.keys(responses[0]) : 'No responses'
    });
  } catch (error) {
    console.error('Schema check error:', error);
    res.json({ error: error.message });
  }
});

export default router;