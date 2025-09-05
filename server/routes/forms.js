// routes/forms.js - Fixed version with better error handling and validation
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = express.Router();

// Input validation for PUT route
const updateFormValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('headerImage')
    .optional()
    .isURL()
    .withMessage('Header image must be a valid URL'),
  body('accentColor')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Accent color must be a valid hex color code'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  body('fields')
    .optional()
    .isArray()
    .withMessage('Fields must be an array'),
  body('fields.*.type')
    .optional()
    .isIn([
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
    ])
    .withMessage('Invalid field type'),
  body('fields.*.question')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Field question must be a non-empty string'),
  body('sections')
    .optional()
    .isArray()
    .withMessage('Sections must be an array'),
  body('sections.*.title')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Section title must be a non-empty string')
];

// =====================================
// PROTECTED ROUTES (require authentication)
// =====================================

// GET all forms for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET /api/forms - Starting request');
    console.log('📋 Request headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'user-agent': req.headers['user-agent']
    });
    console.log('📋 User from middleware:', req.user);
    
    // Better user validation
    if (!req.user || !req.user.id) {
      console.error('❌ No user object or ID found in request');
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_USER_OBJECT' 
      });
    }
    
    console.log('📋 Fetching forms for user ID:', req.user.id);
    
    // Test database connection with timeout
    try {
      console.log('🔍 Testing database connection...');
      const connectionTest = await Promise.race([
        prisma.$queryRaw`SELECT 1 as test`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]);
      console.log('✅ Database connection test passed:', connectionTest);
    } catch (dbError) {
      console.error('❌ Database connection failed:', {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      return res.status(500).json({ 
        error: 'Database connection failed',
        code: 'DB_CONNECTION_ERROR',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    // Verify user exists
    try {
      console.log('👤 Verifying user exists...');
      const userExists = await prisma.user.findUnique({
        where: { id: parseInt(req.user.id) },
        select: { id: true, email: true, name: true }
      });
      
      if (!userExists) {
        console.error('❌ User not found in database:', req.user.id);
        return res.status(404).json({ 
          error: 'User not found in database',
          code: 'USER_NOT_FOUND' 
        });
      }
      
      console.log('✅ User verified:', { id: userExists.id, email: userExists.email });
    } catch (userError) {
      console.error('❌ User verification error:', userError);
      return res.status(500).json({
        error: 'Failed to verify user',
        code: 'USER_VERIFICATION_ERROR',
        details: process.env.NODE_ENV === 'development' ? userError.message : undefined
      });
    }
    
    // Fetch forms
    try {
      console.log('📋 Querying forms...');
      const forms = await prisma.form.findMany({
        where: {
          userId: parseInt(req.user.id)
        },
        select: {
          id: true,
          title: true,
          description: true,
          headerImage: true,
          accentColor: true,
          status: true,
          responseCount: true,
          views: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              responses: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      console.log(`✅ Successfully fetched ${forms.length} forms for user ${req.user.id}`);
      
      // Transform response
      const transformedForms = forms.map(form => ({
        ...form,
        responseCount: form._count?.responses || form.responseCount || 0
      }));
      
      res.json(transformedForms);
      
    } catch (formError) {
      console.error('❌ Forms query error:', {
        message: formError.message,
        code: formError.code,
        meta: formError.meta,
        stack: formError.stack
      });
      
      return res.status(500).json({
        error: 'Failed to fetch forms',
        code: 'FORMS_QUERY_ERROR',
        details: process.env.NODE_ENV === 'development' ? formError.message : undefined,
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error in GET /forms:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    
    res.status(500).json({
      error: 'Internal server error',
      code: 'UNEXPECTED_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST create new form
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, headerImage, accentColor, settings } = req.body;
    
    console.log('📝 POST /api/forms - Starting form creation');
    console.log('📝 Request body:', { title, description, headerImage, accentColor });
    console.log('📝 User from middleware:', req.user);
    console.log('📝 User ID from token:', req.userId);
    
    // Check both req.user.id and req.userId for compatibility
    const userId = req.user?.id || req.userId;
    
    if (!userId) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({ 
        error: 'User not authenticated properly',
        code: 'NO_USER_ID'
      });
    }
    
    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection test passed for POST');
    } catch (dbError) {
      console.error('❌ Database connection failed for POST:', dbError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        code: 'DB_CONNECTION_ERROR'
      });
    }
    
    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { id: true, email: true }
    });
    
    if (!userExists) {
      console.error('❌ User not found in database:', userId);
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    console.log('✅ User verified:', userExists);
    
    const defaultSettings = {
      allowAnonymous: true,
      requireEmail: false,
      allowMultipleSubmissions: false,
      showProgressBar: true
    };
    
    // Simplified form creation - don't create nested relations in the same query
    const formData = {
      title: title || 'Untitled Form',
      description: description || 'Add a description for your form',
      headerImage: headerImage || null,
      accentColor: accentColor || '#3b82f6',
      settings: settings || defaultSettings,
      status: 'DRAFT',
      responseCount: 0,
      views: 0,
      userId: parseInt(userId)
    };
    
    console.log('📝 Creating form with data:', formData);
    
    const form = await prisma.form.create({
      data: formData,
      select: {
        id: true,
        title: true,
        description: true,
        headerImage: true,
        accentColor: true,
        status: true,
        settings: true,
        responseCount: true,
        views: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('✅ Form created successfully:', form.id);
    
    // Add empty arrays for fields and sections for frontend compatibility
    const responseForm = {
      ...form,
      fields: [],
      sections: []
    };
    
    res.status(201).json(responseForm);
    
  } catch (error) {
    console.error('❌ Create form error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Form with this data already exists',
        code: 'DUPLICATE_FORM'
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid user reference',
        code: 'INVALID_USER_REF'
      });
    }
    
    res.status(500).json({
      error: 'Failed to create form',
      code: 'FORM_CREATE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET specific form by ID (for editing)
router.get('/:formId', authenticateToken, async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    console.log(`📋 GET /api/forms/${formId} - Fetching form for user:`, req.user.id);
    
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: parseInt(req.user.id)
      },
      select: {
        id: true,
        title: true,
        description: true,
        headerImage: true,
        accentColor: true,
        fields: true,
        sections: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            responses: true
          }
        }
      }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found or you do not have permission' });
    }
    
    console.log(`✅ Found form ${formId} for user ${req.user.id}`);
    res.json(form);
  } catch (error) {
    console.error('❌ Get form error:', error);
    res.status(500).json({
      error: 'Failed to fetch form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT update form (fixed for nested relations)
router.put('/:formId', authenticateToken, updateFormValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    const { title, description, headerImage, accentColor, fields, sections, settings } = req.body;
    
    console.log(`📝 PUT /api/forms/${formId} - Updating form for user:`, req.user.id);
    
    // Verify ownership
    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: parseInt(req.user.id)
      }
    });
    
    if (!existingForm) {
      return res.status(404).json({ error: 'Form not found or you do not have permission' });
    }
    
    // Update scalar fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (headerImage !== undefined) updateData.headerImage = headerImage;
    if (accentColor !== undefined) updateData.accentColor = accentColor;
    if (settings !== undefined) updateData.settings = settings;
    updateData.updatedAt = new Date();
    
    await prisma.form.update({
      where: { id: formId },
      data: updateData
    });
    
    // Handle fields if provided (create/update/delete)
    if (fields !== undefined) {
      // Get existing field IDs
      const existingFields = await prisma.field.findMany({
        where: { formId },
        select: { id: true }
      });
      const existingIds = new Set(existingFields.map(f => f.id));
      
      // Collect provided IDs (for existing fields)
      const providedIds = fields.filter(f => f.id).map(f => f.id);
      
      // Delete fields not in provided list
      const toDelete = [...existingIds].filter(id => !providedIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.field.deleteMany({
          where: { id: { in: toDelete } }
        });
      }
      
      // Update existing or create new fields
      for (const field of fields) {
        const fieldData = {
          type: field.type,
          question: field.question,
          description: field.description || null,
          required: field.required || false,
          options: field.options || null,
          calculation: field.calculation || null,
          amount: field.amount !== undefined ? Number(field.amount) : null,
          currency: field.currency || null,
          conditions: field.conditions || null
        };
        
        if (field.id && existingIds.has(field.id)) {
          await prisma.field.update({
            where: { id: field.id },
            data: fieldData
          });
        } else {
          await prisma.field.create({
            data: {
              ...fieldData,
              formId
            }
          });
        }
      }
    }
    
    // Handle sections if provided (assumes Section model; adjust fields as needed)
    if (sections !== undefined) {
      // Get existing section IDs
      const existingSections = await prisma.section.findMany({
        where: { formId },
        select: { id: true }
      });
      const existingIds = new Set(existingSections.map(s => s.id));
      
      // Collect provided IDs
      const providedIds = sections.filter(s => s.id).map(s => s.id);
      
      // Delete sections not in provided list
      const toDelete = [...existingIds].filter(id => !providedIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.section.deleteMany({
          where: { id: { in: toDelete } }
        });
      }
      
      // Update existing or create new sections
      for (const section of sections) {
        const sectionData = {
          title: section.title || '',
          description: section.description || null
          // Add other Section fields (e.g., order, conditions) based on schema
        };
        
        if (section.id && existingIds.has(section.id)) {
          await prisma.section.update({
            where: { id: section.id },
            data: sectionData
          });
        } else {
          await prisma.section.create({
            data: {
              ...sectionData,
              formId
            }
          });
        }
      }
    }
    
    // Fetch updated form with nested data
    const updatedForm = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        description: true,
        headerImage: true,
        accentColor: true,
        fields: true,
        sections: true,
        settings: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ Form ${formId} updated successfully`);
    res.json(updatedForm);
  } catch (error) {
    console.error('❌ Update form error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to update form',
      code: 'FORM_UPDATE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE form
router.delete('/:formId', authenticateToken, async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    console.log(`🗑️ DELETE /api/forms/${formId} - Deleting form for user:`, req.user.id);
    
    // Verify ownership
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: parseInt(req.user.id)
      }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found or you do not have permission' });
    }
    
    // Delete responses first (cascade should handle this, but being explicit)
    await prisma.response.deleteMany({
      where: { formId }
    });
    
    // Delete the form
    await prisma.form.delete({
      where: { id: formId }
    });
    
    console.log(`✅ Form ${formId} deleted successfully`);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Delete form error:', error);
    res.status(500).json({
      error: 'Failed to delete form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// =====================================
// PUBLIC ROUTES (no authentication required)
// =====================================

// GET form for public viewing
router.get('/:formId/public', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    console.log(`🌍 GET /api/forms/${formId}/public - Public form access`);
    
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: {
        id: true,
        title: true,
        description: true,
        headerImage: true,
        accentColor: true,
        fields: true,
        sections: true,
        settings: true
      }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    console.log(`✅ Public form ${formId} accessed successfully`);
    res.json(form);
  } catch (error) {
    console.error('❌ Get public form error:', error);
    res.status(500).json({
      error: 'Failed to fetch form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST submit response to form (public)
router.post('/:formId/responses', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const { email, responses: responseData } = req.body;
    
    console.log('📬 POST form response:', { formId, email, responseDataKeys: Object.keys(responseData || {}) });
    
    if (isNaN(formId)) {
      return res.status(400).json({ error: 'Invalid form ID' });
    }
    
    if (!responseData || typeof responseData !== 'object') {
      return res.status(400).json({ error: 'Invalid response data' });
    }
    
    // Verify the form exists
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { 
        id: true, 
        title: true,
        settings: true
      }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if email is required
    if (form.settings?.requireEmail && !email) {
      return res.status(400).json({ error: 'Email is required for this form' });
    }
    
    // Create the response record
    const response = await prisma.response.create({
      data: {
        formId,
        email: email || null,
        data: responseData,
        responses: responseData, // Keep for compatibility
        submittedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        data: true,
        submittedAt: true,
      }
    });
    
    console.log('✅ Form response submitted successfully:', response.id);
    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    console.error('❌ Submit response error:', error);
    res.status(500).json({
      error: 'Failed to submit response',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;