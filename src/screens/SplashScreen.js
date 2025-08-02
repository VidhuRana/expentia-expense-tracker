import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    // Start animation immediately for better perceived performance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to GetStarted after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('GetStarted');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  };

  const logoContainerStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  };

  const subtitleStyle = {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontWeight: '500',
  };

  const taglineStyle = {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontWeight: '400',
  };

  return (
    <View style={containerStyle}>
      <Animated.View
        style={[
          logoContainerStyle,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          }
        ]}
      >
        <Logo size={140} />
        <Text style={subtitleStyle}>
          Expentia
        </Text>
        <Text style={taglineStyle}>
          Your financial companion
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen; 