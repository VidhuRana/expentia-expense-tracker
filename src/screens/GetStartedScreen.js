import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

const GetStartedScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  };

  const middleSectionStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const logoContainerStyle = {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  };

  const titleStyle = {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  };

  const subtitleStyle = {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  };

  const bottomSectionStyle = {
    alignItems: 'center',
  };

  const getStartedButtonStyle = {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  };

  const getStartedButtonTextStyle = {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  };

  const loginButtonStyle = {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  };

  const loginButtonTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 16,
  };

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={contentStyle}>
        {/* Middle Section with Logo */}
        <View style={middleSectionStyle}>
          <View style={logoContainerStyle}>
            <Logo size={120} />
            <Text style={titleStyle}>Welcome to Expentia</Text>
            <Text style={subtitleStyle}>
              Your personal finance companion.{'\n'}
              Track expenses, manage budgets, and achieve your financial goals.
            </Text>
          </View>
        </View>

        {/* Bottom Section with Buttons */}
        <View style={bottomSectionStyle}>
          <TouchableOpacity 
            style={getStartedButtonStyle} 
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={getStartedButtonTextStyle}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={loginButtonStyle} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={loginButtonTextStyle}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GetStartedScreen; 