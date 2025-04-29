-- AlterTable
ALTER TABLE "users" ADD COLUMN     "recommended_daily_calories" DOUBLE PRECISION,
ADD COLUMN     "recommended_daily_fat" DOUBLE PRECISION,
ADD COLUMN     "recommended_daily_salt" DOUBLE PRECISION,
ADD COLUMN     "recommended_daily_sugar" DOUBLE PRECISION;
