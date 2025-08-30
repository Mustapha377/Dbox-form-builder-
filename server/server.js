// server.js - Updated Express server setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import formRoutes from './routes/forms.js';
import uploadRoutes from './routes/upload.js';
import responsesRoutes from './routes/responses.js';
import usersRoutes from './routes/users.js';
import paymentsRoutes from './routes/payment.js';
import fieldsRoutes from './routes/fields.js';
import webhooksRoutes from './routes/webhooks.js';

// Import middleware
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000", "https://localhost:5173"]
    }
  }
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://localhost:5173',
    'http://localhost:5000',
    'https://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Static files
app.use('/uploads', express.static('public/uploads', {
  maxAge: '1d',
  etag: true
}));

// Health check (before auth)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhooksRoutes); // Webhooks should be public

// Protected routes (authentication required)
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/forms', authenticateToken, formRoutes);
app.use('/api/fields', authenticateToken, fieldsRoutes);
app.use('/api/responses', authenticateToken, responsesRoutes);
app.use('/api/uploads', authenticateToken, uploadRoutes);
app.use('/api/payments', authenticateToken, paymentsRoutes);

// Test protected route
app.get('/api/test/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Database connection test
const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Run a simple query to ensure everything is working
    const userCount = await prisma.user.count();
    console.log(`📊 Database stats: ${userCount} users`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Start server
app.listen(PORT, HOST, async () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔒 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Missing'}`);
  
  // Test database connection
  await testDatabaseConnection();
  
  console.log('🎉 Server startup complete!');
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;