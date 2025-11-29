import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Switch,
} from 'react-native';
import { sessionsService } from '../../services/sessions.service';
import { MOROCCAN_CITIES } from '../../constants/moroccanCities';

export default function EditSessionScreen({ route, navigation }: any) {
  const { sessionId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const session = await sessionsService.getById(sessionId);

      // Populate form fields
      setTitle(session.title);
      setDescription(session.description);
      setSkills(session.skills.join(', '));

      // Parse date and time
      const sessionDate = new Date(session.date);
      const dateStr = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = sessionDate.toTimeString().slice(0, 5); // HH:MM
      setDate(dateStr);
      setTime(timeStr);

      setDuration(session.duration.toString());
      setIsOnline(session.isOnline);
      setLocation(session.location || '');
      setPrice(session.price.toString());
      setMaxParticipants(session.maxParticipants.toString());
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger la session');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'La description est obligatoire');
      return;
    }
    if (!skills.trim()) {
      Alert.alert('Erreur', 'Au moins une compétence est requise');
      return;
    }
    if (!date || !time) {
      Alert.alert('Erreur', 'La date et l\'heure sont obligatoires');
      return;
    }
    if (!duration || parseInt(duration) <= 0) {
      Alert.alert('Erreur', 'La durée doit être supérieure à 0');
      return;
    }
    if (!isOnline && !location.trim()) {
      Alert.alert('Erreur', 'Le lieu est obligatoire pour les sessions en présentiel');
      return;
    }
    if (!price || parseFloat(price) < 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur ou égal à 0');
      return;
    }
    if (!maxParticipants || parseInt(maxParticipants) <= 0) {
      Alert.alert('Erreur', 'Le nombre de participants doit être supérieur à 0');
      return;
    }

    setSaving(true);
    try {
      const sessionData = {
        title: title.trim(),
        description: description.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(s => s),
        date: `${date}T${time}:00.000Z`,
        duration: parseInt(duration),
        isOnline,
        location: isOnline ? undefined : location.trim(),
        price: parseFloat(price),
        maxParticipants: parseInt(maxParticipants),
      };

      await sessionsService.update(sessionId, sessionData);
      Alert.alert('Succès', 'Session mise à jour avec succès!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour la session');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la session',
      'Êtes-vous sûr de vouloir supprimer cette session? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await sessionsService.delete(sessionId);
              Alert.alert('Succès', 'Session supprimée', [
                { text: 'OK', onPress: () => navigation.navigate('MySessions') },
              ]);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer la session');
              setDeleting(false);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier la session</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Formation React avancée"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Décrivez votre session en détail..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Compétences enseignées * (séparées par des virgules)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: React, JavaScript, TypeScript"
            value={skills}
            onChangeText={setSkills}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Heure *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Durée (minutes) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 60"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Session en ligne</Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: '#d1d5db', true: '#6366f1' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {!isOnline && (
          <View style={styles.section}>
            <Text style={styles.label}>Lieu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Adresse complète"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        )}

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Prix (MAD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Participants max *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, deleting && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text style={styles.deleteButtonText}>Supprimer la session</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { fontSize: 16, color: '#6366f1', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteButton: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#ef4444' },
  deleteButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
