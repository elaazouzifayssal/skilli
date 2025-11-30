import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useProviderOnboardingStore, useWizardActions } from '../../store/providerOnboardingStore';
import {
  useMyProviderProfileQuery,
  useUpsertMyProviderProfileMutation,
} from '../../services/providerProfiles';
import { TeachingFormat, HourlyRateType, ExperienceLevel } from '../../types/providerProfile';
import { Step1CategoriesSkills } from '../../components/onboarding/Step1CategoriesSkills';
import { Step2TeachingFormat } from '../../components/onboarding/Step2TeachingFormat';
import { Step3Experience } from '../../components/onboarding/Step3Experience';
import { Step4Pricing } from '../../components/onboarding/Step4Pricing';
import { Step5Bio } from '../../components/onboarding/Step5Bio';
import { PRICING_TIERS } from '../../constants/onboarding';

// ============================================================================
// ENUM CONVERSION HELPERS
// ============================================================================

/** Convert TeachingFormat enum to legacy string */
const formatToLegacy = (format: TeachingFormat | null): string => {
  if (!format) return '';
  switch (format) {
    case TeachingFormat.ONLINE:
      return 'online';
    case TeachingFormat.IN_PERSON:
      return 'presential';
    case TeachingFormat.BOTH:
      return 'both';
    default:
      return '';
  }
};

/** Convert legacy string to TeachingFormat enum */
const legacyToFormat = (format: string): TeachingFormat | null => {
  const formatMap: Record<string, TeachingFormat> = {
    online: TeachingFormat.ONLINE,
    presential: TeachingFormat.IN_PERSON,
    both: TeachingFormat.BOTH,
  };
  return formatMap[format] || null;
};

/** Convert ExperienceLevel enum to legacy string */
const experienceToLegacy = (level: ExperienceLevel | null): string => {
  if (!level) return '';
  switch (level) {
    case ExperienceLevel.STUDENT:
      return 'student';
    case ExperienceLevel.ENGINEERING_STUDENT:
      return 'engineering_student';
    case ExperienceLevel.JUNIOR_ENGINEER:
      return 'junior_engineer';
    case ExperienceLevel.TEACHER:
      return 'teacher';
    case ExperienceLevel.FREELANCER:
      return 'freelance';
    case ExperienceLevel.EXPERT:
      return 'expert';
    default:
      return '';
  }
};

/** Convert legacy string to ExperienceLevel enum */
const legacyToExperience = (level: string): ExperienceLevel | null => {
  const levelMap: Record<string, ExperienceLevel> = {
    student: ExperienceLevel.STUDENT,
    engineering_student: ExperienceLevel.ENGINEERING_STUDENT,
    junior_engineer: ExperienceLevel.JUNIOR_ENGINEER,
    teacher: ExperienceLevel.TEACHER,
    freelance: ExperienceLevel.FREELANCER,
    expert: ExperienceLevel.EXPERT,
  };
  return levelMap[level] || null;
};

/** Convert HourlyRateType enum to legacy string */
const rateTypeToLegacy = (type: HourlyRateType | null): string => {
  if (!type) return '';
  switch (type) {
    case HourlyRateType.BASIC:
      return 'basic';
    case HourlyRateType.STANDARD:
      return 'standard';
    case HourlyRateType.PREMIUM:
      return 'premium';
    case HourlyRateType.CUSTOM:
      return 'custom';
    default:
      return '';
  }
};

/** Convert legacy string to HourlyRateType enum */
const legacyToRateType = (type: string): HourlyRateType | null => {
  const typeMap: Record<string, HourlyRateType> = {
    basic: HourlyRateType.BASIC,
    standard: HourlyRateType.STANDARD,
    premium: HourlyRateType.PREMIUM,
    custom: HourlyRateType.CUSTOM,
  };
  return typeMap[type] || null;
};

const TOTAL_STEPS = 5;

export default function BecomeProviderScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch existing profile (if any) for edit mode
  const { data: existingProfile, isLoading: isLoadingProfile } = useMyProviderProfileQuery();

  // Wizard store and actions
  const { loadFromProfile, buildPayloadForApi, reset } = useWizardActions();
  const isStepComplete = useProviderOnboardingStore((state) => state.isStepComplete);

  // Load existing profile into wizard on mount
  useEffect(() => {
    if (existingProfile) {
      console.log('Loading existing profile into wizard:', existingProfile);
      loadFromProfile(existingProfile);
    } else {
      // Start fresh if no profile exists
      reset();
    }
  }, [existingProfile]);

  // Get wizard state from store
  const step1 = useProviderOnboardingStore((state) => state.step1);
  const step2 = useProviderOnboardingStore((state) => state.step2);
  const step3 = useProviderOnboardingStore((state) => state.step3);
  const step4 = useProviderOnboardingStore((state) => state.step4);
  const step5 = useProviderOnboardingStore((state) => state.step5);

  const setStep1 = useProviderOnboardingStore((state) => state.setStep1);
  const setStep2 = useProviderOnboardingStore((state) => state.setStep2);
  const setStep3 = useProviderOnboardingStore((state) => state.setStep3);
  const setStep4 = useProviderOnboardingStore((state) => state.setStep4);
  const setStep5 = useProviderOnboardingStore((state) => state.setStep5);

  // Use the new mutation hook
  const createProviderMutation = useUpsertMyProviderProfileMutation();

  const handleSuccess = () => {
    // The backend automatically marks user as provider
    queryClient.invalidateQueries({ queryKey: ['user'] });

    // Reset wizard state
    reset();

    Alert.alert(
      'Félicitations ! 🎉',
      existingProfile
        ? 'Ton profil provider a été mis à jour avec succès !'
        : 'Ton profil provider est créé ! Tu peux maintenant commencer à créer des sessions et partager ton expertise.',
      [
        {
          text: 'Commencer',
          onPress: () => {
            // Reset navigation to go back to main tabs
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' as never }],
              })
            );
          },
        },
      ]
    );
  };

  const handleError = (error: any) => {
    console.error('Provider profile creation error:', error);
    console.error('Error response:', error.response?.data);

    let errorMessage = 'Impossible de créer le profil provider';

    if (error.response?.data?.message) {
      if (Array.isArray(error.response.data.message)) {
        errorMessage = error.response.data.message.join(', ');
      } else {
        errorMessage = error.response.data.message;
      }
    }

    Alert.alert('Erreur', errorMessage);
  };

  const canGoNext = () => {
    // Use the validation logic from the store
    return isStepComplete(currentStep);
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Build payload from wizard state using store's builder
    const payload = buildPayloadForApi();

    console.log('Submitting provider profile:', payload);

    // Submit to backend API
    createProviderMutation.mutate(payload, {
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const renderProgressBar = () => {
    const progress = (currentStep / TOTAL_STEPS) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Étape {currentStep} sur {TOTAL_STEPS}
        </Text>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        // Categories & Skills
        return (
          <Step1CategoriesSkills
            selectedCategories={step2.categories}
            selectedSkills={step2.skills}
            onCategoriesChange={(categories) => setStep2({ categories })}
            onSkillsChange={(skills) => setStep2({ skills })}
          />
        );
      case 2:
        // Teaching Format & Location
        return (
          <Step2TeachingFormat
            teachingFormat={formatToLegacy(step1.teachingFormat)}
            city={step1.cities[0] || ''}
            onTeachingFormatChange={(format) => {
              setStep1({ teachingFormat: legacyToFormat(format) });
            }}
            onCityChange={(city) => setStep1({ cities: city ? [city] : [] })}
          />
        );
      case 3:
        // Experience Level
        return (
          <Step3Experience
            experienceLevel={experienceToLegacy(step2.experienceLevel)}
            studentYear={step2.studyYear || ''}
            onExperienceLevelChange={(level) => {
              setStep2({ experienceLevel: legacyToExperience(level) });
            }}
            onStudentYearChange={(year) => setStep2({ studyYear: year })}
          />
        );
      case 4:
        // Pricing
        return (
          <Step4Pricing
            pricingTier={rateTypeToLegacy(step3.hourlyRateType)}
            customPrice={step3.hourlyRateMin?.toString() || ''}
            onPricingTierChange={(tier) => {
              setStep3({ hourlyRateType: legacyToRateType(tier) });
            }}
            onCustomPriceChange={(price) => {
              const numPrice = parseFloat(price) || 0;
              setStep3({ hourlyRateMin: numPrice, hourlyRateMax: numPrice });
            }}
          />
        );
      case 5:
        // Bio
        return (
          <Step5Bio
            bio={step5.bio}
            experienceLevel={step2.experienceLevel || ''}
            studentYear={step2.studyYear || ''}
            selectedSkills={step2.skills}
            onBioChange={(bio) => setStep5({ bio })}
          />
        );
      default:
        return null;
    }
  };

  // Show loading while fetching existing profile
  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
            Chargement de votre profil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {existingProfile ? 'Modifier mon profil' : 'Devenir Provider'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Step Content */}
      <View style={styles.content}>{renderStep()}</View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.previousButton}
            onPress={handlePrevious}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.previousButtonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            !canGoNext() && styles.nextButtonDisabled,
            currentStep === 1 && styles.nextButtonFull,
          ]}
          onPress={handleNext}
          disabled={!canGoNext() || createProviderMutation.isPending}
        >
          {createProviderMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === TOTAL_STEPS ? 'Terminer' : 'Suivant'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
