// routes/collaboration.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const router = express.Router();

// Create transporter for sending emails
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Add collaborator to form
router.post('/:formId/collaborators', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { email, role = 'editor' } = req.body;
    
    // Verify form ownership
    const form = await prisma.form.findFirst({
      where: { id: parseInt(formId), userId: req.user.userId }
    });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found or access denied' });
    }
    
    // Check if user exists
    let collaboratorUser = await prisma.user.findUnique({ where: { email } });
    
    if (!collaboratorUser) {
      // Create invitation for non-existing user
      const invitation = await prisma.formInvitation.create({
        data: {
          formId: parseInt(formId),
          email,
          role,
          invitedBy: req.user.userId,
          token: generateInviteToken(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
      
      // Send invitation email
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `You've been invited to collaborate on ${form.title}`,
        html: `
          <h2>Form Collaboration Invitation</h2>
          <p>You've been invited to collaborate on the form "${form.title}" with ${role} permissions.</p>
          <a href="${process.env.FRONTEND_URL}/invite/${invitation.token}" 
             style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Accept Invitation
          </a>
          <p>This invitation expires in 7 days.</p>
        `
      });
      
      return res.json({ message: 'Invitation sent', invitation });
    }
    
    // Add existing user as collaborator
    const collaborator = await prisma.formCollaborator.create({
      data: {
        formId: parseInt(formId),
        userId: collaboratorUser.id,
        role,
        addedBy: req.user.userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.json(collaborator);
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Get form collaborators
router.get('/:formId/collaborators', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    
    const collaborators = await prisma.formCollaborator.findMany({
      where: { formId: parseInt(formId) },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.json(collaborators);
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: 'Failed to get collaborators' });
  }
});

// Update collaborator permissions
router.patch('/:formId/collaborators/:collaboratorId', authenticate, async (req, res) => {
  try {
    const { formId, collaboratorId } = req.params;
    const { role } = req.body;
    
    const collaborator = await prisma.formCollaborator.update({
      where: { id: parseInt(collaboratorId) },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    res.json(collaborator);
  } catch (error) {
    console.error('Update collaborator error:', error);
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
});

// Remove collaborator
router.delete('/:formId/collaborators/:collaboratorId', authenticate, async (req, res) => {
  try {
    await prisma.formCollaborator.delete({
      where: { id: parseInt(req.params.collaboratorId) }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

function generateInviteToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default router;