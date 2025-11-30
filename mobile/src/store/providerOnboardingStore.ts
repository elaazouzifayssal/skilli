/**
 * Provider Onboarding Store
 *
 * Centralized state management for the 5-step provider onboarding wizard.
 * Uses Zustand for simple, type-safe state management.
 */

import { create } from 'zustand';
import {
  TeachingFormat,
  ExperienceLevel,
  HourlyRateType,
  ProviderOnboardingState,
  WizardStep1State,
  WizardStep2State,
  WizardStep3State,
  WizardStep4State,
  WizardStep5State,
  ProviderProfile,
  CreateProviderProfilePayload,
} from '../types/providerProfile';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialStep1State: WizardStep1State = {
  teachingFormat: null,
  cities: [],
};

const initialStep2State: WizardStep2State = {
  experienceLevel: null,
  studyYear: undefined,
  categories: [],
  skills: [],
};

const initialStep3State: WizardStep3State = {
  hourlyRateType: null,
  hourlyRateMin: undefined,
  hourlyRateMax: undefined,
};

const initialStep4State: WizardStep4State = {
  availability: undefined,
};

const initialStep5State: WizardStep5State = {
  bio: '',
  photo: undefined,
};

const initialState: ProviderOnboardingState = {
  step1: initialStep1State,
  step2: initialStep2State,
  step3: initialStep3State,
  step4: initialStep4State,
  step5: initialStep5State,
};

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface ProviderOnboardingStore extends ProviderOnboardingState {
  // Step 1 actions
  setStep1: (data: Partial<WizardStep1State>) => void;

  // Step 2 actions
  setStep2: (data: Partial<WizardStep2State>) => void;

  // Step 3 actions
  setStep3: (data: Partial<WizardStep3State>) => void;

  // Step 4 actions
  setStep4: (data: Partial<WizardStep4State>) => void;

  // Step 5 actions
  setStep5: (data: Partial<WizardStep5State>) => void;

  // Utility actions
  reset: () => void;
  loadFromProfile: (profile: ProviderProfile) => void;
  buildPayloadForApi: () => CreateProviderProfilePayload;
  isStepComplete: (step: number) => boolean;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useProviderOnboardingStore = create<ProviderOnboardingStore>((set, get) => ({
  ...initialState,

  // Step 1 actions
  setStep1: (data) =>
    set((state) => ({
      step1: { ...state.step1, ...data },
    })),

  // Step 2 actions
  setStep2: (data) =>
    set((state) => ({
      step2: { ...state.step2, ...data },
    })),

  // Step 3 actions
  setStep3: (data) =>
    set((state) => ({
      step3: { ...state.step3, ...data },
    })),

  // Step 4 actions
  setStep4: (data) =>
    set((state) => ({
      step4: { ...state.step4, ...data },
    })),

  // Step 5 actions
  setStep5: (data) =>
    set((state) => ({
      step5: { ...state.step5, ...data },
    })),

  // Reset all state to initial values
  reset: () => set(initialState),

  /**
   * Load existing provider profile into wizard state
   * Used when editing an existing profile
   */
  loadFromProfile: (profile: ProviderProfile) => {
    const step1: WizardStep1State = {
      teachingFormat: profile.teachingFormatNew || null,
      cities: profile.cities || [],
    };

    const step2: WizardStep2State = {
      experienceLevel: profile.experienceLevelNew || null,
      studyYear: profile.studyYear,
      categories: profile.categories || [],
      skills: profile.skills || [],
    };

    const step3: WizardStep3State = {
      hourlyRateType: profile.hourlyRateType || null,
      hourlyRateMin: profile.hourlyRateMin,
      hourlyRateMax: profile.hourlyRateMax,
    };

    const step4: WizardStep4State = {
      availability: profile.availability,
    };

    const step5: WizardStep5State = {
      bio: profile.bio || '',
      photo: profile.photo,
    };

    set({
      step1,
      step2,
      step3,
      step4,
      step5,
    });
  },

  /**
   * Build API payload from current wizard state
   * Maps wizard state to backend field names
   */
  buildPayloadForApi: (): CreateProviderProfilePayload => {
    const state = get();

    const payload: CreateProviderProfilePayload = {
      // Step 1: Teaching format & location
      teachingFormatNew: state.step1.teachingFormat || undefined,
      cities: state.step1.cities.length > 0 ? state.step1.cities : undefined,

      // Step 2: Experience & expertise
      experienceLevelNew: state.step2.experienceLevel || undefined,
      studyYear: state.step2.studyYear,
      categories: state.step2.categories.length > 0 ? state.step2.categories : undefined,
      skills: state.step2.skills.length > 0 ? state.step2.skills : undefined,

      // Step 3: Pricing
      hourlyRateType: state.step3.hourlyRateType || undefined,
      hourlyRateMin: state.step3.hourlyRateMin,
      hourlyRateMax: state.step3.hourlyRateMax,

      // Step 4: Availability
      availability: state.step4.availability,

      // Step 5: Bio & photo
      bio: state.step5.bio,
      photo: state.step5.photo,

      // Mark onboarding as completed
      onboardingCompleted: true,
    };

    // Remove undefined values to keep payload clean
    return Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined)
    ) as CreateProviderProfilePayload;
  },

  /**
   * Check if a specific step is complete
   * Used for validation and navigation
   *
   * Wizard flow:
   * 1. Categories & Skills (step2 data)
   * 2. Teaching Format & Location (step1 data)
   * 3. Experience Level (step2 data)
   * 4. Pricing (step3 data)
   * 5. Bio (step5 data)
   */
  isStepComplete: (step: number): boolean => {
    const state = get();

    switch (step) {
      case 1:
        // Step 1: Categories & Skills
        return (
          state.step2.categories.length > 0 &&
          state.step2.skills.length >= 3
        );

      case 2:
        // Step 2: Teaching Format & Location
        const hasFormat = state.step1.teachingFormat !== null;
        const needsCities =
          state.step1.teachingFormat === TeachingFormat.IN_PERSON ||
          state.step1.teachingFormat === TeachingFormat.BOTH;
        const hasCities = state.step1.cities.length > 0;
        return hasFormat && (!needsCities || hasCities);

      case 3:
        // Step 3: Experience Level
        return state.step2.experienceLevel !== null;

      case 4:
        // Step 4: Pricing
        const hasRateType = state.step3.hourlyRateType !== null;
        if (state.step3.hourlyRateType === HourlyRateType.CUSTOM) {
          return (
            hasRateType &&
            state.step3.hourlyRateMin !== undefined &&
            state.step3.hourlyRateMin > 0
          );
        }
        return hasRateType;

      case 5:
        // Step 5: Bio (minimum 50 characters)
        return state.step5.bio.trim().length >= 50;

      default:
        return false;
    }
  },
}));

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to get a specific step's state and setter
 */
export const useWizardStep = <T extends 1 | 2 | 3 | 4 | 5>(step: T) => {
  const stepKey = `step${step}` as keyof ProviderOnboardingState;
  const setterKey = `setStep${step}` as keyof ProviderOnboardingStore;

  const stepData = useProviderOnboardingStore((state) => state[stepKey]);
  const setStepData = useProviderOnboardingStore((state) => state[setterKey]);
  const isComplete = useProviderOnboardingStore((state) => state.isStepComplete(step));

  return {
    data: stepData,
    setData: setStepData,
    isComplete,
  };
};

/**
 * Hook to get all utility actions
 */
export const useWizardActions = () => {
  const reset = useProviderOnboardingStore((state) => state.reset);
  const loadFromProfile = useProviderOnboardingStore((state) => state.loadFromProfile);
  const buildPayloadForApi = useProviderOnboardingStore((state) => state.buildPayloadForApi);

  return {
    reset,
    loadFromProfile,
    buildPayloadForApi,
  };
};
