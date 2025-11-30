import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../services/posts.service';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
  onAuthorPress: (userId: string) => void;
  onPostPress?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onUnlike,
  onAuthorPress,
  onPostPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_CONTENT_LENGTH = 200;

  const shouldTruncate = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate && !isExpanded
    ? post.content.substring(0, MAX_CONTENT_LENGTH) + '...'
    : post.content;

  const handleLikePress = () => {
    if (post.isLiked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPostPress?.(post.id)}
    >
      {/* Author Info */}
      <TouchableOpacity
        style={styles.authorContainer}
        onPress={() => onAuthorPress(post.author.id)}
      >
        {post.author.profile?.photo ? (
          <Image
            source={{ uri: post.author.profile.photo }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {post.author.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <View style={styles.metaRow}>
            {post.author.profile?.city && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.location}> {post.author.profile.city}</Text>
              </View>
            )}
            {post.author.profile?.rating !== undefined && post.author.profile?.rating !== null && post.author.profile?.rating > 0 && post.author.profile?.totalRatings && (
              <>
                <Text style={styles.separator}>•</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.rating}>
                    {' '}{post.author.profile.rating.toFixed(1)} ({post.author.profile.totalRatings})
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
      </TouchableOpacity>

      {/* Category Badge */}
      {post.category && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{post.category}</Text>
        </View>
      )}

      {/* Post Content */}
      <Text style={styles.content}>{displayContent}</Text>
      {shouldTruncate && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreText}>
            {isExpanded ? 'Afficher moins' : 'Afficher plus'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Skills Tags */}
      {post.skills && post.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {post.skills.map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Like Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLikePress}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? '#ef4444' : '#6b7280'}
          />
          {post.likeCount > 0 && (
            <Text style={[styles.likeCount, post.isLiked && styles.likedText]}>
              {post.likeCount}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: '#6b7280',
  },
  separator: {
    marginHorizontal: 6,
    color: '#9ca3af',
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  categoryText: {
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
    marginBottom: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  likeCount: {
    fontSize: 15,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '600',
  },
  likedText: {
    color: '#ef4444',
  },
});
