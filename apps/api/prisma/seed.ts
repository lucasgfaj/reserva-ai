import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Load environment variables from .env file
dotenv.config({ path: './.env' })

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')
  
  // Clear existing data (optional)
  // await prisma.reservationApproval.deleteMany({})
  // await prisma.reservation.deleteMany({})
  // await prisma.commonArea.deleteMany({})
  // await prisma.resident.deleteMany({})
  // await prisma.unit.deleteMany({})
  // await prisma.block.deleteMany({})
  // await prisma.user.deleteMany({})
  // await prisma.condominium.deleteMany({})

  // Create condomínio
  const condominio = await prisma.condominium.create({
    data: {
      name: 'Condomínio Vila Verde',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      timezone: 'America/Sao_Paulo',
    },
  })
  console.log(`Created condomínio: ${condominio.id}`)

  // Create block
  const block = await prisma.block.create({
    data: {
      name: 'Bloco A',
      condominiumId: condominio.id,
    },
  })
  console.log(`Created block: ${block.id}`)

  // Create unit
  const unit = await prisma.unit.create({
    data: {
      number: '101',
      blockId: block.id,
    },
  })
  console.log(`Created unit: ${unit.id}`)

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador Sistema',
      email: 'admin@reservai.com',
      passwordHash: adminPasswordHash,
      provider: 'LOCAL',
      role: 'ADMIN',
      condominiumId: condominio.id,
      isActive: true,
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // Create resident user
  const residentPasswordHash = await bcrypt.hash('Resident@123', 10)
  const residentUser = await prisma.user.create({
    data: {
      name: 'Morador Teste',
      email: 'morador@reservai.com',
      passwordHash: residentPasswordHash,
      provider: 'LOCAL',
      role: 'RESIDENT',
      condominiumId: condominio.id,
      isActive: true,
    },
  })
  console.log(`Created resident user: ${residentUser.email}`)

  // Link resident to unit
  await prisma.resident.create({
    data: {
      userId: residentUser.id,
      unitId: unit.id,
      canBook: true,
      phone: '(11) 99999-9999',
      document: '123.456.789-00',
    },
  })
  console.log(`Created resident profile`)

  console.log('Seed completed successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })