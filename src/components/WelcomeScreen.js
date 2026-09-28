import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Image
          source={require('../assets/welcome-illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to Thrive</Text>
        <Text style={styles.subtitle}>
          Your space to build better study habits, one technique at a time.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={onGetStarted}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDEBF6',
    paddingHorizontal: 32,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 260,
    height: 260,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#F2A0BE',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#F2A0BE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
