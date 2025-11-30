import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { reviewsService } from '../services/reviews.service';

export default function RateSessionScreen({ route, navigation }: any) {
  const { session, providerId } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsService.createReview({
        sessionId: session.id,
        providerId,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Succès', 'Merci pour votre retour !', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de soumettre votre avis');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Évaluez cette session</Text>
          <Text style={styles.sessionTitle}>{session.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre note</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={[styles.star, star <= rating && styles.starFilled]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && 'Très décevant'}
              {rating === 2 && 'Décevant'}
              {rating === 3 && 'Moyen'}
              {rating === 4 && 'Bien'}
              {rating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Votre avis (optionnel)</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Partagez votre expérience avec cette session..."
            placeholderTextColor="#9ca3af"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Envoyer mon avis</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { flex: 1 },
  header: { backgroundColor: '#fff', padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  sessionTitle: { fontSize: 16, color: '#6b7280' },
  section: { backgroundColor: '#fff', padding: 24, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  starButton: { padding: 8 },
  star: { fontSize: 40, color: '#d1d5db' },
  starFilled: { color: '#fbbf24' },
  ratingText: { textAlign: 'center', marginTop: 12, fontSize: 16, fontWeight: '600', color: '#6366f1' },
  textarea: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 16, fontSize: 15, color: '#1f2937', minHeight: 120 },
  charCount: { textAlign: 'right', marginTop: 8, fontSize: 12, color: '#9ca3af' },
  submitButton: { backgroundColor: '#6366f1', margin: 24, marginTop: 12, padding: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
