-- CreateEnum
CREATE TYPE "TeachingFormat" AS ENUM ('ONLINE', 'IN_PERSON', 'BOTH');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('STUDENT', 'ENGINEERING_STUDENT', 'JUNIOR_ENGINEER', 'TEACHER', 'FREELANCER', 'EXPERT');

-- CreateEnum
CREATE TYPE "HourlyRateType" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SUSPENDED');

-- AlterTable
ALTER TABLE "provider_profiles"
ADD COLUMN IF NOT EXISTS "teaching_format_enum" "TeachingFormat",
ADD COLUMN IF NOT EXISTS "cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "experience_level_enum" "ExperienceLevel",
ADD COLUMN IF NOT EXISTS "studyYear" TEXT,
ADD COLUMN IF NOT EXISTS "studentYear" TEXT,
ADD COLUMN IF NOT EXISTS "hourlyRateType" "HourlyRateType",
ADD COLUMN IF NOT EXISTS "pricingTier" TEXT,
ADD COLUMN IF NOT EXISTS "hourlyRateMin" INTEGER,
ADD COLUMN IF NOT EXISTS "hourlyRateMax" INTEGER,
ADD COLUMN IF NOT EXISTS "profileStatus" "ProfileStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_categories" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_skills" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "provider_categories_providerId_idx" ON "provider_categories"("providerId");

-- CreateIndex
CREATE INDEX "provider_categories_categoryId_idx" ON "provider_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_categories_providerId_categoryId_key" ON "provider_categories"("providerId", "categoryId");

-- CreateIndex
CREATE INDEX "provider_skills_providerId_idx" ON "provider_skills"("providerId");

-- CreateIndex
CREATE INDEX "provider_skills_skillId_idx" ON "provider_skills"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_skills_providerId_skillId_key" ON "provider_skills"("providerId", "skillId");

-- CreateIndex
CREATE INDEX "provider_profiles_profileStatus_idx" ON "provider_profiles"("profileStatus");

-- CreateIndex
CREATE INDEX "provider_profiles_experience_level_enum_idx" ON "provider_profiles"("experience_level_enum");

-- CreateIndex
CREATE INDEX "provider_profiles_teaching_format_enum_idx" ON "provider_profiles"("teaching_format_enum");

-- AddForeignKey
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_categories" ADD CONSTRAINT "provider_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_skills" ADD CONSTRAINT "provider_skills_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_skills" ADD CONSTRAINT "provider_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
