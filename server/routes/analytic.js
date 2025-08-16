// routes/analytics.js
import express from 'express';
import { PrismaClient } from '@prisma/prisma-client';
import authenticate from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Get real-time analytics
router.get('/:formId/realtime', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    const { timeRange = '24h' } = req.query;
    
    // Calculate time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '1h':
        startDate = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 24 * 60 * 60 * 1000);
    }
    
    // Get form views and responses
    const [views, responses, completionTimes] = await Promise.all([
      prisma.formView.count({
        where: {
          formId: parseInt(formId),
          viewedAt: { gte: startDate }
        }
      }),
      
      prisma.response.count({
        where: {
          formId: parseInt(formId),
          submittedAt: { gte: startDate }
        }
      }),
      
      prisma.response.findMany({
        where: {
          formId: parseInt(formId),
          submittedAt: { gte: startDate }
        },
        select: {
          submittedAt: true,
          startedAt: true
        }
      })
    ]);
    
    // Calculate completion rate and average time
    const completionRate = views > 0 ? (responses / views) * 100 : 0;
    const avgCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, r) => {
          const time = r.startedAt ? (new Date(r.submittedAt) - new Date(r.startedAt)) / 1000 : 0;
          return sum + time;
        }, 0) / completionTimes.length
      : 0;
    
    // Get device breakdown
    const deviceStats = await prisma.formView.groupBy({
      by: ['deviceType'],
      where: {
        formId: parseInt(formId),
        viewedAt: { gte: startDate }
      },
      _count: true
    });
    
    // Get hourly breakdown for charts
    const hourlyData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', submitted_at) as hour,
        COUNT(*) as responses
      FROM responses 
      WHERE form_id = ${parseInt(formId)} 
        AND submitted_at >= ${startDate}
      GROUP BY hour 
      ORDER BY hour
    `;
    
    res.json({
      metrics: {
        views,
        responses,
        completionRate: Math.round(completionRate * 10) / 10,
        avgCompletionTime: Math.round(avgCompletionTime),
        dropOffRate: Math.round((100 - completionRate) * 10) / 10
      },
      deviceStats,
      hourlyData,
      timeRange
    });
    
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get heatmap data
router.get('/:formId/heatmap', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    
    // Get click/interaction data (simulated for now)
    const heatmapData = await prisma.formInteraction.findMany({
      where: { formId: parseInt(formId) },
      select: {
        fieldId: true,
        interactionType: true,
        xPosition: true,
        yPosition: true,
        timestamp: true
      },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });
    
    res.json({ heatmapData });
  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({ error: 'Failed to get heatmap data' });
  }
});

// Get sentiment analysis summary
router.get('/:formId/sentiment', authenticate, async (req, res) => {
  try {
    const { formId } = req.params;
    
    const sentimentData = await prisma.response.findMany({
      where: { 
        formId: parseInt(formId),
        sentiment: { not: null }
      },
      select: {
        sentiment: true,
        sentimentScore: true,
        emotions: true
      }
    });
    
    // Aggregate sentiment data
    const sentimentSummary = sentimentData.reduce((acc, curr) => {
      const sentiment = curr.sentiment.toLowerCase();
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const total = sentimentData.length;
    const sentimentPercentages = {
      positive: Math.round((sentimentSummary.positive || 0) / total * 100),
      neutral: Math.round((sentimentSummary.neutral || 0) / total * 100),
      negative: Math.round((sentimentSummary.negative || 0) / total * 100)
    };
    
    res.json({
      total,
      percentages: sentimentPercentages,
      rawData: sentimentData
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Failed to get sentiment analysis' });
  }
});

export default router;