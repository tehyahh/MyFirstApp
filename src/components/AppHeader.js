import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';

// Shared top header used across screens: avatar on the left,
// search / dark-mode toggle on the right.
export default function AppHeader() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.header}>
      <Image
        // Replace with your own avatar asset, e.g. require('../assets/avatar.png')
        source={{ uri: 'https://placehold.co/72x72/f5c6d0/000000?text=🐹' }}
        style={styles.avatar}
      />

      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconButtonBg }]}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.iconButtonBg }]}
          activeOpacity={0.7}
          onPress={toggleTheme}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={colors.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
