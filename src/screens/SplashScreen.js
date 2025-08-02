import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/Logo';
import { LinearGradient } from 'expo-linear-gradient';

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
    color: '#ffffff',
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  };

  const taglineStyle = {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: theme.spacing.md,
    opacity: 0.9,
    fontWeight: '400',
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.accent]}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
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
    </LinearGradient>
  );
};

export default SplashScreen; 