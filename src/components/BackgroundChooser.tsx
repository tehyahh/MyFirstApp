import React, { useState } from 'react';
import { ImageBackground, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../constants/appStyles';
import { AButton, IconBubble, SOLID_BACKGROUNDS, BACKGROUND_CATEGORIES } from './AppShared';

export function BackgroundChooser({ selected, setSelected, palette }: any) {
  const [mode, setMode] = useState<'colors' | 'patterns'>('colors');
  const [activeCategory, setActiveCategory] = useState('pink');
  const activeGroup = BACKGROUND_CATEGORIES.find((category: any) => category.id === activeCategory) || BACKGROUND_CATEGORIES[0];
  return (
    <View style={[styles.inlineBackgroundChooser, { backgroundColor: palette.card, borderColor: palette.line }]}>
      <View style={styles.row}>
        <IconBubble name="images-outline" color={palette.primary} bg={palette.soft} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardSectionTitle, { color: palette.text }]}>Journal Background</Text>
          <Text style={[styles.smallText, { color: palette.muted }]}>Pick one of the 8 pastel colors or your original patterns.</Text>
        </View>
      </View>
      <View style={[styles.backgroundModeRow, { backgroundColor: palette.soft, marginTop: 12 }]}>
        <AButton onPress={() => setMode('colors')} style={[styles.backgroundModeButton, mode === 'colors' && { backgroundColor: palette.card }]}>
          <Ionicons name="color-palette-outline" size={17} color={mode === 'colors' ? palette.primary : palette.muted} />
          <Text style={[styles.backgroundModeText, { color: mode === 'colors' ? palette.primary : palette.muted }]}>Pastel Colors</Text>
        </AButton>
        <AButton onPress={() => setMode('patterns')} style={[styles.backgroundModeButton, mode === 'patterns' && { backgroundColor: palette.card }]}>
          <Ionicons name="images-outline" size={17} color={mode === 'patterns' ? palette.primary : palette.muted} />
          <Text style={[styles.backgroundModeText, { color: mode === 'patterns' ? palette.primary : palette.muted }]}>Patterns</Text>
        </AButton>
      </View>
      {mode === 'colors' ? (
        <>
          <Text style={[styles.pickerSectionTitle, { color: palette.text }]}>8 pastel colors</Text>
          <View style={styles.solidColorGrid}>
            {SOLID_BACKGROUNDS.map(item => {
              const active = selected === item.id;
              return (
                <AButton key={item.id} onPress={() => setSelected(item.id)} style={[styles.solidColorTile, { backgroundColor: item.color, borderColor: active ? palette.primary : '#FFFFFFAA', borderWidth: active ? 3 : 1 }]}>
                  <View style={styles.solidColorNamePill}>
                    <Text style={styles.solidColorName}>{item.name}</Text>
                  </View>
                  {active ? (
                    <View style={[styles.solidColorCheck, { backgroundColor: palette.primary }]}>
                      <Ionicons name="checkmark" size={17} color="#fff" />
                    </View>
                  ) : null}
                </AButton>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.pickerSectionTitle, { color: palette.text }]}>Your journal patterns</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.patternCategoryRow}>
            {BACKGROUND_CATEGORIES.map((category: any) => {
              const active = category.id === activeCategory;
              return (
                <AButton key={category.id} onPress={() => setActiveCategory(category.id)} style={[styles.patternCategoryButton, { backgroundColor: active ? palette.primary : palette.soft }]}>
                  <Text style={{ color: active ? '#fff' : palette.text, fontWeight: '800', fontSize: 12 }}>{category.label}</Text>
                </AButton>
              );
            })}
          </ScrollView>
          <View style={styles.patternGrid}>
            {activeGroup?.items.map((item: any) => {
              const active = selected === item.id;
              return (
                <AButton key={item.id} onPress={() => setSelected(item.id)} style={[styles.patternTile, { borderColor: active ? palette.primary : palette.line, borderWidth: active ? 3 : 1 }]}>
                  <ImageBackground source={item.image} resizeMode="cover" style={styles.patternTileImage} imageStyle={{ borderRadius: 14 }}>
                    {active ? (
                      <View style={[styles.patternCheck, { backgroundColor: palette.primary }]}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : null}
                    <View style={styles.patternNamePill}>
                      <Text style={styles.solidColorName} numberOfLines={1}>{item.name}</Text>
                    </View>
                  </ImageBackground>
                </AButton>
              );
            })}
          </View>
        </>
      )}
      <View style={[styles.selectedBackgroundHint, { backgroundColor: palette.soft }]}>
        <Ionicons name="checkmark-circle-outline" size={17} color={palette.primary} />
        <Text style={[styles.smallText, { color: palette.muted, flex: 1 }]}>Your selected background will be saved with this entry.</Text>
      </View>
    </View>
  );
}
