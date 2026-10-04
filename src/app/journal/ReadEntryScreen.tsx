import React from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteJournal, toggleJournalFavorite } from '../../database/db';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, EntryBackground, JournalBottomNav, MOODS, Screen, moodInfo } from '../../components/AppShared';

export default function ReadEntryScreen({ entry, go, reload }: { entry: any; go: (s: Screen | string) => void; reload: () => Promise<void>; }) {
  const { palette } = useAppTheme();
  if (!entry) return null;
  const mood = moodInfo(entry.mood);
  const favorite = Number(entry.is_favorite || 0) === 1;

  const toggleFavorite = async () => {
    await toggleJournalFavorite(entry.id, !favorite);
    await reload();
  };
  const remove = () => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteJournal(entry.id); await reload(); go('journal'); } },
    ]);
  };

  return (
    <View style={styles.readScreen}>
      <EntryBackground id={entry.bg_theme} style={StyleSheet.absoluteFill} imageStyle={{ opacity: 0.9 }}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.primary + '55' }]} />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.readTop}>
            <AButton onPress={() => go('journal')} style={styles.readRound}>
              <Ionicons name="chevron-back" size={21} color="#fff" />
            </AButton>
            <Text style={styles.readDate}>{entry.entry_date}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <AButton onPress={toggleFavorite} style={styles.readRound}>
                <Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={favorite ? '#FFD35A' : '#fff'} />
              </AButton>
              <AButton onPress={remove} style={styles.readRound}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </AButton>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.readScroll}>
            <View style={[styles.readGlass, { backgroundColor: palette.text + 'D9', borderColor: '#FFFFFF55' }]}>
              <Text style={styles.readTitle}>{entry.title || 'Untitled Entry'}</Text>
              <View style={styles.readMood}>
                <Ionicons name={mood.icon as any} size={15} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '800' }}>{mood.label}</Text>
              </View>
              {entry.photo_uri ? <Image source={{ uri: entry.photo_uri }} style={styles.attachedPhoto} /> : null}
              <Text style={styles.readContent}>{entry.content}</Text>
              <Text style={[styles.fieldLabel, { color: '#fff', marginTop: 20 }]}>Mood</Text>
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <View key={m.id} style={styles.readMoodItem}>
                    <View style={styles.readMoodCircle}>
                      <Ionicons name={m.icon as any} size={20} color="#fff" />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.actionRow}>
                <AButton onPress={() => go(`edit:${entry.id}` as any)} style={[styles.secondaryButton, { backgroundColor: '#FFFFFF22', borderColor: '#FFFFFF44', borderWidth: 1 }]}>
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.buttonTextWhite}>Edit</Text>
                </AButton>
                <AButton onPress={remove} style={[styles.secondaryButton, { backgroundColor: '#FFFFFF22', borderColor: '#FFFFFF44', borderWidth: 1 }]}>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.buttonTextWhite}>Delete</Text>
                </AButton>
              </View>
            </View>
          </ScrollView>
          <JournalBottomNav active="journal" palette={palette} go={go} />
        </SafeAreaView>
      </EntryBackground>
    </View>
  );
}
