import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initializeDatabase, updateJournal } from '../../database/db';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, Header, JournalBottomNav, MoodRow, Screen } from '../../components/AppShared';
import { BackgroundChooser } from '../../components/BackgroundChooser';

export default function EditEntryScreen({ entry, go, reload }: { entry: any; go: (s: Screen | string) => void; reload: () => Promise<void>; }) {
  const { palette } = useAppTheme();
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || 'calm');
  const [bg, setBg] = useState(entry?.bg_theme || 'b_2');
  const [saving, setSaving] = useState(false);

  if (!entry) return null;

  const save = async () => {
    if (!content.trim()) return Alert.alert('Your entry is empty', 'Write something before saving.');
    if (saving) return;
    try {
      setSaving(true);
      await initializeDatabase();
      await updateJournal(entry.id, {
        title: title.trim() || 'Untitled Entry',
        content: content.trim(),
        mood,
        bg_theme: bg,
      });
      await reload();
      go(`read:${entry.id}` as any);
    } catch (error) {
      Alert.alert('Could not save changes', error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Header title="Edit Entry" subtitle="Keep what changed." palette={palette} onBack={() => go(`read:${entry.id}` as any)} />

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} style={[styles.textInput, { color: palette.text, backgroundColor: palette.card, borderColor: palette.line }]} />

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Mood</Text>
          <MoodRow selected={mood} setSelected={setMood} palette={palette} />

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Your Thoughts</Text>
          <TextInput value={content} onChangeText={setContent} multiline textAlignVertical="top" style={[styles.bodyInput, { color: palette.text, backgroundColor: palette.card, borderColor: palette.line }]} />

          <BackgroundChooser selected={bg} setSelected={setBg} palette={palette} />

          <View style={styles.actionRow}>
            <AButton onPress={() => go(`read:${entry.id}` as any)} style={[styles.secondaryButton, { backgroundColor: palette.soft }]}>
              <Text style={[styles.buttonText, { color: palette.muted }]}>Cancel</Text>
            </AButton>
            <AButton disabled={saving} onPress={save} style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonTextWhite}>{saving ? 'Saving...' : 'Save changes'}</Text>
            </AButton>
          </View>
        </ScrollView>
        <JournalBottomNav active="journal" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}
