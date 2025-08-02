import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const BottomNavigation = ({ navigation, activeTab, onTabPress }) => {
  const { theme } = useTheme();

  const bottomNavStyle = {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  };

  const navItemStyle = (isActive) => ({
    flex: 1,
    alignItems: 'center',
    opacity: isActive ? 1 : 0.6,
    paddingVertical: theme.spacing.xs,
  });

  const navLabelStyle = (isActive) => ({
    color: isActive ? theme.colors.accent : theme.colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    fontWeight: isActive ? '600' : '400',
  });

  const addButtonStyle = {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: theme.colors.background,
    marginHorizontal: theme.spacing.sm,
  };

  const handleTabPress = (tabName) => {
    if (tabName === 'addExpense') {
      if (onTabPress) {
        onTabPress(tabName);
      }
      return;
    }
    
    if (onTabPress) {
      onTabPress(tabName);
    }
    
    // Navigate to the appropriate screen
    switch (tabName) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'reports':
        navigation.navigate('Reports');
        break;
      case 'activity':
        navigation.navigate('Activity');
        break;
      case 'account':
        navigation.navigate('Profile');
        break;
      default:
        break;
    }
  };

  const handleAddExpense = () => {
    // Navigate to Home screen and trigger add expense modal
    if (activeTab === 'home') {
      // If we're already on home, just trigger the modal
      if (onTabPress) {
        onTabPress('addExpense');
      }
    } else {
      // Navigate to Home screen and trigger add expense modal
      navigation.navigate('Home', { showAddExpense: true });
    }
  };

  return (
    <View style={bottomNavStyle}>
      <TouchableOpacity 
        style={navItemStyle(activeTab === 'home')} 
        onPress={() => handleTabPress('home')}
      >
        <Ionicons 
          name="home" 
          size={20} 
          color={activeTab === 'home' ? theme.colors.accent : theme.colors.textSecondary} 
        />
        <Text style={navLabelStyle(activeTab === 'home')}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={navItemStyle(activeTab === 'reports')} 
        onPress={() => handleTabPress('reports')}
      >
        <Ionicons 
          name="bar-chart" 
          size={20} 
          color={activeTab === 'reports' ? theme.colors.accent : theme.colors.textSecondary} 
        />
        <Text style={navLabelStyle(activeTab === 'reports')}>Reports</Text>
      </TouchableOpacity>

      {/* Add Expense Button - Part of Navbar */}
      <TouchableOpacity 
        style={addButtonStyle} 
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={navItemStyle(activeTab === 'activity')} 
        onPress={() => handleTabPress('activity')}
      >
        <Ionicons 
          name="time" 
          size={20} 
          color={activeTab === 'activity' ? theme.colors.accent : theme.colors.textSecondary} 
        />
        <Text style={navLabelStyle(activeTab === 'activity')}>Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={navItemStyle(activeTab === 'account')} 
        onPress={() => handleTabPress('account')}
      >
        <Ionicons 
          name="person" 
          size={20} 
          color={activeTab === 'account' ? theme.colors.accent : theme.colors.textSecondary} 
        />
        <Text style={navLabelStyle(activeTab === 'account')}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavigation; 