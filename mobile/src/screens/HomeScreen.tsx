import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { sessionsService } from '../services/sessions.service';
import { notificationsService } from '../services/notifications.service';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [featuredSessions, setFeaturedSessions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sessions, count] = await Promise.all([
        sessionsService.getAll(),
        notificationsService.getUnreadCount(),
      ]);

      // Get upcoming sessions, sorted by date
      const upcoming = sessions
        .filter((s: any) => new Date(s.date) > new Date())
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

      setFeaturedSessions(upcoming);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
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
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Découvrez de nouvelles compétences</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SessionsList')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionTitle}>Explorer</Text>
            <Text style={styles.actionSubtitle}>Sessions</Text>
          </TouchableOpacity>

          {user?.isProvider && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreateSession')}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionTitle}>Créer</Text>
              <Text style={styles.actionSubtitle}>Session</Text>
            </TouchableOpacity>
          )}

          {!user?.isProvider && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('BecomeProvider')}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={styles.actionTitle}>Devenir</Text>
              <Text style={styles.actionSubtitle}>Provider</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MySessions')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionTitle}>Mes</Text>
            <Text style={styles.actionSubtitle}>Sessions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prochaines sessions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SessionsList')}>
            <Text style={styles.seeAll}>Tout voir</Text>
          </TouchableOpacity>
        </View>

        {featuredSessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Aucune session disponible</Text>
            {user?.isProvider && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateSession')}
              >
                <Text style={styles.createButtonText}>Créer une session</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          featuredSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle} numberOfLines={1}>
                  {session.title}
                </Text>
                <View
                  style={[
                    styles.sessionBadge,
                    session.isOnline ? styles.badgeOnline : styles.badgePresential,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {session.isOnline ? 'En ligne' : 'Présentiel'}
                  </Text>
                </View>
              </View>

              <Text style={styles.sessionDescription} numberOfLines={2}>
                {session.description}
              </Text>

              <View style={styles.sessionSkills}>
                {session.skills.slice(0, 3).map((skill: string, index: number) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
                {session.skills.length > 3 && (
                  <Text style={styles.moreSkills}>+{session.skills.length - 3}</Text>
                )}
              </View>

              <View style={styles.sessionFooter}>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                <Text style={styles.sessionPrice}>{session.price} MAD</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Stats for Providers */}
      {user?.isProvider && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos statistiques</Text>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Réservations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>-</Text>
              <Text style={styles.statLabel}>Revenus</Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, paddingBottom: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  notificationButton: { position: 'relative', padding: 4 },
  notificationIcon: { fontSize: 28 },
  notificationBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notificationBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  seeAll: { fontSize: 14, color: '#6366f1', fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: '30%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  actionSubtitle: { fontSize: 12, color: '#6b7280' },
  emptyState: { backgroundColor: '#fff', borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  createButton: { backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  createButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sessionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  sessionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  sessionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  sessionDescription: { fontSize: 14, color: '#6b7280', marginBottom: 12, lineHeight: 20 },
  sessionSkills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillTag: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#374151' },
  moreSkills: { fontSize: 12, color: '#6b7280', alignSelf: 'center' },
  sessionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionDate: { fontSize: 13, color: '#6b7280' },
  sessionPrice: { fontSize: 18, fontWeight: 'bold', color: '#10b981' },
  statsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6b7280' },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },
});
