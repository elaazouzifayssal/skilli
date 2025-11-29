import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { sessionsService } from '../../services/sessions.service';
import { SKILLS_CATEGORIES, ALL_SKILLS } from '../../constants/skills';
import { MOROCCAN_CITIES } from '../../constants/moroccanCities';

export default function CreateSessionScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [duration, setDuration] = useState('60');
  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || selectedSkills.length === 0 || !price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isOnline && !location) {
      Alert.alert('Erreur', 'Veuillez spécifier un lieu pour les sessions présentielles');
      return;
    }

    setLoading(true);
    try {
      await sessionsService.create({
        title,
        description,
        skills: selectedSkills,
        date: date.toISOString(),
        duration: parseInt(duration),
        isOnline,
        location: isOnline ? undefined : location,
        price: parseFloat(price),
        maxParticipants: parseInt(maxParticipants),
      });

      Alert.alert('Succès', 'Session créée avec succès!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer une Session</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Maîtriser React en 2 heures"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Décrivez votre session..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Compétences *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.skillsScroll}>
          {ALL_SKILLS.slice(0, 20).map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[styles.chip, selectedSkills.includes(skill) && styles.chipSelected]}
              onPress={() => toggleSkill(skill)}
            >
              <Text style={[styles.chipText, selectedSkills.includes(skill) && styles.chipTextSelected]}>
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Date et heure *</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{date.toLocaleString('fr-FR')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            is24Hour={true}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Durée (minutes) *</Text>
        <TextInput
          style={styles.input}
          placeholder="60"
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Type de session</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.optionButton, isOnline && styles.optionButtonActive]}
            onPress={() => setIsOnline(true)}
          >
            <Text style={[styles.optionText, isOnline && styles.optionTextActive]}>En ligne</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, !isOnline && styles.optionButtonActive]}
            onPress={() => setIsOnline(false)}
          >
            <Text style={[styles.optionText, !isOnline && styles.optionTextActive]}>Présentiel</Text>
          </TouchableOpacity>
        </View>

        {!isOnline && (
          <>
            <Text style={styles.label}>Lieu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Casablanca, Twin Center"
              value={location}
              onChangeText={setLocation}
            />
          </>
        )}

        <Text style={styles.label}>Prix (MAD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="100"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Nombre de participants max</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer la session</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1f2937' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff' },
  textarea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#fff', minHeight: 100 },
  skillsScroll: { maxHeight: 60 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', marginRight: 8 },
  chipSelected: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  optionButton: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', backgroundColor: '#fff' },
  optionButtonActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  optionText: { fontSize: 14, color: '#374151' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  submitButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});
