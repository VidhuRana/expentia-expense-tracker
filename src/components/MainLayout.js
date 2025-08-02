import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const MainLayout = ({ children, activeTab, setActiveTab, navigation, onAddExpense, onAIAssistant }) => {
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

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flex: 1,
    paddingBottom: 140, // Space for floating bottom nav
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={contentStyle}>
        {children}
      </View>

      {/* Bottom Navigation */}
      <View style={bottomNavStyle}>
        <TouchableOpacity 
          style={navItemStyle(activeTab === 'home')} 
          onPress={() => setActiveTab('home')}
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
          onPress={() => setActiveTab('reports')}
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
          onPress={onAddExpense}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={navItemStyle(activeTab === 'activity')} 
          onPress={() => setActiveTab('activity')}
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
          onPress={() => setActiveTab('account')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={activeTab === 'account' ? theme.colors.accent : theme.colors.textSecondary} 
          />
          <Text style={navLabelStyle(activeTab === 'account')}>Account</Text>
        </TouchableOpacity>
      </View>

      {/* AI Assistant Button */}
      <TouchableOpacity 
        style={aiButtonStyle} 
        onPress={onAIAssistant}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MainLayout; 