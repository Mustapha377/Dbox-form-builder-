// routes/integrations.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from '../middleware/auth.js';
import axios from 'axios';

const prisma = new PrismaClient();
const router = express.Router();

// Webhook endpoint
router.post('/:formId/webhook', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { url, events, headers = {} } = req.body;
    
    const webhook = await prisma.webhook.create({
      data: {
        formId: parseInt(formId),
        url,
        events, // ['response_submitted', 'form_updated', etc.]
        headers: JSON.stringify(headers),
        isActive: true
      }
    });
    
    res.json(webhook);
  } catch (error) {
    console.error('Webhook creation error:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Slack integration
router.post('/:formId/integrations/slack', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { webhookUrl, channel, events } = req.body;
    
    const integration = await prisma.integration.create({
      data: {
        formId: parseInt(formId),
        provider: 'slack',
        config: JSON.stringify({ webhookUrl, channel, events }),
        isActive: true
      }
    });
    
    res.json(integration);
  } catch (error) {
    console.error('Slack integration error:', error);
    res.status(500).json({ error: 'Failed to setup Slack integration' });
  }
});

// WhatsApp integration
router.post('/:formId/integrations/whatsapp', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { phoneNumber, apiKey, template } = req.body;
    
    const integration = await prisma.integration.create({
      data: {
        formId: parseInt(formId),
        provider: 'whatsapp',
        config: JSON.stringify({ phoneNumber, apiKey, template }),
        isActive: true
      }
    });
    
    res.json(integration);
  } catch (error) {
    console.error('WhatsApp integration error:', error);
    res.status(500).json({ error: 'Failed to setup WhatsApp integration' });
  }
});

// Discord integration
router.post('/:formId/integrations/discord', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { webhookUrl, embedColor, events } = req.body;
    
    const integration = await prisma.integration.create({
      data: {
        formId: parseInt(formId),
        provider: 'discord',
        config: JSON.stringify({ webhookUrl, embedColor, events }),
        isActive: true
      }
    });
    
    res.json(integration);
  } catch (error) {
    console.error('Discord integration error:', error);
    res.status(500).json({ error: 'Failed to setup Discord integration' });
  }
});

// Trigger integrations when form response is submitted
export const triggerIntegrations = async (formId, responseData) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { formId: parseInt(formId), isActive: true }
    });
    
    for (const integration of integrations) {
      const config = JSON.parse(integration.config);
      
      switch (integration.provider) {
        case 'slack':
          await axios.post(config.webhookUrl, {
            channel: config.channel,
            text: `New form submission received!`,
            attachments: [{
              color: 'good',
              fields: Object.entries(responseData.data).map(([key, value]) => ({
                title: key,
                value: value,
                short: true
              }))
            }]
          });
          break;
          
        case 'discord':
          await axios.post(config.webhookUrl, {
            embeds: [{
              title: 'New Form Submission',
              color: parseInt(config.embedColor || '0x00ff00', 16),
              fields: Object.entries(responseData.data).map(([key, value]) => ({
                name: key,
                value: value,
                inline: true
              })),
              timestamp: new Date().toISOString()
            }]
          });
          break;
          
        case 'whatsapp':
          // WhatsApp Business API call
          await axios.post('https://graph.facebook.com/v17.0/YOUR_PHONE_ID/messages', {
            messaging_product: 'whatsapp',
            to: config.phoneNumber,
            type: 'template',
            template: {
              name: config.template,
              language: { code: 'en' },
              components: [{
                type: 'body',
                parameters: [{ type: 'text', text: 'New form submission received' }]
              }]
            }
          }, {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          break;
      }
    }
  } catch (error) {
    console.error('Integration trigger error:', error);
  }
};

export default router;
