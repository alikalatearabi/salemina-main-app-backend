-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "IllnessLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AppetiteMode" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "password" TEXT,
    "gender" "Gender",
    "birth_date" TIMESTAMP(3),
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "ideal_weight" DOUBLE PRECISION,
    "activity_level" "ActivityLevel",
    "water_intake" DOUBLE PRECISION,
    "appetite_mode" "AppetiteMode",
    "signup_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT NOT NULL,
    "main_data_status" INTEGER NOT NULL DEFAULT 0,
    "extra_data_status" TEXT,
    "importer" TEXT,
    "monitor" TEXT,
    "cluster" TEXT,
    "child_cluster" TEXT,
    "product_name" TEXT NOT NULL,
    "brand" TEXT,
    "picture_old" TEXT,
    "picture_new" TEXT,
    "picture_main_info" TEXT,
    "picture_extra_info" TEXT,
    "product_description" TEXT,
    "state_of_matter" INTEGER,
    "per" DOUBLE PRECISION,
    "calorie" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "salt" DOUBLE PRECISION,
    "trans_fatty_acids" DOUBLE PRECISION,
    "per_ext" TEXT,
    "calorie_ext" TEXT,
    "cal_fat" TEXT,
    "total_fat" TEXT,
    "saturated_fat" TEXT,
    "unsaturated_fat" TEXT,
    "trans_fat" TEXT,
    "protein" TEXT,
    "sugar_ext" TEXT,
    "carbohydrate" TEXT,
    "fiber" TEXT,
    "salt_ext" TEXT,
    "sodium" TEXT,
    "cholesterol" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consumed_products" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "serving_size" DOUBLE PRECISION,
    "meal_type" "MealType" NOT NULL,
    "consumed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_consumed_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "illnesses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "illnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_illnesses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "illness_id" INTEGER NOT NULL,
    "level" "IllnessLevel" NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_illnesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_allergies" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "allergy_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_preferences" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_food_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "food_preference_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_food_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "user_consumed_products_user_id_consumed_at_idx" ON "user_consumed_products"("user_id", "consumed_at");

-- CreateIndex
CREATE UNIQUE INDEX "illnesses_name_key" ON "illnesses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_illnesses_user_id_illness_id_key" ON "user_illnesses"("user_id", "illness_id");

-- CreateIndex
CREATE UNIQUE INDEX "allergies_name_key" ON "allergies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_allergies_user_id_allergy_id_key" ON "user_allergies"("user_id", "allergy_id");

-- CreateIndex
CREATE UNIQUE INDEX "food_preferences_name_key" ON "food_preferences"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_food_preferences_user_id_food_preference_id_key" ON "user_food_preferences"("user_id", "food_preference_id");

-- AddForeignKey
ALTER TABLE "user_consumed_products" ADD CONSTRAINT "user_consumed_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consumed_products" ADD CONSTRAINT "user_consumed_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_illnesses" ADD CONSTRAINT "user_illnesses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_illnesses" ADD CONSTRAINT "user_illnesses_illness_id_fkey" FOREIGN KEY ("illness_id") REFERENCES "illnesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_allergies" ADD CONSTRAINT "user_allergies_allergy_id_fkey" FOREIGN KEY ("allergy_id") REFERENCES "allergies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_food_preferences" ADD CONSTRAINT "user_food_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_food_preferences" ADD CONSTRAINT "user_food_preferences_food_preference_id_fkey" FOREIGN KEY ("food_preference_id") REFERENCES "food_preferences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
