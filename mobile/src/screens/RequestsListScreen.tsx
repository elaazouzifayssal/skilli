import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { requestsService, Request } from '../services/requests.service';

export default function RequestsListScreen({ navigation }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'online' | 'presential'>('all');

  const loadData = async () => {
    try {
      const params = {
        status: 'open',
        requestType: filter === 'all' ? undefined : filter,
        limit: 50,
      };
      const response = await requestsService.getAllRequests(params);
      setRequests(response.requests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}
    >
      <View style={cardStyles.header}>
        <Text style={cardStyles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[cardStyles.typeBadge, item.requestType === 'online' ? cardStyles.typeBadgeOnline : cardStyles.typeBadgePresential]}>
          <Text style={cardStyles.typeBadgeText}>
            {item.requestType === 'online' ? 'En ligne' : item.requestType === 'presential' ? 'Présentiel' : 'Les deux'}
          </Text>
        </View>
      </View>

      <Text style={cardStyles.description} numberOfLines={3}>
        {item.description}
      </Text>

      {/* Requester */}
      <View style={cardStyles.requesterRow}>
        <View style={cardStyles.avatar}>
          <Text style={cardStyles.avatarText}>{item.requester.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={cardStyles.requesterName}>{item.requester.name}</Text>
          {item.location && <Text style={cardStyles.location}>📍 {item.location}</Text>}
        </View>
      </View>

      {/* Skills */}
      <View style={cardStyles.skillsRow}>
        {item.skills.slice(0, 3).map((skill, index) => (
          <View key={index} style={cardStyles.skillBadge}>
            <Text style={cardStyles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 3 && (
          <Text style={cardStyles.moreSkills}>+{item.skills.length - 3}</Text>
        )}
      </View>

      {/* Footer */}
      <View style={cardStyles.footer}>
        <Text style={cardStyles.date}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
        {(item.budgetMin || item.budgetMax) && (
          <Text style={cardStyles.budget}>
            {item.budgetMin && item.budgetMax
              ? `${item.budgetMin} - ${item.budgetMax} MAD`
              : item.budgetMin
              ? `Dès ${item.budgetMin} MAD`
              : `Max ${item.budgetMax} MAD`}
          </Text>
        )}
      </View>

      {item._count && item._count.offers > 0 && (
        <View style={cardStyles.offersIndicator}>
          <Text style={cardStyles.offersIndicatorText}>
            {item._count.offers} offre{item._count.offers > 1 ? 's' : ''} reçue{item._count.offers > 1 ? 's' : ''}
          </Text>
        </View>
      )}
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
        <Text style={screenStyles.headerTitle}>Demandes ouvertes</Text>
        <Text style={screenStyles.headerSubtitle}>Trouvez des opportunités et envoyez vos offres</Text>
      </View>

      {/* Filters */}
      <View style={screenStyles.filtersRow}>
        <TouchableOpacity
          style={[screenStyles.filterButton, filter === 'all' && screenStyles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[screenStyles.filterButtonText, filter === 'all' && screenStyles.filterButtonTextActive]}>
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[screenStyles.filterButton, filter === 'online' && screenStyles.filterButtonActive]}
          onPress={() => setFilter('online')}
        >
          <Text style={[screenStyles.filterButtonText, filter === 'online' && screenStyles.filterButtonTextActive]}>
            En ligne
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[screenStyles.filterButton, filter === 'presential' && screenStyles.filterButtonActive]}
          onPress={() => setFilter('presential')}
        >
          <Text style={[screenStyles.filterButtonText, filter === 'presential' && screenStyles.filterButtonTextActive]}>
            Présentiel
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={screenStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={screenStyles.empty}>
            <Text style={screenStyles.emptyText}>Aucune demande pour le moment</Text>
            <Text style={screenStyles.emptySubtext}>Revenez plus tard pour découvrir de nouvelles opportunités</Text>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#6b7280' },
  filtersRow: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  filterButtonActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  filterButtonTextActive: { color: '#fff' },
  list: { padding: 16 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeOnline: { backgroundColor: '#dbeafe' },
  typeBadgePresential: { backgroundColor: '#fef3c7' },
  typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  requesterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  requesterName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  location: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  moreSkills: { fontSize: 12, color: '#6b7280', alignSelf: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 13, color: '#9ca3af' },
  budget: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  offersIndicator: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  offersIndicatorText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
