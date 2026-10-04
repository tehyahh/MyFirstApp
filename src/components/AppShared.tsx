import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BACKGROUND_CATEGORIES, findImageSource, MOODS } from '../constants/journalData';
import { styles } from '../constants/appStyles';

export type Screen =
  | 'dashboard' | 'journal' | 'explore' | 'newEntry' | 'readEntry' | 'editEntry'
  | 'tasks' | 'study' | 'goals' | 'leisure' | 'profile';

export const SOLID_BACKGROUNDS = [
  { id: 'solid_blush', name: 'Blush', color: '#F7D6E0' },
  { id: 'solid_peach', name: 'Peach', color: '#FAD7C0' },
  { id: 'solid_butter', name: 'Butter', color: '#F9E7A8' },
  { id: 'solid_mint', name: 'Mint', color: '#D7EEDB' },
  { id: 'solid_sage', name: 'Sage', color: '#DDE8D2' },
  { id: 'solid_sky', name: 'Sky', color: '#D6EAF8' },
  { id: 'solid_lavender', name: 'Lavender', color: '#E3D9F8' },
  { id: 'solid_cream', name: 'Cream', color: '#F1E2D0' },
] as const;

export const AFFIRMATIONS = [
  'I am allowed to take things one step at a time.',
  'My feelings are valid, and I can meet them with kindness.',
  'I do not have to be perfect to be proud of myself.',
  'Small progress is still progress.',
  'I can rest without feeling guilty.',
  'I am learning more about myself every day.',
  'I deserve patience, especially from myself.',
  'I can begin again whenever I need to.',
  'I am capable of handling today as it comes.',
  'My best can look different from day to day.',
  'I can celebrate the little things.',
  'I am growing at my own pace.',
  'I can choose kindness toward myself.',
  'I am more than one difficult day.',
  'I can make space for both joy and hard feelings.',
  'I trust myself to keep moving forward.',
  'I am worthy of the care I give to others.',
  'I can pause, breathe, and start again.',
  'There is no single right way to grow.',
  'I am becoming someone I can be proud of.',
] as const;

export function getSolidBackground(id?: string | null) {
  return SOLID_BACKGROUNDS.find(item => item.id === id) || null;
}
export function defaultSolidBackground(themeName: string) {
  if (themeName === 'blue') return 'solid_sky';
  if (themeName === 'green') return 'solid_mint';
  if (themeName === 'purple') return 'solid_lavender';
  if (themeName === 'yellow') return 'solid_butter';
  return 'solid_blush';
}
export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}
export function dateString() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
}
export function moodInfo(id?: string) {
  return MOODS.find(m => m.id === id) || MOODS[2];
}
export { BACKGROUND_CATEGORIES, findImageSource, MOODS };

export function EntryBackground({ id, style, imageStyle, children }: any) {
  const solid = getSolidBackground(id);
  if (solid) return <View style={[style, { backgroundColor: solid.color }]}>{children}</View>;
  return (
    <ImageBackground source={findImageSource(id)} style={style} imageStyle={imageStyle} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

export function AButton({ children, onPress, style, disabled }: { children: React.ReactNode; onPress?: () => void; style?: any; disabled?: boolean; }) {
  const scale = useRef(new Animated.Value(1)).current;
  const down = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const up = () => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  const flat = StyleSheet.flatten(style) || {};
  return (
    <Animated.View style={[{ alignSelf: flat.alignSelf || 'auto' }, style, { transform: [{ scale }], opacity: disabled ? 0.55 : 1 }]}>
      <Pressable
        disabled={disabled}
        onPressIn={down}
        onPressOut={up}
        onPress={onPress}
        style={{
          flex: flat.flex ?? undefined,
          width: flat.width ?? 'auto',
          alignSelf: flat.alignSelf || 'auto',
          flexDirection: flat.flexDirection || 'column',
          alignItems: flat.alignItems || 'center',
          justifyContent: flat.justifyContent || 'center',
          gap: flat.gap,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function ScreenTransition({ screenKey, children }: { screenKey: string; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    opacity.setValue(0);
    y.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.spring(y, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [screenKey]);
  return <Animated.View style={{ flex: 1, opacity, transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export function IconBubble({ name, color, bg, size = 42 }: { name: any; color: string; bg: string; size?: number }) {
  return (
    <View style={[styles.iconBubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Ionicons name={name} size={size * 0.48} color={color} />
    </View>
  );
}

export function Header({ title, subtitle, palette, onBack, onTheme, icon = 'book-outline' }: { title: string; subtitle: string; palette: any; onBack?: () => void; onTheme?: () => void; icon?: any; }) {
  return (
    <View style={styles.header}>
      <AButton onPress={onBack} style={[styles.headerIcon, { backgroundColor: palette.soft, borderColor: palette.line }]}>
        <Ionicons name={onBack ? 'chevron-back' : icon} size={22} color={palette.primary} />
      </AButton>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.headerSubtitle, { color: palette.muted }]}>{subtitle}</Text>
      </View>
      {onTheme ? (
        <AButton onPress={onTheme} style={[styles.headerIcon, { backgroundColor: palette.soft, borderColor: palette.line }]}>
          <Ionicons name="moon-outline" size={21} color={palette.primary} />
        </AButton>
      ) : null}
    </View>
  );
}

export function GlobalBottomNav({ active, palette, go }: { active: string; palette: any; go: (s: Screen) => void; }) {
  const items = [
    ['dashboard', 'home-outline', 'Dashboard'],
    ['journal', 'book-outline', 'Journal'],
    ['tasks', 'checkmark-circle-outline', 'Tasks'],
    ['study', 'key-outline', 'Study'],
    ['profile', 'person-outline', 'Profile'],
  ] as const;
  return (
    <View style={[styles.bottomNav, styles.globalBottomNav, { backgroundColor: palette.card, borderColor: palette.line }]}>
      {items.map(([key, icon, label]) => {
        const selected = active === key;
        return (
          <AButton key={key} onPress={() => go(key as Screen)} style={styles.globalNavButton}>
            <View style={[styles.globalNavIcon, selected && { backgroundColor: palette.soft }]}>
              <Ionicons name={selected ? (icon.replace('-outline', '') as any) : (icon as any)} size={23} color={selected ? palette.primary : palette.muted} />
            </View>
            <Text style={[styles.navLabel, { color: selected ? palette.primary : palette.muted }]}>{label}</Text>
          </AButton>
        );
      })}
    </View>
  );
}

export function JournalBottomNav({ active, palette, go }: { active: string; palette: any; go: (s: Screen) => void; }) {
  const items = [
    ['dashboard', 'home-outline', 'Home'],
    ['explore', 'compass-outline', 'Explore'],
    ['newEntry', 'add', ''],
    ['journal', 'book-outline', 'Journal'],
    ['profile', 'person-outline', 'Profile'],
  ] as const;
  return (
    <View style={[styles.bottomNav, styles.journalBottomNav, { backgroundColor: palette.card, borderColor: palette.line }]}>
      {items.map(([key, icon, label]) => {
        const selected = active === key;
        if (key === 'newEntry') {
          return (
            <AButton key={key} onPress={() => go('newEntry')} style={[styles.centerFab, { backgroundColor: palette.primary }]}>
              <Ionicons name="add" size={34} color="#fff" />
            </AButton>
          );
        }
        return (
          <AButton key={key} onPress={() => go(key as Screen)} style={styles.navButton}>
            <View style={[styles.navIconWrap, selected && { backgroundColor: palette.soft }]}>
              <Ionicons name={selected ? (icon.replace('-outline', '') as any) : (icon as any)} size={23} color={selected ? palette.primary : palette.muted} />
            </View>
            <Text style={[styles.navLabel, { color: selected ? palette.primary : palette.muted }]}>{label}</Text>
          </AButton>
        );
      })}
    </View>
  );
}

export function CloudDecor({ palette }: { palette: any }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.cloud, styles.cloud1, { backgroundColor: palette.soft }]} />
      <View style={[styles.cloud, styles.cloud2, { backgroundColor: palette.card }]} />
      <View style={[styles.cloud, styles.cloud3, { backgroundColor: palette.bg2 }]} />
      <View style={[styles.mountain, { borderBottomColor: palette.primary2 + '30' }]} />
      <View style={[styles.mountainSmall, { borderBottomColor: palette.primary + '18' }]} />
    </View>
  );
}

export function ProgressRing({ score, palette }: { score: number; palette: any }) {
  return (
    <View style={[styles.ringOuter, { borderColor: palette.primary2 + '55' }]}>
      <View style={[styles.ringInner, { backgroundColor: palette.soft }]}>
        <Text style={[styles.ringScore, { color: palette.text }]}>{score}%</Text>
        <Text style={[styles.ringLabel, { color: palette.muted }]}>Aimscore</Text>
      </View>
    </View>
  );
}

export function MoodRow({ selected, setSelected, palette }: any) {
  return (
    <View style={styles.moodRow}>
      {MOODS.map(m => {
        const active = selected === m.id;
        return (
          <AButton key={m.id} onPress={() => setSelected(m.id)} style={styles.moodItem}>
            <View style={[styles.moodCircle, { backgroundColor: active ? palette.soft : '#FFFFFFAA', borderColor: active ? palette.primary : palette.line }]}>
              <Ionicons name={m.icon as any} size={22} color={active ? palette.primary : palette.muted} />
            </View>
            <Text style={[styles.moodLabel, { color: palette.muted }]}>{m.label}</Text>
          </AButton>
        );
      })}
    </View>
  );
}
