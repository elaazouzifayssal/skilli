import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { providerProfileService } from '../../services/provider-profile.service';
import { useAuthStore } from '../../store/authStore';
import { MOROCCAN_CITIES } from '../../constants/moroccanCities';
import { EDUCATION_LEVELS } from '../../constants/educationLevels';
import { SKILLS_CATEGORIES, LANGUAGES } from '../../constants/skills';

export default function BecomeProviderScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, loadTokens } = useAuthStore();

  // Form data
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [level, setLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!bio || !city || selectedLanguages.length === 0 || !level || selectedSkills.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await providerProfileService.createOrUpdate({
        bio,
        city,
        languages: selectedLanguages,
        level,
        skills: selectedSkills,
      });

      // Reload user data to update isProvider status
      await loadTokens();

      Alert.alert('Succès', 'Votre profil provider a été créé!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[styles.stepDot, step >= s && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Parlez-nous de vous</Text>
      <Text style={styles.stepDescription}>
        Rédigez une courte bio pour présenter votre expertise
      </Text>

      <TextInput
        style={styles.textarea}
        placeholder="Ex: Ingénieur en informatique avec 5 ans d'expérience en React et Node.js..."
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.nextButton}
        onPress={() => bio.trim().length >= 10 ? setStep(2) : Alert.alert('Erreur', 'Votre bio doit contenir au moins 10 caractères')}
      >
        <Text style={styles.nextButtonText}>Continuer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Localisation et niveau</Text>

      <Text style={styles.label}>Ville</Text>
      <ScrollView style={styles.optionsContainer} horizontal showsHorizontalScrollIndicator={false}>
        {MOROCCAN_CITIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.optionChip, city === c && styles.optionChipSelected]}
            onPress={() => setCity(c)}
          >
            <Text style={[styles.optionText, city === c && styles.optionTextSelected]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Votre niveau d'études</Text>
      <ScrollView style={styles.optionsContainer} horizontal showsHorizontalScrollIndicator={false}>
        {EDUCATION_LEVELS.map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.optionChip, level === l && styles.optionChipSelected]}
            onPress={() => setLevel(l)}
          >
            <Text style={[styles.optionText, level === l && styles.optionTextSelected]}>
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => city && level ? setStep(3) : Alert.alert('Erreur', 'Veuillez sélectionner une ville et un niveau')}
        >
          <Text style={styles.nextButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Langues parlées</Text>
      <Text style={styles.stepDescription}>
        Sélectionnez les langues que vous parlez
      </Text>

      <View style={styles.chipsWrap}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.chip, selectedLanguages.includes(lang) && styles.chipSelected]}
            onPress={() => toggleLanguage(lang)}
          >
            <Text style={[styles.chipText, selectedLanguages.includes(lang) && styles.chipTextSelected]}>
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => selectedLanguages.length > 0 ? setStep(4) : Alert.alert('Erreur', 'Sélectionnez au moins une langue')}
        >
          <Text style={styles.nextButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vos compétences</Text>
      <Text style={styles.stepDescription}>
        Sélectionnez les domaines dans lesquels vous pouvez aider
      </Text>

      <ScrollView style={styles.skillsScroll}>
        {Object.entries(SKILLS_CATEGORIES).map(([category, skills]) => (
          <View key={category} style={styles.skillCategory}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.chipsWrap}>
              {skills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.chip, selectedSkills.includes(skill) && styles.chipSelected]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.chipText, selectedSkills.includes(skill) && styles.chipTextSelected]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer mon profil</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Devenir Provider</Text>
        {renderStepIndicator()}
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  stepDotActive: {
    backgroundColor: '#6366f1',
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
  },
  optionsContainer: {
    maxHeight: 60,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  optionChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  skillsScroll: {
    maxHeight: 400,
  },
  skillCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6366f1',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
