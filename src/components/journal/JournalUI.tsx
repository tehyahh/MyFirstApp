import React, {
  useRef,
} from 'react';

import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useRouter,
} from 'expo-router';

import {
  BACKGROUND_CATEGORIES,
  MOODS,
  findImageSource,
} from '../../constants/journalData';

import {
  useTheme,
} from '../../constants/ThemeContext';

// Flat list of every background, built from the categories in journalData.
const BACKGROUNDS = BACKGROUND_CATEGORIES.flatMap((c) => [...c.items]);

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.screen,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </SafeAreaView>
  );
}

export function AnimatedPressable({
  children,
  onPress,
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {onBack && (
          <AnimatedPressable
            onPress={onBack}
            style={[
              styles.headerButton,
              {
                backgroundColor:
                  theme.surface,
                borderColor:
                  theme.border,
              },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={theme.text}
            />
          </AnimatedPressable>
        )}

        <View>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              style={[
                styles.headerSubtitle,
                { color: theme.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {right}
    </View>
  );
}

export function ThemeSwitch() {
  const {
    theme,
    themeName: themeKey,
    setTheme,
  } = useTheme();

  return (
    <View
      style={[
        styles.themeSwitch,
        {
          backgroundColor:
            theme.surface,
          borderColor:
            theme.border,
        },
      ]}
    >
      <AnimatedPressable
        onPress={() =>
          setTheme('pink')
        }
        style={[
          styles.themeOption,
          themeKey === 'pink' && {
            backgroundColor:
              theme.primarySoft,
          },
        ]}
      >
        <Ionicons
          name="flower-outline"
          size={17}
          color={
            themeKey === 'pink'
              ? '#F45B91'
              : theme.textMuted
          }
        />

        <Text
          style={[
            styles.themeOptionText,
            {
              color:
                themeKey === 'pink'
                  ? theme.primary
                  : theme.textMuted,
            },
          ]}
        >
          Pink
        </Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPress={() =>
          setTheme('blue')
        }
        style={[
          styles.themeOption,
          themeKey === 'blue' && {
            backgroundColor:
              theme.primarySoft,
          },
        ]}
      >
        <Ionicons
          name="water-outline"
          size={17}
          color={
            themeKey === 'blue'
              ? '#2457A6'
              : theme.textMuted
          }
        />

        <Text
          style={[
            styles.themeOptionText,
            {
              color:
                themeKey === 'blue'
                  ? theme.primary
                  : theme.textMuted,
            },
          ]}
        >
          Blue
        </Text>
      </AnimatedPressable>
    </View>
  );
}

export function MoodRow({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect?: (id: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={styles.moodRow}>
      {MOODS.map(mood => {
        const active =
          selected === mood.id;

        return (
          <AnimatedPressable
            key={mood.id}
            onPress={() =>
              onSelect?.(mood.id)
            }
            style={styles.moodItem}
          >
            <View
              style={[
                styles.moodCircle,
                {
                  backgroundColor:
                    active
                      ? theme.primarySoft
                      : theme.surfaceSoft,
                  borderColor:
                    active
                      ? theme.primary
                      : theme.border,
                },
              ]}
            >
              <Ionicons
                name={mood.icon as any}
                size={23}
                color={
                  active
                    ? theme.primary
                    : theme.textSecondary
                }
              />
            </View>

            <Text
              style={[
                styles.moodLabel,
                { color: theme.text },
              ]}
            >
              {mood.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

export function BackgroundGrid({
  selected,
  category,
  onSelect,
}: {
  selected: string;
  category?: string;
  onSelect: (id: string) => void;
}) {
  const { theme } = useTheme();

  const items =
    category && category !== 'all'
      ? BACKGROUNDS.filter(
          item =>
            item.category === category
        )
      : BACKGROUNDS;

  return (
    <View style={styles.backgroundGrid}>
      {items.map(item => {
        const active =
          selected === item.id;

        return (
          <AnimatedPressable
            key={item.id}
            onPress={() =>
              onSelect(item.id)
            }
            style={styles.backgroundItem}
          >
            <Image
              source={item.image}
              style={[
                styles.backgroundImage,
                {
                  borderColor:
                    active
                      ? theme.primary
                      : theme.border,
                  borderWidth:
                    active ? 3 : 1,
                },
              ]}
            />

            {active && (
              <View
                style={[
                  styles.checkBadge,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

export function BottomNav({
  active = 'journal',
}: {
  active?: 'home' | 'explore' | 'journal';
}) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor:
            theme.surface,
          borderColor:
            theme.border,
        },
      ]}
    >
      <AnimatedPressable
        onPress={() =>
          router.push(
            '/journal/JournalScreen'
          )
        }
        style={styles.navItem}
      >
        <Ionicons
          name={
            active === 'home'
              ? 'home'
              : 'home-outline'
          }
          size={22}
          color={
            active === 'home'
              ? theme.primary
              : theme.textSecondary
          }
        />

        <Text
          style={[
            styles.navText,
            {
              color:
                active === 'home'
                  ? theme.primary
                  : theme.textSecondary,
            },
          ]}
        >
          Home
        </Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPress={() =>
          router.push(
            '/journal/ExploreScreen'
          )
        }
        style={styles.navItem}
      >
        <Ionicons
          name="compass-outline"
          size={22}
          color={
            active === 'explore'
              ? theme.primary
              : theme.textSecondary
          }
        />

        <Text
          style={[
            styles.navText,
            {
              color:
                active === 'explore'
                  ? theme.primary
                  : theme.textSecondary,
            },
          ]}
        >
          Explore
        </Text>
      </AnimatedPressable>

      <AnimatedPressable
        onPress={() =>
          router.push(
            '/journal/AddJournalScreen'
          )
        }
        style={[
          styles.addButton,
          {
            backgroundColor:
              theme.primary,
          },
        ]}
      >
        <Ionicons
          name="add"
          size={30}
          color="#FFFFFF"
        />
      </AnimatedPressable>

      <AnimatedPressable
        onPress={() =>
          router.push(
            '/journal/JournalScreen'
          )
        }
        style={styles.navItem}
      >
        <Ionicons
          name={
            active === 'journal'
              ? 'book'
              : 'book-outline'
          }
          size={22}
          color={
            active === 'journal'
              ? theme.primary
              : theme.textSecondary
          }
        />

        <Text
          style={[
            styles.navText,
            {
              color:
                active === 'journal'
                  ? theme.primary
                  : theme.textSecondary,
            },
          ]}
        >
          Journal
        </Text>
      </AnimatedPressable>
    </View>
  );
}

export function BackgroundCard({
  backgroundId,
  title = 'Change Background',
  subtitle = 'Choose a pattern that matches your mood.',
  onPress,
}: {
  backgroundId: string;
  title?: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
    >
      <ImageBackground
        source={findImageSource(
          backgroundId
        )}
        imageStyle={{
          borderRadius: 18,
        }}
        style={[
          styles.backgroundCard,
          {
            borderColor:
              theme.border,
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                'rgba(255,255,255,0.80)',
              borderRadius: 18,
            },
          ]}
        />

        <View
          style={[
            styles.backgroundPreview,
            {
              borderColor:
                theme.border,
            },
          ]}
        >
          <Image
            source={findImageSource(
              backgroundId
            )}
            style={styles.previewImage}
          />
        </View>

        <View style={styles.backgroundText}>
          <Text
            style={[
              styles.backgroundTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.backgroundSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.text}
        />
      </ImageBackground>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 120,
  },

  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  themeSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 22,
    borderWidth: 1,
    gap: 2,
  },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 17,
  },

  themeOptionText: {
    fontSize: 11,
    fontWeight: '700',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 10,
  },

  moodItem: {
    alignItems: 'center',
    width: '18%',
  },

  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moodLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },

  backgroundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  backgroundItem: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },

  backgroundImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  checkBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backgroundCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  backgroundPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  backgroundText: {
    flex: 1,
    paddingHorizontal: 12,
  },

  backgroundTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  backgroundSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  bottomNav: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
    minHeight: 72,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowOpacity: 0.12,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 7,
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
  },

  navText: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },

  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});