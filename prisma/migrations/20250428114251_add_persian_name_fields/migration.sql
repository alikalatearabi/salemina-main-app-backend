/*
  Warnings:

  - You are about to drop the column `description` on the `illnesses` table. All the data in the column will be lost.
  - The `level` column on the `user_illnesses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[persianName]` on the table `allergies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[persianName]` on the table `illnesses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `persianName` to the `allergies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `persianName` to the `illnesses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserIllnessLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "allergies" ADD COLUMN     "persianName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "illnesses" DROP COLUMN "description",
ADD COLUMN     "persianName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_illnesses" DROP COLUMN "level",
ADD COLUMN     "level" "UserIllnessLevel" NOT NULL DEFAULT 'MEDIUM';

-- DropEnum
DROP TYPE "IllnessLevel";

-- CreateTable
CREATE TABLE "IllnessLevel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "persianName" TEXT NOT NULL,
    "illnessId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IllnessLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IllnessLevel_illnessId_name_key" ON "IllnessLevel"("illnessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_persianName_key" ON "allergies"("persianName");

-- CreateIndex
CREATE UNIQUE INDEX "illnesses_persianName_key" ON "illnesses"("persianName");

-- AddForeignKey
ALTER TABLE "IllnessLevel" ADD CONSTRAINT "IllnessLevel_illnessId_fkey" FOREIGN KEY ("illnessId") REFERENCES "illnesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
