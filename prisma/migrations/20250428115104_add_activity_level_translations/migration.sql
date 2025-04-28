-- CreateTable
CREATE TABLE "activity_level_translations" (
    "id" SERIAL NOT NULL,
    "level" "ActivityLevel" NOT NULL,
    "persianName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_level_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_level_translations_level_key" ON "activity_level_translations"("level");
