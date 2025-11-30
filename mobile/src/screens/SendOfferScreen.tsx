import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { offersService } from '../services/offers.service';

export default function SendOfferScreen({ route, navigation }: any) {
  const { request } = route.params;
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [availableDate, setAvailableDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un prix valide');
      return;
    }

    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir une durée valide');
      return;
    }

    setLoading(true);

    try {
      const offerData = {
        requestId: request.id,
        message: message.trim(),
        price: parseFloat(price),
        duration: parseInt(duration),
        firstAvailableDate: availableDate.toISOString(),
      };

      await offersService.createOffer(offerData);

      Alert.alert('Succès', 'Votre offre a été envoyée avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error creating offer:', error);
      const errorMsg = error.response?.data?.message || 'Impossible d\'envoyer l\'offre';
      Alert.alert('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setAvailableDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Envoyer une offre</Text>
        <Text style={styles.headerSubtitle}>Pour: {request.title}</Text>
      </View>

      <View style={styles.form}>
        {/* Request Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Résumé de la demande</Text>
          <Text style={styles.summaryText} numberOfLines={3}>
            {request.description}
          </Text>
          {request.budgetMin && request.budgetMax && (
            <Text style={styles.summaryBudget}>
              Budget: {request.budgetMin} - {request.budgetMax} MAD
            </Text>
          )}
        </View>

        {/* Message */}
        <View style={styles.field}>
          <Text style={styles.label}>Votre proposition *</Text>
          <Text style={styles.hint}>
            Expliquez pourquoi vous êtes le bon choix pour cette demande
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Décrivez votre expertise, votre approche, vos qualifications..."
            multiline
            numberOfLines={8}
            maxLength={1000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Prix proposé (MAD) *</Text>
          <Text style={styles.hint}>
            Proposez un prix compétitif en fonction de votre expertise
          </Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Ex: 500"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <Text style={styles.label}>Durée estimée (heures) *</Text>
          <Text style={styles.hint}>
            Estimation du nombre d'heures pour compléter le service
          </Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="Ex: 10"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Available Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Première disponibilité *</Text>
          <Text style={styles.hint}>À partir de quand pouvez-vous commencer?</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              📅 {availableDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <>
              <DateTimePicker
                value={availableDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneButtonText}>Terminé</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Summary Box */}
        <View style={styles.offerSummaryBox}>
          <Text style={styles.offerSummaryTitle}>📋 Récapitulatif de votre offre</Text>
          <View style={styles.offerSummaryRow}>
            <Text style={styles.offerSummaryLabel}>Prix:</Text>
            <Text style={styles.offerSummaryValue}>{price || '0'} MAD</Text>
          </View>
          <View style={styles.offerSummaryRow}>
            <Text style={styles.offerSummaryLabel}>Durée:</Text>
            <Text style={styles.offerSummaryValue}>{duration || '0'}h</Text>
          </View>
          {price && duration && (
            <View style={styles.offerSummaryRow}>
              <Text style={styles.offerSummaryLabel}>Tarif horaire:</Text>
              <Text style={styles.offerSummaryValue}>
                ~{(parseFloat(price) / parseInt(duration || '1')).toFixed(0)} MAD/h
              </Text>
            </View>
          )}
          <View style={styles.offerSummaryRow}>
            <Text style={styles.offerSummaryLabel}>Disponible dès:</Text>
            <Text style={styles.offerSummaryValue}>
              {availableDate.toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>✉️ Envoyer mon offre</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          💡 Une fois envoyée, votre offre sera visible par le demandeur. Vous ne pourrez plus la modifier une fois qu'elle sera acceptée ou rejetée.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6b7280' },
  form: { padding: 20 },
  summaryCard: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#bfdbfe' },
  summaryTitle: { fontSize: 14, fontWeight: '600', color: '#1e40af', marginBottom: 8 },
  summaryText: { fontSize: 13, color: '#1f2937', lineHeight: 19, marginBottom: 8 },
  summaryBudget: { fontSize: 13, fontWeight: '600', color: '#10b981' },
  field: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  hint: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 15, color: '#1f2937' },
  textArea: { minHeight: 140, paddingTop: 14 },
  charCount: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  dateButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, alignItems: 'center' },
  dateButtonText: { fontSize: 15, color: '#1f2937', fontWeight: '500' },
  doneButton: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  doneButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  offerSummaryBox: { backgroundColor: '#fef3c7', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#fbbf24' },
  offerSummaryTitle: { fontSize: 15, fontWeight: 'bold', color: '#92400e', marginBottom: 12 },
  offerSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  offerSummaryLabel: { fontSize: 14, color: '#78350f' },
  offerSummaryValue: { fontSize: 14, fontWeight: '600', color: '#92400e' },
  submitButton: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disclaimer: { fontSize: 12, color: '#6b7280', lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },
});
