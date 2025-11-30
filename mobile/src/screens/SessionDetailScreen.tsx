import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { sessionsService } from '../services/sessions.service';
import { messagesService } from '../services/messages.service';
import { reviewsService, Review } from '../services/reviews.service';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';

export default function SessionDetailScreen({ route, navigation }: any) {
  const { sessionId } = route.params;
  const { user } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    loadSession();
    loadReviews();
    checkCanReview();
  }, [sessionId]);

  // Reload when screen gains focus (e.g., after leaving a review)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadReviews();
      checkCanReview();
    });
    return unsubscribe;
  }, [navigation]);

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

  const loadReviews = async () => {
    try {
      const data = await reviewsService.getSessionReviews(sessionId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const result = await reviewsService.canReviewSession(sessionId);
      setCanReview(result.canReview);
    } catch (error) {
      console.error('Error checking can review:', error);
    }
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= rating ? '⭐' : '☆'}
        </Text>
      );
    }
    return stars;
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

        {session.provider && session.provider.profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Provider</Text>
            <TouchableOpacity
              style={styles.providerCard}
              onPress={() => navigation.navigate('ProviderDetail', { providerId: session.provider.id })}
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

        {/* Edit button for session owner */}
        {isOwnSession && !isPast && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditSession', { sessionId: session.id })}
            >
              <Text style={styles.editButtonText}>✏️ Modifier la session</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Avis ({reviews.length})
            </Text>
            {session.totalRatings > 0 && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingNumber}>⭐ {session.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {canReview && !isOwnSession && (
            <TouchableOpacity
              style={styles.leaveReviewButton}
              onPress={() =>
                navigation.navigate('RateSession', {
                  session,
                  providerId: session.providerId,
                })
              }
            >
              <Text style={styles.leaveReviewButtonText}>⭐ Noter la session</Text>
            </TouchableOpacity>
          )}

          {loadingReviews ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#6366f1" />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>Aucun avis pour le moment</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {getImageUrl(review.reviewer.profile?.photo) ? (
                    <Image
                      source={{ uri: getImageUrl(review.reviewer.profile.photo)! }}
                      style={styles.reviewAvatar}
                    />
                  ) : (
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {review.reviewer.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
                    <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          )}
        </View>

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
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  ratingBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ratingNumber: { fontSize: 14, fontWeight: '600', color: '#d97706' },
  leaveReviewButton: { backgroundColor: '#6366f1', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  leaveReviewButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: 20 },
  reviewCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  reviewAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  reviewInfo: { flex: 1 },
  reviewerName: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  reviewStars: { flexDirection: 'row', gap: 2 },
  star: { fontSize: 14 },
  reviewDate: { fontSize: 12, color: '#9ca3af' },
  reviewComment: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginTop: 8 },
  editButton: { backgroundColor: '#6366f1', padding: 14, borderRadius: 12, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: { backgroundColor: '#fff', padding: 20, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 16 },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  bookButton: { flex: 1, backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
