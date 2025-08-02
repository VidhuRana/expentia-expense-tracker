import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../services/supabaseClient';
import BottomNavigation from '../components/BottomNavigation';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animation immediately for better perceived performance
    animateIn();
    fetchUserProfile();
  }, []);

  const animateIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const fetchUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        return;
      }
      
      const { data: profile, error: profileError } = await db.getUserProfile(user.id);
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setUserProfile({
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email,
          created_at: user.created_at
        });
      } else if (profile) {
        setUserProfile({
          ...profile,
          email: user.email,
          created_at: user.created_at
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.replace('Login');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const headerTitleStyle = {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: theme.spacing.md,
  };

  const backButtonStyle = {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  };

  const profileCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  };

  const avatarStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const userNameStyle = {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  };

  const userEmailStyle = {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  };

  const memberSinceStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
  };

  const sectionCardStyle = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const sectionTitleStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  };

  const menuItemStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const menuItemIconStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  };

  const menuItemTextStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  };

  const signOutButtonStyle = {
    backgroundColor: '#ef4444',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const signOutTextStyle = {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  };

  const emptyStateStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  };

  const emptyTitleStyle = {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  };



  const aiButtonStyle = {
    position: 'absolute',
    bottom: 120,
    right: 25,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: theme.colors.background,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={headerStyle}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={backButtonStyle}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={headerTitleStyle}>Profile</Text>
      </View>

      <Animated.View 
        style={[
          contentStyle,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {loading ? (
            <View style={emptyStateStyle}>
              <Text style={emptyTitleStyle}>Loading profile...</Text>
            </View>
          ) : userProfile ? (
            <>
              {/* Profile Card */}
              <View style={profileCardStyle}>
                <View style={avatarStyle}>
                  <Ionicons name="person" size={40} color={theme.colors.primary} />
                </View>
                <Text style={userNameStyle}>{userProfile.full_name}</Text>
                <Text style={userEmailStyle}>{userProfile.email}</Text>
                <Text style={memberSinceStyle}>
                  Member since {formatDate(userProfile.created_at)}
                </Text>
              </View>

              {/* Settings Section */}
              <View style={sectionCardStyle}>
                <Text style={sectionTitleStyle}>Settings</Text>
                
                <TouchableOpacity style={menuItemStyle} activeOpacity={0.7}>
                  <View style={menuItemIconStyle}>
                    <Ionicons name="notifications" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Notifications</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={menuItemStyle} activeOpacity={0.7}>
                  <View style={menuItemIconStyle}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Privacy & Security</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={menuItemStyle} activeOpacity={0.7}>
                  <View style={menuItemIconStyle}>
                    <Ionicons name="help-circle" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Help & Support</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={menuItemStyle} activeOpacity={0.7}>
                  <View style={menuItemIconStyle}>
                    <Ionicons name="information-circle" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Sign Out Button */}
              <TouchableOpacity 
                style={signOutButtonStyle} 
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Text style={signOutTextStyle}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={emptyStateStyle}>
              <Text style={emptyTitleStyle}>Unable to load profile</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bottom Navigation */}
      <BottomNavigation 
        navigation={navigation}
        activeTab="account"
        onTabPress={(tabName) => {
          if (tabName === 'addExpense') {
            navigation.navigate('Home', { showAddExpense: true });
          }
        }}
      />

      {/* AI Assistant Button */}
      <TouchableOpacity 
        style={aiButtonStyle} 
        onPress={() => {}}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen; 