import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// Helper function to verify JWT token
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('No token provided');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// GET responses for a specific form (PROTECTED - requires auth)
router.get('/:formId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Received token for responses:', token);
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized: No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formId = parseInt(req.params.formId);

    if (isNaN(formId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid form ID' 
      });
    }

    console.log('Fetching responses for formId:', formId, 'userId:', decoded.userId);

    // First verify the form belongs to the authenticated user
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: decoded.userId,
      },
      select: {
        id: true,
        title: true,
        views: true,
        createdAt: true
      }
    });

    if (!form) {
      console.error('Form not found for formId:', formId, 'userId:', decoded.userId);
      return res.status(404).json({ 
        success: false,
        error: 'Form not found or you do not have permission' 
      });
    }

    // Add pagination support (optional)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1000; // High default for backward compatibility
    const offset = (page - 1) * limit;

    // Get responses for this form
    const [responses, totalCount] = await Promise.all([
      prisma.response.findMany({
        where: {
          formId,
        },
        select: {
          id: true,
          email: true,
          data: true,
          responses: true, // Keep for compatibility
          paymentId: true,
          paymentStatus: true,
          submittedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
        ...(req.query.page ? { skip: offset, take: limit } : {}) // Only apply pagination if requested
      }),
      prisma.response.count({
        where: { formId }
      })
    ]);

    console.log(`Found ${responses.length} responses for form ${formId}`);

    // Format responses for better consistency
    const formattedResponses = responses.map(response => ({
      ...response,
      // Ensure consistent date format
      submittedAt: response.submittedAt || response.createdAt,
      // Prioritize 'data' field over 'responses' for consistency
      data: response.data || response.responses || {}
    }));

    // Return in format compatible with both old and new frontend expectations
    if (req.query.format === 'enhanced') {
      return res.json({
        success: true,
        data: formattedResponses,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        form: {
          id: form.id,
          title: form.title,
          views: form.views || 0
        }
      });
    }

    // Default format for backward compatibility
    res.json(formattedResponses);
  } catch (error) {
    console.error('Responses fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized: Invalid token' 
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch responses',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET single response details (PROTECTED - requires auth)
router.get('/:formId/:responseId', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const formId = parseInt(req.params.formId);
    const responseId = parseInt(req.params.responseId);

    if (isNaN(formId) || isNaN(responseId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid form ID or response ID' 
      });
    }

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: decoded.userId,
      },
    });

    if (!form) {
      return res.status(404).json({ 
        success: false,
        error: 'Form not found or access denied' 
      });
    }

    // Get specific response
    const response = await prisma.response.findFirst({
      where: {
        id: responseId,
        formId: formId,
      },
    });

    if (!response) {
      return res.status(404).json({ 
        success: false,
        error: 'Response not found' 
      });
    }

    res.json({
      success: true,
      data: {
        ...response,
        data: response.data || response.responses || {}
      }
    });
  } catch (error) {
    console.error('Single response fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST new response (PUBLIC - no auth required)
router.post('/:formId', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    
    if (isNaN(formId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid form ID' 
      });
    }

    // Verify form exists and get settings
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { 
        id: true, 
        title: true,
        isActive: true,
        settings: true
      }
    });

    if (!form) {
      return res.status(404).json({ 
        success: false,
        error: 'Form not found' 
      });
    }

    // Check if form is accepting responses
    if (form.isActive === false) {
      return res.status(400).json({ 
        success: false,
        error: 'Form is not currently accepting responses' 
      });
    }

    const { email, data, responses: responseData } = req.body;

    // Basic validation
    if (!data && !responseData) {
      return res.status(400).json({ 
        success: false,
        error: 'Response data is required' 
      });
    }

    const currentTime = new Date();

    // Create the response
    const response = await prisma.response.create({
      data: {
        formId,
        email: email || null,
        data: data || {},
        responses: responseData || {}, // Keep for backward compatibility
        submittedAt: currentTime,
        createdAt: currentTime, // Ensure createdAt is set for analytics
      },
      select: {
        id: true,
        email: true,
        data: true,
        submittedAt: true,
        createdAt: true,
      },
    });

    // Update form response count and metrics
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        responseCount: { increment: 1 },
        lastResponse: currentTime,
      },
      select: {
        responseCount: true,
        views: true
      }
    });

    console.log('Response created:', response.id, 'for form:', formId);
    console.log('Updated form stats - Responses:', updatedForm.responseCount, 'Views:', updatedForm.views);

    // Return enhanced format if requested, otherwise maintain backward compatibility
    if (req.query.format === 'enhanced') {
      return res.status(201).json({
        success: true,
        message: 'Response submitted successfully',
        data: response,
        form: {
          id: formId,
          title: form.title,
          totalResponses: updatedForm.responseCount,
          totalViews: updatedForm.views || 0
        }
      });
    }

    // Default backward compatible response
    res.status(201).json(response);
  } catch (error) {
    console.error('Response creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET analytics summary for user's forms (PROTECTED)
router.get('/analytics/summary', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const timeRange = parseInt(req.query.range) || 30; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    // Get forms with response data for analytics
    const forms = await prisma.form.findMany({
      where: {
        userId: decoded.userId,
      },
      include: {
        responses: {
          select: {
            id: true,
            submittedAt: true,
            createdAt: true,
          },
          where: {
            submittedAt: {
              gte: startDate,
            },
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate metrics
    const totalViews = forms.reduce((sum, form) => sum + (form.views || 0), 0);
    const totalResponses = forms.reduce((sum, form) => sum + form._count.responses, 0);
    const responseRate = totalViews > 0 ? ((totalResponses / totalViews) * 100).toFixed(1) : 0;

    // Calculate completion times
    const completionTimes = [];
    forms.forEach(form => {
      form.responses.forEach(response => {
        if (response.submittedAt && response.createdAt) {
          const timeDiff = (new Date(response.submittedAt) - new Date(response.createdAt)) / 1000;
          // Only include reasonable completion times (10 seconds to 24 hours)
          if (timeDiff >= 10 && timeDiff <= 86400) {
            completionTimes.push(timeDiff);
          }
        }
      });
    });

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    res.json({
      success: true,
      data: {
        totalForms: forms.length,
        totalViews,
        totalResponses,
        responseRate: parseFloat(responseRate),
        avgCompletionTime: Math.round(avgCompletionTime),
        forms: forms.map(form => ({
          id: form.id,
          title: form.title,
          views: form.views || 0,
          responses: form._count.responses,
          responseRate: form.views > 0 ? ((form._count.responses / form.views) * 100).toFixed(1) : 0,
          createdAt: form.createdAt,
          lastResponse: form.lastResponse,
        })),
        timeRange
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE response (PROTECTED - requires auth)
router.delete('/:formId/:responseId', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const formId = parseInt(req.params.formId);
    const responseId = parseInt(req.params.responseId);

    if (isNaN(formId) || isNaN(responseId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid form ID or response ID' 
      });
    }

    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: decoded.userId,
      },
    });

    if (!form) {
      return res.status(404).json({ 
        success: false,
        error: 'Form not found or access denied' 
      });
    }

    // Delete the response
    const deletedResponse = await prisma.response.delete({
      where: {
        id: responseId,
      },
    });

    // Update form response count
    await prisma.form.update({
      where: { id: formId },
      data: {
        responseCount: { decrement: 1 },
      },
    });

    console.log('Response deleted:', responseId, 'from form:', formId);

    res.json({
      success: true,
      message: 'Response deleted successfully',
      data: { id: deletedResponse.id }
    });
  } catch (error) {
    console.error('Response deletion error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Response not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;