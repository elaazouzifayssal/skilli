import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRICING_TIERS } from '../../constants/onboarding';

interface Step4Props {
  pricingTier: string;
  customPrice: string;
  onPricingTierChange: (tier: string) => void;
  onCustomPriceChange: (price: string) => void;
}

export const Step4Pricing: React.FC<Step4Props> = ({
  pricingTier,
  customPrice,
  onPricingTierChange,
  onCustomPriceChange,
}) => {
  const showCustomInput = pricingTier === 'custom';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Quel sera ton tarif ?</Text>
        <Text style={styles.subtitle}>
          Fixe un prix horaire pour tes cours
        </Text>
      </View>

      {/* Pricing Tiers */}
      <View style={styles.tiersContainer}>
        {PRICING_TIERS.map((tier) => {
          const isSelected = pricingTier === tier.id;
          return (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                isSelected && styles.tierCardSelected,
                { borderLeftColor: tier.color, borderLeftWidth: 4 },
              ]}
              onPress={() => onPricingTierChange(tier.id)}
            >
              {tier.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: tier.color }]}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.recommendedText}>Recommandé</Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                <Text style={[styles.tierTitle, { color: tier.color }]}>
                  {tier.title}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </View>

              <Text style={styles.tierRange}>{tier.range}</Text>
              <Text style={styles.tierDescription}>{tier.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Price Input */}
      {showCustomInput && (
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>
            Tarif personnalisé
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ex: 150"
              keyboardType="numeric"
              value={customPrice}
              onChangeText={onCustomPriceChange}
              maxLength={4}
            />
            <Text style={styles.inputSuffix}>MAD/heure</Text>
          </View>
          <Text style={styles.inputHelp}>
            Entre un tarif horaire raisonnable selon ton expérience
          </Text>
        </View>
      )}

      {/* Pricing Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={22} color="#FF9800" />
          <Text style={styles.tipsTitle}>Conseils tarifaires</Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Commence avec un prix compétitif pour attirer tes premiers étudiants
          </Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Tu pourras ajuster ton tarif plus tard selon la demande
          </Text>
        </View>

        <View style={styles.tip}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>
            Un bon rating te permettra d'augmenter tes prix progressivement
          </Text>
        </View>
      </View>

      {/* Market Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Prix moyen du marché</Text>
          <Text style={styles.infoText}>
            La plupart des providers facturent entre 100 et 200 MAD/heure selon leur expérience et spécialisation.
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
  tiersContainer: {
    marginBottom: 32,
  },
  tierCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  tierCardSelected: {
    backgroundColor: '#F5F5F5',
    borderColor: '#1976D2',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  tierRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  customSection: {
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1976D2',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 16,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  inputHelp: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
