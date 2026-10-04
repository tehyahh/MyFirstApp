import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, IconBubble } from '../../components/AppShared';

const QUICK_MESSAGES = [
  ['sparkles-outline', "I'm feeling grateful today."],
  ['cloud-outline', "It's been a hard day."],
  ['star-outline', "I'm proud of myself."],
  ['leaf-outline', "I'm feeling a little overwhelmed."],
  ['heart-outline', 'Today was actually a good day.'],
  ['flower-outline', "I'm just feeling okay."],
  ['sparkles-outline', "I'm excited about what's ahead."],
  ['water-outline', "I'm feeling a bit sad today."],
] as const;

// Collapsible "Quick Reflection" panel used inside the New Entry screen —
// tapping a message appends it to the entry's content.
export default function ReflectionPromptScreen({ onAppend }: { onAppend: (message: string) => void }) {
  const { palette } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AButton onPress={() => setOpen(v => !v)} style={[styles.quickReflectionToggle, { backgroundColor: palette.card, borderColor: palette.line }]}>
        <IconBubble name="sparkles-outline" color={palette.primary} bg={palette.soft} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardSectionTitle, { color: palette.text, fontSize: 13 }]}>Quick Reflection</Text>
          <Text style={[styles.smallText, { color: palette.muted }]}>Choose a message or write your own below.</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={19} color={palette.primary} />
      </AButton>
      {open ? (
        <View style={[styles.quickReflectionPanel, { backgroundColor: palette.card, borderColor: palette.line }]}>
          <Text style={[styles.quickSectionLabel, { color: palette.text }]}>Quick Messages</Text>
          <View style={styles.quickGrid}>
            {QUICK_MESSAGES.map(([icon, message]) => (
              <AButton key={message} onPress={() => onAppend(message)} style={[styles.quickChoice, { backgroundColor: palette.bg2, borderColor: palette.line }]}>
                <IconBubble name={icon as any} color={palette.primary} bg="#FFFFFF88" size={31} />
                <Text numberOfLines={2} style={[styles.quickChoiceText, { color: palette.text }]}>{message}</Text>
              </AButton>
            ))}
          </View>
          <Text style={[styles.smallText, { color: palette.muted, marginTop: 8 }]}>Tap a message to add it to your thoughts.</Text>
        </View>
      ) : null}
    </>
  );
}
