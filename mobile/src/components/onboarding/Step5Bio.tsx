import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIO_TEMPLATES } from '../../constants/onboarding';

interface Step5Props {
  bio: string;
  experienceLevel: string;
  studentYear: string;
  selectedSkills: string[];
  onBioChange: (bio: string) => void;
}

export const Step5Bio: React.FC<Step5Props> = ({
  bio,
  experienceLevel,
  studentYear,
  selectedSkills,
  onBioChange,
}) => {
  const getTemplate = () => {
    const template = BIO_TEMPLATES.find((t) => t.category === experienceLevel);
    if (!template) return '';

    let text = template.template;

    // Replace {year} with student year
    if (studentYear) {
      text = text.replace('{year}', studentYear);
    }

    // Replace {skills} with first 3 skills
    const skillsText = selectedSkills.slice(0, 3).join(', ');
    text = text.replace('{skills}', skillsText || 'mes compétences');

    return text;
  };

  const useTemplate = () => {
    const template = getTemplate();
    if (template) {
      onBioChange(template);
    }
  };

  const templates = [
    getTemplate(),
    `Passionné(e) par ${selectedSkills.slice(0, 2).join(' et ')}, je propose des cours adaptés à tous les niveaux.`,
    `Je partage mon expérience et mes connaissances pour vous aider à progresser rapidement.`,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Présente-toi !</Text>
        <Text style={styles.subtitle}>
          Écris une bio qui donnera envie aux étudiants de te choisir
        </Text>
      </View>

      {/* Bio Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>
          Ta bio
          <Text style={styles.required}> *</Text>
        </Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Parle de ton parcours, ta passion, et ce que tu peux apporter..."
          placeholderTextColor="#999"
          multiline
          value={bio}
          onChangeText={onBioChange}
          maxLength={500}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{bio.length}/500</Text>
      </View>

      {/* Template Suggestions */}
      {templates.length > 0 && (
        <View style={styles.templatesSection}>
          <View style={styles.templatesHeader}>
            <Ionicons name="sparkles-outline" size={20} color="#9C27B0" />
            <Text style={styles.templatesTitle}>Suggestions de bio</Text>
          </View>
          <Text style={styles.templatesSubtitle}>
            Clique sur une suggestion pour l'utiliser comme base
          </Text>

          {templates.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={styles.templateCard}
              onPress={() => onBioChange(template)}
            >
              <Text style={styles.templateText}>{template}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9C27B0" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={22} color="#FF9800" />
          <Text style={styles.tipsTitle}>Conseils pour une bonne bio</Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Mentionne ton parcours et tes diplômes
          </Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Explique ta méthode d'enseignement
          </Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Reste authentique et professionnel
          </Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Montre ta passion pour l'enseignement
          </Text>
        </View>
      </View>

      {/* Examples */}
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>✨ Exemples de bonnes bios</Text>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleText}>
            "Étudiant en Master 2 Mathématiques, j'ai aidé plus de 20 étudiants à améliorer leurs notes.
            Ma méthode : comprendre avant de mémoriser. Patient et pédagogue, je m'adapte à votre rythme."
          </Text>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleText}>
            "Développeur web depuis 5 ans, passionné par le partage de connaissances.
            Je propose des cours pratiques basés sur des projets réels. Apprenez en créant !"
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#f44336',
  },
  bioInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    minHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  templatesSection: {
    marginBottom: 32,
  },
  templatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  templatesSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  templateText: {
    flex: 1,
    fontSize: 14,
    color: '#6A1B9A',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
  examplesContainer: {
    marginBottom: 24,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  exampleCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  exampleText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
