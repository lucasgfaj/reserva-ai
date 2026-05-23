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
  
  // Clear existing data in reverse dependency order
  await prisma.reservationApproval.deleteMany({})
  await prisma.reservation.deleteMany({})
  await prisma.commonArea.deleteMany({})
  await prisma.resident.deleteMany({})
  await prisma.unit.deleteMany({})
  await prisma.block.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.condominium.deleteMany({})

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

  // Create common areas
  const areas = [
    {
      name: 'Salão de Festas',
      description: 'Espaço amplo e climatizado para confraternizações e eventos sociais. Possui cozinha, banheiros e sistema de som.',
      capacity: 80,
      openTime: '08:00',
      closeTime: '23:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: true,
      icon: 'celebration',
      isUnderMaintenance: false,
    },
    {
      name: 'Churrasqueira',
      description: 'Área gourmet ao ar livre com churrasqueira, forno a lenha e mesas para confraternizações.',
      capacity: 40,
      openTime: '10:00',
      closeTime: '22:00',
      operatingDays: [6, 0],
      requiresApproval: false,
      icon: 'outdoor_grill',
    },
    {
      name: 'Piscina',
      description: 'Piscina adulto e infantil com deck, espreguiçadeiras e área de convivência.',
      capacity: 60,
      openTime: '09:00',
      closeTime: '21:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: false,
      icon: 'pool',
    },
    {
      name: 'Quadra Poliesportiva',
      description: 'Quadra coberta para futebol society, basquete e vôlei. Inclui vestiários.',
      capacity: 30,
      openTime: '07:00',
      closeTime: '22:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: false,
      icon: 'sports_tennis',
    },
    {
      name: 'Academia',
      description: 'Academia equipada com aparelhos de musculação, esteiras, bicicletas ergométricas e peso livre.',
      capacity: 20,
      openTime: '06:00',
      closeTime: '22:00',
      operatingDays: [1, 2, 3, 4, 5, 6],
      requiresApproval: false,
      icon: 'fitness_center',
    },
    {
      name: 'Espaço Gourmet',
      description: 'Cozinha completa e área de jantar para eventos gastronômicos e aulas de culinária.',
      capacity: 25,
      openTime: '10:00',
      closeTime: '23:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: true,
      icon: 'kitchen',
    },
    {
      name: 'Brinquedoteca',
      description: 'Espaço infantil com brinquedos educativos, jogos, livros e monitores.',
      capacity: 15,
      openTime: '09:00',
      closeTime: '18:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: false,
      icon: 'toys',
    },
    {
      name: 'Salão de Jogos',
      description: 'Espaço com mesas de sinuca, ping-pong, totó e videogames. Climatizado.',
      capacity: 20,
      openTime: '14:00',
      closeTime: '22:00',
      operatingDays: [1, 2, 3, 4, 5, 6, 0],
      requiresApproval: false,
      icon: 'sports_esports',
    },
  ]

  for (const area of areas) {
    await prisma.commonArea.create({
      data: {
        ...area,
        operatingDays: area.operatingDays,
        condominiumId: condominio.id,
      },
    })
    console.log(`Created common area: ${area.name}`)
  }

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