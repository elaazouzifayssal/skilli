-- AlterTable
ALTER TABLE "provider_profiles" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pricingTier" TEXT,
ADD COLUMN     "studentYear" TEXT,
ADD COLUMN     "teachingFormat" TEXT;
