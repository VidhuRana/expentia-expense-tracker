import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  style,
  showPasswordToggle = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const inputStyle = {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: error ? theme.colors.error : theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    ...style,
  };

  const labelStyle = {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  };

  const errorStyle = {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: theme.spacing.xs,
  };

  const inputContainerStyle = {
    position: 'relative',
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
    zIndex: 1,
  };

  const isPasswordField = secureTextEntry && showPasswordToggle;
  const shouldShowPassword = isPasswordField ? !showPassword : secureTextEntry;

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={inputContainerStyle}>
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={shouldShowPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
        {isPasswordField && (
          <TouchableOpacity
            style={eyeButtonStyle}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};

export default Input; 