// routes/users.js - Updated user routes
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();
const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        language: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            forms: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      ...user,
      formsCount: user._count.forms
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user data',
      code: 'FETCH_USER_ERROR'
    });
  }
});

// Update user profile
router.patch('/me', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('language')
    .optional()
    .isIn(['English', 'Spanish', 'French', 'German'])
    .withMessage('Invalid language selection')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      });
    }

    const { name, language } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (language !== undefined) updateData.language = language;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        language: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      code: 'UPDATE_USER_ERROR'
    });
  }
});

// Delete user account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    // Delete user and all related data (cascade delete should handle this)
    await prisma.user.delete({
      where: { id: req.userId }
    });

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      code: 'DELETE_USER_ERROR'
    });
  }
});

export default router;