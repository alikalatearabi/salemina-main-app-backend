/*
  Warnings:

  - A unique constraint covering the columns `[persianName]` on the table `food_preferences` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "food_preferences" ADD COLUMN "persianName" TEXT;

-- Update existing records with name as placeholder
UPDATE "food_preferences" SET "persianName" = name || ' (Persian)' WHERE "persianName" IS NULL;

-- Now make the column required
ALTER TABLE "food_preferences" ALTER COLUMN "persianName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "food_preferences_persianName_key" ON "food_preferences"("persianName");
