import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { providersService } from '../services/providers.service';
import { sessionsService } from '../services/sessions.service';
import { messagesService } from '../services/messages.service';
import { getImageUrl } from '../utils/imageUtils';

export default function ProviderDetailScreen({ route, navigation }: any) {
  const { providerId } = route.params;
  const [provider, setProvider] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [providerId]);

  const loadData = async () => {
    try {
      const [providerData, allSessions] = await Promise.all([
        providersService.getById(providerId),
        sessionsService.getAll(),
      ]);
      setProvider(providerData);

      // Filter sessions by this provider
      const providerSessions = allSessions.filter(
        (s: any) => s.providerId === providerData.userId
      );
      setSessions(providerSessions);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le profil');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleContactProvider = async () => {
    try {
      // Get or create conversation with this provider
      const conversation = await messagesService.getOrCreateConversation(provider.userId);

      // Navigate to chat screen
      navigation.navigate('Chat', {
        conversationId: conversation.id,
        otherUser: {
          id: provider.userId,
          name: provider.user.name,
          email: provider.user.email,
          profile: { photo: provider.photo },
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

  if (!provider) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {getImageUrl(provider.photo) ? (
          <Image source={{ uri: getImageUrl(provider.photo)! }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {provider.user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{provider.user.name}</Text>
        <Text style={styles.city}>📍 {provider.city}</Text>
        {provider.rating > 0 && (
          <Text style={styles.rating}>
            ⭐ {provider.rating.toFixed(1)} ({provider.totalRatings} avis)
          </Text>
        )}

        <TouchableOpacity style={styles.contactButton} onPress={handleContactProvider}>
          <Text style={styles.contactButtonText}>💬 Contacter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos</Text>
        <Text style={styles.bio}>{provider.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences</Text>
        <View style={styles.skillsGrid}>
          {provider.skills.map((skill: string, index: number) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Niveau d'études</Text>
            <Text style={styles.infoValue}>{provider.educationLevel}</Text>
          </View>
          {provider.yearsOfExperience && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Expérience</Text>
              <Text style={styles.infoValue}>{provider.yearsOfExperience} ans</Text>
            </View>
          )}
          {provider.hourlyRate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tarif horaire</Text>
              <Text style={styles.infoValue}>{provider.hourlyRate} MAD/h</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Langues</Text>
        <View style={styles.languagesRow}>
          {provider.languages.map((lang: string, index: number) => (
            <View key={index} style={styles.languageChip}>
              <Text style={styles.languageText}>{lang}</Text>
            </View>
          ))}
        </View>
      </View>

      {provider.certifications && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          <Text style={styles.certifications}>{provider.certifications}</Text>
        </View>
      )}

      {provider.availability && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilité</Text>
          <Text style={styles.availability}>{provider.availability}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sessions ({sessions.length})</Text>
        </View>

        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>Aucune session disponible</Text>
        ) : (
          sessions.map((session) => (
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

              <View style={styles.sessionFooter}>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                <Text style={styles.sessionPrice}>{session.price} MAD</Text>
              </View>
            </TouchableOpacity>
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
  header: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  city: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  rating: { fontSize: 16, color: '#f59e0b', fontWeight: '600', marginBottom: 12 },
  contactButton: { backgroundColor: '#6366f1', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  contactButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  section: { backgroundColor: '#fff', marginTop: 12, padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  bio: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  infoGrid: { gap: 16 },
  infoItem: {},
  infoLabel: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  languagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageChip: { backgroundColor: '#ede9fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  languageText: { fontSize: 13, color: '#6366f1', fontWeight: '500' },
  certifications: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  availability: { fontSize: 15, color: '#4b5563', lineHeight: 22 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', padding: 20 },
  sessionCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 8 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  sessionTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  sessionBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#1f2937' },
  sessionDescription: { fontSize: 13, color: '#6b7280', marginBottom: 8, lineHeight: 18 },
  sessionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionDate: { fontSize: 12, color: '#6b7280' },
  sessionPrice: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
});
