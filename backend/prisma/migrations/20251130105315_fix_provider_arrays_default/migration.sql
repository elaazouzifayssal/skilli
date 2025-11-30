-- AlterTable
ALTER TABLE "provider_profiles" ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "categories" SET DEFAULT ARRAY[]::TEXT[];
