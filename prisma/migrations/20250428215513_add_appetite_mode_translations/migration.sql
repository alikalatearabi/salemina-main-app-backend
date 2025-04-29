-- CreateTable
CREATE TABLE "appetite_mode_translations" (
    "id" SERIAL NOT NULL,
    "mode" "AppetiteMode" NOT NULL,
    "persian_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appetite_mode_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appetite_mode_translations_mode_key" ON "appetite_mode_translations"("mode");
