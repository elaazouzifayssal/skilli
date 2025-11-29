import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView, Image,
} from 'react-native';
import { providersService } from '../services/providers.service';
import { MOROCCAN_CITIES } from '../constants/moroccanCities';
import { getImageUrl } from '../utils/imageUtils';

export default function ProvidersListScreen({ navigation }: any) {
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      const data = await providersService.getAll();
      setAllProviders(data);
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allProviders];

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.user.name.toLowerCase().includes(query) ||
        p.bio.toLowerCase().includes(query) ||
        p.skills.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    setProviders(filtered);
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCity, allProviders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProviders();
  };

  const renderProvider = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProviderDetail', { providerId: item.userId })}
    >
      <View style={styles.header}>
        {getImageUrl(item.photo) ? (
          <Image source={{ uri: getImageUrl(item.photo)! }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name}>{item.user.name}</Text>
          <Text style={styles.city}>📍 {item.city}</Text>
          {item.rating > 0 && (
            <Text style={styles.rating}>
              ⭐ {item.rating.toFixed(1)} ({item.totalRatings} avis)
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {item.bio}
      </Text>

      <View style={styles.skillsRow}>
        {item.skills.slice(0, 4).map((skill: string, index: number) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 4 && (
          <Text style={styles.moreSkills}>+{item.skills.length - 4}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Niveau</Text>
          <Text style={styles.detailValue}>{item.educationLevel}</Text>
        </View>
        {item.hourlyRate && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Tarif/h</Text>
            <Text style={styles.detailValue}>{item.hourlyRate} MAD</Text>
          </View>
        )}
        {item.yearsOfExperience && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expérience</Text>
            <Text style={styles.detailValue}>{item.yearsOfExperience} ans</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Providers</Text>
        <Text style={styles.headerSubtitle}>{providers.length} providers</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou compétence..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.cityFilterSection}>
          <Text style={styles.filterLabel}>Ville</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.cityChip, !selectedCity && styles.cityChipActive]}
              onPress={() => setSelectedCity(null)}
            >
              <Text style={[styles.cityText, !selectedCity && styles.cityTextActive]}>
                Toutes
              </Text>
            </TouchableOpacity>
            {MOROCCAN_CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
                onPress={() => setSelectedCity(city)}
              >
                <Text style={[styles.cityText, selectedCity === city && styles.cityTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucun provider trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#f9fafb', marginBottom: 16 },
  cityFilterSection: { marginTop: 8 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  cityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', marginRight: 8 },
  cityChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  cityText: { fontSize: 13, color: '#374151' },
  cityTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  header: { flexDirection: 'row', marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  city: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  rating: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  bio: { fontSize: 14, color: '#4b5563', marginBottom: 12, lineHeight: 20 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#374151' },
  moreSkills: { fontSize: 12, color: '#6b7280', alignSelf: 'center' },
  footer: { flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },
});
