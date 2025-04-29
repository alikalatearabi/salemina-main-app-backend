-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserIllnessLevel" ADD VALUE 'YES';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'NORMAL';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'NO';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'HYPOTHYROIDISM';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'HYPERTHYROIDISM';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'UNKNOWN';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'HEALTHY';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'PREDIABETES';
ALTER TYPE "UserIllnessLevel" ADD VALUE 'DIABETES';
