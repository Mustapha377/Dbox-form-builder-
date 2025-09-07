// Fixed fields.js backend route
import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// FIXED: Comprehensive list that matches frontend exactly
const validFieldTypes = [
  'SHORT_ANSWER',
  'PARAGRAPH', 
  'EMAIL',
  'PHONE',
  'URL',
  'NUMBER',
  'MULTIPLE_CHOICE',
  'CHECKBOXES',
  'DROPDOWN',
  'LINEAR_SCALE',
  'DATE',
  'TIME',
  'DATE_TIME',
  'FILE_UPLOAD',
  'PAYMENT',
  'CALCULATED',
  'SECTION_HEADER'
];

// FIXED: Enhanced field type normalization (matches frontend)
const normalizeFieldType = (type) => {
  if (!type) return 'SHORT_ANSWER';
  
  const typeString = type.toString().toUpperCase().trim();
  
  // Direct match first
  if (validFieldTypes.includes(typeString)) {
    return typeString;
  }
  
  // Common aliases
  const typeMap = {
    'TEXT': 'SHORT_ANSWER',
    'INPUT': 'SHORT_ANSWER',
    'TEXTBOX': 'SHORT_ANSWER',
    'SHORT-ANSWER': 'SHORT_ANSWER',
    
    'TEXTAREA': 'PARAGRAPH',
    'LONG_TEXT': 'PARAGRAPH',
    'MULTILINE': 'PARAGRAPH',
    'LONG-TEXT': 'PARAGRAPH',
    
    'E-MAIL': 'EMAIL',
    'MAIL': 'EMAIL',
    
    'TEL': 'PHONE',
    'TELEPHONE': 'PHONE',
    'PHONE_NUMBER': 'PHONE',
    'PHONE-NUMBER': 'PHONE',
    
    'LINK': 'URL',
    'WEBSITE': 'URL',
    'WEB': 'URL',
    
    'NUMERIC': 'NUMBER',
    'INTEGER': 'NUMBER',
    'DECIMAL': 'NUMBER',
    
    'RADIO': 'MULTIPLE_CHOICE',
    'RADIO_BUTTON': 'MULTIPLE_CHOICE',
    'MULTIPLE-CHOICE': 'MULTIPLE_CHOICE',
    
    'CHECKBOX': 'CHECKBOXES',
    'CHECK_BOXES': 'CHECKBOXES',
    'CHECK-BOXES': 'CHECKBOXES',
    
    'SELECT': 'DROPDOWN',
    'DROP_DOWN': 'DROPDOWN',
    'DROP-DOWN': 'DROPDOWN',
    
    'FILE': 'FILE_UPLOAD',
    'UPLOAD': 'FILE_UPLOAD',
    'ATTACHMENT': 'FILE_UPLOAD',
    'FILE-UPLOAD': 'FILE_UPLOAD',
    'FILE_UPLOAD': 'FILE_UPLOAD',
    
    'RATING': 'LINEAR_SCALE',
    'SCALE': 'LINEAR_SCALE',
    'LINEAR-SCALE': 'LINEAR_SCALE',
    'LINEAR_SCALE': 'LINEAR_SCALE',
    
    'DATETIME': 'DATE_TIME',
    'DATE-TIME': 'DATE_TIME',
    'DATE_TIME': 'DATE_TIME',
    
    'HEADER': 'SECTION_HEADER',
    'HEADING': 'SECTION_HEADER',
    'SECTION': 'SECTION_HEADER',
    'SECTION-HEADER': 'SECTION_HEADER',
    'SECTION_HEADER': 'SECTION_HEADER',
    
    'PAY': 'PAYMENT',
    'CREDIT_CARD': 'PAYMENT',
    
    'CALC': 'CALCULATED',
    'FORMULA': 'CALCULATED'
  };
  
  const normalizedType = typeMap[typeString] || 'SHORT_ANSWER';
  
  console.log(`Field type normalized: ${type} → ${normalizedType}`);
  return normalizedType;
};

// FIXED: Enhanced validation function
const validateFieldData = (fieldData) => {
  const errors = [];
  
  // Basic required field validation
  if (!fieldData.type || typeof fieldData.type !== 'string') {
    errors.push('Field type is required and must be a string');
  } else {
    const normalizedType = normalizeFieldType(fieldData.type);
    if (!validFieldTypes.includes(normalizedType)) {
      errors.push(`Invalid field type: ${fieldData.type} (normalized: ${normalizedType}). Valid types: ${validFieldTypes.join(', ')}`);
    }
  }
  
  if (!fieldData.question || typeof fieldData.question !== 'string' || fieldData.question.trim() === '') {
    errors.push('Question is required and must be a non-empty string');
  }
  
  if (!fieldData.formId) {
    errors.push('Form ID is required');
  } else {
    const formIdNum = parseInt(fieldData.formId);
    if (isNaN(formIdNum) || formIdNum <= 0) {
      errors.push('Form ID must be a valid positive integer');
    }
  }
  
  // Type-specific validations
  const normalizedType = normalizeFieldType(fieldData.type);
  
  if (['MULTIPLE_CHOICE', 'CHECKBOXES', 'DROPDOWN'].includes(normalizedType)) {
    if (fieldData.options) {
      if (!Array.isArray(fieldData.options)) {
        errors.push('Options must be an array');
      } else if (fieldData.options.length === 0) {
        errors.push('Choice fields must have at least one option');
      } else {
        fieldData.options.forEach((option, index) => {
          if (!option.value || typeof option.value !== 'string') {
            errors.push(`Option ${index + 1} must have a valid value`);
          }
        });
      }
    }
  }
  
  if (normalizedType === 'LINEAR_SCALE') {
    if (fieldData.scaleMin !== undefined && fieldData.scaleMax !== undefined) {
      if (typeof fieldData.scaleMin !== 'number' || typeof fieldData.scaleMax !== 'number') {
        errors.push('Scale min and max must be numbers');
      } else if (fieldData.scaleMin >= fieldData.scaleMax) {
        errors.push('Scale minimum must be less than maximum');
      }
    }
  }
  
  if (normalizedType === 'PAYMENT') {
    if (fieldData.amount !== undefined) {
      const amount = parseFloat(fieldData.amount);
      if (isNaN(amount) || amount < 0) {
        errors.push('Payment amount must be a valid non-negative number');
      }
    }
  }
  
  return errors;
};

// FIXED: Enhanced sanitization function
const sanitizeFieldData = (fieldData) => {
  const normalizedType = normalizeFieldType(fieldData.type);
  
  const sanitized = {
    formId: parseInt(fieldData.formId),
    type: normalizedType,
    question: fieldData.question.trim(),
    description: (fieldData.description || '').trim(),
    required: Boolean(fieldData.required)
  };
  
  // Add type-specific properties
  switch (normalizedType) {
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOXES':
    case 'DROPDOWN':
      if (fieldData.options && Array.isArray(fieldData.options)) {
        sanitized.options = fieldData.options.map((option, index) => ({
          id: option.id || (index + 1),
          value: (option.value || `Option ${index + 1}`).trim(),
          score: typeof option.score === 'number' ? option.score : 0
        }));
      } else {
        sanitized.options = [
          { id: 1, value: 'Option 1', score: 0 },
          { id: 2, value: 'Option 2', score: 0 }
        ];
      }
      break;
      
    case 'LINEAR_SCALE':
      sanitized.scaleMin = fieldData.scaleMin || 1;
      sanitized.scaleMax = fieldData.scaleMax || 5;
      break;
      
    case 'PAYMENT':
      sanitized.amount = fieldData.amount !== undefined ? parseFloat(fieldData.amount) : 0;
      sanitized.currency = fieldData.currency || 'USD';
      break;
      
    case 'CALCULATED':
      sanitized.calculation = fieldData.calculation || [];
      break;
  }
  
  // Convert certain fields to JSON if they exist
  if (sanitized.options) {
    sanitized.options = JSON.stringify(sanitized.options);
  }
  if (sanitized.calculation) {
    sanitized.calculation = JSON.stringify(sanitized.calculation);
  }
  
  return sanitized;
};

// GET route - fetch fields for a form
router.get('/:formId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const formId = parseInt(req.params.formId);

    if (isNaN(formId)) {
      return res.status(400).json({ 
        error: 'Invalid form ID', 
        details: 'formId must be a valid integer' 
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
        error: 'Form not found or you do not have permission' 
      });
    }

    // Fetch fields
    const fields = await prisma.field.findMany({
      where: { formId: formId },
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
      orderBy: { id: 'asc' },
    });

    // Parse JSON fields
    const processedFields = fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      calculation: field.calculation ? JSON.parse(field.calculation) : null,
      conditions: field.conditions ? JSON.parse(field.conditions) : null,
    }));

    console.log(`Found ${fields.length} fields for form ${formId}`);
    res.json(processedFields);
    
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

// POST route - create new field
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Received field creation request:', req.body);
    
    // Validate input data
    const validationErrors = validateFieldData(req.body);
    if (validationErrors.length > 0) {
      console.error('Field validation failed:', validationErrors);
      return res.status(400).json({ 
        error: 'Invalid field data', 
        details: validationErrors.join('; '),
        received: req.body
      });
    }
    
    // Verify form ownership
    const formId = parseInt(req.body.formId);
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: decoded.userId,
      },
    });

    if (!form) {
      console.error(`Form not found: formId=${formId}, userId=${decoded.userId}`);
      return res.status(404).json({ 
        error: 'Form not found or you do not have permission',
        details: `No form found with id ${formId} for user ${decoded.userId}`
      });
    }

    // Sanitize field data
    const sanitizedData = sanitizeFieldData(req.body);
    
    console.log('Creating field with sanitized data:', sanitizedData);

    // Create field
    const field = await prisma.field.create({
      data: sanitizedData,
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

    // Parse JSON fields for response
    const responseField = {
      ...field,
      options: field.options ? JSON.parse(field.options) : null,
      calculation: field.calculation ? JSON.parse(field.calculation) : null,
      conditions: field.conditions ? JSON.parse(field.conditions) : null,
    };

    console.log('Field created successfully:', responseField);
    res.status(201).json(responseField);
    
  } catch (error) {
    console.error('Field creation error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        error: 'Database validation error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Invalid data format',
      });
    }
    
    res.status(500).json({
      error: 'Failed to create field',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
});

// PATCH route - update field
router.patch('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fieldId = parseInt(req.params.id);

    if (isNaN(fieldId)) {
      return res.status(400).json({ error: 'Invalid field ID' });
    }

    // Verify field exists and user owns the form
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        form: { select: { userId: true } }
      }
    });

    if (!field || field.form.userId !== decoded.userId) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not own this field' 
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Normalize field type if provided
    if (updateData.type) {
      updateData.type = normalizeFieldType(updateData.type);
      if (!validFieldTypes.includes(updateData.type)) {
        return res.status(400).json({ 
          error: 'Invalid field type',
          details: `Type must be one of: ${validFieldTypes.join(', ')}`
        });
      }
    }
    
    // Handle JSON fields
    if (updateData.options && typeof updateData.options === 'object') {
      updateData.options = JSON.stringify(updateData.options);
    }
    if (updateData.calculation && typeof updateData.calculation === 'object') {
      updateData.calculation = JSON.stringify(updateData.calculation);
    }
    
    // Update the field
    const updatedField = await prisma.field.update({
      where: { id: fieldId },
      data: updateData,
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

    // Parse JSON fields for response
    const responseField = {
      ...updatedField,
      options: updatedField.options ? JSON.parse(updatedField.options) : null,
      calculation: updatedField.calculation ? JSON.parse(updatedField.calculation) : null,
      conditions: updatedField.conditions ? JSON.parse(updatedField.conditions) : null,
    };

    res.json(responseField);
    
  } catch (error) {
    console.error('Field update error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    res.status(500).json({
      error: 'Failed to update field',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE route - delete field
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fieldId = parseInt(req.params.id);

    if (isNaN(fieldId)) {
      return res.status(400).json({ error: 'Invalid field ID' });
    }

    // Verify field exists and user owns the form
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        form: { select: { userId: true } }
      }
    });

    if (!field || field.form.userId !== decoded.userId) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not own this field' 
      });
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