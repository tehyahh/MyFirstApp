import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from './AppHeader';
import MethodCard from './MethodCard';
import BottomNav from './BottomNav';
import { useTheme } from '../constants/ThemeContext';

// Study techniques shown on the home screen.
// `screen` must match a case in App.js's navigation switch for the card to be tappable.
const STUDY_METHODS = [
  { id: '1', title: 'Feynman Method', screen: 'feynman' },
  { id: '2', title: 'Pomodoro Method', screen: 'pomodoro' },
];

export default function HomeScreen({ activeTab, onTabPress, onNavigate }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <Text style={[styles.pageTitle, { color: colors.text }]}>
          Study Technique
        </Text>

        <View style={styles.cardsContainer}>
          {STUDY_METHODS.map((method) => (
            <MethodCard
              key={method.id}
              title={method.title}
              onPress={() => {
                if (method.screen) {
                  onNavigate(method.screen);
                } else {
                  console.log(`${method.title} pressed (no screen yet)`);
                }
              }}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNav activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 24,
  },
  cardsContainer: {
    marginTop: 4,
  },
});
