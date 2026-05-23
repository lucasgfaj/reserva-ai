import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Load environment variables from .env file in the apps/api directory
dotenv.config({ path: './.env' })

// Verify DATABASE_URL is loaded
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded' : 'Not found');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env file')
}

const prisma = new PrismaClient()

async function main() {
  console.log('🔌 Testing database connection...')
  
  try {
    // Try a simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful!')
    console.log('Query result:', result)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()