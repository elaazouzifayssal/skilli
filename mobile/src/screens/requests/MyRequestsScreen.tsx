import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { requestsService, Request } from '../../services/requests.service';

export default function MyRequestsScreen({ navigation }: any) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await requestsService.getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
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

  const renderRequest = ({ item }: { item: Request }) => (
    <View style={cardStyles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('RequestDetails', { requestId: item.id })}>
        <View style={cardStyles.header}>
          <Text style={cardStyles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {getStatusBadge(item.status)}
        </View>

        <Text style={cardStyles.description} numberOfLines={2}>
          {item.description}
        </Text>

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

        <View style={cardStyles.footer}>
          <Text style={cardStyles.date}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
          <View style={cardStyles.offersCount}>
            <Text style={cardStyles.offersCountText}>
              {item._count?.offers || 0} offre{(item._count?.offers || 0) > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {(item.budgetMin || item.budgetMax) && (
          <View style={cardStyles.budgetRow}>
            <Text style={cardStyles.budgetLabel}>Budget: </Text>
            <Text style={cardStyles.budgetValue}>
              {item.budgetMin && item.budgetMax
                ? `${item.budgetMin} - ${item.budgetMax} MAD`
                : item.budgetMin
                ? `À partir de ${item.budgetMin} MAD`
                : `Jusqu'à ${item.budgetMax} MAD`}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {item.status !== 'completed' && item.status !== 'cancelled' && (
        <TouchableOpacity
          style={cardStyles.editButton}
          onPress={() => navigation.navigate('EditRequest', { requestId: item.id })}
        >
          <Text style={cardStyles.editButtonText}>✏️ Modifier</Text>
        </TouchableOpacity>
      )}
    </View>
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
        <Text style={screenStyles.headerTitle}>Mes demandes</Text>
        <TouchableOpacity
          style={screenStyles.createButton}
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Text style={screenStyles.createButtonText}>+ Nouvelle demande</Text>
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
            <Text style={screenStyles.emptyText}>Aucune demande</Text>
            <Text style={screenStyles.emptySubtext}>Créez votre première demande pour recevoir des offres</Text>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  createButton: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  createButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  list: { padding: 16 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 12 },
  description: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  moreSkills: { fontSize: 12, color: '#6b7280', alignSelf: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 13, color: '#9ca3af' },
  offersCount: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  offersCountText: { fontSize: 12, fontWeight: '600', color: '#1e40af' },
  budgetRow: { flexDirection: 'row', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  budgetLabel: { fontSize: 13, color: '#6b7280' },
  budgetValue: { fontSize: 13, fontWeight: '600', color: '#10b981' },
  editButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#6366f1', alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

const statusStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});
