import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import {
  AButton, CloudDecor, GlobalBottomNav, IconBubble, ProgressRing, Screen, greeting,
} from '../../components/AppShared';

export default function DashboardScreen({
  nickname, journalsCount, weeklyCompleted, weeklyTotal, activeGoals, minutesToday, go,
}: {
  nickname: string;
  journalsCount: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  activeGoals: number;
  minutesToday: number;
  go: (s: Screen | string) => void;
}) {
  const { palette, cycleThemeName } = useAppTheme();
  const score = weeklyTotal ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <CloudDecor palette={palette} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardTop}>
            <AButton onPress={() => go('profile')} style={styles.identity}>
              <IconBubble name="person-outline" color={palette.primary} bg={palette.soft} size={48} />
              <View>
                <Text style={[styles.greeting, { color: palette.text }]}>{greeting()},</Text>
                <Text style={[styles.nameText, { color: palette.text }]}>{nickname}! <Text style={{ fontSize: 14 }}>☆</Text></Text>
              </View>
            </AButton>
            <View style={styles.topActions}>
              <AButton onPress={() => go('journal')} style={styles.smallIcon}>
                <Ionicons name="search-outline" size={21} color={palette.primary} />
              </AButton>
              <AButton onPress={cycleThemeName} style={styles.smallIcon}>
                <Ionicons name="moon-outline" size={21} color={palette.primary} />
              </AButton>
            </View>
          </View>

          <View style={[styles.welcomeCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeTitle, { color: palette.text }]}>{greeting()},</Text>
              <Text style={[styles.welcomeTitle, { color: palette.primary }]}>{nickname}!</Text>
              <Text style={[styles.smallText, { color: palette.muted, marginTop: 7 }]}>Today is a new page.{'\n'}What will you write about?</Text>
            </View>
            <View style={[styles.welcomeArt, { backgroundColor: palette.soft }]}>
              <Ionicons name="partly-sunny-outline" size={48} color={palette.primary2} />
              <Ionicons name="triangle-outline" size={54} color={palette.primary + '55'} style={{ position: 'absolute', bottom: -5, right: 6 }} />
            </View>
          </View>

          <View style={[styles.progressCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Ionicons name="radio-button-on-outline" size={15} color={palette.primary} />
                <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Your Progress</Text>
              </View>
              <Text style={[styles.progressNumber, { color: palette.text }]}>{weeklyCompleted}/{weeklyTotal}</Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>weekly tasks done</Text>
            </View>
            <ProgressRing score={score} palette={palette} />
          </View>

          <View style={[styles.reminder, { backgroundColor: palette.purple }]}>
            <IconBubble name="sparkles-outline" color="#6742C2" bg="#DCCBFF" size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardSectionTitle, { color: palette.text }]}>A Gentle Reminder</Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>You're allowed to grow at your own pace.</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              ['book-outline', journalsCount, 'journal entries', palette.yellow],
              ['sparkles-outline', activeGoals, 'active goals', palette.pink],
              ['time-outline', minutesToday, 'mins today', palette.blue],
            ].map(([icon, value, label, bg], i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: bg }]}>
                <Ionicons name={icon as any} size={25} color={palette.text} />
                <Text style={[styles.statNumber, { color: palette.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: palette.muted }]}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.loopTitle, { color: palette.primary }]}>YOUR THRIVE LOOP</Text>
          {[
            ['journal', 'book-outline', 'Journal', 'Reflect. Grow. Repeat.', palette.yellow],
            ['tasks', 'checkmark-circle-outline', 'Task Manager', 'Plan. Focus. Finish.', palette.pink],
            ['study', 'key-outline', 'Study Technique', 'Study smarter, not harder.', palette.blue],
            ['goals', 'flag-outline', 'Goals', 'Grow with purpose.', palette.purple],
            ['leisure', 'leaf-outline', 'Leisure', 'Make space for yourself.', palette.green],
          ].map(([key, icon, title, sub, bg]) => (
            <AButton key={key} onPress={() => go(key as Screen)} style={[styles.moduleCard, { backgroundColor: bg }]}>
              <IconBubble name={icon as any} color={palette.primary} bg="#FFFFFF55" size={48} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.moduleTitle, { color: palette.text }]}>{title}</Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>{sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={palette.primary} />
            </AButton>
          ))}
          <View style={{ height: 110 }} />
        </ScrollView>
        <GlobalBottomNav active="dashboard" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}
