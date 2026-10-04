import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createJournal } from '../../database/db';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, Header, JournalBottomNav, MoodRow, Screen, dateString, defaultSolidBackground } from '../../components/AppShared';
import { BackgroundChooser } from '../../components/BackgroundChooser';
import ReflectionPromptScreen from './ReflectionPromptScreen';

export default function AddJournalScreen({ go, reload }: { go: (s: Screen | string) => void; reload: () => Promise<void>; }) {
  const { palette, themeName } = useAppTheme();
  const [date, setDate] = useState(dateString());
  const [mood, setMood] = useState('calm');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bg, setBg] = useState(defaultSolidBackground(themeName));
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission', 'Please allow photo access to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, allowsEditing: true, quality: 0.85 });
    if (!result.canceled) setPhoto(result.assets[0]?.uri || null);
  };

  const save = async () => {
    if (!content.trim()) {
      Alert.alert('Your entry is empty', 'Write something before saving.');
      return;
    }
    try {
      setSaving(true);
      await createJournal({
        title: title.trim() || 'Untitled Entry',
        content: content.trim(),
        mood,
        entry_date: date.trim() || dateString(),
        bg_theme: bg,
        photo_uri: photo,
      });
      await reload();
      go('journal');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Header title="New Entry" subtitle="Give today a page." palette={palette} onBack={() => go('journal')} icon="chevron-back" />

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Today's Date</Text>
          <View style={[styles.inputBox, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <Ionicons name="calendar-outline" size={19} color={palette.primary} />
            <TextInput value={date} onChangeText={setDate} style={[styles.input, { color: palette.text }]} />
            <Ionicons name="calendar-outline" size={18} color={palette.primary} />
          </View>

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Mood</Text>
          <MoodRow selected={mood} setSelected={setMood} palette={palette} />

          <ReflectionPromptScreen onAppend={message => setContent(previous => (previous.trim() ? `${previous.trim()} ${message}` : message))} />

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Title (optional)</Text>
          <TextInput value={title} onChangeText={setTitle} maxLength={100} placeholder="Give your entry a title..." placeholderTextColor={palette.muted} style={[styles.textInput, { color: palette.text, backgroundColor: palette.card, borderColor: palette.line }]} />

          <View style={styles.rowBetween}>
            <Text style={[styles.fieldLabel, { color: palette.text }]}>Your Thoughts</Text>
            <Text style={[styles.counter, { color: palette.muted }]}>{content.length}/2000</Text>
          </View>
          <TextInput value={content} onChangeText={setContent} multiline maxLength={2000} textAlignVertical="top" placeholder="Write about your day, your feelings, what's on your mind..." placeholderTextColor={palette.muted} style={[styles.bodyInput, { color: palette.text, backgroundColor: palette.card, borderColor: palette.line }]} />

          <BackgroundChooser selected={bg} setSelected={setBg} palette={palette} />

          <AButton onPress={pickPhoto} style={[styles.photoBox, { backgroundColor: palette.card, borderColor: palette.line }]}>
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <View style={styles.photoChangePill}>
                  <Ionicons name="images-outline" size={14} color="#fff" />
                  <Text style={styles.photoChangeText}>Change photo</Text>
                </View>
              </>
            ) : (
              <>
                <Ionicons name="images-outline" size={26} color={palette.primary} />
                <Text style={[styles.cardSectionTitle, { color: palette.text, fontSize: 13 }]}>Add a photo</Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>Optional — choose one image from your gallery.</Text>
              </>
            )}
          </AButton>

          <View style={[styles.actionRow, { marginTop: 18 }]}>
            <AButton onPress={() => go('journal')} style={[styles.secondaryButton, { backgroundColor: palette.soft }]}>
              <Text style={[styles.buttonText, { color: palette.muted }]}>Cancel</Text>
            </AButton>
            <AButton disabled={saving} onPress={save} style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonTextWhite}>{saving ? 'Saving...' : 'Save Entry'}</Text>
            </AButton>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
        <JournalBottomNav active="newEntry" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}
