"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting seed...');
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
    });
    console.log(`Created condomínio: ${condominio.id}`);
    // Create block
    const block = await prisma.block.create({
        data: {
            name: 'Bloco A',
            condominiumId: condominio.id,
        },
    });
    console.log(`Created block: ${block.id}`);
    // Create unit
    const unit = await prisma.unit.create({
        data: {
            number: '101',
            blockId: block.id,
        },
    });
    console.log(`Created unit: ${unit.id}`);
    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
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
    });
    console.log(`Created admin user: ${adminUser.email}`);
    // Create resident user
    const residentPasswordHash = await bcrypt.hash('resident123', 10);
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
    });
    console.log(`Created resident user: ${residentUser.email}`);
    // Link resident to unit
    await prisma.resident.create({
        data: {
            userId: residentUser.id,
            unitId: unit.id,
            canBook: true,
            phone: '(11) 99999-9999',
            document: '123.456.789-00',
        },
    });
    console.log(`Created resident profile`);
    console.log('Seed completed successfully!');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
