import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService, CreatePostData } from '../services/posts.service';

const SKILL_OPTIONS = [
  'Plomberie',
  'Électricité',
  'Menuiserie',
  'Peinture',
  'Jardinage',
  'Nettoyage',
  'Déménagement',
  'Informatique',
  'Réparation',
  'Installation',
];

const CATEGORY_OPTIONS = [
  'Conseil',
  'Tutoriel',
  'Astuce',
  'Promotion',
  'Actualité',
  'Question',
];

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const createPostMutation = useMutation({
    mutationFn: (data: CreatePostData) => postsService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      Alert.alert('Succès', 'Votre post a été publié!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de créer le post'
      );
    },
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Erreur', 'Le contenu ne peut pas être vide');
      return;
    }

    if (selectedSkills.length === 0) {
      Alert.alert('Erreur', 'Sélectionnez au moins une compétence');
      return;
    }

    createPostMutation.mutate({
      content: content.trim(),
      skills: selectedSkills,
      category: selectedCategory,
    });
  };

  const canSubmit = content.trim().length > 0 && selectedSkills.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer un post</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || createPostMutation.isPending}
        >
          {createPostMutation.isPending ? (
            <ActivityIndicator size="small" color="#1976D2" />
          ) : (
            <Text
              style={[
                styles.publishButton,
                !canSubmit && styles.publishButtonDisabled,
              ]}
            >
              Publier
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenu</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Partagez vos conseils, astuces, ou actualités..."
            placeholderTextColor="#999"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={5000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie (optionnel)</Text>
          <View style={styles.optionsContainer}>
            {CATEGORY_OPTIONS.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.optionChip,
                  selectedCategory === category && styles.optionChipSelected,
                ]}
                onPress={() =>
                  setSelectedCategory(
                    selectedCategory === category ? undefined : category
                  )
                }
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedCategory === category && styles.optionChipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skills Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Compétences <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.optionsContainer}>
            {SKILL_OPTIONS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.optionChip,
                  selectedSkills.includes(skill) && styles.optionChipSelected,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    selectedSkills.includes(skill) &&
                      styles.optionChipTextSelected,
                  ]}
                >
                  {skill}
                </Text>
                {selectedSkills.includes(skill) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#fff"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Partagez votre expertise pour attirer de nouveaux clients et construire
            votre réputation!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  publishButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  publishButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#f44336',
  },
  contentInput: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    minHeight: 150,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },
  optionChipText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 12,
    lineHeight: 20,
  },
});
