import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleJournalFavorite } from '../../database/db';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import { AButton, EntryBackground, IconBubble, JournalBottomNav, moodInfo } from '../../components/AppShared';

export default function JournalScreen({
  journals,
  go,
  search,
  setSearch,
  reload,
}: {
  journals: any[];
  go: (s: string) => void;
  search: boolean;
  setSearch: (v: boolean) => void;
  reload: () => Promise<void>;
}) {
  const { palette } = useAppTheme();
  const [tab, setTab] = useState<'all' | 'mine' | 'favorites'>('all');
  const [query, setQuery] = useState('');

  const filtered = journals.filter((j: any) => {
    const q = query.trim().toLowerCase();
    const matchesSearch = !q || `${j.title || ''} ${j.content || ''}`.toLowerCase().includes(q);
    const matchesTab = tab === 'favorites' ? Number(j.is_favorite || 0) === 1 : true;
    return matchesSearch && matchesTab;
  });

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <StatusBar hidden />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.journalListScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardTop}>
            <View style={styles.identity}>
              <IconBubble name="book-outline" color={palette.primary} bg={palette.soft} size={48} />
              <View>
                <Text style={[styles.headerTitle, { color: palette.text }]}>Journal</Text>
                <Text style={[styles.headerSubtitle, { color: palette.muted }]}>Your thoughts, your space.</Text>
              </View>
            </View>
            <View style={styles.topActions}>
              <AButton onPress={() => setSearch(!search)} style={[styles.smallIcon, { backgroundColor: palette.card, borderColor: palette.line, borderWidth: 1 }]}>
                <Ionicons name="search-outline" size={21} color={palette.primary} />
              </AButton>
              <AButton onPress={() => go('profile')} style={[styles.smallIcon, { backgroundColor: palette.card, borderColor: palette.line, borderWidth: 1 }]}>
                <Ionicons name="moon-outline" size={21} color={palette.primary} />
              </AButton>
            </View>
          </View>

          {search && (
            <View style={[styles.searchBox, { backgroundColor: palette.card, borderColor: palette.line, marginBottom: 12 }]}>
              <Ionicons name="search-outline" size={19} color={palette.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search your entries..." placeholderTextColor={palette.muted} style={[styles.input, { color: palette.text }]} autoFocus />
              <AButton onPress={() => { setQuery(''); setSearch(false); }} style={{ width: 32, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color={palette.muted} />
              </AButton>
            </View>
          )}

          <View style={[styles.journalTabs, { backgroundColor: palette.card, borderColor: palette.line }]}>
            {[
              ['all', 'All'],
              ['mine', 'My Entries'],
              ['favorites', 'Favorites'],
            ].map(([key, label]) => {
              const active = tab === key;
              return (
                <AButton key={key} onPress={() => setTab(key as any)} style={[styles.journalTab, { backgroundColor: active ? palette.primary : 'transparent' }]}>
                  <Text style={[styles.journalTabText, { color: active ? '#fff' : palette.muted }]}>{label}</Text>
                </AButton>
              );
            })}
          </View>

          <View style={styles.journalSectionHeader}>
            <View>
              <Text style={[styles.loopTitle, { color: palette.primary, marginBottom: 2 }]}>YOUR ENTRIES</Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                {filtered.length} {filtered.length === 1 ? 'page' : 'pages'} saved
              </Text>
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.line, marginTop: 8 }]}>
              <IconBubble name="book-outline" color={palette.primary} bg={palette.soft} size={62} />
              <Text style={[styles.cardSectionTitle, { color: palette.text, marginTop: 12, fontSize: 16 }]}>
                {tab === 'favorites' ? 'No favorite entries yet.' : 'Your first page is waiting.'}
              </Text>
              <Text style={[styles.smallText, { color: palette.muted, textAlign: 'center', marginTop: 5, maxWidth: 260 }]}>
                Tap the + button below to write something that belongs to you.
              </Text>
            </View>
          ) : (
            filtered.slice(0, 30).map((entry: any) => {
              const mood = moodInfo(entry.mood);
              const favorite = Number(entry.is_favorite || 0) === 1;
              return (
                <View key={entry.id} style={[styles.journalListCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
                  <AButton onPress={() => go(`read:${entry.id}`)} style={styles.journalListMainButton}>
                    <EntryBackground id={entry.bg_theme} style={styles.journalListThumb} imageStyle={{ borderRadius: 14 }} />
                    <View style={styles.journalListContent}>
                      <View style={styles.journalListTopRow}>
                        <Text numberOfLines={1} style={[styles.journalListTitle, { color: palette.text }]}>
                          {entry.title || 'Untitled Entry'}
                        </Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.journalListDate, { color: palette.muted }]}>
                        {entry.entry_date || 'No date'}
                      </Text>
                      <View style={[styles.journalMoodPill, { backgroundColor: palette.soft }]}>
                        <Ionicons name={mood.icon as any} size={12} color={palette.primary} />
                        <Text style={[styles.journalMoodText, { color: palette.primary }]}>{mood.label}</Text>
                      </View>
                      <Text numberOfLines={1} style={[styles.journalListPreview, { color: palette.muted }]}>
                        {entry.content || 'No text in this entry.'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color={palette.muted} />
                  </AButton>
                  <AButton
                    onPress={async () => {
                      try {
                        await toggleJournalFavorite(entry.id, !favorite);
                        await reload();
                      } catch (error) {
                        Alert.alert('Could not update favorite', error instanceof Error ? error.message : String(error));
                      }
                    }}
                    style={styles.favoriteButton}
                  >
                    <Ionicons name={favorite ? 'star' : 'star-outline'} size={22} color={favorite ? '#F4B400' : palette.muted} />
                  </AButton>
                </View>
              );
            })
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
        <JournalBottomNav active="journal" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}