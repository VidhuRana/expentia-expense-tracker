import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Logo = ({ size = 120, style }) => {
  const { theme } = useTheme();

  const logoStyle = {
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    ...style,
  };

  const imageStyle = {
    width: size,
    height: size,
    resizeMode: 'contain',
  };

  return (
    <View style={logoStyle}>
      <Image
        source={require('../../assets/LogoExpentia.png')}
        style={imageStyle}
      />
    </View>
  );
};

export default Logo; 