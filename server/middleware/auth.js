// middleware/auth.js - Fixed authentication middleware
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    console.log('🔐 Auth middleware - Token received:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Token verification failed:', err.message);
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }
      
      // Set both req.userId and req.user for compatibility
      req.userId = decoded.userId;
      req.user = { 
        id: decoded.userId,
        userId: decoded.userId 
      };
      
      console.log('✅ Token verified for user:', decoded.userId);
      next();
    });
    
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};