import { IsString, IsOptional, IsArray, IsIn, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator';

// Enums matching Prisma schema
export enum TeachingFormat {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  BOTH = 'BOTH',
}

export enum ExperienceLevel {
  STUDENT = 'STUDENT',
  ENGINEERING_STUDENT = 'ENGINEERING_STUDENT',
  JUNIOR_ENGINEER = 'JUNIOR_ENGINEER',
  TEACHER = 'TEACHER',
  FREELANCER = 'FREELANCER',
  EXPERT = 'EXPERT',
}

export enum HourlyRateType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  CUSTOM = 'CUSTOM',
}

export enum ProfileStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
}

// Constants for legacy string fields (backward compatibility)
const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Temara',
  'Mohammedia', 'Khouribga', 'El Jadida', 'Beni Mellal', 'Nador'
];

const EDUCATION_LEVELS = [
  'Collège', 'Lycée', 'Bac', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Bac+8'
];

const TEACHING_FORMATS_LEGACY = ['online', 'presential', 'both'];
const EXPERIENCE_LEVELS_LEGACY = ['student', 'engineering_student', 'junior_engineer', 'teacher', 'freelance', 'expert'];
const PRICING_TIERS = ['basic', 'standard', 'premium', 'custom'];

export class CreateProviderProfileDto {
  // Basic info
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  // Legacy fields (for backward compatibility with current mobile app)
  @IsOptional()
  @IsString()
  @IsIn(MOROCCAN_CITIES, { message: 'City must be a valid Moroccan city' })
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  @IsIn(EDUCATION_LEVELS, { message: 'Level must be a valid education level' })
  level?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsString()
  @IsIn(TEACHING_FORMATS_LEGACY, { message: 'Teaching format must be online, presential, or both' })
  teachingFormat?: string;

  @IsOptional()
  @IsString()
  @IsIn(EXPERIENCE_LEVELS_LEGACY, { message: 'Experience level must be valid' })
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  studentYear?: string;

  @IsOptional()
  @IsString()
  @IsIn(PRICING_TIERS, { message: 'Pricing tier must be valid' })
  pricingTier?: string;

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  // New enum-based fields (preferred for new implementations)
  @IsOptional()
  @IsEnum(TeachingFormat)
  teachingFormatNew?: TeachingFormat;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevelNew?: ExperienceLevel;

  @IsOptional()
  @IsString()
  studyYear?: string;

  @IsOptional()
  @IsEnum(HourlyRateType)
  hourlyRateType?: HourlyRateType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMax?: number;

  // Onboarding
  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  // NOTE: profileStatus is NOT settable by users (managed by service layer)
  // NOTE: isPhoneVerified is read-only (set by admin/system only)
  // NOTE: isEmailVerified is read-only (set by admin/system only)
}
