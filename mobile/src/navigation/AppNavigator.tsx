import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';

// Screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BecomeProviderScreen from '../screens/provider/BecomeProviderScreen';
import CreateSessionScreen from '../screens/provider/CreateSessionScreen';
import EditSessionScreen from '../screens/provider/EditSessionScreen';
import ProviderDashboardScreen from '../screens/provider/ProviderDashboardScreen';
import SessionsListScreen from '../screens/SessionsListScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import MySessionsScreen from '../screens/MySessionsScreen';
import RateSessionScreen from '../screens/RateSessionScreen';
import ProvidersListScreen from '../screens/ProvidersListScreen';
import ProviderDetailScreen from '../screens/ProviderDetailScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ChatScreen from '../screens/ChatScreen';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import EditRequestScreen from '../screens/EditRequestScreen';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import SendOfferScreen from '../screens/SendOfferScreen';
import MyRequestsScreen from '../screens/requests/MyRequestsScreen';
import MyOffersScreen from '../screens/offers/MyOffersScreen';
import RequestsListScreen from '../screens/RequestsListScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import PublicProviderProfileScreen from '../screens/PublicProviderProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs for authenticated users
function MainTabs() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="Providers"
        component={ProvidersListScreen}
        options={{ tabBarLabel: 'Providers' }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ tabBarLabel: 'Feed' }}
      />
      <Tab.Screen
        name="Requests"
        component={user?.isProvider ? RequestsListScreen : MyRequestsScreen}
        options={{ tabBarLabel: 'Demandes' }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, loadTokens } = useAuthStore();

  // Load saved tokens on app startup
  useEffect(() => {
    loadTokens();
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main app
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="BecomeProvider" component={BecomeProviderScreen} />
            <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
            <Stack.Screen name="EditSession" component={EditSessionScreen} />
            <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
            <Stack.Screen name="SessionsList" component={SessionsListScreen} />
            <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
            <Stack.Screen name="MySessions" component={MySessionsScreen} />
            <Stack.Screen name="RateSession" component={RateSessionScreen} />
            <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
            <Stack.Screen name="PublicProviderProfile" component={PublicProviderProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
            <Stack.Screen name="EditRequest" component={EditRequestScreen} />
            <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
            <Stack.Screen name="SendOffer" component={SendOfferScreen} />
            <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
            <Stack.Screen name="MyOffers" component={MyOffersScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
