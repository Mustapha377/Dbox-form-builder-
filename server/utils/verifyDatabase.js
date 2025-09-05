//verifyDatabase.js - Add this to your server startup
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyDatabaseSchema = async () => {
  try {
    console.log('🔍 Verifying database schema...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist by running simple queries
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists - ${userCount} users found`);
    } catch (error) {
      console.error('❌ Users table issue:', error.message);
    }
    
    try {
      const formCount = await prisma.form.count();
      console.log(`✅ Forms table exists - ${formCount} forms found`);
    } catch (error) {
      console.error('❌ Forms table issue:', error.message);
    }
    
    try {
      const responseCount = await prisma.response.count();
      console.log(`✅ Responses table exists - ${responseCount} responses found`);
    } catch (error) {
      console.error('❌ Responses table issue:', error.message);
    }
    
    // Check specific columns that might cause issues
    try {
      await prisma.$queryRaw`SELECT id, title, description, fields, sections, settings FROM "Form" LIMIT 1`;
      console.log('✅ Form table schema looks good');
    } catch (error) {
      console.error('❌ Form table schema issue:', error.message);
      console.error('💡 Hint: Make sure your Form table has: id, title, description, fields (JSON), sections (JSON), settings (JSON)');
    }
    
    // Test a user query similar to what the routes will do
    try {
      const testUser = await prisma.user.findFirst({
        select: { id: true, email: true }
      });
      if (testUser) {
        console.log(`✅ Can query user: ${testUser.email} (ID: ${testUser.id})`);
        
        // Test form query for this user
        const userForms = await prisma.form.findMany({
          where: { userId: testUser.id },
          select: { id: true, title: true }
        });
        console.log(`✅ User has ${userForms.length} forms`);
      }
    } catch (error) {
      console.error('❌ User query test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    throw error;
  }
};

// Test authentication token parsing
export const testTokenParsing = () => {
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1Njc5NTUyMywiZXhwIjoxNzU2ODgxOTIzLCJhdWQiOiJkYm94LXVzZXJzIiwiaXNzIjoiZGJveC1hcHAifQ.03TFYze0WGBDl6WkkLwfXdabEeL8Y4qqORLc04O-rVI';
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Token parsing test passed:', decoded);
    return decoded;
  } catch (error) {
    console.error('❌ Token parsing test failed:', error.message);
    return null;
  }
};