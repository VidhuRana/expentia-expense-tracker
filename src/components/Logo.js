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