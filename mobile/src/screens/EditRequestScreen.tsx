import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { requestsService } from '../services/requests.service';

const COMMON_SKILLS = [
  'Mathématiques', 'Physique', 'Informatique', 'Langues', 'Musique',
  'Sport', 'Art', 'Cuisine', 'Business', 'Marketing', 'Design',
];

const EDUCATION_LEVELS = ['Lycée', 'Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];

export default function EditRequestScreen({ route, navigation }: any) {
  const { requestId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [level, setLevel] = useState('');
  const [location, setLocation] = useState('');
  const [requestType, setRequestType] = useState<'online' | 'presential' | 'both'>('online');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const request = await requestsService.getRequestById(requestId);
      setTitle(request.title);
      setDescription(request.description);
      setSelectedSkills(request.skills);
      setLevel(request.level || '');
      setLocation(request.location || '');
      setRequestType(request.requestType as any);
      setBudgetMin(request.budgetMin?.toString() || '');
      setBudgetMax(request.budgetMax?.toString() || '');
    } catch (error) {
      console.error('Error loading request:', error);
      Alert.alert('Erreur', 'Impossible de charger la demande');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return;
    }

    if (selectedSkills.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins une compétence');
      return;
    }

    // Budget validation
    const minBudget = budgetMin ? parseFloat(budgetMin) : undefined;
    const maxBudget = budgetMax ? parseFloat(budgetMax) : undefined;

    if (minBudget && maxBudget && minBudget > maxBudget) {
      Alert.alert('Erreur', 'Le budget minimum ne peut pas être supérieur au budget maximum');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        skills: selectedSkills,
        level: level || undefined,
        location: location.trim() || undefined,
        requestType,
        budgetMin: minBudget,
        budgetMax: maxBudget,
      };

      await requestsService.updateRequest(requestId, updateData);

      Alert.alert('Succès', 'Demande mise à jour avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating request:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de mettre à jour la demande');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la demande',
      'Êtes-vous sûr de vouloir supprimer cette demande? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await requestsService.deleteRequest(requestId);
              Alert.alert('Succès', 'Demande supprimée', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Requests'),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible de supprimer la demande');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Annuler la demande',
      'Êtes-vous sûr de vouloir annuler cette demande? Elle ne sera plus visible dans le marketplace.',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await requestsService.cancelRequest(requestId);
              Alert.alert('Succès', 'Demande annulée', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Impossible d\'annuler la demande');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Modifier la demande</Text>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Besoin d'un prof de mathématiques"
            maxLength={200}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez en détail ce que vous recherchez..."
            multiline
            numberOfLines={6}
            maxLength={2000}
            placeholderTextColor="#9ca3af"
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/2000</Text>
        </View>

        {/* Skills */}
        <View style={styles.field}>
          <Text style={styles.label}>Compétences recherchées *</Text>
          <View style={styles.skillsGrid}>
            {COMMON_SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  selectedSkills.includes(skill) && styles.skillChipSelected,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillChipText,
                    selectedSkills.includes(skill) && styles.skillChipTextSelected,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom skill input */}
          <View style={styles.customSkillRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={customSkill}
              onChangeText={setCustomSkill}
              placeholder="Autre compétence..."
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.addButton} onPress={addCustomSkill}>
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {/* Selected skills */}
          {selectedSkills.length > 0 && (
            <View style={styles.selectedSkillsContainer}>
              <Text style={styles.selectedSkillsLabel}>Sélectionnées:</Text>
              <View style={styles.selectedSkillsRow}>
                {selectedSkills.map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={styles.selectedSkillBadge}
                    onPress={() => toggleSkill(skill)}
                  >
                    <Text style={styles.selectedSkillText}>{skill} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Education Level */}
        <View style={styles.field}>
          <Text style={styles.label}>Niveau d'études requis (optionnel)</Text>
          <View style={styles.levelGrid}>
            {EDUCATION_LEVELS.map((eduLevel) => (
              <TouchableOpacity
                key={eduLevel}
                style={[
                  styles.levelChip,
                  level === eduLevel && styles.levelChipSelected,
                ]}
                onPress={() => setLevel(level === eduLevel ? '' : eduLevel)}
              >
                <Text
                  style={[
                    styles.levelChipText,
                    level === eduLevel && styles.levelChipTextSelected,
                  ]}
                >
                  {eduLevel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Request Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Type de session *</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'online' && styles.typeButtonSelected,
              ]}
              onPress={() => setRequestType('online')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  requestType === 'online' && styles.typeButtonTextSelected,
                ]}
              >
                En ligne
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'presential' && styles.typeButtonSelected,
              ]}
              onPress={() => setRequestType('presential')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  requestType === 'presential' && styles.typeButtonTextSelected,
                ]}
              >
                Présentiel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                requestType === 'both' && styles.typeButtonSelected,
              ]}
              onPress={() => setRequestType('both')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  requestType === 'both' && styles.typeButtonTextSelected,
                ]}
              >
                Les deux
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        {(requestType === 'presential' || requestType === 'both') && (
          <View style={styles.field}>
            <Text style={styles.label}>Ville / Lieu</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: Casablanca, Rabat..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        )}

        {/* Budget */}
        <View style={styles.field}>
          <Text style={styles.label}>Budget (MAD) - optionnel</Text>
          <View style={styles.budgetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.budgetLabel}>Min</Text>
              <TextInput
                style={styles.input}
                value={budgetMin}
                onChangeText={setBudgetMin}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <Text style={styles.budgetSeparator}>—</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.budgetLabel}>Max</Text>
              <TextInput
                style={styles.input}
                value={budgetMax}
                onChangeText={setBudgetMax}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>

        {/* Cancel Request Button */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Annuler la demande</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text style={styles.deleteButtonText}>Supprimer la demande</Text>
          )}
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
  form: { padding: 20 },
  field: { marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 15, color: '#1f2937' },
  textArea: { minHeight: 120, paddingTop: 14 },
  charCount: { fontSize: 12, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  skillChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  skillChipSelected: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  skillChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  skillChipTextSelected: { color: '#fff' },
  customSkillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  addButton: { backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  selectedSkillsContainer: { marginTop: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 12 },
  selectedSkillsLabel: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  selectedSkillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selectedSkillBadge: { backgroundColor: '#6366f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  selectedSkillText: { fontSize: 12, color: '#fff', fontWeight: '500' },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  levelChipSelected: { backgroundColor: '#10b981', borderColor: '#10b981' },
  levelChipText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  levelChipTextSelected: { color: '#fff' },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: { flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  typeButtonSelected: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  typeButtonText: { fontSize: 14, color: '#374151', fontWeight: '600' },
  typeButtonTextSelected: { color: '#fff' },
  budgetRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  budgetLabel: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  budgetSeparator: { fontSize: 18, color: '#6b7280', paddingBottom: 14 },
  updateButton: { backgroundColor: '#6366f1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  updateButtonDisabled: { opacity: 0.6 },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#f59e0b' },
  cancelButtonText: { color: '#f59e0b', fontSize: 15, fontWeight: '600' },
  deleteButton: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  deleteButtonDisabled: { opacity: 0.6 },
  deleteButtonText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
