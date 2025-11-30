import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOROCCAN_CITIES } from '../../constants/onboarding';

interface Step2Props {
  teachingFormat: string;
  city: string;
  onTeachingFormatChange: (format: string) => void;
  onCityChange: (city: string) => void;
}

export const Step2TeachingFormat: React.FC<Step2Props> = ({
  teachingFormat,
  city,
  onTeachingFormatChange,
  onCityChange,
}) => {
  const FORMAT_OPTIONS = [
    {
      id: 'online',
      title: 'En ligne uniquement',
      description: 'Cours à distance via visioconférence',
      icon: 'videocam',
      color: '#2196F3',
    },
    {
      id: 'presential',
      title: 'En présentiel uniquement',
      description: 'Cours en personne dans votre ville',
      icon: 'person',
      color: '#4CAF50',
    },
    {
      id: 'both',
      title: 'Les deux',
      description: 'Flexibilité totale selon les besoins',
      icon: 'options',
      color: '#9C27B0',
      recommended: true,
    },
  ];

  const showCitySelection = teachingFormat === 'presential' || teachingFormat === 'both';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Format d'enseignement</Text>
        <Text style={styles.subtitle}>
          Comment souhaites-tu donner tes cours ?
        </Text>
      </View>

      {/* Format Options */}
      <View style={styles.optionsContainer}>
        {FORMAT_OPTIONS.map((format) => {
          const isSelected = teachingFormat === format.id;
          return (
            <TouchableOpacity
              key={format.id}
              style={[
                styles.formatCard,
                isSelected && styles.formatCardSelected,
              ]}
              onPress={() => onTeachingFormatChange(format.id)}
            >
              {format.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}
              <View style={[styles.iconContainer, { backgroundColor: format.color }]}>
                <Ionicons name={format.icon as any} size={32} color="#fff" />
              </View>
              <Text style={styles.formatTitle}>{format.title}</Text>
              <Text style={styles.formatDescription}>{format.description}</Text>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* City Selection */}
      {showCitySelection && (
        <View style={styles.citySection}>
          <Text style={styles.sectionTitle}>
            Dans quelle ville ?
            <Text style={styles.required}> *</Text>
          </Text>
          <Text style={styles.helpText}>
            Sélectionne la ville où tu proposes des cours en présentiel
          </Text>
          <View style={styles.citiesGrid}>
            {MOROCCAN_CITIES.map((cityOption) => {
              const isSelected = city === cityOption;
              return (
                <TouchableOpacity
                  key={cityOption}
                  style={[
                    styles.cityChip,
                    isSelected && styles.cityChipSelected,
                  ]}
                  onPress={() => onCityChange(cityOption)}
                >
                  <Text
                    style={[
                      styles.cityText,
                      isSelected && styles.cityTextSelected,
                    ]}
                  >
                    {cityOption}
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
      )}

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
        <Text style={styles.infoText}>
          {teachingFormat === 'both'
            ? 'Offrir les deux formats augmente tes chances de trouver des étudiants !'
            : teachingFormat === 'online'
            ? 'Les cours en ligne te permettent d\'atteindre des étudiants dans tout le Maroc.'
            : 'Les cours en présentiel créent une meilleure connexion avec tes étudiants.'}
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
  optionsContainer: {
    marginBottom: 32,
  },
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  formatCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  formatDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  citySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cityChipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  cityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  cityTextSelected: {
    color: '#1976D2',
  },
  checkIcon: {
    marginLeft: 6,
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
