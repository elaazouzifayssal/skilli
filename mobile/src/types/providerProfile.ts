/**
 * Provider Profile Types
 *
 * These types match the backend enums and DTOs defined in:
 * /backend/src/provider-profiles/dto/create-provider-profile.dto.ts
 *
 * IMPORTANT: Keep these in sync with backend definitions
 */

// ============================================================================
// ENUMS (matching backend)
// ============================================================================

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
  BASIC = 'BASIC',        // 50-100 MAD
  STANDARD = 'STANDARD',  // 100-200 MAD
  PREMIUM = 'PREMIUM',    // 200-500 MAD
  CUSTOM = 'CUSTOM',      // User-defined range
}

export enum ProfileStatus {
  DRAFT = 'DRAFT',                    // Incomplete profile
  PENDING_REVIEW = 'PENDING_REVIEW',  // Complete, awaiting approval
  APPROVED = 'APPROVED',              // Active and visible to clients
  SUSPENDED = 'SUSPENDED',            // Temporarily disabled by admin
}

// ============================================================================
// API REQUEST TYPES
// ============================================================================

/**
 * Payload for creating or updating provider profile
 * POST/PATCH /api/provider-profiles/me
 */
export interface CreateProviderProfilePayload {
  // Basic info
  bio?: string;
  photo?: string;

  // New enum-based fields (PREFERRED - use these)
  teachingFormatNew?: TeachingFormat;
  experienceLevelNew?: ExperienceLevel;
  hourlyRateType?: HourlyRateType;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  cities?: string[];
  availability?: string;
  studyYear?: string;

  // Skills and categories
  skills?: string[];
  categories?: string[];

  // Onboarding
  onboardingCompleted?: boolean;

  // Legacy fields (for backward compatibility - avoid in new code)
  city?: string;
  languages?: string[];
  level?: string;
  teachingFormat?: string;
  experienceLevel?: string;
  studentYear?: string;
  pricingTier?: string;
  hourlyRate?: number;

  // NOTE: The following fields are NOT settable by users:
  // - profileStatus (computed automatically by backend)
  // - isPhoneVerified (admin/system only)
  // - isEmailVerified (admin/system only)
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * User data included in provider profile response
 */
export interface ProviderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

/**
 * Category relation data
 */
export interface CategoryRelation {
  id: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

/**
 * Skill relation data
 */
export interface SkillRelation {
  id: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

/**
 * Complete provider profile response
 * GET /api/provider-profiles/me
 * GET /api/provider-profiles/:userId
 */
export interface ProviderProfile {
  id: string;
  userId: string;

  // Basic info
  bio?: string;
  photo?: string;

  // Status and verification (READ-ONLY)
  profileStatus: ProfileStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;

  // New enum fields
  teachingFormatNew?: TeachingFormat;
  experienceLevelNew?: ExperienceLevel;
  hourlyRateType?: HourlyRateType;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  cities?: string[];
  availability?: string;
  studyYear?: string;

  // Skills and categories (legacy arrays)
  skills?: string[];
  categories?: string[];

  // Relational data (new scalable approach)
  categoryRelations?: CategoryRelation[];
  skillRelations?: SkillRelation[];

  // Legacy fields
  city?: string;
  languages?: string[];
  level?: string;
  teachingFormat?: string;
  experienceLevel?: string;
  studentYear?: string;
  pricingTier?: string;
  hourlyRate?: number;

  // Metadata
  rating?: number;
  totalRatings?: number;
  onboardingCompleted?: boolean;
  isComplete?: boolean;
  createdAt: string;
  updatedAt: string;

  // User data
  user?: ProviderUser;
}

// ============================================================================
// WIZARD STATE TYPES
// ============================================================================

/**
 * State for Step 1: Teaching Format & Location
 */
export interface WizardStep1State {
  teachingFormat: TeachingFormat | null;
  cities: string[];
}

/**
 * State for Step 2: Experience & Expertise
 */
export interface WizardStep2State {
  experienceLevel: ExperienceLevel | null;
  studyYear?: string;
  categories: string[];
  skills: string[];
}

/**
 * State for Step 3: Pricing
 */
export interface WizardStep3State {
  hourlyRateType: HourlyRateType | null;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
}

/**
 * State for Step 4: Availability
 */
export interface WizardStep4State {
  availability?: string;
}

/**
 * State for Step 5: Bio & Photo
 */
export interface WizardStep5State {
  bio: string;
  photo?: string;
}

/**
 * Complete wizard state (all steps combined)
 */
export interface ProviderOnboardingState {
  step1: WizardStep1State;
  step2: WizardStep2State;
  step3: WizardStep3State;
  step4: WizardStep4State;
  step5: WizardStep5State;
}
