import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { sessionsService } from '../../services/sessions.service';
import { useAuthStore } from '../../store/authStore';

export default function ProviderDashboardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalParticipants: 0,
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const sessions = await sessionsService.getMySessions();

      // Calculate statistics
      const now = new Date();
      const upcoming = sessions.filter((s: any) => new Date(s.date) >= now);
      const completed = sessions.filter((s: any) => new Date(s.date) < now);

      const totalBookings = sessions.reduce((sum: number, s: any) => sum + (s._count?.bookings || 0), 0);
      const totalRevenue = sessions.reduce((sum: number, s: any) => {
        return sum + (s.price * (s._count?.bookings || 0));
      }, 0);

      setStats({
        totalSessions: sessions.length,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        totalBookings,
        totalRevenue,
        averageRating: user?.profile?.rating || 0,
        totalParticipants: totalBookings,
      });

      // Get 5 most recent sessions
      const sorted = [...sessions].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentSessions(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <Text style={styles.headerSubtitle}>Vue d'ensemble de vos sessions</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions créées</Text>
        </View>

        <View style={[styles.statCard, styles.statCardSuccess]}>
          <Text style={styles.statValue}>{stats.upcomingSessions}</Text>
          <Text style={styles.statLabel}>À venir</Text>
        </View>

        <View style={[styles.statCard, styles.statCardWarning]}>
          <Text style={styles.statValue}>{stats.totalBookings}</Text>
          <Text style={styles.statLabel}>Réservations</Text>
        </View>

        <View style={[styles.statCard, styles.statCardInfo]}>
          <Text style={styles.statValue}>{stats.completedSessions}</Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabelSmall}>Revenu total</Text>
        <Text style={styles.revenueValue}>{stats.totalRevenue.toLocaleString()} MAD</Text>
        <View style={styles.revenueDetails}>
          <View style={styles.revenueDetailItem}>
            <Text style={styles.revenueDetailLabel}>Participants</Text>
            <Text style={styles.revenueDetailValue}>{stats.totalParticipants}</Text>
          </View>
          <View style={styles.revenueDetailDivider} />
          <View style={styles.revenueDetailItem}>
            <Text style={styles.revenueDetailLabel}>Note moyenne</Text>
            <Text style={styles.revenueDetailValue}>
              {stats.averageRating > 0 ? `⭐ ${stats.averageRating.toFixed(1)}` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sessions récentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MySessions')}>
            <Text style={styles.seeAllText}>Tout voir →</Text>
          </TouchableOpacity>
        </View>

        {recentSessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune session créée</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateSession')}
            >
              <Text style={styles.createButtonText}>+ Créer une session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle} numberOfLines={1}>
                  {session.title}
                </Text>
                <View style={[styles.badge, session.isOnline ? styles.badgeOnline : styles.badgePresential]}>
                  <Text style={styles.badgeText}>{session.isOnline ? 'En ligne' : 'Présentiel'}</Text>
                </View>
              </View>

              <View style={styles.sessionStats}>
                <Text style={styles.sessionStat}>
                  📅 {formatDate(session.date)}
                </Text>
                <Text style={styles.sessionStat}>
                  👥 {session._count?.bookings || 0}/{session.maxParticipants}
                </Text>
                <Text style={styles.sessionPrice}>{session.price} MAD</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateSession')}
        >
          <Text style={styles.actionButtonIcon}>➕</Text>
          <Text style={styles.actionButtonText}>Créer une nouvelle session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('MySessions')}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>Gérer mes sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.actionButtonIcon}>⚙️</Text>
          <Text style={styles.actionButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statCardPrimary: { borderLeftWidth: 4, borderLeftColor: '#6366f1' },
  statCardSuccess: { borderLeftWidth: 4, borderLeftColor: '#10b981' },
  statCardWarning: { borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  statCardInfo: { borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#6b7280', fontWeight: '500' },

  revenueCard: { backgroundColor: '#6366f1', borderRadius: 16, padding: 24, margin: 16, marginTop: 0 },
  revenueLabelSmall: { fontSize: 14, color: '#e0e7ff', marginBottom: 8 },
  revenueValue: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  revenueDetails: { flexDirection: 'row', alignItems: 'center' },
  revenueDetailItem: { flex: 1 },
  revenueDetailLabel: { fontSize: 12, color: '#e0e7ff', marginBottom: 4 },
  revenueDetailValue: { fontSize: 16, fontWeight: '600', color: '#fff' },
  revenueDetailDivider: { width: 1, height: 40, backgroundColor: '#8b91f7', marginHorizontal: 16 },

  section: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  seeAllText: { fontSize: 14, color: '#6366f1', fontWeight: '500' },

  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af', marginBottom: 16 },
  createButton: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  sessionCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  sessionStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionStat: { fontSize: 13, color: '#6b7280' },
  sessionPrice: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginLeft: 'auto' },

  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 12 },
  actionButtonIcon: { fontSize: 24, marginRight: 12 },
  actionButtonText: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
});
