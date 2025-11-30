import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { offersService, Offer } from '../../services/offers.service';

export default function MyOffersScreen({ navigation }: any) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await offersService.getMyOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: '#fef3c7', text: 'En attente', color: '#92400e' },
      accepted: { bg: '#d1fae5', text: 'Acceptée', color: '#065f46' },
      rejected: { bg: '#fee2e2', text: 'Rejetée', color: '#991b1b' },
    };
    const style = styles[status as keyof typeof styles] || styles.pending;
    return (
      <View style={[statusStyles.badge, { backgroundColor: style.bg }]}>
        <Text style={[statusStyles.badgeText, { color: style.color }]}>{style.text}</Text>
      </View>
    );
  };

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => navigation.navigate('RequestDetails', { requestId: item.requestId })}
    >
      {/* Request Info */}
      <View style={cardStyles.requestSection}>
        <Text style={cardStyles.requestLabel}>Demande:</Text>
        <Text style={cardStyles.requestTitle} numberOfLines={2}>
          {item.request?.title}
        </Text>
      </View>

      {/* Requester Info */}
      <View style={cardStyles.requesterRow}>
        <View style={cardStyles.requesterAvatar}>
          <Text style={cardStyles.requesterAvatarText}>
            {item.request?.requester.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={cardStyles.requesterName}>{item.request?.requester.name}</Text>
          <Text style={cardStyles.requestDate}>
            Demande créée le {new Date(item.request?.createdAt || '').toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      {/* Offer Details */}
      <View style={cardStyles.offerDetailsSection}>
        <Text style={cardStyles.offerMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={cardStyles.offerStatsRow}>
          <View style={cardStyles.offerStat}>
            <Text style={cardStyles.offerStatLabel}>Prix</Text>
            <Text style={cardStyles.offerPrice}>{item.price} MAD</Text>
          </View>
          <View style={cardStyles.offerStat}>
            <Text style={cardStyles.offerStatLabel}>Durée</Text>
            <Text style={cardStyles.offerDuration}>{item.duration}h</Text>
          </View>
          {item.firstAvailableDate && (
            <View style={cardStyles.offerStat}>
              <Text style={cardStyles.offerStatLabel}>Dispo</Text>
              <Text style={cardStyles.offerDate}>
                {new Date(item.firstAvailableDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={cardStyles.footer}>
        <Text style={cardStyles.offerTimestamp}>
          Envoyée le {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        {getStatusBadge(item.status)}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={screenStyles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <Text style={screenStyles.headerTitle}>Mes offres</Text>
        <View style={screenStyles.statsRow}>
          <View style={screenStyles.statBadge}>
            <Text style={screenStyles.statValue}>{offers.filter(o => o.status === 'pending').length}</Text>
            <Text style={screenStyles.statLabel}>En attente</Text>
          </View>
          <View style={[screenStyles.statBadge, { backgroundColor: '#d1fae5' }]}>
            <Text style={[screenStyles.statValue, { color: '#065f46' }]}>
              {offers.filter(o => o.status === 'accepted').length}
            </Text>
            <Text style={[screenStyles.statLabel, { color: '#065f46' }]}>Acceptées</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={offers}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={screenStyles.empty}>
            <Text style={screenStyles.emptyText}>Aucune offre envoyée</Text>
            <Text style={screenStyles.emptySubtext}>
              Parcourez les demandes et envoyez des offres pour décrocher des opportunités
            </Text>
          </View>
        }
      />
    </View>
  );
}

const screenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#92400e', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#92400e', fontWeight: '500' },
  list: { padding: 16 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 20 },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  requestSection: { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  requestLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  requestTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  requesterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  requesterAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  requesterAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  requesterName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  requestDate: { fontSize: 12, color: '#9ca3af' },
  offerDetailsSection: { marginBottom: 12 },
  offerMessage: { fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 12 },
  offerStatsRow: { flexDirection: 'row', gap: 16 },
  offerStat: {},
  offerStatLabel: { fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  offerPrice: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  offerDuration: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  offerDate: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  offerTimestamp: { fontSize: 12, color: '#9ca3af' },
});

const statusStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
