-- DropForeignKey
ALTER TABLE "residents" DROP CONSTRAINT "residents_unitId_fkey";

-- AlterTable
ALTER TABLE "residents" ALTER COLUMN "unitId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
