import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { requestsService, Request } from '../services/requests.service';
import { offersService, Offer } from '../services/offers.service';
import { useAuthStore } from '../store/authStore';

export default function RequestDetailsScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const { user } = useAuthStore();
  const [request, setRequest] = useState<Request | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [requestData, offersData] = await Promise.all([
        requestsService.getRequestById(requestId),
        offersService.getRequestOffers(requestId),
      ]);
      setRequest(requestData);
      setOffers(offersData);
    } catch (error) {
      console.error('Error loading request:', error);
      Alert.alert('Erreur', 'Impossible de charger la demande');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: { bg: '#dbeafe', text: 'Ouvert', color: '#1e40af' },
      in_progress: { bg: '#fef3c7', text: 'En cours', color: '#92400e' },
      completed: { bg: '#d1fae5', text: 'Terminé', color: '#065f46' },
      cancelled: { bg: '#fee2e2', text: 'Annulé', color: '#991b1b' },
    };
    const style = styles[status as keyof typeof styles] || styles.open;
    return (
      <View style={[statusStyles.badge, { backgroundColor: style.bg }]}>
        <Text style={[statusStyles.badgeText, { color: style.color }]}>{style.text}</Text>
      </View>
    );
  };

  const handleAcceptOffer = (offerId: string, providerName: string) => {
    Alert.alert(
      'Accepter cette offre?',
      `Vous êtes sur le point d'accepter l'offre de ${providerName}. Cela rejettera automatiquement toutes les autres offres et marquera votre demande comme terminée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: async () => {
            try {
              await offersService.acceptOffer(offerId);
              Alert.alert('Succès', 'Offre acceptée avec succès');
              loadData();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'accepter l\'offre');
            }
          },
        },
      ]
    );
  };

  const handleRejectOffer = (offerId: string) => {
    Alert.alert(
      'Rejeter cette offre?',
      'Êtes-vous sûr de vouloir rejeter cette offre?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              await offersService.rejectOffer(offerId);
              Alert.alert('Succès', 'Offre rejetée');
              loadData();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de rejeter l\'offre');
            }
          },
        },
      ]
    );
  };

  const handleSendOffer = () => {
    navigation.navigate('SendOffer', { request });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!request) return null;

  const isOwner = user?.id === request.requesterId;
  const canSendOffer = user?.isProvider && !isOwner && request.status !== 'completed' && request.status !== 'cancelled';
  const hasAlreadyOffered = offers.some(o => o.providerId === user?.id);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{request.title}</Text>
          {getStatusBadge(request.status)}
        </View>
        <Text style={styles.date}>
          Publié le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {/* Client Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demandeur</Text>
        <View style={styles.clientRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{request.requester.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.clientName}>{request.requester.name}</Text>
            <Text style={styles.clientEmail}>{request.requester.email}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{request.description}</Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails</Text>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {request.requestType === 'online' ? 'En ligne' : request.requestType === 'presential' ? 'Présentiel' : 'Les deux'}
              </Text>
            </View>
          </View>

          {request.location && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lieu</Text>
              <Text style={styles.detailValue}>📍 {request.location}</Text>
            </View>
          )}

          {request.level && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Niveau requis</Text>
              <Text style={styles.detailValue}>{request.level}</Text>
            </View>
          )}

          {(request.budgetMin || request.budgetMax) && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>
                {request.budgetMin && request.budgetMax
                  ? `${request.budgetMin} - ${request.budgetMax} MAD`
                  : request.budgetMin
                  ? `À partir de ${request.budgetMin} MAD`
                  : `Jusqu'à ${request.budgetMax} MAD`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences recherchées</Text>
        <View style={styles.skillsRow}>
          {request.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Send Offer Button (for providers) */}
      {canSendOffer && !hasAlreadyOffered && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.sendOfferButton} onPress={handleSendOffer}>
            <Text style={styles.sendOfferButtonText}>✉️ Envoyer une offre</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasAlreadyOffered && (
        <View style={styles.section}>
          <View style={styles.alreadyOfferedBanner}>
            <Text style={styles.alreadyOfferedText}>✅ Vous avez déjà envoyé une offre pour cette demande</Text>
          </View>
        </View>
      )}

      {/* Offers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offres reçues ({offers.length})</Text>

        {offers.length === 0 ? (
          <Text style={styles.emptyText}>Aucune offre pour le moment</Text>
        ) : (
          offers.map((offer) => (
            <View key={offer.id} style={styles.offerCard}>
              <View style={styles.offerHeader}>
                <View style={styles.offerProviderRow}>
                  <View style={styles.offerAvatar}>
                    <Text style={styles.offerAvatarText}>
                      {offer.provider.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerProviderName}>{offer.provider.name}</Text>
                    {offer.provider.profile?.city && (
                      <Text style={styles.offerProviderCity}>📍 {offer.provider.profile.city}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.offerStatusBadge, { backgroundColor: offer.status === 'accepted' ? '#d1fae5' : offer.status === 'rejected' ? '#fee2e2' : '#fef3c7' }]}>
                  <Text style={[styles.offerStatusText, { color: offer.status === 'accepted' ? '#065f46' : offer.status === 'rejected' ? '#991b1b' : '#92400e' }]}>
                    {offer.status === 'accepted' ? 'Acceptée' : offer.status === 'rejected' ? 'Rejetée' : 'En attente'}
                  </Text>
                </View>
              </View>

              <Text style={styles.offerMessage}>{offer.message}</Text>

              <View style={styles.offerDetails}>
                <View style={styles.offerDetailItem}>
                  <Text style={styles.offerDetailLabel}>Prix proposé</Text>
                  <Text style={styles.offerPrice}>{offer.price} MAD</Text>
                </View>
                <View style={styles.offerDetailItem}>
                  <Text style={styles.offerDetailLabel}>Durée estimée</Text>
                  <Text style={styles.offerDuration}>{offer.duration}h</Text>
                </View>
                {offer.firstAvailableDate && (
                  <View style={styles.offerDetailItem}>
                    <Text style={styles.offerDetailLabel}>Disponible à partir du</Text>
                    <Text style={styles.offerDate}>
                      {new Date(offer.firstAvailableDate).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                )}
              </View>

              {isOwner && offer.status === 'pending' && (
                <View style={styles.offerActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOffer(offer.id, offer.provider.name)}
                  >
                    <Text style={styles.acceptButtonText}>✓ Accepter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectOffer(offer.id)}
                  >
                    <Text style={styles.rejectButtonText}>✕ Rejeter</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.offerTimestamp}>
                Envoyée le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', flex: 1, marginRight: 12 },
  date: { fontSize: 13, color: '#6b7280' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  clientName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  clientEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  detailsGrid: { gap: 16 },
  detailItem: {},
  detailLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  typeBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  typeBadgeText: { fontSize: 14, fontWeight: '600', color: '#1e40af' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  skillText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  sendOfferButton: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  sendOfferButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  alreadyOfferedBanner: { backgroundColor: '#d1fae5', padding: 16, borderRadius: 12 },
  alreadyOfferedText: { fontSize: 14, color: '#065f46', fontWeight: '500', textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: 20 },
  offerCard: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  offerProviderRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  offerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  offerAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  offerProviderName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  offerProviderCity: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  offerStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  offerStatusText: { fontSize: 11, fontWeight: '600' },
  offerMessage: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 12 },
  offerDetails: { gap: 10, marginBottom: 12 },
  offerDetailItem: {},
  offerDetailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  offerPrice: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  offerDuration: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  offerDate: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  offerActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  acceptButton: { flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  rejectButton: { flex: 1, backgroundColor: '#fff', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  rejectButtonText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  offerTimestamp: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});

const statusStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
