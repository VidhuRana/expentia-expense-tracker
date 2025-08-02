import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../services/supabaseClient';
import Button from '../components/Button';
import Input from '../components/Input';

const SignUpScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Use real Supabase authentication
      const { data, error } = await auth.signUp(email, password, fullName);
      
      if (error) {
        Alert.alert('Sign Up Error', error.message || 'An error occurred during sign up.');
      } else {
        // Check if user was created successfully
        if (data.user) {
          // If we have a session, user is automatically logged in
          if (data.session) {
            // Navigate directly to Home
            navigation.replace('Home');
          } else {
            // User created but needs email confirmation
            Alert.alert(
              'Account Created', 
              'Please check your email and click the confirmation link to activate your account.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Login')
                }
              ]
            );
          }
        } else {
          Alert.alert('Error', 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  };

  const headerStyle = {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  };

  const subtitleStyle = {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  };

  const formStyle = {
    marginBottom: theme.spacing.xl,
  };

  const footerStyle = {
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  };

  const footerTextStyle = {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={formStyle}>
            <Text style={headerStyle}>Create Account</Text>
            <Text style={subtitleStyle}>Sign up to get started</Text>

            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.fullName}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              showPasswordToggle
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              showPasswordToggle
              error={errors.confirmPassword}
            />

            <Button
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignUp}
              disabled={loading}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>

          <View style={footerStyle}>
            <Text style={footerTextStyle}>Already have an account?</Text>
            <Button
              title="Sign In"
              onPress={handleBackToLogin}
              variant="outline"
              size="small"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen; 