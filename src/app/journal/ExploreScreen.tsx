import React, { useState } from 'react';
import { ImageBackground, Modal, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../constants/appStyles';
import { useAppTheme } from '../../constants/ThemeContext';
import {
  AButton, BACKGROUND_CATEGORIES, EntryBackground, Header, IconBubble, JournalBottomNav,
  MoodRow, Screen, SOLID_BACKGROUNDS, AFFIRMATIONS, moodInfo, dateString,
} from '../../components/AppShared';

export default function ExploreScreen({ journals, go }: { journals: any[]; go: (s: Screen | string) => void; }) {
  const { palette } = useAppTheme();
  const [month, setMonth] = useState(new Date());
  const [tab, setTab] = useState<'calendar' | 'colors' | 'tips'>('calendar');
  const [reflectionMood, setReflectionMood] = useState('calm');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [patternCategory, setPatternCategory] = useState('pink');

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const monthName = month.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const formatCalendarDate = (day: number) => `${String(day).padStart(2, '0')}-${String(monthIndex + 1).padStart(2, '0')}-${year}`;
  const cells = Array.from({ length: totalCells }, (_, index) => {
    if (index < mondayOffset) return null;
    const day = index - mondayOffset + 1;
    return day <= daysInMonth ? day : null;
  });
  const entryForDay = (day: number) => journals.find((entry: any) => String(entry.entry_date || '') === formatCalendarDate(day)) || null;
  const selectedEntry = selectedDayKey ? journals.find((entry: any) => String(entry.entry_date || '') === selectedDayKey) || null : null;
  const selectedMood = selectedEntry ? moodInfo(selectedEntry.mood) : null;
  const activePatternGroup = BACKGROUND_CATEGORIES.find((category: any) => category.id === patternCategory) || BACKGROUND_CATEGORIES[0];

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Header title="Explore" subtitle="Discover, plan, and organize." palette={palette} onBack={() => go('dashboard')} />

          <View style={[styles.segment, { backgroundColor: palette.card, borderColor: palette.line }]}>
            {(['calendar', 'colors', 'tips'] as const).map(item => (
              <AButton key={item} onPress={() => setTab(item)} style={tab === item ? [styles.segmentActive, { backgroundColor: palette.primary }] : [styles.segmentItem, { backgroundColor: 'transparent' }]}>
                <Text style={tab === item ? styles.segmentActiveText : [styles.segmentText, { color: palette.muted }]}>{item[0].toUpperCase() + item.slice(1)}</Text>
              </AButton>
            ))}
          </View>

          {tab === 'calendar' ? (
            <>
              <View style={[styles.calendarCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
                <View style={styles.rowBetween}>
                  <AButton onPress={() => { setMonth(new Date(year, monthIndex - 1, 1)); setSelectedDayKey(null); }} style={styles.calendarArrowButton}>
                    <Ionicons name="chevron-back" size={19} color={palette.primary} />
                  </AButton>
                  <Text style={[styles.calendarMonthTitle, { color: palette.text }]}>{monthName}</Text>
                  <AButton onPress={() => { setMonth(new Date(year, monthIndex + 1, 1)); setSelectedDayKey(null); }} style={styles.calendarArrowButton}>
                    <Ionicons name="chevron-forward" size={19} color={palette.primary} />
                  </AButton>
                </View>
                <View style={styles.weekRow}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <Text key={day} style={[styles.weekText, { color: palette.muted }]}>{day}</Text>)}</View>
                <View style={styles.calendarGrid}>
                  {cells.map((day, index) => {
                    if (day === null) return <View key={`empty-${index}`} style={styles.dayCell} />;
                    const dateKey = formatCalendarDate(day);
                    const entry = entryForDay(day);
                    const selected = selectedDayKey === dateKey;
                    const today = dateKey === dateString();
                    return (
                      <AButton key={dateKey} onPress={() => setSelectedDayKey(dateKey)} style={[styles.dayCell, selected && { backgroundColor: palette.primary }, !selected && today && { backgroundColor: palette.soft }]}>
                        <Text numberOfLines={1} allowFontScaling={false} style={[styles.calendarDayNumber, { color: selected ? '#fff' : palette.text }]}>{day}</Text>
                        {entry ? <View style={[styles.dot, { backgroundColor: selected ? '#fff' : palette.primary }]} /> : null}
                      </AButton>
                    );
                  })}
                </View>
                <View style={[styles.calendarHint, { backgroundColor: palette.soft }]}>
                  <Ionicons name="hand-left-outline" size={15} color={palette.primary} />
                  <Text style={[styles.smallText, { color: palette.muted, flex: 1 }]}>Tap any date to preview what you saved that day.</Text>
                </View>
              </View>

              <View style={[styles.reflectionCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
                <View style={styles.row}>
                  <IconBubble name="sunny-outline" color={palette.primary} bg={palette.soft} size={45} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Today's Reflection</Text>
                    <Text style={[styles.smallText, { color: palette.muted }]}>How are you feeling today?</Text>
                  </View>
                </View>
                <MoodRow selected={reflectionMood} setSelected={setReflectionMood} palette={palette} />
              </View>

              <AButton onPress={() => go('newEntry')} style={[styles.tipCard, { backgroundColor: palette.purple }]}>
                <IconBubble name="sparkles-outline" color="#6844C6" bg="#FFFFFF66" size={42} />
                <Text style={[styles.cardSectionTitle, { color: palette.text, flex: 1 }]}>A fresh start is always a good idea.</Text>
                <Ionicons name="chevron-forward" size={20} color={palette.primary} />
              </AButton>
            </>
          ) : null}

          {tab === 'colors' ? (
            <>
              <Text style={[styles.loopTitle, { color: palette.primary }]}>8 PASTEL JOURNAL COLORS</Text>
              <View style={styles.exploreColorGrid}>
                {SOLID_BACKGROUNDS.map(item => (
                  <AButton key={item.id} onPress={() => go('newEntry')} style={[styles.exploreColorCard, { backgroundColor: item.color }]}>
                    <View style={styles.exploreColorLabel}><Text style={styles.solidColorName}>{item.name}</Text></View>
                  </AButton>
                ))}
              </View>
              <Text style={[styles.smallText, { color: palette.muted, marginTop: 10 }]}>Tap a color to start a new entry with it.</Text>

              <View style={[styles.explorePatternsSection, { backgroundColor: palette.card, borderColor: palette.line }]}>
                <View style={styles.row}>
                  <IconBubble name="images-outline" color={palette.primary} bg={palette.soft} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Journal Patterns</Text>
                    <Text style={[styles.smallText, { color: palette.muted }]}>All of your original background images are still here.</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.patternCategoryRow}>
                  {BACKGROUND_CATEGORIES.map((category: any) => {
                    const active = category.id === patternCategory;
                    return (
                      <AButton key={category.id} onPress={() => setPatternCategory(category.id)} style={[styles.patternCategoryButton, { backgroundColor: active ? palette.primary : palette.soft }]}>
                        <Text style={{ color: active ? '#fff' : palette.text, fontWeight: '800', fontSize: 12 }}>{category.label}</Text>
                      </AButton>
                    );
                  })}
                </ScrollView>
                <Text style={[styles.patternSectionLabel, { color: palette.text }]}>{activePatternGroup.label} patterns</Text>
                <View style={styles.explorePatternGrid}>
                  {activePatternGroup.items.map((item: any) => (
                    <AButton key={item.id} onPress={() => go('newEntry')} style={[styles.explorePatternTile, { borderColor: palette.line }]}>
                      <ImageBackground source={item.image} resizeMode="cover" style={styles.explorePatternImage} imageStyle={{ borderRadius: 15 }}>
                        <View style={styles.explorePatternNamePill}><Text style={styles.solidColorName} numberOfLines={1}>{item.name}</Text></View>
                      </ImageBackground>
                    </AButton>
                  ))}
                </View>
                <Text style={[styles.smallText, { color: palette.muted, marginTop: 12 }]}>Tap any pattern to open a new entry. You can change it again before saving.</Text>
              </View>
            </>
          ) : null}

          {tab === 'tips' ? (
            <View>
              <View style={[styles.affirmationIntro, { backgroundColor: palette.soft, borderColor: palette.line }]}>
                <IconBubble name="sparkles-outline" color={palette.primary} bg={palette.card} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardSectionTitle, { color: palette.text }]}>20 affirmations for you</Text>
                  <Text style={[styles.smallText, { color: palette.muted }]}>A gentle reminder to come back to yourself.</Text>
                </View>
              </View>
              {AFFIRMATIONS.map((affirmation, index) => (
                <View key={index} style={[styles.affirmationCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
                  <View style={[styles.affirmationNumber, { backgroundColor: palette.soft }]}><Text style={[styles.affirmationNumberText, { color: palette.primary }]}>{index + 1}</Text></View>
                  <Ionicons name="heart-outline" size={19} color={palette.primary} />
                  <Text style={[styles.affirmationText, { color: palette.text }]}>{affirmation}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={{ height: 110 }} />
        </ScrollView>
        <JournalBottomNav active="explore" palette={palette} go={go} />
      </SafeAreaView>

      <Modal visible={selectedDayKey !== null} transparent animationType="fade" onRequestClose={() => setSelectedDayKey(null)}>
        <View style={styles.calendarPreviewBackdrop}>
          <View style={[styles.calendarPreviewCard, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Day Preview</Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>{selectedDayKey}</Text>
              </View>
              <AButton onPress={() => setSelectedDayKey(null)} style={[styles.closeButton, { backgroundColor: palette.soft }]}>
                <Ionicons name="close" size={21} color={palette.text} />
              </AButton>
            </View>
            {selectedEntry ? (
              <>
                <EntryBackground id={selectedEntry.bg_theme} style={styles.calendarPreviewImage} imageStyle={{ borderRadius: 18 }}>
                  <View style={styles.calendarPreviewImageShade} />
                  <View style={styles.calendarPreviewGlass}>
                    <View style={styles.row}>
                      <IconBubble name={selectedMood?.icon || 'book-outline'} color={palette.primary} bg="#FFFFFFDD" size={40} />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.calendarPreviewTitle} numberOfLines={2}>{selectedEntry.title || 'Untitled Entry'}</Text>
                        <Text style={styles.calendarPreviewMood}>{selectedMood?.label || 'Reflection'}</Text>
                      </View>
                    </View>
                  </View>
                </EntryBackground>
                <Text style={[styles.calendarPreviewContent, { color: palette.text }]} numberOfLines={7}>{selectedEntry.content}</Text>
                <View style={styles.actionRow}>
                  <AButton onPress={() => { setSelectedDayKey(null); go(`read:${selectedEntry.id}` as any); }} style={[styles.primaryButton, { backgroundColor: palette.primary, flex: 1 }]}>
                    <Ionicons name="book-outline" size={18} color="#fff" />
                    <Text style={styles.buttonTextWhite}>Open Entry</Text>
                  </AButton>
                </View>
              </>
            ) : (
              <View style={styles.emptyPreview}>
                <IconBubble name="calendar-outline" color={palette.primary} bg={palette.soft} size={58} />
                <Text style={[styles.cardSectionTitle, { color: palette.text, marginTop: 12 }]}>No reflection saved</Text>
                <Text style={[styles.smallText, { color: palette.muted, textAlign: 'center', marginTop: 5 }]}>Nothing was saved for this date yet.</Text>
                <AButton onPress={() => { setSelectedDayKey(null); go('newEntry'); }} style={[styles.primaryButton, { backgroundColor: palette.primary, marginTop: 16, minWidth: 160 }]}>
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.buttonTextWhite}>Write for this day</Text>
                </AButton>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
