import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SKILL_CATEGORIES } from '../../constants/onboarding';

interface Step1Props {
  selectedCategories: string[];
  selectedSkills: string[];
  onCategoriesChange: (categories: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
}

export const Step1CategoriesSkills: React.FC<Step1Props> = ({
  selectedCategories,
  selectedSkills,
  onCategoriesChange,
  onSkillsChange,
}) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const getActiveCategoriesSkills = () => {
    return SKILL_CATEGORIES.filter((cat) => selectedCategories.includes(cat.id));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dans quoi peux-tu aider ?</Text>
        <Text style={styles.subtitle}>
          Sélectionne d'abord les catégories qui t'intéressent
        </Text>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <View style={styles.chipsContainer}>
          {SKILL_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, isSelected && styles.chipSelected]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {category.name}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Skills */}
      {selectedCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Compétences spécifiques
            <Text style={styles.required}> *</Text>
          </Text>
          <Text style={styles.helpText}>
            Sélectionne au moins 3 compétences que tu maîtrises
          </Text>
          {getActiveCategoriesSkills().map((category) => (
            <View key={category.id} style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>{category.name}</Text>
              <View style={styles.chipsContainer}>
                {category.skills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        isSelected && styles.skillChipSelected,
                      ]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text
                        style={[
                          styles.skillChipText,
                          isSelected && styles.skillChipTextSelected,
                        ]}
                      >
                        {skill}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#1976D2"
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills count indicator */}
      {selectedSkills.length > 0 && (
        <View style={styles.counterContainer}>
          <Ionicons
            name={selectedSkills.length >= 3 ? 'checkmark-circle' : 'information-circle-outline'}
            size={20}
            color={selectedSkills.length >= 3 ? '#4CAF50' : '#FF9800'}
          />
          <Text
            style={[
              styles.counterText,
              selectedSkills.length >= 3 && styles.counterTextSuccess,
            ]}
          >
            {selectedSkills.length} compétence{selectedSkills.length > 1 ? 's' : ''} sélectionnée{selectedSkills.length > 1 ? 's' : ''}
            {selectedSkills.length < 3 && ` (minimum 3)`}
          </Text>
        </View>
      )}
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#f44336',
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },
  chipTextSelected: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 6,
  },
  skillCategory: {
    marginBottom: 20,
  },
  skillCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skillChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  skillChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  skillChipTextSelected: {
    color: '#1976D2',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9800',
    marginLeft: 12,
  },
  counterTextSuccess: {
    color: '#4CAF50',
  },
});
