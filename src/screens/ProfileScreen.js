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
  Alert,
  Modal,
  TextInput,
  Switch,
  Linking
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
  const [slideAnim] = useState(new Animated.Value(50));
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Success message states
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  
  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  useEffect(() => {
    // Start animation immediately for better perceived performance
    animateIn();
    fetchUserProfile();
  }, []);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showSuccessWithAnimation = (message) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    // Trigger entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => setShowSuccessMessage(false), 3000);
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

  const handleEditProfile = () => {
    setEditFullName(userProfile?.full_name || '');
    setEditEmail(userProfile?.email || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    try {
      const { data: { user }, error: userError } = await auth.getCurrentUser();
      if (userError || !user) {
        Alert.alert('Error', 'Please sign in again');
        return;
      }

      const updates = {
        full_name: editFullName.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await db.updateUserProfile(user.id, updates);
      if (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      showSuccessWithAnimation('Profile updated successfully! ✨');
      setShowEditProfile(false);
      fetchUserProfile(); // Refresh data
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user }, error: userError } = await auth.getCurrentUser();
              if (userError || !user) {
                Alert.alert('Error', 'Please sign in again');
                return;
              }

              // Delete user data from database
              const { error: deleteError } = await db.deleteUserProfile(user.id);
              if (deleteError) {
                console.error('Error deleting user data:', deleteError);
              }

              // Delete user account
              const { error } = await auth.admin.deleteUser(user.id);
              if (error) {
                console.error('Error deleting account:', error);
                Alert.alert('Error', 'Failed to delete account. Please try again.');
                return;
              }

              Alert.alert('Success', 'Account deleted successfully');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSaveNotifications = () => {
    // Save notification settings to user preferences
    try {
      // In a real app, this would save to AsyncStorage or database
      showSuccessWithAnimation('Notification settings saved! 🔔');
      setShowNotifications(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const handleSavePrivacy = () => {
    // Save privacy settings to user preferences
    try {
      // In a real app, this would save to AsyncStorage or database
      showSuccessWithAnimation('Privacy settings updated! 🔒');
      setShowPrivacy(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save privacy settings');
    }
  };

  const handleToggleNotification = (type) => {
    switch (type) {
      case 'push':
        setPushNotifications(!pushNotifications);
        break;
      case 'email':
        setEmailNotifications(!emailNotifications);
        break;
      case 'budget':
        setBudgetAlerts(!budgetAlerts);
        break;
    }
  };

  const handleTogglePrivacy = (type) => {
    switch (type) {
      case 'biometric':
        setBiometricAuth(!biometricAuth);
        break;
      case 'sync':
        setDataSync(!dataSync);
        break;
    }
  };

  const handleHelpItem = (item) => {
    switch (item) {
      case 'addExpenses':
        Alert.alert('How to Add Expenses', 
          '1. Tap the + button on any screen\n2. Enter expense details\n3. Select category and date\n4. Tap "Add Expense" to save');
        break;
      case 'setBudgets':
        Alert.alert('How to Set Budgets', 
          '1. Go to Budget tab (top-right on Home)\n2. Tap "Add Budget"\n3. Enter budget amount and category\n4. Set start/end dates\n5. Tap "Create Budget"');
        break;
      case 'viewReports':
        Alert.alert('How to View Reports', 
          '1. Go to Reports tab\n2. View spending by category\n3. Check monthly trends\n4. Analyze your spending patterns');
        break;
      case 'contactSupport':
        Linking.openURL('mailto:support@expentia.app?subject=Support Request');
        break;
    }
  };

  const handleAboutItem = (item) => {
    switch (item) {
      case 'privacyPolicy':
        Linking.openURL('https://expentia.app/privacy');
        break;
      case 'termsOfService':
        Linking.openURL('https://expentia.app/terms');
        break;
      case 'rateApp':
        Linking.openURL('https://play.google.com/store/apps/details?id=com.expentia.app');
        break;
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your expense data as CSV file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            showSuccessWithAnimation('Data export started! 📊');
            // In a real app, this would trigger actual data export
          },
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'Create a backup of your data to cloud storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Backup',
          onPress: () => {
            showSuccessWithAnimation('Backup created successfully! ☁️');
            // In a real app, this would trigger actual backup
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your expenses and budgets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            showSuccessWithAnimation('Data cleared successfully! 🗑️');
            // In a real app, this would clear all user data
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () => {
            showSuccessWithAnimation('Password reset link sent! 📧');
            // In a real app, this would send password reset email
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

  const editButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  };

  const editButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: theme.spacing.md,
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
    fontSize: 16,
    fontWeight: 'bold',
  };

  const deleteAccountButtonStyle = {
    backgroundColor: '#dc2626',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  };

  const deleteAccountTextStyle = {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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

  // Modal Styles
  const modalOverlayStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  };

  const modalContentStyle = {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    maxHeight: '85%',
  };

  const modalHeaderStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const modalTitleStyle = {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  };

  const closeButtonStyle = {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  };

  const inputContainerStyle = {
    marginBottom: theme.spacing.lg,
  };

  const inputLabelStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  };

  const inputStyle = {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  };

  const settingItemStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const settingTextStyle = {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  };

  const saveButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  };

  const saveButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  };

  // Success Message Styles
  const successMessageStyle = {
    position: 'absolute',
    top: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: '#10b981',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  };

  const successIconStyle = {
    marginRight: theme.spacing.md,
  };

  const successTextStyle = {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
      
      {/* Success Message */}
      {showSuccessMessage && (
        <Animated.View 
          style={[
            successMessageStyle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name="checkmark-circle" size={24} color="#ffffff" style={successIconStyle} />
          <Text style={successTextStyle}>{successMessage}</Text>
        </Animated.View>
      )}
      
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
            transform: [{ translateY: slideAnim }],
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
                <TouchableOpacity 
                  style={editButtonStyle} 
                  onPress={handleEditProfile}
                  activeOpacity={0.7}
                >
                  <Text style={editButtonTextStyle}>Edit Profile</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Stats Section */}
              <View style={sectionCardStyle}>
                <Text style={sectionTitleStyle}>Quick Stats</Text>
                
                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Reports')}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="analytics" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>View Reports</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Budget')}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="wallet" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Manage Budgets</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Activity')}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="list" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>View All Expenses</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Settings Section */}
              <View style={sectionCardStyle}>
                <Text style={sectionTitleStyle}>Settings</Text>
                
                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => setShowNotifications(true)}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="notifications" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Notifications</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => setShowPrivacy(true)}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Privacy & Security</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => setShowHelp(true)}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="help-circle" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Help & Support</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={() => setShowAbout(true)}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="information-circle" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>About</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={menuItemStyle} 
                  activeOpacity={0.7}
                  onPress={handleExportData}
                >
                  <View style={menuItemIconStyle}>
                    <Ionicons name="download" size={20} color={theme.colors.text} />
                  </View>
                  <Text style={menuItemTextStyle}>Export Data</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                                 <TouchableOpacity 
                   style={menuItemStyle} 
                   activeOpacity={0.7}
                   onPress={handleBackupData}
                 >
                   <View style={menuItemIconStyle}>
                     <Ionicons name="cloud-upload" size={20} color={theme.colors.text} />
                   </View>
                   <Text style={menuItemTextStyle}>Backup Data</Text>
                   <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                 </TouchableOpacity>

                 <TouchableOpacity 
                   style={menuItemStyle} 
                   activeOpacity={0.7}
                   onPress={handleChangePassword}
                 >
                   <View style={menuItemIconStyle}>
                     <Ionicons name="key" size={20} color={theme.colors.text} />
                   </View>
                   <Text style={menuItemTextStyle}>Change Password</Text>
                   <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                 </TouchableOpacity>

                 <TouchableOpacity 
                   style={menuItemStyle} 
                   activeOpacity={0.7}
                   onPress={handleClearData}
                 >
                   <View style={menuItemIconStyle}>
                     <Ionicons name="trash" size={20} color={theme.colors.text} />
                   </View>
                   <Text style={menuItemTextStyle}>Clear All Data</Text>
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

              {/* Delete Account Button */}
              <TouchableOpacity 
                style={deleteAccountButtonStyle} 
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
              >
                <Text style={deleteAccountTextStyle}>Delete Account</Text>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <View style={modalHeaderStyle}>
              <Text style={modalTitleStyle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)} style={closeButtonStyle}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={inputContainerStyle}>
              <Text style={inputLabelStyle}>Full Name</Text>
              <TextInput
                style={inputStyle}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={inputContainerStyle}>
              <Text style={inputLabelStyle}>Email</Text>
              <TextInput
                style={[inputStyle, { color: theme.colors.textSecondary }]}
                value={editEmail}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity 
              style={saveButtonStyle} 
              onPress={handleSaveProfile}
              activeOpacity={0.7}
            >
              <Text style={saveButtonTextStyle}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <View style={modalHeaderStyle}>
              <Text style={modalTitleStyle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={closeButtonStyle}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={settingItemStyle}>
              <Text style={settingTextStyle}>Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={() => handleToggleNotification('push')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={pushNotifications ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={settingItemStyle}>
              <Text style={settingTextStyle}>Email Notifications</Text>
              <Switch
                value={emailNotifications}
                onValueChange={() => handleToggleNotification('email')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={emailNotifications ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={settingItemStyle}>
              <Text style={settingTextStyle}>Budget Alerts</Text>
              <Switch
                value={budgetAlerts}
                onValueChange={() => handleToggleNotification('budget')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={budgetAlerts ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
            <TouchableOpacity 
              style={saveButtonStyle} 
              onPress={handleSaveNotifications}
              activeOpacity={0.7}
            >
              <Text style={saveButtonTextStyle}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy & Security Modal */}
      <Modal
        visible={showPrivacy}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPrivacy(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <View style={modalHeaderStyle}>
              <Text style={modalTitleStyle}>Privacy & Security</Text>
              <TouchableOpacity onPress={() => setShowPrivacy(false)} style={closeButtonStyle}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={settingItemStyle}>
              <Text style={settingTextStyle}>Biometric Authentication</Text>
              <Switch
                value={biometricAuth}
                onValueChange={() => handleTogglePrivacy('biometric')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={biometricAuth ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>

            <View style={settingItemStyle}>
              <Text style={settingTextStyle}>Data Sync</Text>
              <Switch
                value={dataSync}
                onValueChange={() => handleTogglePrivacy('sync')}
                trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
                thumbColor={dataSync ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
            <TouchableOpacity 
              style={saveButtonStyle} 
              onPress={handleSavePrivacy}
              activeOpacity={0.7}
            >
              <Text style={saveButtonTextStyle}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Help & Support Modal */}
      <Modal
        visible={showHelp}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <View style={modalHeaderStyle}>
              <Text style={modalTitleStyle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)} style={closeButtonStyle}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text style={[settingTextStyle, { marginBottom: theme.spacing.md }]}>
                Need help? Here are some common questions:
              </Text>
              
              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleHelpItem('addExpenses')}>
                <Text style={settingTextStyle}>How to add expenses?</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleHelpItem('setBudgets')}>
                <Text style={settingTextStyle}>How to set budgets?</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleHelpItem('viewReports')}>
                <Text style={settingTextStyle}>How to view reports?</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleHelpItem('contactSupport')}>
                <Text style={settingTextStyle}>Contact Support</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContentStyle}>
            <View style={modalHeaderStyle}>
              <Text style={modalTitleStyle}>About Expentia</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)} style={closeButtonStyle}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Text style={[settingTextStyle, { marginBottom: theme.spacing.md }]}>
                Expentia - Your Personal Finance Manager
              </Text>
              
              <Text style={[settingTextStyle, { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
                Version 1.0.0
              </Text>

              <Text style={[settingTextStyle, { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
                Expentia helps you track your expenses, set budgets, and gain insights into your spending habits. Take control of your finances with our intuitive and powerful expense management app.
              </Text>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleAboutItem('privacyPolicy')}>
                <Text style={settingTextStyle}>Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleAboutItem('termsOfService')}>
                <Text style={settingTextStyle}>Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={settingItemStyle} activeOpacity={0.7} onPress={() => handleAboutItem('rateApp')}>
                <Text style={settingTextStyle}>Rate App</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Assistant Button */}
      <TouchableOpacity 
        style={aiButtonStyle} 
        onPress={() => {
          Alert.alert(
            'AI Assistant',
            'Coming soon! 🤖\n\nOur AI assistant will help you with:\n• Expense categorization\n• Budget recommendations\n• Spending insights\n• Financial tips',
            [{ text: 'OK', style: 'default' }]
          );
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen; 