import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsService } from '../services/posts.service';
import { PostCard } from '../components/PostCard';
import { useAuthStore } from '../store/authStore';

export const FeedScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [selectedSkill, setSelectedSkill] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['posts', page, selectedSkill, selectedCategory],
    queryFn: () =>
      postsService.getAllPosts({
        page,
        limit: 20,
        skill: selectedSkill,
        category: selectedCategory,
      }),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => postsService.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => postsService.unlikePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  const handleUnlike = (postId: string) => {
    unlikeMutation.mutate(postId);
  };

  const handleAuthorPress = (userId: string) => {
    navigation.navigate('ProviderDetail' as never, { providerId: userId } as never);
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail' as never, { postId } as never);
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost' as never);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Feed</Text>
      {user?.isProvider && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePost}
        >
          <Ionicons name="add-circle" size={28} color="#1976D2" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Aucun post pour le moment</Text>
      <Text style={styles.emptySubtitle}>
        {user?.isProvider
          ? 'Soyez le premier à partager votre expertise!'
          : 'Les providers partageront bientôt leur expertise ici.'}
      </Text>
      {user?.isProvider && (
        <TouchableOpacity style={styles.emptyButton} onPress={handleCreatePost}>
          <Text style={styles.emptyButtonText}>Créer un post</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <Text style={styles.errorText}>Erreur lors du chargement du feed</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const posts = data?.posts || [];

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onAuthorPress={handleAuthorPress}
            onPostPress={handlePostPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            colors={['#1976D2']}
          />
        }
        onEndReached={() => {
          if (data?.pagination?.page < data?.pagination?.totalPages) {
            setPage((prev) => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
