import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXPERIENCE_LEVELS, STUDENT_YEARS } from '../../constants/onboarding';

interface Step3Props {
  experienceLevel: string;
  studentYear: string;
  onExperienceLevelChange: (level: string) => void;
  onStudentYearChange: (year: string) => void;
}

export const Step3Experience: React.FC<Step3Props> = ({
  experienceLevel,
  studentYear,
  onExperienceLevelChange,
  onStudentYearChange,
}) => {
  const selectedLevel = EXPERIENCE_LEVELS.find((l) => l.id === experienceLevel);
  const showYearSelection = selectedLevel?.requiresYear;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Qui es-tu ?</Text>
        <Text style={styles.subtitle}>
          Aide les étudiants à mieux te connaître
        </Text>
      </View>

      {/* Experience Levels */}
      <View style={styles.levelsContainer}>
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = experienceLevel === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                isSelected && styles.levelCardSelected,
              ]}
              onPress={() => onExperienceLevelChange(level.id)}
            >
              <View style={styles.levelHeader}>
                <View style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}>
                  <Ionicons
                    name={level.icon as any}
                    size={24}
                    color={isSelected ? '#1976D2' : '#999'}
                  />
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </View>
              <Text style={[styles.levelTitle, isSelected && styles.levelTitleSelected]}>
                {level.title}
              </Text>
              <Text style={styles.levelDescription}>{level.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Student Year Selection */}
      {showYearSelection && (
        <View style={styles.yearSection}>
          <Text style={styles.sectionTitle}>
            En quelle année ?
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.yearsGrid}>
            {STUDENT_YEARS.map((year) => {
              const isSelected = studentYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearChip,
                    isSelected && styles.yearChipSelected,
                  ]}
                  onPress={() => onStudentYearChange(year)}
                >
                  <Text
                    style={[
                      styles.yearText,
                      isSelected && styles.yearTextSelected,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
        <Text style={styles.infoText}>
          {experienceLevel === 'student' || experienceLevel === 'engineering_student'
            ? 'Pas besoin d\'être un expert ! Partage ce que tu sais et aide d\'autres étudiants.'
            : experienceLevel === 'expert' || experienceLevel === 'teacher'
            ? 'Ton expérience est précieuse ! Les étudiants recherchent des mentors comme toi.'
            : 'Ton profil sera visible par tous les étudiants recherchant de l\'aide.'}
        </Text>
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
  levelsContainer: {
    marginBottom: 32,
  },
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  levelCardSelected: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#BBDEFB',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  levelTitleSelected: {
    color: '#1976D2',
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  yearSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  required: {
    color: '#f44336',
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  yearChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
    alignItems: 'center',
  },
  yearChipSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  yearTextSelected: {
    color: '#fff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
});
