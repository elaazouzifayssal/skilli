import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { sessionsService } from '../services/sessions.service';
import { useAuthStore } from '../store/authStore';

export default function MySessionsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'provider'>('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [providerSessions, setProviderSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [bookingsData, sessionsData] = await Promise.all([
        sessionsService.getMyBookings(),
        user?.isProvider ? sessionsService.getMySessions() : Promise.resolve([]),
      ]);
      setBookings(bookingsData);
      setProviderSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionsService.cancelBooking(bookingId);
              loadData();
              Alert.alert('Succès', 'Réservation annulée');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'annuler');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: { bg: '#dbeafe', text: 'Confirmé' },
      completed: { bg: '#d1fae5', text: 'Terminé' },
      cancelled: { bg: '#fee2e2', text: 'Annulé' },
      pending: { bg: '#fef3c7', text: 'En attente' },
    };
    const style = styles[status as keyof typeof styles] || styles.pending;
    return (
      <View style={[statusStyles.badge, { backgroundColor: style.bg }]}>
        <Text style={statusStyles.badgeText}>{style.text}</Text>
      </View>
    );
  };

  const renderBooking = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: item.session.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.session.title}
        </Text>
        {getStatusBadge(item.status)}
      </View>

      <View style={styles.providerRow}>
        <View style={styles.providerAvatar}>
          <Text style={styles.providerAvatarText}>
            {item.session.provider.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{item.session.provider.name}</Text>
          <Text style={styles.providerCity}>{item.session.provider.profile?.city}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(item.session.date)}</Text>
        <Text style={styles.price}>{item.amount} MAD</Text>
      </View>

      {item.status === 'confirmed' && new Date(item.session.date) > new Date() && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.id)}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && !item.rating && (
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => navigation.navigate('RateSession', { bookingId: item.id })}
        >
          <Text style={styles.rateButtonText}>⭐ Noter la session</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderProviderSession = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.badge, item.isOnline ? styles.badgeOnline : styles.badgePresential]}>
            <Text style={styles.badgeText}>{item.isOnline ? 'En ligne' : 'Présentiel'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item._count?.bookings || 0}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.interested || 0}</Text>
            <Text style={styles.statLabel}>Intéressés</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.likes || 0}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <Text style={styles.price}>{item.price} MAD</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditSession', { sessionId: item.id })}
      >
        <Text style={styles.editButtonText}>✏️ Modifier</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const data = activeTab === 'bookings' ? bookings : providerSessions;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes sessions</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Mes réservations
          </Text>
        </TouchableOpacity>

        {user?.isProvider && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'provider' && styles.tabActive]}
            onPress={() => setActiveTab('provider')}
          >
            <Text style={[styles.tabText, activeTab === 'provider' && styles.tabTextActive]}>
              Mes sessions
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={data}
        renderItem={activeTab === 'bookings' ? renderBooking : renderProviderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === 'bookings' ? 'Aucune réservation' : 'Aucune session créée'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#6366f1' },
  tabText: { fontSize: 14, color: '#6b7280' },
  tabTextActive: { color: '#6366f1', fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  providerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  providerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  providerAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  providerInfo: { flex: 1 },
  providerName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  providerCity: { fontSize: 12, color: '#6b7280' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6', marginBottom: 12 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 13, color: '#6b7280' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  cancelButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ef4444', alignItems: 'center' },
  cancelButtonText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  rateButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#fef3c7', alignItems: 'center' },
  rateButtonText: { color: '#92400e', fontSize: 14, fontWeight: '600' },
  editButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#6366f1', alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },
});

const statusStyles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
});
