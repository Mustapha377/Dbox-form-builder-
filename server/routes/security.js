// routes/security.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();
const router = express.Router();

// Rate limiting for form submissions
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many form submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Fraud detection middleware
const fraudDetection = async (req, res, next) => {
  try {
    const clientIP = req.ip;
    const userAgent = req.get('User-Agent');
    const formId = req.params.formId || req.body.formId;
    
    // Check for suspicious patterns
    const recentSubmissions = await prisma.response.count({
      where: {
        formId: parseInt(formId),
        submittedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        },
        metadata: {
          path: ['ip'],
          equals: clientIP
        }
      }
    });
    
    if (recentSubmissions >= 3) {
      return res.status(429).json({ 
        error: 'Suspicious activity detected',
        requiresVerification: true
      });
    }
    
    // Add fraud score to request
    req.fraudScore = calculateFraudScore(clientIP, userAgent, recentSubmissions);
    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    next(); // Continue even if fraud detection fails
  }
};

function calculateFraudScore(ip, userAgent, recentSubmissions) {
  let score = 0;
  
  // IP-based scoring
  if (ip.includes('tor-exit') || ip.includes('proxy')) score += 30;
  
  // User-Agent based scoring
  if (!userAgent || userAgent.length < 20) score += 20;
  if (userAgent.includes('bot') || userAgent.includes('crawler')) score += 50;
  
  // Frequency based scoring
  score += recentSubmissions * 10;
  
  return Math.min(score, 100);
}

// Update form security settings
router.patch('/:formId/security', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const securitySettings = req.body;
    
    const form = await prisma.form.update({
      where: { id: parseInt(formId) },
      data: {
        securitySettings: JSON.stringify(securitySettings)
      }
    });
    
    res.json({ message: 'Security settings updated', form });
  } catch (error) {
    console.error('Security settings error:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// Check form access permissions
router.get('/:formId/access-check', async (req, res) => {
  try {
    const { formId } = req.params;
    const { password, token } = req.query;
    const clientIP = req.ip;
    
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      select: { securitySettings: true }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const security = JSON.parse(form.securitySettings || '{}');
    const accessResult = { canAccess: true, requiresAuth: false, message: '' };
    
    // Check password protection
    if (security.password && (!password || password !== security.password)) {
      accessResult.canAccess = false;
      accessResult.requiresAuth = true;
      accessResult.authType = 'password';
      accessResult.message = 'Password required';
    }
    
    // Check time-based access
    if (security.time_limit) {
      const now = new Date();
      const startDate = new Date(security.startDate);
      const endDate = new Date(security.endDate);
      
      if (now < startDate || now > endDate) {
        accessResult.canAccess = false;
        accessResult.message = 'Form is not accessible at this time';
      }
    }
    
    // Check IP restrictions
    if (security.ip_restriction && security.allowedIPs) {
      const allowed = security.allowedIPs.some(range => 
        clientIP.startsWith(range) || range === clientIP
      );
      if (!allowed) {
        accessResult.canAccess = false;
        accessResult.message = 'Access denied from this location';
      }
    }
    
    res.json(accessResult);
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ error: 'Access check failed' });
  }
});

export { submissionLimiter, fraudDetection };
export default router;