import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView, Modal,
} from 'react-native';
import { sessionsService } from '../services/sessions.service';

export default function SessionsListScreen({ navigation }: any) {
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'presential'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity'>('date');
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Extract unique skills from all sessions
  const availableSkills = Array.from(
    new Set(allSessions.flatMap(s => s.skills))
  ).sort();

  const loadSessions = async () => {
    try {
      const data = await sessionsService.getAll();
      setAllSessions(data);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allSessions];

    // Filter by type
    if (filterType === 'online') {
      filtered = filtered.filter(s => s.isOnline);
    } else if (filterType === 'presential') {
      filtered = filtered.filter(s => !s.isOnline);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.skills.some((skill: string) => skill.toLowerCase().includes(query))
      );
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter(s => s.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(s => s.price <= parseFloat(maxPrice));
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === 'today') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= now && sessionDate < tomorrow;
      });
    } else if (dateFilter === 'week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= now && sessionDate < nextWeek;
      });
    } else if (dateFilter === 'month') {
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      filtered = filtered.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate >= now && sessionDate < nextMonth;
      });
    }

    // Filter by skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(s =>
        s.skills.some((skill: string) => selectedSkills.includes(skill))
      );
    }

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'popularity') {
      filtered.sort((a, b) => (b._count?.bookings || 0) - (a._count?.bookings || 0));
    }

    setSessions(filtered);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType, allSessions, sortBy, minPrice, maxPrice, dateFilter, selectedSkills]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setDateFilter('all');
    setSelectedSkills([]);
    setFilterType('all');
    setSortBy('date');
    setSearchQuery('');
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
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

  const renderSession = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={[styles.badge, item.isOnline ? styles.badgeOnline : styles.badgePresential]}>
          <Text style={styles.badgeText}>{item.isOnline ? 'En ligne' : 'Présentiel'}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.skillsRow}>
        {item.skills.slice(0, 3).map((skill: string, index: number) => (
          <View key={index} style={styles.skillChip}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
        {item.skills.length > 3 && (
          <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          <Text style={styles.duration}>{item.duration} min</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price} MAD</Text>
          <Text style={styles.spots}>
            {item._count?.bookings || 0}/{item.maxParticipants} places
          </Text>
        </View>
      </View>

      {!item.isOnline && item.location && (
        <Text style={styles.location}>📍 {item.location}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const activeFiltersCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    selectedSkills.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sessions disponibles</Text>
        <Text style={styles.headerSubtitle}>{sessions.length} sessions</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
              Tout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'online' && styles.filterButtonActive]}
            onPress={() => setFilterType('online')}
          >
            <Text style={[styles.filterText, filterType === 'online' && styles.filterTextActive]}>
              En ligne
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterType === 'presential' && styles.filterButtonActive]}
            onPress={() => setFilterType('presential')}
          >
            <Text style={[styles.filterText, filterType === 'presential' && styles.filterTextActive]}>
              Présentiel
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.advancedFiltersButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.advancedFiltersText}>
              🔍 Filtres {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Text>
          </TouchableOpacity>

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Trier:</Text>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
              onPress={() => setSortBy('date')}
            >
              <Text style={[styles.sortText, sortBy === 'date' && styles.sortTextActive]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
              onPress={() => setSortBy('price')}
            >
              <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>Prix</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'popularity' && styles.sortButtonActive]}
              onPress={() => setSortBy('popularity')}
            >
              <Text style={[styles.sortText, sortBy === 'popularity' && styles.sortTextActive]}>Popularité</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune session disponible</Text>
          </View>
        }
      />

      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres avancés</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Prix (MAD)</Text>
                <View style={styles.priceInputRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                  />
                  <Text style={styles.priceInputSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                  />
                </View>
              </View>

              {/* Date Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Date</Text>
                <View style={styles.dateFilterRow}>
                  <TouchableOpacity
                    style={[styles.dateFilterButton, dateFilter === 'all' && styles.dateFilterButtonActive]}
                    onPress={() => setDateFilter('all')}
                  >
                    <Text style={[styles.dateFilterText, dateFilter === 'all' && styles.dateFilterTextActive]}>
                      Toutes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateFilterButton, dateFilter === 'today' && styles.dateFilterButtonActive]}
                    onPress={() => setDateFilter('today')}
                  >
                    <Text style={[styles.dateFilterText, dateFilter === 'today' && styles.dateFilterTextActive]}>
                      Aujourd'hui
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateFilterButton, dateFilter === 'week' && styles.dateFilterButtonActive]}
                    onPress={() => setDateFilter('week')}
                  >
                    <Text style={[styles.dateFilterText, dateFilter === 'week' && styles.dateFilterTextActive]}>
                      Cette semaine
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dateFilterButton, dateFilter === 'month' && styles.dateFilterButtonActive]}
                    onPress={() => setDateFilter('month')}
                  >
                    <Text style={[styles.dateFilterText, dateFilter === 'month' && styles.dateFilterTextActive]}>
                      Ce mois
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Skills Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Compétences</Text>
                <View style={styles.skillsFilterGrid}>
                  {availableSkills.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillFilterChip,
                        selectedSkills.includes(skill) && styles.skillFilterChipActive
                      ]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={[
                        styles.skillFilterText,
                        selectedSkills.includes(skill) && styles.skillFilterTextActive
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  searchInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#f9fafb', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', alignItems: 'center' },
  filterButtonActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  filterText: { fontSize: 14, color: '#374151' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  advancedFiltersButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  advancedFiltersText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  sortButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  sortButtonActive: { backgroundColor: '#ede9fe', borderColor: '#6366f1' },
  sortText: { fontSize: 12, color: '#374151' },
  sortTextActive: { color: '#6366f1', fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOnline: { backgroundColor: '#dbeafe' },
  badgePresential: { backgroundColor: '#fef3c7' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 12, lineHeight: 20 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 6 },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 12, color: '#374151' },
  moreSkills: { fontSize: 12, color: '#6b7280', alignSelf: 'center' },
  footer: { gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: '#6b7280' },
  duration: { fontSize: 13, color: '#6b7280' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  spots: { fontSize: 13, color: '#6b7280' },
  location: { fontSize: 13, color: '#6b7280', marginTop: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#9ca3af' },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  modalClose: { fontSize: 24, color: '#6b7280' },
  modalBody: { padding: 20 },
  filterSection: { marginBottom: 24 },
  filterSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  priceInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  priceInputSeparator: { fontSize: 16, color: '#6b7280' },
  dateFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateFilterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  dateFilterButtonActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  dateFilterText: { fontSize: 14, color: '#374151' },
  dateFilterTextActive: { color: '#fff', fontWeight: '600' },
  skillsFilterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillFilterChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' },
  skillFilterChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  skillFilterText: { fontSize: 13, color: '#374151' },
  skillFilterTextActive: { color: '#fff', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  clearFiltersButton: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
  clearFiltersText: { fontSize: 16, color: '#374151', fontWeight: '600' },
  applyFiltersButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center' },
  applyFiltersText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
