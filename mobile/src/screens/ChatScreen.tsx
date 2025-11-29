import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { messagesService, Message } from '../services/messages.service';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';

export default function ChatScreen({ route, navigation }: any) {
  const { conversationId, otherUser } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const data = await messagesService.getMessages(conversationId);
      setMessages(data);
      if (data.length > 0 && !loading) {
        // Scroll to bottom on new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await messagesService.sendMessage(otherUser.id, messageText.trim());
      setMessageText('');
      await loadMessages();
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === user?.id;
    const showDate =
      index === 0 ||
      new Date(item.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        <View style={[styles.messageRow, isMyMessage && styles.messageRowReverse]}>
          {!isMyMessage && (
            <View style={styles.avatarSmall}>
              {otherUser.profile?.photo ? (
                <Image
                  source={{ uri: getImageUrl(otherUser.profile.photo) }}
                  style={styles.avatarSmallImage}
                />
              ) : (
                <View style={styles.avatarPlaceholderSmall}>
                  <Text style={styles.avatarTextSmall}>{otherUser.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
          )}

          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.messageBubbleMine : styles.messageBubbleTheirs,
            ]}
          >
            <Text style={[styles.messageText, isMyMessage && styles.messageTextMine]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, isMyMessage && styles.messageTimeMine]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {otherUser.profile?.photo ? (
            <Image
              source={{ uri: getImageUrl(otherUser.profile.photo) }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{otherUser.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.headerTitle}>{otherUser.name}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>Commencez la conversation</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez un message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { backgroundColor: '#fff', padding: 16, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 12 },
  backButtonText: { fontSize: 28, color: '#6366f1' },
  headerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },

  messagesList: { padding: 16, paddingBottom: 8 },

  dateSeparator: { alignItems: 'center', marginVertical: 16 },
  dateText: { fontSize: 12, color: '#9ca3af', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },

  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  messageRowReverse: { flexDirection: 'row-reverse' },

  avatarSmall: { marginRight: 8 },
  avatarSmallImage: { width: 32, height: 32, borderRadius: 16 },
  avatarPlaceholderSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarTextSmall: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  messageBubble: { maxWidth: '75%', borderRadius: 16, padding: 12, paddingBottom: 8 },
  messageBubbleMine: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  messageBubbleTheirs: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },

  messageText: { fontSize: 15, color: '#1f2937', marginBottom: 4, lineHeight: 20 },
  messageTextMine: { color: '#fff' },

  messageTime: { fontSize: 10, color: '#9ca3af', alignSelf: 'flex-end' },
  messageTimeMine: { color: '#e0e7ff' },

  inputContainer: { backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, marginRight: 8 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#d1d5db' },
  sendButtonText: { fontSize: 20, color: '#fff' },

  empty: { padding: 60, alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: '#6b7280' },
});
