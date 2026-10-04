import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { THEME_META, ThemeName } from '../../constants/theme';
import { AButton, IconBubble } from '../../components/AppShared';

// Dark/light switch + 6-color picker. Rendered inside Profile (index.tsx).
export default function ThemeToggleScreen() {
  const { palette, isDark, toggleDark, themeName, setThemeName } = useAppTheme();

  return (
    <View>
      <Text style={[styles.fieldLabel, { color: palette.text, marginTop: 24 }]}>Appearance</Text>
      <View style={[styles.darkToggleRow, { backgroundColor: palette.card, borderColor: palette.line }]}>
        <IconBubble name={isDark ? 'moon' : 'sunny-outline'} color={palette.primary} bg={palette.soft} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Dark mode</Text>
          <Text style={[styles.smallText, { color: palette.muted }]}>{isDark ? 'Easy on the eyes tonight.' : 'Switch to a darker look.'}</Text>
        </View>
        <Pressable onPress={toggleDark} style={[styles.darkToggleTrack, { backgroundColor: isDark ? palette.primary : palette.line, alignItems: isDark ? 'flex-end' : 'flex-start' }]}>
          <View style={styles.darkToggleKnob} />
        </Pressable>
      </View>

      <Text style={[styles.fieldLabel, { color: palette.text, marginTop: 18 }]}>Theme</Text>
      <View style={styles.themeGrid}>
        {(Object.keys(THEME_META) as ThemeName[]).map(t => {
          const meta = THEME_META[t];
          const p = isDark ? meta.dark : meta.light;
          const active = themeName === t;
          return (
            <AButton key={t} onPress={() => setThemeName(t)} style={[styles.themeChoice, { backgroundColor: p.soft, borderColor: active ? p.primary : palette.line, borderWidth: active ? 2 : 1 }]}>
              <IconBubble name={meta.icon} color={p.primary} bg="#FFFFFF33" size={38} />
              <Text style={[styles.cardSectionTitle, { color: p.text }]}>{meta.label}</Text>
              {active ? <Ionicons name="checkmark-circle" size={18} color={p.primary} /> : null}
            </AButton>
          );
        })}
      </View>
    </View>
  );
}
