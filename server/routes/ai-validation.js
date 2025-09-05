// routes/ai-validation.js
import express from 'express';
import OpenAI from 'openai';
import authenticate from '../middleware/auth.js';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Grammar Check
router.post('/grammar-check', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a grammar checker. Analyze the text and provide grammar score (0-100), suggestions for improvement, and corrected version."
        },
        {
          role: "user",
          content: `Check this text: "${text}"`
        }
      ],
      max_tokens: 500
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    res.json(analysis);
  } catch (error) {
    console.error('Grammar check error:', error);
    res.status(500).json({ error: 'Grammar check failed' });
  }
});

// AI Sentiment Analysis
router.post('/sentiment-analysis', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment of the text. Return JSON with sentiment (positive/neutral/negative), confidence (0-100), and detected emotions array."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 200
    });

    const sentiment = JSON.parse(completion.choices[0].message.content);
    res.json(sentiment);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// AI Plagiarism Check (using a simulated check)
router.post('/plagiarism-check', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Simulate plagiarism check (in production, use services like Copyscape API)
    const wordCount = text.split(' ').length;
    const similarityScore = Math.min(Math.floor(Math.random() * 30) + (wordCount > 100 ? 10 : 0), 100);
    
    const result = {
      isOriginal: similarityScore < 15,
      similarityScore,
      sources: similarityScore > 15 ? ['Academic Database', 'Web Content', 'Previous Submissions'] : [],
      wordCount,
      checkedAt: new Date().toISOString()
    };
    
    res.json(result);
  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({ error: 'Plagiarism check failed' });
  }
});

// Domain Verification
router.post('/verify-domain', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const domain = email.split('@')[1];
    
    // Simulate domain verification (use DNS lookups in production)
    const isValid = domain && domain.includes('.');
    const riskScore = Math.floor(Math.random() * 100);
    
    const result = {
      isValid,
      domain,
      isActive: isValid && Math.random() > 0.2,
      riskScore,
      domainAge: Math.floor(Math.random() * 10) + 1,
      reputation: riskScore < 30 ? 'high' : riskScore < 70 ? 'medium' : 'low'
    };
    
    res.json(result);
  } catch (error) {
    console.error('Domain verification error:', error);
    res.status(500).json({ error: 'Domain verification failed' });
  }
});

export default router;