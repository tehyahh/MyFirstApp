import React, { useEffect, useState } from 'react';
import { Alert, Modal, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createJournal, initializeDatabase } from '../../database/db';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, IconBubble, Screen, defaultSolidBackground, dateString } from '../../components/AppShared';

const QUICK_MESSAGES = [
  ['sunny', "I'm feeling grateful today.", 'sunny-outline'],
  ['cloudy', "It's been a hard day.", 'cloud-outline'],
  ['proud', "I'm proud of myself.", 'star-outline'],
  ['overwhelmed', "I'm feeling a little overwhelmed.", 'leaf-outline'],
  ['good', 'Today was actually a good day.', 'heart-outline'],
  ['okay', "I'm just feeling okay.", 'flower-outline'],
  ['excited', "I'm excited about what's ahead.", 'sparkles-outline'],
  ['sad', "I'm feeling a bit sad today.", 'water-outline'],
] as const;

// "What's on your mind" quick-message picker, shown as a bottom-sheet modal.
export default function MindPromptScreen({
  visible, close, reload, go,
}: {
  visible: boolean;
  close: () => void;
  reload: () => Promise<void>;
  go: (s: Screen | string) => void;
}) {
  const { palette, themeName } = useAppTheme();
  const [content, setContent] = useState('');
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setContent('');
      setSelected('');
    }
  }, [visible]);

  const choose = (message: string) => {
    setSelected(message);
    setContent(message);
  };

  const save = async () => {
    const text = content.trim();
    if (!text) return;
    try {
      setSaving(true);
      await initializeDatabase();
      await createJournal({
        title: 'Quick Reflection',
        content: text,
        mood: selected === QUICK_MESSAGES[0][1] ? 'happy' : selected === QUICK_MESSAGES[2][1] ? 'loved' : selected === QUICK_MESSAGES[7][1] ? 'sad' : 'calm',
        entry_date: dateString(),
        bg_theme: defaultSolidBackground(themeName),
        photo_uri: null,
      });
      await reload();
      close();
      go('journal');
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={styles.quickBackdrop}>
        <View style={[styles.quickModal, { backgroundColor: palette.card, borderColor: palette.line }]}>
          <View style={styles.quickHandle} />
          <View style={styles.rowBetween}>
            <View style={styles.quickTitleRow}>
              <IconBubble name="sunny-outline" color={palette.primary} bg={palette.soft} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickTitle, { color: palette.text }]}>What's on your mind?</Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>Choose a message or write your own.</Text>
              </View>
            </View>
            <AButton onPress={close} style={[styles.quickClose, { backgroundColor: palette.soft }]}>
              <Ionicons name="close" size={20} color={palette.text} />
            </AButton>
          </View>
          <Text style={[styles.quickSectionLabel, { color: palette.text }]}>Quick Messages</Text>
          <View style={styles.quickGrid}>
            {QUICK_MESSAGES.map(([id, message, icon]) => {
              const active = selected === message;
              return (
                <AButton key={id} onPress={() => choose(message)} style={[styles.quickChoice, { backgroundColor: active ? palette.soft : palette.bg2, borderColor: active ? palette.primary : palette.line }]}>
                  <IconBubble name={icon as any} color={palette.primary} bg="#FFFFFF88" size={32} />
                  <Text numberOfLines={2} style={[styles.quickChoiceText, { color: palette.text }]}>{message}</Text>
                </AButton>
              );
            })}
          </View>
          <Text style={[styles.quickSectionLabel, { color: palette.text, marginTop: 12 }]}>Or write your own</Text>
          <TextInput
            value={content}
            onChangeText={value => { setContent(value); setSelected(''); }}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Share what's on your mind..."
            placeholderTextColor={palette.muted}
            style={[styles.quickInput, { color: palette.text, backgroundColor: palette.card, borderColor: palette.line }]}
          />
          <Text style={[styles.quickCounter, { color: palette.muted }]}>{content.length}/500</Text>
          <AButton onPress={() => { close(); go('newEntry'); }} style={styles.fullEntryLink}>
            <Ionicons name="create-outline" size={14} color={palette.primary} />
            <Text style={[styles.fullEntryLinkText, { color: palette.primary }]}>Write a full entry instead</Text>
          </AButton>
          <View style={styles.actionRow}>
            <AButton onPress={close} style={[styles.secondaryButton, { backgroundColor: palette.soft }]}>
              <Text style={[styles.buttonText, { color: palette.muted }]}>Cancel</Text>
            </AButton>
            <AButton disabled={!content.trim() || saving} onPress={save} style={[styles.primaryButton, { backgroundColor: palette.primary }]}>
              <Ionicons name="paper-plane-outline" size={17} color="#fff" />
              <Text style={styles.buttonTextWhite}>{saving ? 'Saving...' : 'Save'}</Text>
            </AButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}
