import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { sessionsService } from '../services/sessions.service';
import { messagesService } from '../services/messages.service';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';

export default function SessionDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { user } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const data = await sessionsService.getById(sessionId);
      setSession(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la session');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!session) return;

    Alert.alert(
      'Confirmer la réservation',
      `Voulez-vous réserver cette session pour ${session.price} MAD?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réserver',
          onPress: async () => {
            setBooking(true);
            try {
              await sessionsService.book(sessionId);
              Alert.alert('Succès', 'Session réservée avec succès!', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de réserver la session');
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMessageProvider = async () => {
    if (!session?.provider) return;

    try {
      // Get or create conversation with this provider
      const conversation = await messagesService.getOrCreateConversation(session.provider.id);

      // Navigate to chat screen
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUser: {
          id: session.provider.id,
          name: session.provider.name,
          email: session.provider.email,
          profile: { photo: session.provider.profile?.photo },
        },
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Erreur', 'Impossible de démarrer une conversation');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!session) return null;

  const isFull = session._count?.bookings >= session.maxParticipants;
  const isOwnSession = session.providerId === user?.id;
  const isPast = new Date(session.date) < new Date();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{session.title}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, session.isOnline ? styles.badgeOnline : styles.badgePresential]}>
              <Text style={styles.badgeText}>{session.isOnline ? 'En ligne' : 'Présentiel'}</Text>
            </View>
            {isFull && (
              <View style={[styles.badge, styles.badgeFull]}>
                <Text style={styles.badgeText}>Complet</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{session.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences</Text>
          <View style={styles.skillsGrid}>
            {session.skills.map((skill: string, index: number) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Date</Text>
            <Text style={styles.detailValue}>{formatDate(session.date)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Durée</Text>
            <Text style={styles.detailValue}>{session.duration} minutes</Text>
          </View>
          {!session.isOnline && session.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Lieu</Text>
              <Text style={styles.detailValue}>{session.location}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👥 Places</Text>
            <Text style={styles.detailValue}>
              {session._count?.bookings || 0} / {session.maxParticipants}
            </Text>
          </View>
        </View>

        {session.provider && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider</Text>
            <TouchableOpacity
              style={styles.providerCard}
              onPress={() => navigation.navigate('ProviderDetail', { providerId: session.provider.profile?.id })}
            >
              {getImageUrl(session.provider.profile?.photo) ? (
                <Image source={{ uri: getImageUrl(session.provider.profile.photo)! }} style={styles.providerAvatar} />
              ) : (
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerAvatarText}>
                    {session.provider.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{session.provider.name}</Text>
                {session.provider.profile?.rating > 0 && (
                  <Text style={styles.providerRating}>
                    ⭐ {session.provider.profile.rating.toFixed(1)} ({session.provider.profile.totalRatings} avis)
                  </Text>
                )}
              </View>
              {!isOwnSession && (
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleMessageProvider}
                >
                  <Text style={styles.messageButtonText}>💬</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {!isOwnSession && !isPast && (
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.price}>{session.price} MAD</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, (isFull || booking) && styles.buttonDisabled]}
            onPress={handleBook}
            disabled={isFull || booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>
                {isFull ? 'Complet' : 'Réserver'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeFull: { backgroundColor: '#fee2e2' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 13, color: '#374151' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  detailLabel: { fontSize: 15, color: '#6b7280' },
  detailValue: { fontSize: 15, color: '#1f2937', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 16 },
  providerCard: { flexDirection: 'row', alignItems: 'center' },
  providerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  providerAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  providerRating: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  messageButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  messageButtonText: { fontSize: 20 },
  footer: { backgroundColor: '#fff', padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 16 },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  bookButton: { flex: 1, backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
