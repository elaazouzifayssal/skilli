import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {getImageUrl(user?.profile?.photo) ? (
          <Image source={{ uri: getImageUrl(user.profile.photo)! }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        {user?.phone && (
          <Text style={styles.phone}>{user.phone}</Text>
        )}

        <View style={styles.badges}>
          {user?.isClient && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Client</Text>
            </View>
          )}
          {user?.isProvider && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Provider</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.menuText}>Modifier le profil</Text>
        </TouchableOpacity>

        {!user?.isProvider && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('BecomeProvider')}
          >
            <Text style={styles.menuText}>Devenir provider</Text>
          </TouchableOpacity>
        )}

        {user?.isProvider && (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProviderDashboard')}
            >
              <Text style={styles.menuText}>📊 Tableau de bord</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('CreateSession')}
            >
              <Text style={styles.menuText}>Créer une session</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MySessions')}
        >
          <Text style={styles.menuText}>Mes sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyRequests')}
        >
          <Text style={styles.menuText}>📝 Mes demandes</Text>
        </TouchableOpacity>

        {user?.isProvider && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyOffers')}
          >
            <Text style={styles.menuText}>💼 Mes offres</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: '#6b7280',
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  badge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    fontSize: 16,
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
