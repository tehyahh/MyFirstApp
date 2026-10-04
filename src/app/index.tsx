import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeynmanScreen from "../components/FeynmanScreen";
import HomeScreen from "../components/HomeScreen";
import PomodoroScreen from "../components/PomodoroScreen";
import { ThemeProvider } from "../context/ThemeContext";

import {
  BACKGROUND_CATEGORIES,
  findImageSource,
  MOODS,
} from "../constants/journalData";
import {
  createJournal,
  createStudyNote,
  createTask,
  deleteJournal,
  deleteTask,
  getJournals,
  getProfile,
  getStudyNotes,
  getTasks,
  initializeDatabase,
  saveProfileNickname,
  saveProfileTheme,
  toggleJournalFavorite,
  updateJournal,
  updateStudyNote,
  updateTask,
} from "../database/db";

type Screen =
  | "dashboard"
  | "journal"
  | "explore"
  | "newEntry"
  | "readEntry"
  | "editEntry"
  | "tasks"
  | "study"
  | "feynman"
  | "pomodoro"
  | "goals"
  | "leisure"
  | "profile";

type ThemeName = "blue" | "pink" | "green" | "purple" | "red" | "yellow";

type ThemePalette = {
  bg: string;
  bg2: string;
  primary: string;
  primary2: string;
  text: string;
  muted: string;
  card: string;
  line: string;
  soft: string;
  yellow: string;
  pink: string;
  purple: string;
  green: string;
  blue: string;
};

const BLUE: ThemePalette = {
  bg: "#EAF7FF",
  bg2: "#DDF1FF",
  primary: "#1767B7",
  primary2: "#2E83D6",
  text: "#123F72",
  muted: "#7595B0",
  card: "#FFFFFF",
  line: "#CFE5F6",
  soft: "#E5F3FF",
  yellow: "#FFF2B9",
  pink: "#FFDDEB",
  purple: "#E9DEFF",
  green: "#DDF6E9",
  blue: "#DDEEFF",
};
const PINK: ThemePalette = {
  bg: "#FFF1F7",
  bg2: "#FFE6F0",
  primary: "#E55491",
  primary2: "#F477AD",
  text: "#76254C",
  muted: "#AA7690",
  card: "#FFFFFF",
  line: "#F3D5E2",
  soft: "#FFE7F0",
  yellow: "#FFF0BA",
  pink: "#FFD5E6",
  purple: "#EBDFFF",
  green: "#DDF5E9",
  blue: "#DDEEFF",
};
const GREEN: ThemePalette = {
  bg: "#F0FBF5",
  bg2: "#E0F5E8",
  primary: "#3B9B68",
  primary2: "#59B982",
  text: "#245A40",
  muted: "#769A87",
  card: "#FFFFFF",
  line: "#CFE8D9",
  soft: "#E2F6EA",
  yellow: "#FFF1B8",
  pink: "#F8DDE8",
  purple: "#E9DEFF",
  green: "#D4F0DF",
  blue: "#DDEEFF",
};
const PURPLE: ThemePalette = {
  bg: "#F7F1FF",
  bg2: "#EEE3FF",
  primary: "#8056C7",
  primary2: "#9A73DD",
  text: "#4B3572",
  muted: "#917DA9",
  card: "#FFFFFF",
  line: "#DFD1F1",
  soft: "#EEE3FF",
  yellow: "#FFF1B8",
  pink: "#F8DDE8",
  purple: "#E4D5FF",
  green: "#DDF5E9",
  blue: "#DDEEFF",
};
const RED: ThemePalette = {
  bg: "#FFF2F2",
  bg2: "#FFE2E2",
  primary: "#D94B59",
  primary2: "#EB6975",
  text: "#6F2931",
  muted: "#A47B80",
  card: "#FFFFFF",
  line: "#F0D0D3",
  soft: "#FFE4E6",
  yellow: "#FFF0BA",
  pink: "#FFD9E3",
  purple: "#EBDFFF",
  green: "#DDF5E9",
  blue: "#DDEEFF",
};
const YELLOW: ThemePalette = {
  bg: "#FFFBEA",
  bg2: "#FFF3C9",
  primary: "#D89B18",
  primary2: "#E9B936",
  text: "#684E12",
  muted: "#A18B5B",
  card: "#FFFFFF",
  line: "#F0DFAC",
  soft: "#FFF3C8",
  yellow: "#FFE99A",
  pink: "#FFDDE8",
  purple: "#EBDFFF",
  green: "#DDF5E9",
  blue: "#DDEEFF",
};

const THEME_META: Record<
  ThemeName,
  { label: string; icon: any; palette: ThemePalette }
> = {
  blue: { label: "Blue", icon: "water-outline", palette: BLUE },
  pink: { label: "Pink", icon: "heart-outline", palette: PINK },
  green: { label: "Green", icon: "leaf-outline", palette: GREEN },
  purple: { label: "Purple", icon: "sparkles-outline", palette: PURPLE },
  red: { label: "Red", icon: "heart-outline", palette: RED },
  yellow: { label: "Yellow", icon: "sunny-outline", palette: YELLOW },
};

const SOLID_BACKGROUNDS = [
  { id: "solid_blush", name: "Blush", color: "#F7D6E0" },
  { id: "solid_peach", name: "Peach", color: "#FAD7C0" },
  { id: "solid_butter", name: "Butter", color: "#F9E7A8" },
  { id: "solid_mint", name: "Mint", color: "#D7EEDB" },
  { id: "solid_sage", name: "Sage", color: "#DDE8D2" },
  { id: "solid_sky", name: "Sky", color: "#D6EAF8" },
  { id: "solid_lavender", name: "Lavender", color: "#E3D9F8" },
  { id: "solid_cream", name: "Cream", color: "#F1E2D0" },
] as const;

const AFFIRMATIONS = [
  "I am allowed to take things one step at a time.",
  "My feelings are valid, and I can meet them with kindness.",
  "I do not have to be perfect to be proud of myself.",
  "Small progress is still progress.",
  "I can rest without feeling guilty.",
  "I am learning more about myself every day.",
  "I deserve patience, especially from myself.",
  "I can begin again whenever I need to.",
  "I am capable of handling today as it comes.",
  "My best can look different from day to day.",
  "I can celebrate the little things.",
  "I am growing at my own pace.",
  "I can choose kindness toward myself.",
  "I am more than one difficult day.",
  "I can make space for both joy and hard feelings.",
  "I trust myself to keep moving forward.",
  "I am worthy of the care I give to others.",
  "I can pause, breathe, and start again.",
  "There is no single right way to grow.",
  "I am becoming someone I can be proud of.",
] as const;

function getSolidBackground(id?: string | null) {
  return SOLID_BACKGROUNDS.find((item) => item.id === id) || null;
}

function defaultSolidBackground(themeName: ThemeName) {
  if (themeName === "blue") return "solid_sky";
  if (themeName === "green") return "solid_mint";
  if (themeName === "purple") return "solid_lavender";
  if (themeName === "yellow") return "solid_butter";
  return "solid_blush";
}

function EntryBackground({ id, style, imageStyle, children }: any) {
  const solid = getSolidBackground(id);
  if (solid)
    return (
      <View style={[style, { backgroundColor: solid.color }]}>{children}</View>
    );
  return (
    <ImageBackground
      source={findImageSource(id)}
      style={style}
      imageStyle={imageStyle}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

function usePalette(themeName: ThemeName): ThemePalette {
  return THEME_META[themeName].palette;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Good night";
}

function dateString() {
  return new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
}

function moodInfo(id?: string) {
  return MOODS.find((m) => m.id === id) || MOODS[2];
}

function AButton({
  children,
  onPress,
  style,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const down = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  const up = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  const flat = StyleSheet.flatten(style) || {};

  return (
    <Animated.View
      style={[
        { alignSelf: flat.alignSelf || "auto" },
        style,
        {
          transform: [{ scale }],
          opacity: disabled ? 0.55 : 1,
        },
      ]}
    >
      <Pressable
        disabled={disabled}
        onPressIn={down}
        onPressOut={up}
        onPress={onPress}
        style={{
          flex: flat.flex ?? undefined,
          width: flat.width ?? "auto",
          alignSelf: flat.alignSelf || "auto",
          flexDirection: flat.flexDirection || "column",
          alignItems: flat.alignItems || "center",
          justifyContent: flat.justifyContent || "center",
          gap: flat.gap,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function ScreenTransition({
  screenKey,
  children,
}: {
  screenKey: string;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    opacity.setValue(0);
    y.setValue(18);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.spring(y, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [screenKey]);
  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY: y }] }}>
      {children}
    </Animated.View>
  );
}

function IconBubble({
  name,
  color,
  bg,
  size = 42,
}: {
  name: any;
  color: string;
  bg: string;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.iconBubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Ionicons name={name} size={size * 0.48} color={color} />
    </View>
  );
}

function Header({
  title,
  subtitle,
  palette,
  onBack,
  onTheme,
  icon = "book-outline",
}: {
  title: string;
  subtitle: string;
  palette: any;
  onBack?: () => void;
  onTheme?: () => void;
  icon?: any;
}) {
  return (
    <View style={styles.header}>
      <AButton
        onPress={onBack}
        style={[
          styles.headerIcon,
          { backgroundColor: palette.soft, borderColor: palette.line },
        ]}
      >
        <Ionicons
          name={onBack ? "chevron-back" : icon}
          size={22}
          color={palette.primary}
        />
      </AButton>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: palette.text }]}>
          {title}
        </Text>
        <Text style={[styles.headerSubtitle, { color: palette.muted }]}>
          {subtitle}
        </Text>
      </View>
      {onTheme ? (
        <AButton
          onPress={onTheme}
          style={[
            styles.headerIcon,
            { backgroundColor: palette.soft, borderColor: palette.line },
          ]}
        >
          <Ionicons name="moon-outline" size={21} color={palette.primary} />
        </AButton>
      ) : null}
    </View>
  );
}

function GlobalBottomNav({
  active,
  palette,
  go,
}: {
  active: string;
  palette: any;
  go: (s: Screen) => void;
}) {
  const items = [
    ["dashboard", "home-outline", "Dashboard"],
    ["journal", "book-outline", "Journal"],
    ["tasks", "checkmark-circle-outline", "Tasks"],
    ["study", "key-outline", "Study"],
    ["profile", "person-outline", "Profile"],
  ] as const;

  return (
    <View
      style={[
        styles.bottomNav,
        styles.globalBottomNav,
        { backgroundColor: palette.card, borderColor: palette.line },
      ]}
    >
      {items.map(([key, icon, label]) => {
        const selected = active === key;
        return (
          <AButton
            key={key}
            onPress={() => go(key as Screen)}
            style={styles.globalNavButton}
          >
            <View
              style={[
                styles.globalNavIcon,
                selected && { backgroundColor: palette.soft },
              ]}
            >
              <Ionicons
                name={
                  selected
                    ? (icon.replace("-outline", "") as any)
                    : (icon as any)
                }
                size={23}
                color={selected ? palette.primary : palette.muted}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: selected ? palette.primary : palette.muted },
              ]}
            >
              {label}
            </Text>
          </AButton>
        );
      })}
    </View>
  );
}

function JournalBottomNav({
  active,
  palette,
  go,
}: {
  active: string;
  palette: any;
  go: (s: Screen) => void;
}) {
  const items = [
    ["dashboard", "home-outline", "Home"],
    ["explore", "compass-outline", "Explore"],
    ["newEntry", "add", ""],
    ["journal", "book-outline", "Journal"],
    ["profile", "person-outline", "Profile"],
  ] as const;

  return (
    <View
      style={[
        styles.bottomNav,
        styles.journalBottomNav,
        { backgroundColor: palette.card, borderColor: palette.line },
      ]}
    >
      {items.map(([key, icon, label]) => {
        const selected = active === key;
        if (key === "newEntry") {
          return (
            <AButton
              key={key}
              onPress={() => go("newEntry")}
              style={[styles.centerFab, { backgroundColor: palette.primary }]}
            >
              <Ionicons name="add" size={34} color="#fff" />
            </AButton>
          );
        }
        return (
          <AButton
            key={key}
            onPress={() => go(key as Screen)}
            style={styles.navButton}
          >
            <View
              style={[
                styles.navIconWrap,
                selected && { backgroundColor: palette.soft },
              ]}
            >
              <Ionicons
                name={
                  selected
                    ? (icon.replace("-outline", "") as any)
                    : (icon as any)
                }
                size={23}
                color={selected ? palette.primary : palette.muted}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                { color: selected ? palette.primary : palette.muted },
              ]}
            >
              {label}
            </Text>
          </AButton>
        );
      })}
    </View>
  );
}

function CloudDecor({ palette }: { palette: any }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View
        style={[styles.cloud, styles.cloud1, { backgroundColor: palette.soft }]}
      />
      <View
        style={[styles.cloud, styles.cloud2, { backgroundColor: palette.card }]}
      />
      <View
        style={[styles.cloud, styles.cloud3, { backgroundColor: palette.bg2 }]}
      />
      <View
        style={[
          styles.mountain,
          { borderBottomColor: palette.primary2 + "30" },
        ]}
      />
      <View
        style={[
          styles.mountainSmall,
          { borderBottomColor: palette.primary + "18" },
        ]}
      />
    </View>
  );
}

function ProgressRing({ score, palette }: { score: number; palette: any }) {
  return (
    <View style={[styles.ringOuter, { borderColor: palette.primary2 + "55" }]}>
      <View style={[styles.ringInner, { backgroundColor: palette.soft }]}>
        <Text style={[styles.ringScore, { color: palette.text }]}>
          {score}%
        </Text>
        <Text style={[styles.ringLabel, { color: palette.muted }]}>
          Aimscore
        </Text>
      </View>
    </View>
  );
}

function Dashboard({
  palette,
  nickname,
  journalsCount,
  weeklyCompleted,
  weeklyTotal,
  activeGoals,
  minutesToday,
  go,
  setTheme,
  themeName,
}: any) {
  const score = weeklyTotal
    ? Math.round((weeklyCompleted / weeklyTotal) * 100)
    : 0;
  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <CloudDecor palette={palette} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardTop}>
            <AButton onPress={() => go("profile")} style={styles.identity}>
              <IconBubble
                name="person-outline"
                color={palette.primary}
                bg={palette.soft}
                size={48}
              />
              <View>
                <Text style={[styles.greeting, { color: palette.text }]}>
                  {greeting()},
                </Text>
                <Text style={[styles.nameText, { color: palette.text }]}>
                  {nickname}! <Text style={{ fontSize: 14 }}>☆</Text>
                </Text>
              </View>
            </AButton>
            <View style={styles.topActions}>
              <AButton onPress={() => go("journal")} style={styles.smallIcon}>
                <Ionicons
                  name="search-outline"
                  size={21}
                  color={palette.primary}
                />
              </AButton>
              <AButton
                onPress={() => {
                  const names = Object.keys(THEME_META) as ThemeName[];
                  const next =
                    names[(names.indexOf(themeName) + 1) % names.length];
                  setTheme(next);
                }}
                style={styles.smallIcon}
              >
                <Ionicons
                  name="moon-outline"
                  size={21}
                  color={palette.primary}
                />
              </AButton>
            </View>
          </View>

          <View
            style={[
              styles.welcomeCard,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeTitle, { color: palette.text }]}>
                {greeting()},
              </Text>
              <Text style={[styles.welcomeTitle, { color: palette.primary }]}>
                {nickname}!
              </Text>
              <Text
                style={[
                  styles.smallText,
                  { color: palette.muted, marginTop: 7 },
                ]}
              >
                Today is a new page.{"\n"}What will you write about?
              </Text>
            </View>
            <View
              style={[styles.welcomeArt, { backgroundColor: palette.soft }]}
            >
              <Ionicons
                name="partly-sunny-outline"
                size={48}
                color={palette.primary2}
              />
              <Ionicons
                name="triangle-outline"
                size={54}
                color={palette.primary + "55"}
                style={{ position: "absolute", bottom: -5, right: 6 }}
              />
            </View>
          </View>

          <View
            style={[
              styles.progressCard,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Ionicons
                  name="radio-button-on-outline"
                  size={15}
                  color={palette.primary}
                />
                <Text
                  style={[styles.cardSectionTitle, { color: palette.text }]}
                >
                  Your Progress
                </Text>
              </View>
              <Text style={[styles.progressNumber, { color: palette.text }]}>
                {weeklyCompleted}/{weeklyTotal}
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                weekly tasks done
              </Text>
            </View>
            <ProgressRing score={score} palette={palette} />
          </View>

          <View style={[styles.reminder, { backgroundColor: palette.purple }]}>
            <IconBubble
              name="sparkles-outline"
              color="#6742C2"
              bg="#DCCBFF"
              size={44}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardSectionTitle, { color: palette.text }]}>
                A Gentle Reminder
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                You're allowed to grow at your own pace.
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              [
                "book-outline",
                journalsCount,
                "journal entries",
                palette.yellow,
              ],
              ["sparkles-outline", activeGoals, "active goals", palette.pink],
              ["time-outline", minutesToday, "mins today", palette.blue],
            ].map(([icon, value, label, bg], i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: bg }]}>
                <Ionicons name={icon as any} size={25} color={palette.text} />
                <Text style={[styles.statNumber, { color: palette.text }]}>
                  {value}
                </Text>
                <Text style={[styles.statLabel, { color: palette.muted }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.loopTitle, { color: palette.primary }]}>
            YOUR THRIVE LOOP
          </Text>
          {[
            [
              "journal",
              "book-outline",
              "Journal",
              "Reflect. Grow. Repeat.",
              palette.yellow,
            ],
            [
              "tasks",
              "checkmark-circle-outline",
              "Task Manager",
              "Plan. Focus. Finish.",
              palette.pink,
            ],
            [
              "study",
              "key-outline",
              "Study Technique",
              "Study smarter, not harder.",
              palette.blue,
            ],
            [
              "goals",
              "flag-outline",
              "Goals",
              "Grow with purpose.",
              palette.purple,
            ],
            [
              "leisure",
              "leaf-outline",
              "Leisure",
              "Make space for yourself.",
              palette.green,
            ],
          ].map(([key, icon, title, sub, bg]) => (
            <AButton
              key={key}
              onPress={() => go(key as Screen)}
              style={[styles.moduleCard, { backgroundColor: bg }]}
            >
              <IconBubble
                name={icon as any}
                color={palette.primary}
                bg="#FFFFFF55"
                size={48}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.moduleTitle, { color: palette.text }]}>
                  {title}
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  {sub}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={palette.primary}
              />
            </AButton>
          ))}
          <View style={{ height: 110 }} />
        </ScrollView>
        <GlobalBottomNav active="dashboard" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}

function QuickMessagesModal({
  visible,
  palette,
  close,
  reload,
  go,
  themeName,
}: any) {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  const quickMessages = [
    ["sunny", "I'm feeling grateful today.", "sunny-outline"],
    ["cloudy", "It's been a hard day.", "cloud-outline"],
    ["proud", "I'm proud of myself.", "star-outline"],
    ["overwhelmed", "I'm feeling a little overwhelmed.", "leaf-outline"],
    ["good", "Today was actually a good day.", "heart-outline"],
    ["okay", "I'm just feeling okay.", "flower-outline"],
    ["excited", "I'm excited about what's ahead.", "sparkles-outline"],
    ["sad", "I'm feeling a bit sad today.", "water-outline"],
  ] as const;

  useEffect(() => {
    if (!visible) {
      setContent("");
      setSelected("");
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
        title: "Quick Reflection",
        content: text,
        mood:
          selected === quickMessages[0][1]
            ? "happy"
            : selected === quickMessages[2][1]
              ? "loved"
              : selected === quickMessages[7][1]
                ? "sad"
                : "calm",
        entry_date: dateString(),
        bg_theme: defaultSolidBackground(themeName as ThemeName),
        photo_uri: null,
      });
      await reload();
      close();
      go("journal");
    } catch (error) {
      Alert.alert(
        "Could not save",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={close}
    >
      <View style={styles.quickBackdrop}>
        <View
          style={[
            styles.quickModal,
            { backgroundColor: palette.card, borderColor: palette.line },
          ]}
        >
          <View style={styles.quickHandle} />
          <View style={styles.rowBetween}>
            <View style={styles.quickTitleRow}>
              <IconBubble
                name="sunny-outline"
                color={palette.primary}
                bg={palette.soft}
                size={42}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickTitle, { color: palette.text }]}>
                  What's on your mind?
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  Choose a message or write your own.
                </Text>
              </View>
            </View>
            <AButton
              onPress={close}
              style={[styles.quickClose, { backgroundColor: palette.soft }]}
            >
              <Ionicons name="close" size={20} color={palette.text} />
            </AButton>
          </View>

          <Text style={[styles.quickSectionLabel, { color: palette.text }]}>
            Quick Messages
          </Text>
          <View style={styles.quickGrid}>
            {quickMessages.map(([id, message, icon]) => {
              const active = selected === message;
              return (
                <AButton
                  key={id}
                  onPress={() => choose(message)}
                  style={[
                    styles.quickChoice,
                    {
                      backgroundColor: active ? palette.soft : palette.bg2,
                      borderColor: active ? palette.primary : palette.line,
                    },
                  ]}
                >
                  <IconBubble
                    name={icon as any}
                    color={palette.primary}
                    bg="#FFFFFF88"
                    size={32}
                  />
                  <Text
                    numberOfLines={2}
                    style={[styles.quickChoiceText, { color: palette.text }]}
                  >
                    {message}
                  </Text>
                </AButton>
              );
            })}
          </View>

          <Text
            style={[
              styles.quickSectionLabel,
              { color: palette.text, marginTop: 12 },
            ]}
          >
            Or write your own
          </Text>
          <TextInput
            value={content}
            onChangeText={(value) => {
              setContent(value);
              setSelected("");
            }}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Share what's on your mind..."
            placeholderTextColor={palette.muted}
            style={[
              styles.quickInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />
          <Text style={[styles.quickCounter, { color: palette.muted }]}>
            {content.length}/500
          </Text>

          <AButton
            onPress={() => {
              close();
              go("newEntry");
            }}
            style={styles.fullEntryLink}
          >
            <Ionicons name="create-outline" size={14} color={palette.primary} />
            <Text
              style={[styles.fullEntryLinkText, { color: palette.primary }]}
            >
              Write a full entry instead
            </Text>
          </AButton>

          <View style={styles.actionRow}>
            <AButton
              onPress={close}
              style={[
                styles.secondaryButton,
                { backgroundColor: palette.soft },
              ]}
            >
              <Text style={[styles.buttonText, { color: palette.muted }]}>
                Cancel
              </Text>
            </AButton>
            <AButton
              disabled={!content.trim() || saving}
              onPress={save}
              style={[
                styles.primaryButton,
                { backgroundColor: palette.primary },
              ]}
            >
              <Ionicons name="paper-plane-outline" size={17} color="#fff" />
              <Text style={styles.buttonTextWhite}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </AButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function JournalHome({
  palette,
  journals,
  go,
  search,
  setSearch,
  reload,
  themeName,
}: any) {
  const [tab, setTab] = useState<"all" | "mine" | "favorites">("all");
  const [query, setQuery] = useState("");

  const filtered = journals.filter((j: any) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q || `${j.title || ""} ${j.content || ""}`.toLowerCase().includes(q);
    const matchesTab =
      tab === "favorites" ? Number(j.is_favorite || 0) === 1 : true;
    return matchesSearch && matchesTab;
  });

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <StatusBar hidden />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.journalListScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardTop}>
            <View style={styles.identity}>
              <IconBubble
                name="book-outline"
                color={palette.primary}
                bg={palette.soft}
                size={48}
              />
              <View>
                <Text style={[styles.headerTitle, { color: palette.text }]}>
                  Journal
                </Text>
                <Text style={[styles.headerSubtitle, { color: palette.muted }]}>
                  Your thoughts, your space.
                </Text>
              </View>
            </View>
            <View style={styles.topActions}>
              <AButton
                onPress={() => setSearch(!search)}
                style={[
                  styles.smallIcon,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.line,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={21}
                  color={palette.primary}
                />
              </AButton>
              <AButton
                onPress={() => go("profile")}
                style={[
                  styles.smallIcon,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.line,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={21}
                  color={palette.primary}
                />
              </AButton>
            </View>
          </View>

          {search && (
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.line,
                  marginBottom: 12,
                },
              ]}
            >
              <Ionicons name="search-outline" size={19} color={palette.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your entries..."
                placeholderTextColor={palette.muted}
                style={[styles.input, { color: palette.text }]}
                autoFocus
              />
              <AButton
                onPress={() => {
                  setQuery("");
                  setSearch(false);
                }}
                style={{
                  width: 32,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={palette.muted} />
              </AButton>
            </View>
          )}

          <View
            style={[
              styles.journalTabs,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            {[
              ["all", "All"],
              ["mine", "My Entries"],
              ["favorites", "Favorites"],
            ].map(([key, label]) => {
              const active = tab === key;
              return (
                <AButton
                  key={key}
                  onPress={() => setTab(key as any)}
                  style={[
                    styles.journalTab,
                    {
                      backgroundColor: active ? palette.primary : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.journalTabText,
                      { color: active ? "#fff" : palette.muted },
                    ]}
                  >
                    {label}
                  </Text>
                </AButton>
              );
            })}
          </View>

          <View style={styles.journalSectionHeader}>
            <View>
              <Text
                style={[
                  styles.loopTitle,
                  { color: palette.primary, marginBottom: 2 },
                ]}
              >
                YOUR ENTRIES
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                {filtered.length} {filtered.length === 1 ? "page" : "pages"}{" "}
                saved
              </Text>
            </View>
          </View>

          {filtered.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.line,
                  marginTop: 8,
                },
              ]}
            >
              <IconBubble
                name="book-outline"
                color={palette.primary}
                bg={palette.soft}
                size={62}
              />
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: palette.text, marginTop: 12, fontSize: 16 },
                ]}
              >
                {tab === "favorites"
                  ? "No favorite entries yet."
                  : "Your first page is waiting."}
              </Text>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: palette.muted,
                    textAlign: "center",
                    marginTop: 5,
                    maxWidth: 260,
                  },
                ]}
              >
                Tap the + button below to write something that belongs to you.
              </Text>
            </View>
          ) : (
            filtered.slice(0, 30).map((entry: any) => {
              const mood = moodInfo(entry.mood);
              const favorite = Number(entry.is_favorite || 0) === 1;
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.journalListCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.line,
                    },
                  ]}
                >
                  <AButton
                    onPress={() => go(`read:${entry.id}` as any)}
                    style={styles.journalListMainButton}
                  >
                    <EntryBackground
                      id={entry.bg_theme}
                      style={styles.journalListThumb}
                      imageStyle={{ borderRadius: 14 }}
                    />
                    <View style={styles.journalListContent}>
                      <View style={styles.journalListTopRow}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.journalListTitle,
                            { color: palette.text },
                          ]}
                        >
                          {entry.title || "Untitled Entry"}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.journalListDate,
                          { color: palette.muted },
                        ]}
                      >
                        {entry.entry_date || "No date"}
                      </Text>
                      <View
                        style={[
                          styles.journalMoodPill,
                          { backgroundColor: palette.soft },
                        ]}
                      >
                        <Ionicons
                          name={mood.icon as any}
                          size={12}
                          color={palette.primary}
                        />
                        <Text
                          style={[
                            styles.journalMoodText,
                            { color: palette.primary },
                          ]}
                        >
                          {mood.label}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.journalListPreview,
                          { color: palette.muted },
                        ]}
                      >
                        {entry.content || "No text in this entry."}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={palette.muted}
                    />
                  </AButton>
                  <AButton
                    onPress={async () => {
                      try {
                        await toggleJournalFavorite(entry.id, !favorite);
                        await reload();
                      } catch (error) {
                        Alert.alert(
                          "Could not update favorite",
                          error instanceof Error
                            ? error.message
                            : String(error),
                        );
                      }
                    }}
                    style={styles.favoriteButton}
                  >
                    <Ionicons
                      name={favorite ? "star" : "star-outline"}
                      size={22}
                      color={favorite ? "#F4B400" : palette.muted}
                    />
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

function MoodRow({ selected, setSelected, palette }: any) {
  return (
    <View style={styles.moodRow}>
      {MOODS.map((m) => {
        const active = selected === m.id;
        return (
          <AButton
            key={m.id}
            onPress={() => setSelected(m.id)}
            style={styles.moodItem}
          >
            <View
              style={[
                styles.moodCircle,
                {
                  backgroundColor: active ? palette.soft : "#FFFFFFAA",
                  borderColor: active ? palette.primary : palette.line,
                },
              ]}
            >
              <Ionicons
                name={m.icon as any}
                size={22}
                color={active ? palette.primary : palette.muted}
              />
            </View>
            <Text style={[styles.moodLabel, { color: palette.muted }]}>
              {m.label}
            </Text>
          </AButton>
        );
      })}
    </View>
  );
}

function BackgroundChooser({ selected, setSelected, palette }: any) {
  const [mode, setMode] = useState<"colors" | "patterns">("colors");
  const [activeCategory, setActiveCategory] = useState("pink");
  const activeGroup =
    BACKGROUND_CATEGORIES.find(
      (category: any) => category.id === activeCategory,
    ) || BACKGROUND_CATEGORIES[0];

  return (
    <View
      style={[
        styles.inlineBackgroundChooser,
        { backgroundColor: palette.card, borderColor: palette.line },
      ]}
    >
      <View style={styles.row}>
        <IconBubble
          name="images-outline"
          color={palette.primary}
          bg={palette.soft}
          size={42}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardSectionTitle, { color: palette.text }]}>
            Journal Background
          </Text>
          <Text style={[styles.smallText, { color: palette.muted }]}>
            Pick one of the 8 pastel colors or your original patterns.
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.backgroundModeRow,
          { backgroundColor: palette.soft, marginTop: 12 },
        ]}
      >
        <AButton
          onPress={() => setMode("colors")}
          style={[
            styles.backgroundModeButton,
            mode === "colors" && { backgroundColor: palette.card },
          ]}
        >
          <Ionicons
            name="color-palette-outline"
            size={17}
            color={mode === "colors" ? palette.primary : palette.muted}
          />
          <Text
            style={[
              styles.backgroundModeText,
              { color: mode === "colors" ? palette.primary : palette.muted },
            ]}
          >
            Pastel Colors
          </Text>
        </AButton>
        <AButton
          onPress={() => setMode("patterns")}
          style={[
            styles.backgroundModeButton,
            mode === "patterns" && { backgroundColor: palette.card },
          ]}
        >
          <Ionicons
            name="images-outline"
            size={17}
            color={mode === "patterns" ? palette.primary : palette.muted}
          />
          <Text
            style={[
              styles.backgroundModeText,
              { color: mode === "patterns" ? palette.primary : palette.muted },
            ]}
          >
            Patterns
          </Text>
        </AButton>
      </View>

      {mode === "colors" ? (
        <>
          <Text style={[styles.pickerSectionTitle, { color: palette.text }]}>
            8 pastel colors
          </Text>
          <View style={styles.solidColorGrid}>
            {SOLID_BACKGROUNDS.map((item) => {
              const active = selected === item.id;
              return (
                <AButton
                  key={item.id}
                  onPress={() => setSelected(item.id)}
                  style={[
                    styles.solidColorTile,
                    {
                      backgroundColor: item.color,
                      borderColor: active ? palette.primary : "#FFFFFFAA",
                      borderWidth: active ? 3 : 1,
                    },
                  ]}
                >
                  <View style={styles.solidColorNamePill}>
                    <Text style={styles.solidColorName}>{item.name}</Text>
                  </View>
                  {active ? (
                    <View
                      style={[
                        styles.solidColorCheck,
                        { backgroundColor: palette.primary },
                      ]}
                    >
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
          <Text style={[styles.pickerSectionTitle, { color: palette.text }]}>
            Your journal patterns
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.patternCategoryRow}
          >
            {BACKGROUND_CATEGORIES.map((category: any) => {
              const active = category.id === activeCategory;
              return (
                <AButton
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  style={[
                    styles.patternCategoryButton,
                    {
                      backgroundColor: active ? palette.primary : palette.soft,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : palette.text,
                      fontWeight: "800",
                      fontSize: 12,
                    }}
                  >
                    {category.label}
                  </Text>
                </AButton>
              );
            })}
          </ScrollView>

          <View style={styles.patternGrid}>
            {activeGroup?.items.map((item: any) => {
              const active = selected === item.id;
              return (
                <AButton
                  key={item.id}
                  onPress={() => setSelected(item.id)}
                  style={[
                    styles.patternTile,
                    {
                      borderColor: active ? palette.primary : palette.line,
                      borderWidth: active ? 3 : 1,
                    },
                  ]}
                >
                  <ImageBackground
                    source={item.image}
                    resizeMode="cover"
                    style={styles.patternTileImage}
                    imageStyle={{ borderRadius: 14 }}
                  >
                    {active ? (
                      <View
                        style={[
                          styles.patternCheck,
                          { backgroundColor: palette.primary },
                        ]}
                      >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      </View>
                    ) : null}
                    <View style={styles.patternNamePill}>
                      <Text style={styles.solidColorName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  </ImageBackground>
                </AButton>
              );
            })}
          </View>
        </>
      )}

      <View
        style={[
          styles.selectedBackgroundHint,
          { backgroundColor: palette.soft },
        ]}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={17}
          color={palette.primary}
        />
        <Text style={[styles.smallText, { color: palette.muted, flex: 1 }]}>
          Your selected background will be saved with this entry.
        </Text>
      </View>
    </View>
  );
}

function NewEntry({ palette, go, themeName, reload }: any) {
  const [date, setDate] = useState(dateString());
  const [mood, setMood] = useState("calm");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bg, setBg] = useState(defaultSolidBackground(themeName as ThemeName));
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQuickReflection, setShowQuickReflection] = useState(false);

  const quickMessages = [
    ["sunny-outline", "I'm feeling grateful today."],
    ["cloud-outline", "It's been a hard day."],
    ["star-outline", "I'm proud of myself."],
    ["leaf-outline", "I'm feeling a little overwhelmed."],
    ["heart-outline", "Today was actually a good day."],
    ["flower-outline", "I'm just feeling okay."],
    ["sparkles-outline", "I'm excited about what's ahead."],
    ["water-outline", "I'm feeling a bit sad today."],
  ] as const;

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo permission",
        "Please allow photo access to attach a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) setPhoto(result.assets[0]?.uri || null);
  };

  const save = async () => {
    if (!content.trim()) {
      Alert.alert("Your entry is empty", "Write something before saving.");
      return;
    }
    try {
      setSaving(true);
      await createJournal({
        title: title.trim() || "Untitled Entry",
        content: content.trim(),
        mood,
        entry_date: date.trim() || dateString(),
        bg_theme: bg,
        photo_uri: photo,
      });
      await reload();
      go("journal");
    } catch (e) {
      Alert.alert("Could not save", e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="New Entry"
            subtitle="Give today a page."
            palette={palette}
            onBack={() => go("journal")}
            icon="chevron-back"
          />
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            Today's Date
          </Text>
          <View
            style={[
              styles.inputBox,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={19}
              color={palette.primary}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              style={[styles.input, { color: palette.text }]}
            />
            <Ionicons
              name="calendar-outline"
              size={18}
              color={palette.primary}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: palette.text }]}>Mood</Text>
          <MoodRow selected={mood} setSelected={setMood} palette={palette} />

          <AButton
            onPress={() => setShowQuickReflection((value) => !value)}
            style={[
              styles.quickReflectionToggle,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <IconBubble
              name="sparkles-outline"
              color={palette.primary}
              bg={palette.soft}
              size={38}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: palette.text, fontSize: 13 },
                ]}
              >
                Quick Reflection
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                Choose a message or write your own below.
              </Text>
            </View>
            <Ionicons
              name={showQuickReflection ? "chevron-up" : "chevron-down"}
              size={19}
              color={palette.primary}
            />
          </AButton>

          {showQuickReflection ? (
            <View
              style={[
                styles.quickReflectionPanel,
                { backgroundColor: palette.card, borderColor: palette.line },
              ]}
            >
              <Text style={[styles.quickSectionLabel, { color: palette.text }]}>
                Quick Messages
              </Text>
              <View style={styles.quickGrid}>
                {quickMessages.map(([icon, message]) => (
                  <AButton
                    key={message}
                    onPress={() =>
                      setContent((previous) =>
                        previous.trim()
                          ? `${previous.trim()} ${message}`
                          : message,
                      )
                    }
                    style={[
                      styles.quickChoice,
                      {
                        backgroundColor: palette.bg2,
                        borderColor: palette.line,
                      },
                    ]}
                  >
                    <IconBubble
                      name={icon as any}
                      color={palette.primary}
                      bg="#FFFFFF88"
                      size={31}
                    />
                    <Text
                      numberOfLines={2}
                      style={[styles.quickChoiceText, { color: palette.text }]}
                    >
                      {message}
                    </Text>
                  </AButton>
                ))}
              </View>
              <Text
                style={[
                  styles.smallText,
                  { color: palette.muted, marginTop: 8 },
                ]}
              >
                Tap a message to add it to your thoughts.
              </Text>
            </View>
          ) : null}

          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            Title (optional)
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            placeholder="Give your entry a title..."
            placeholderTextColor={palette.muted}
            style={[
              styles.textInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />

          <View style={styles.rowBetween}>
            <Text style={[styles.fieldLabel, { color: palette.text }]}>
              Your Thoughts
            </Text>
            <Text style={[styles.counter, { color: palette.muted }]}>
              {content.length}/2000
            </Text>
          </View>
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={2000}
            textAlignVertical="top"
            placeholder="Write about your day, your feelings, what's on your mind..."
            placeholderTextColor={palette.muted}
            style={[
              styles.bodyInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />

          <BackgroundChooser
            selected={bg}
            setSelected={setBg}
            palette={palette}
          />

          <AButton
            onPress={pickPhoto}
            style={[
              styles.photoBox,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
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
                <Ionicons
                  name="images-outline"
                  size={26}
                  color={palette.primary}
                />
                <Text
                  style={[
                    styles.cardSectionTitle,
                    { color: palette.text, fontSize: 13 },
                  ]}
                >
                  Add a photo
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  Optional — choose one image from your gallery.
                </Text>
              </>
            )}
          </AButton>

          <View style={[styles.actionRow, { marginTop: 18 }]}>
            <AButton
              onPress={() => go("journal")}
              style={[
                styles.secondaryButton,
                { backgroundColor: palette.soft },
              ]}
            >
              <Text style={[styles.buttonText, { color: palette.muted }]}>
                Cancel
              </Text>
            </AButton>
            <AButton
              disabled={saving}
              onPress={save}
              style={[
                styles.primaryButton,
                { backgroundColor: palette.primary },
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonTextWhite}>
                {saving ? "Saving..." : "Save Entry"}
              </Text>
            </AButton>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
        <JournalBottomNav active="newEntry" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}

function ReadEntry({ entry, palette, go, reload }: any) {
  if (!entry) return null;
  const mood = moodInfo(entry.mood);
  const favorite = Number(entry.is_favorite || 0) === 1;
  const toggleFavorite = async () => {
    await toggleJournalFavorite(entry.id, !favorite);
    await reload();
  };
  const remove = () => {
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteJournal(entry.id);
          await reload();
          go("journal");
        },
      },
    ]);
  };
  return (
    <View style={styles.readScreen}>
      <EntryBackground
        id={entry.bg_theme}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.9 }}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: palette.primary + "55" },
          ]}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.readTop}>
            <AButton onPress={() => go("journal")} style={styles.readRound}>
              <Ionicons name="chevron-back" size={21} color="#fff" />
            </AButton>
            <Text style={styles.readDate}>{entry.entry_date}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <AButton onPress={toggleFavorite} style={styles.readRound}>
                <Ionicons
                  name={favorite ? "star" : "star-outline"}
                  size={20}
                  color={favorite ? "#FFD35A" : "#fff"}
                />
              </AButton>
              <AButton onPress={remove} style={styles.readRound}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </AButton>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.readScroll}>
            <View
              style={[
                styles.readGlass,
                {
                  backgroundColor: palette.text + "D9",
                  borderColor: "#FFFFFF55",
                },
              ]}
            >
              <Text style={styles.readTitle}>
                {entry.title || "Untitled Entry"}
              </Text>
              <View style={styles.readMood}>
                <Ionicons name={mood.icon as any} size={15} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {mood.label}
                </Text>
              </View>
              {entry.photo_uri ? (
                <Image
                  source={{ uri: entry.photo_uri }}
                  style={styles.attachedPhoto}
                />
              ) : null}
              <Text style={styles.readContent}>{entry.content}</Text>
              <Text
                style={[styles.fieldLabel, { color: "#fff", marginTop: 20 }]}
              >
                Mood
              </Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <View key={m.id} style={styles.readMoodItem}>
                    <View style={styles.readMoodCircle}>
                      <Ionicons name={m.icon as any} size={20} color="#fff" />
                    </View>
                    <Text style={{ color: "#fff", fontSize: 10 }}>
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.actionRow}>
                <AButton
                  onPress={() => go(`edit:${entry.id}` as any)}
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: "#FFFFFF22",
                      borderColor: "#FFFFFF44",
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.buttonTextWhite}>Edit</Text>
                </AButton>
                <AButton
                  onPress={remove}
                  style={[
                    styles.secondaryButton,
                    {
                      backgroundColor: "#FFFFFF22",
                      borderColor: "#FFFFFF44",
                      borderWidth: 1,
                    },
                  ]}
                >
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

function EditEntry({ entry, palette, go, reload }: any) {
  const [title, setTitle] = useState(entry?.title || "");
  const [content, setContent] = useState(entry?.content || "");
  const [mood, setMood] = useState(entry?.mood || "calm");
  const [bg, setBg] = useState(entry?.bg_theme || "b_2");
  const [saving, setSaving] = useState(false);

  if (!entry) return null;

  const save = async () => {
    if (!content.trim())
      return Alert.alert(
        "Your entry is empty",
        "Write something before saving.",
      );
    if (saving) return;
    try {
      setSaving(true);
      await initializeDatabase();
      await updateJournal(entry.id, {
        title: title.trim() || "Untitled Entry",
        content: content.trim(),
        mood,
        bg_theme: bg,
      });
      await reload();
      go(`read:${entry.id}` as any);
    } catch (error) {
      Alert.alert(
        "Could not save changes",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Edit Entry"
            subtitle="Keep what changed."
            palette={palette}
            onBack={() => go(`read:${entry.id}` as any)}
          />
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            Title
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[
              styles.textInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />
          <Text style={[styles.fieldLabel, { color: palette.text }]}>Mood</Text>
          <MoodRow selected={mood} setSelected={setMood} palette={palette} />
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            Your Thoughts
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={[
              styles.bodyInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />

          <BackgroundChooser
            selected={bg}
            setSelected={setBg}
            palette={palette}
          />

          <View style={styles.actionRow}>
            <AButton
              onPress={() => go(`read:${entry.id}` as any)}
              style={[
                styles.secondaryButton,
                { backgroundColor: palette.soft },
              ]}
            >
              <Text style={[styles.buttonText, { color: palette.muted }]}>
                Cancel
              </Text>
            </AButton>
            <AButton
              disabled={saving}
              onPress={save}
              style={[
                styles.primaryButton,
                { backgroundColor: palette.primary },
              ]}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.buttonTextWhite}>
                {saving ? "Saving..." : "Save changes"}
              </Text>
            </AButton>
          </View>
        </ScrollView>
        <JournalBottomNav active="journal" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}

function Explore({ palette, journals, go }: any) {
  const [month, setMonth] = useState(new Date());
  const [tab, setTab] = useState<"calendar" | "colors" | "tips">("calendar");
  const [reflectionMood, setReflectionMood] = useState("calm");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [patternCategory, setPatternCategory] = useState("pink");

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;
  const monthName = month.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const formatCalendarDate = (day: number) =>
    `${String(day).padStart(2, "0")}-${String(monthIndex + 1).padStart(2, "0")}-${year}`;

  const cells = Array.from({ length: totalCells }, (_, index) => {
    if (index < mondayOffset) return null;
    const day = index - mondayOffset + 1;
    return day <= daysInMonth ? day : null;
  });

  const entryForDay = (day: number) =>
    journals.find(
      (entry: any) =>
        String(entry.entry_date || "") === formatCalendarDate(day),
    ) || null;
  const selectedEntry = selectedDayKey
    ? journals.find(
        (entry: any) => String(entry.entry_date || "") === selectedDayKey,
      ) || null
    : null;
  const selectedMood = selectedEntry ? moodInfo(selectedEntry.mood) : null;
  const activePatternGroup =
    BACKGROUND_CATEGORIES.find(
      (category: any) => category.id === patternCategory,
    ) || BACKGROUND_CATEGORIES[0];

  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Explore"
            subtitle="Discover, plan, and organize."
            palette={palette}
            onBack={() => go("dashboard")}
          />

          <View
            style={[
              styles.segment,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            {(["calendar", "colors", "tips"] as const).map((item) => (
              <AButton
                key={item}
                onPress={() => setTab(item)}
                style={
                  tab === item
                    ? [
                        styles.segmentActive,
                        { backgroundColor: palette.primary },
                      ]
                    : [styles.segmentItem, { backgroundColor: "transparent" }]
                }
              >
                <Text
                  style={
                    tab === item
                      ? styles.segmentActiveText
                      : [styles.segmentText, { color: palette.muted }]
                  }
                >
                  {item[0].toUpperCase() + item.slice(1)}
                </Text>
              </AButton>
            ))}
          </View>

          {tab === "calendar" ? (
            <>
              <View
                style={[
                  styles.calendarCard,
                  { backgroundColor: palette.card, borderColor: palette.line },
                ]}
              >
                <View style={styles.rowBetween}>
                  <AButton
                    onPress={() => {
                      setMonth(new Date(year, monthIndex - 1, 1));
                      setSelectedDayKey(null);
                    }}
                    style={styles.calendarArrowButton}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={19}
                      color={palette.primary}
                    />
                  </AButton>
                  <Text
                    style={[styles.calendarMonthTitle, { color: palette.text }]}
                  >
                    {monthName}
                  </Text>
                  <AButton
                    onPress={() => {
                      setMonth(new Date(year, monthIndex + 1, 1));
                      setSelectedDayKey(null);
                    }}
                    style={styles.calendarArrowButton}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={palette.primary}
                    />
                  </AButton>
                </View>
                <View style={styles.weekRow}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <Text
                        key={day}
                        style={[styles.weekText, { color: palette.muted }]}
                      >
                        {day}
                      </Text>
                    ),
                  )}
                </View>
                <View style={styles.calendarGrid}>
                  {cells.map((day, index) => {
                    if (day === null)
                      return (
                        <View key={`empty-${index}`} style={styles.dayCell} />
                      );
                    const dateKey = formatCalendarDate(day);
                    const entry = entryForDay(day);
                    const selected = selectedDayKey === dateKey;
                    const today = dateKey === dateString();
                    return (
                      <AButton
                        key={dateKey}
                        onPress={() => setSelectedDayKey(dateKey)}
                        style={[
                          styles.dayCell,
                          selected && { backgroundColor: palette.primary },
                          !selected &&
                            today && { backgroundColor: palette.soft },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          allowFontScaling={false}
                          style={[
                            styles.calendarDayNumber,
                            { color: selected ? "#fff" : palette.text },
                          ]}
                        >
                          {day}
                        </Text>
                        {entry ? (
                          <View
                            style={[
                              styles.dot,
                              {
                                backgroundColor: selected
                                  ? "#fff"
                                  : palette.primary,
                              },
                            ]}
                          />
                        ) : null}
                      </AButton>
                    );
                  })}
                </View>
                <View
                  style={[
                    styles.calendarHint,
                    { backgroundColor: palette.soft },
                  ]}
                >
                  <Ionicons
                    name="hand-left-outline"
                    size={15}
                    color={palette.primary}
                  />
                  <Text
                    style={[
                      styles.smallText,
                      { color: palette.muted, flex: 1 },
                    ]}
                  >
                    Tap any date to preview what you saved that day.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.reflectionCard,
                  { backgroundColor: palette.card, borderColor: palette.line },
                ]}
              >
                <View style={styles.row}>
                  <IconBubble
                    name="sunny-outline"
                    color={palette.primary}
                    bg={palette.soft}
                    size={45}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardSectionTitle, { color: palette.text }]}
                    >
                      Today's Reflection
                    </Text>
                    <Text style={[styles.smallText, { color: palette.muted }]}>
                      How are you feeling today?
                    </Text>
                  </View>
                </View>
                <MoodRow
                  selected={reflectionMood}
                  setSelected={setReflectionMood}
                  palette={palette}
                />
              </View>
              <AButton
                onPress={() => go("newEntry")}
                style={[styles.tipCard, { backgroundColor: palette.purple }]}
              >
                <IconBubble
                  name="sparkles-outline"
                  color="#6844C6"
                  bg="#FFFFFF66"
                  size={42}
                />
                <Text
                  style={[
                    styles.cardSectionTitle,
                    { color: palette.text, flex: 1 },
                  ]}
                >
                  A fresh start is always a good idea.
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={palette.primary}
                />
              </AButton>
            </>
          ) : null}

          {tab === "colors" ? (
            <>
              <Text style={[styles.loopTitle, { color: palette.primary }]}>
                8 PASTEL JOURNAL COLORS
              </Text>
              <View style={styles.exploreColorGrid}>
                {SOLID_BACKGROUNDS.map((item) => (
                  <AButton
                    key={item.id}
                    onPress={() => go("newEntry")}
                    style={[
                      styles.exploreColorCard,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <View style={styles.exploreColorLabel}>
                      <Text style={styles.solidColorName}>{item.name}</Text>
                    </View>
                  </AButton>
                ))}
              </View>
              <Text
                style={[
                  styles.smallText,
                  { color: palette.muted, marginTop: 10 },
                ]}
              >
                Tap a color to start a new entry with it.
              </Text>

              <View
                style={[
                  styles.explorePatternsSection,
                  { backgroundColor: palette.card, borderColor: palette.line },
                ]}
              >
                <View style={styles.row}>
                  <IconBubble
                    name="images-outline"
                    color={palette.primary}
                    bg={palette.soft}
                    size={42}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardSectionTitle, { color: palette.text }]}
                    >
                      Journal Patterns
                    </Text>
                    <Text style={[styles.smallText, { color: palette.muted }]}>
                      All of your original background images are still here.
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.patternCategoryRow}
                >
                  {BACKGROUND_CATEGORIES.map((category: any) => {
                    const active = category.id === patternCategory;
                    return (
                      <AButton
                        key={category.id}
                        onPress={() => setPatternCategory(category.id)}
                        style={[
                          styles.patternCategoryButton,
                          {
                            backgroundColor: active
                              ? palette.primary
                              : palette.soft,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: active ? "#fff" : palette.text,
                            fontWeight: "800",
                            fontSize: 12,
                          }}
                        >
                          {category.label}
                        </Text>
                      </AButton>
                    );
                  })}
                </ScrollView>

                <Text
                  style={[styles.patternSectionLabel, { color: palette.text }]}
                >
                  {activePatternGroup.label} patterns
                </Text>
                <View style={styles.explorePatternGrid}>
                  {activePatternGroup.items.map((item: any) => (
                    <AButton
                      key={item.id}
                      onPress={() => go("newEntry")}
                      style={[
                        styles.explorePatternTile,
                        { borderColor: palette.line },
                      ]}
                    >
                      <ImageBackground
                        source={item.image}
                        resizeMode="cover"
                        style={styles.explorePatternImage}
                        imageStyle={{ borderRadius: 15 }}
                      >
                        <View style={styles.explorePatternNamePill}>
                          <Text style={styles.solidColorName} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                      </ImageBackground>
                    </AButton>
                  ))}
                </View>
                <Text
                  style={[
                    styles.smallText,
                    { color: palette.muted, marginTop: 12 },
                  ]}
                >
                  Tap any pattern to open a new entry. You can change it again
                  before saving.
                </Text>
              </View>
            </>
          ) : null}

          {tab === "tips" ? (
            <View>
              <View
                style={[
                  styles.affirmationIntro,
                  { backgroundColor: palette.soft, borderColor: palette.line },
                ]}
              >
                <IconBubble
                  name="sparkles-outline"
                  color={palette.primary}
                  bg={palette.card}
                  size={48}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.cardSectionTitle, { color: palette.text }]}
                  >
                    20 affirmations for you
                  </Text>
                  <Text style={[styles.smallText, { color: palette.muted }]}>
                    A gentle reminder to come back to yourself.
                  </Text>
                </View>
              </View>
              {AFFIRMATIONS.map((affirmation, index) => (
                <View
                  key={index}
                  style={[
                    styles.affirmationCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.line,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.affirmationNumber,
                      { backgroundColor: palette.soft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.affirmationNumberText,
                        { color: palette.primary },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Ionicons
                    name="heart-outline"
                    size={19}
                    color={palette.primary}
                  />
                  <Text
                    style={[styles.affirmationText, { color: palette.text }]}
                  >
                    {affirmation}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={{ height: 110 }} />
        </ScrollView>
        <JournalBottomNav active="explore" palette={palette} go={go} />
      </SafeAreaView>

      <Modal
        visible={selectedDayKey !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDayKey(null)}
      >
        <View style={styles.calendarPreviewBackdrop}>
          <View
            style={[
              styles.calendarPreviewCard,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.cardSectionTitle, { color: palette.text }]}
                >
                  Day Preview
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  {selectedDayKey}
                </Text>
              </View>
              <AButton
                onPress={() => setSelectedDayKey(null)}
                style={[styles.closeButton, { backgroundColor: palette.soft }]}
              >
                <Ionicons name="close" size={21} color={palette.text} />
              </AButton>
            </View>
            {selectedEntry ? (
              <>
                <EntryBackground
                  id={selectedEntry.bg_theme}
                  style={styles.calendarPreviewImage}
                  imageStyle={{ borderRadius: 18 }}
                >
                  <View style={styles.calendarPreviewImageShade} />
                  <View style={styles.calendarPreviewGlass}>
                    <View style={styles.row}>
                      <IconBubble
                        name={selectedMood?.icon || "book-outline"}
                        color={palette.primary}
                        bg="#FFFFFFDD"
                        size={40}
                      />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={styles.calendarPreviewTitle}
                          numberOfLines={2}
                        >
                          {selectedEntry.title || "Untitled Entry"}
                        </Text>
                        <Text style={styles.calendarPreviewMood}>
                          {selectedMood?.label || "Reflection"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </EntryBackground>
                <Text
                  style={[
                    styles.calendarPreviewContent,
                    { color: palette.text },
                  ]}
                  numberOfLines={7}
                >
                  {selectedEntry.content}
                </Text>
                <View style={styles.actionRow}>
                  <AButton
                    onPress={() => {
                      setSelectedDayKey(null);
                      go(`read:${selectedEntry.id}` as any);
                    }}
                    style={[
                      styles.primaryButton,
                      { backgroundColor: palette.primary, flex: 1 },
                    ]}
                  >
                    <Ionicons name="book-outline" size={18} color="#fff" />
                    <Text style={styles.buttonTextWhite}>Open Entry</Text>
                  </AButton>
                </View>
              </>
            ) : (
              <View style={styles.emptyPreview}>
                <IconBubble
                  name="calendar-outline"
                  color={palette.primary}
                  bg={palette.soft}
                  size={58}
                />
                <Text
                  style={[
                    styles.cardSectionTitle,
                    { color: palette.text, marginTop: 12 },
                  ]}
                >
                  No reflection saved
                </Text>
                <Text
                  style={[
                    styles.smallText,
                    { color: palette.muted, textAlign: "center", marginTop: 5 },
                  ]}
                >
                  Nothing was saved for this date yet.
                </Text>
                <AButton
                  onPress={() => {
                    setSelectedDayKey(null);
                    go("newEntry");
                  }}
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: palette.primary,
                      marginTop: 16,
                      minWidth: 160,
                    },
                  ]}
                >
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

function Tasks({ palette, tasks, go, reload, category = "assignment" }: any) {
  const [title, setTitle] = useState("");
  const visible = tasks.filter((t: any) => t.category === category);
  const create = async () => {
    if (!title.trim()) return;
    await createTask({ title: title.trim(), category, priority: "Medium" });
    setTitle("");
    await reload();
  };
  const heading =
    category === "assignment"
      ? "Task Manager"
      : category === "goal"
        ? "Goals"
        : "Leisure";
  const icon =
    category === "assignment"
      ? "checkmark-circle-outline"
      : category === "goal"
        ? "flag-outline"
        : "leaf-outline";
  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Header
            title={heading}
            subtitle={
              category === "assignment"
                ? "Plan. Focus. Finish."
                : category === "goal"
                  ? "Grow with purpose."
                  : "Make space for yourself."
            }
            palette={palette}
            onBack={() => go("dashboard")}
            icon={icon}
          />
          <View
            style={[
              styles.addTaskCard,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <IconBubble
              name={icon}
              color={palette.primary}
              bg={palette.soft}
              size={46}
            />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={
                category === "assignment"
                  ? "Add a task..."
                  : category === "goal"
                    ? "Add a goal..."
                    : "Add something enjoyable..."
              }
              placeholderTextColor={palette.muted}
              style={[styles.input, { color: palette.text }]}
            />
            <AButton
              onPress={create}
              style={[styles.circleAdd, { backgroundColor: palette.primary }]}
            >
              <Ionicons name="add" size={23} color="#fff" />
            </AButton>
          </View>
          {visible.map((task: any) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                { backgroundColor: palette.card, borderColor: palette.line },
              ]}
            >
              <AButton
                onPress={async () => {
                  const done = task.status === "completed";
                  await updateTask(task.id, {
                    status: done ? "todo" : "completed",
                    progress: done ? 0 : 100,
                  });
                  await reload();
                }}
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor:
                      task.status === "completed"
                        ? palette.primary
                        : palette.soft,
                    borderColor: palette.line,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={17}
                  color={task.status === "completed" ? "#fff" : palette.primary}
                />
              </AButton>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.cardSectionTitle,
                    {
                      color: palette.text,
                      textDecorationLine:
                        task.status === "completed" ? "line-through" : "none",
                    },
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  {task.priority || "Medium"} priority ·{" "}
                  {task.status === "completed" ? "Completed" : "To do"}
                </Text>
              </View>
              <AButton
                onPress={() =>
                  Alert.alert("Delete?", "Remove this item?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        await deleteTask(task.id);
                        await reload();
                      },
                    },
                  ])
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color={palette.muted}
                />
              </AButton>
            </View>
          ))}
          {visible.length === 0 && (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: palette.card, borderColor: palette.line },
              ]}
            >
              <IconBubble
                name={icon}
                color={palette.primary}
                bg={palette.soft}
                size={60}
              />
              <Text
                style={[
                  styles.cardSectionTitle,
                  { color: palette.text, marginTop: 10 },
                ]}
              >
                Nothing here yet.
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                Add your first one above.
              </Text>
            </View>
          )}
          <View style={{ height: 110 }} />
        </ScrollView>
        <GlobalBottomNav
          active={category === "assignment" ? "tasks" : "dashboard"}
          palette={palette}
          go={go}
        />
      </SafeAreaView>
    </View>
  );
}

function Study({ palette, notes, reload, go }: any) {
  const [topic, setTopic] = useState("");
  const [active, setActive] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>(["", "", "", "", ""]);
  const labels = [
    "Explain it",
    "Simplify it",
    "Make an analogy",
    "Find the gaps",
    "Refine your understanding",
  ];
  const start = async () => {
    if (!topic.trim()) return;
    const id = await createStudyNote(topic.trim());
    await reload();
    setActive({ id, topic: topic.trim() });
    setSteps(["", "", "", "", ""]);
  };
  const save = async () => {
    if (!active) return;
    await updateStudyNote(active.id, {
      step_1_explanation: steps[0],
      step_2_simplify: steps[1],
      step_3_analogy: steps[2],
      step_4_gaps: steps[3],
      step_5_refined_understanding: steps[4],
    });
    await reload();
    Alert.alert("Saved", "Your study note is saved.");
  };
  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Header
            title="Study Technique"
            subtitle="Study smarter, not harder."
            palette={palette}
            onBack={() => go("dashboard")}
            icon="key-outline"
          />
          <View style={[styles.studyHero, { backgroundColor: palette.blue }]}>
            <IconBubble
              name="bulb-outline"
              color={palette.primary}
              bg="#FFFFFF88"
              size={50}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardSectionTitle, { color: palette.text }]}>
                5-step understanding
              </Text>
              <Text style={[styles.smallText, { color: palette.muted }]}>
                Turn a topic into something you can explain.
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.addTaskCard,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="What are you studying?"
              placeholderTextColor={palette.muted}
              style={[styles.input, { color: palette.text }]}
            />
            <AButton
              onPress={start}
              style={[
                styles.primarySmall,
                { backgroundColor: palette.primary },
              ]}
            >
              <Text style={styles.buttonTextWhite}>Start</Text>
            </AButton>
          </View>
          {active ? (
            <View
              style={[
                styles.studyCard,
                { backgroundColor: palette.card, borderColor: palette.line },
              ]}
            >
              <Text style={[styles.modalTitle, { color: palette.text }]}>
                {active.topic}
              </Text>
              {labels.map((label, i) => (
                <View key={label} style={{ marginTop: 14 }}>
                  <Text style={[styles.fieldLabel, { color: palette.text }]}>
                    {i + 1}. {label}
                  </Text>
                  <TextInput
                    value={steps[i]}
                    onChangeText={(v) =>
                      setSteps((s) => s.map((x, idx) => (idx === i ? v : x)))
                    }
                    multiline
                    placeholder="Write here..."
                    placeholderTextColor={palette.muted}
                    style={[
                      styles.stepInput,
                      {
                        color: palette.text,
                        backgroundColor: palette.soft,
                        borderColor: palette.line,
                      },
                    ]}
                  />
                </View>
              ))}
              <AButton
                onPress={save}
                style={[
                  styles.primaryButton,
                  { backgroundColor: palette.primary, marginTop: 16 },
                ]}
              >
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.buttonTextWhite}>Save Study Note</Text>
              </AButton>
            </View>
          ) : null}
          {notes.map((n: any) => (
            <View
              key={n.id}
              style={[
                styles.taskCard,
                { backgroundColor: palette.card, borderColor: palette.line },
              ]}
            >
              <IconBubble
                name="book-outline"
                color={palette.primary}
                bg={palette.soft}
                size={42}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.cardSectionTitle, { color: palette.text }]}
                >
                  {n.topic}
                </Text>
                <Text style={[styles.smallText, { color: palette.muted }]}>
                  5-step study note
                </Text>
              </View>
            </View>
          ))}
          <View style={{ height: 110 }} />
        </ScrollView>
        <GlobalBottomNav active="study" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}

function Profile({
  palette,
  nickname,
  setNickname,
  themeName,
  setTheme,
  go,
}: any) {
  const [value, setValue] = useState(nickname === "Teya" ? "" : nickname);
  const save = async () => {
    const clean = value.trim();
    await saveProfileNickname(clean || "Teya");
    setNickname(clean || "Teya");
    Alert.alert("Saved", `Your name is now ${clean || "Teya"}.`);
  };
  return (
    <View style={[styles.screen, { backgroundColor: palette.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Header
            title="Profile"
            subtitle="Make Thrive feel like yours."
            palette={palette}
            onBack={() => go("dashboard")}
            icon="person-outline"
          />
          <View
            style={[
              styles.profileHero,
              { backgroundColor: palette.card, borderColor: palette.line },
            ]}
          >
            <IconBubble
              name="person-outline"
              color={palette.primary}
              bg={palette.soft}
              size={80}
            />
            <Text style={[styles.profileName, { color: palette.text }]}>
              {nickname}
            </Text>
            <Text style={[styles.smallText, { color: palette.muted }]}>
              Your Thrive space
            </Text>
          </View>
          <Text style={[styles.fieldLabel, { color: palette.text }]}>
            Nickname
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="Teya"
            placeholderTextColor={palette.muted}
            style={[
              styles.textInput,
              {
                color: palette.text,
                backgroundColor: palette.card,
                borderColor: palette.line,
              },
            ]}
          />
          <AButton
            onPress={save}
            style={[styles.primaryButton, { backgroundColor: palette.primary }]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.buttonTextWhite}>Save nickname</Text>
          </AButton>

          <Text
            style={[styles.fieldLabel, { color: palette.text, marginTop: 24 }]}
          >
            Theme
          </Text>
          <View style={styles.themeGrid}>
            {(Object.keys(THEME_META) as ThemeName[]).map((t) => {
              const meta = THEME_META[t];
              const active = themeName === t;
              return (
                <AButton
                  key={t}
                  onPress={async () => {
                    setTheme(t);
                    await saveProfileTheme(t);
                  }}
                  style={[
                    styles.themeChoice,
                    {
                      backgroundColor: meta.palette.soft,
                      borderColor: active ? meta.palette.primary : palette.line,
                      borderWidth: active ? 2 : 1,
                    },
                  ]}
                >
                  <IconBubble
                    name={meta.icon}
                    color={meta.palette.primary}
                    bg="#FFFFFF88"
                    size={38}
                  />
                  <Text
                    style={[
                      styles.cardSectionTitle,
                      { color: meta.palette.text },
                    ]}
                  >
                    {meta.label}
                  </Text>
                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={meta.palette.primary}
                    />
                  ) : null}
                </AButton>
              );
            })}
          </View>
          <View style={{ height: 110 }} />
        </ScrollView>
        <GlobalBottomNav active="profile" palette={palette} go={go} />
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [themeName, setThemeName] = useState<ThemeName>("pink");
  const [nickname, setNickname] = useState("Teya");
  const [, setClockTick] = useState(0);
  const [journals, setJournals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState(false);

  const { screen: routeScreen } = useLocalSearchParams<{ screen?: string }>();

  useEffect(() => {
    const target = Array.isArray(routeScreen) ? routeScreen[0] : routeScreen;

    const validScreens: Screen[] = [
      "dashboard",
      "journal",
      "explore",
      "newEntry",
      "readEntry",
      "editEntry",
      "tasks",
      "study",
      "feynman",
      "pomodoro",
      "goals",
      "leisure",
      "profile",
    ];

    if (target && validScreens.includes(target as Screen)) {
      setScreen(target as Screen);
    }
  }, [routeScreen]);

  const palette = usePalette(themeName);

  const reload = async () => {
    // IMPORTANT: keep these SQLite reads sequential on Android.
    // expo-sqlite can throw a native NullPointerException when several
    // async statements are started on the same database handle at once.
    const p = await getProfile();
    const j = await getJournals();
    const t = await getTasks();
    const n = await getStudyNotes();

    const display = String(p?.nickname || "").trim();
    setNickname(display || "Teya");
    setThemeName(
      (p?.theme_color as ThemeName) in THEME_META
        ? (p?.theme_color as ThemeName)
        : "pink",
    );
    setJournals(j || []);
    setTasks(t || []);
    setNotes(n || []);
  };

  useEffect(() => {
    initializeDatabase()
      .then(reload)
      .catch((e) => console.log("THRIVE init error", e));
    const timer = setInterval(() => setClockTick((v) => v + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const go = (target: Screen | string) => {
    if (typeof target === "string" && target.startsWith("read:")) {
      setSelectedId(Number(target.split(":")[1]));
      setScreen("readEntry");
      return;
    }
    if (typeof target === "string" && target.startsWith("edit:")) {
      setSelectedId(Number(target.split(":")[1]));
      setScreen("editEntry");
      return;
    }

    // ============================================================
    // TASK MANAGER MODULE
    // Connected to the CM's task-manager Expo Router screens.
    // ============================================================
    if (target === "tasks") {
      router.push("/task-manager");
      return;
    }

    if (target === "goals") {
      router.push("/task-manager/goal");
      return;
    }

    if (target === "leisure") {
      router.push("/task-manager/leisure");
      return;
    }

    // ============================================================
    // THRIVE INTERNAL SCREENS
    // ============================================================
    setScreen(target as Screen);
  };

  const selectedEntry = journals.find((j) => j.id === selectedId);
  const weeklyTotal = tasks.filter((t) => t.category === "assignment").length;
  const weeklyCompleted = tasks.filter(
    (t) => t.category === "assignment" && t.status === "completed",
  ).length;
  const activeGoals = tasks.filter(
    (t) => t.category === "goal" && t.status !== "completed",
  ).length;
  const minutesToday = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.duration_minutes || 0), 0);

  let content: React.ReactNode;
  if (screen === "dashboard")
    content = (
      <Dashboard
        palette={palette}
        nickname={nickname}
        journalsCount={journals.length}
        weeklyCompleted={weeklyCompleted}
        weeklyTotal={weeklyTotal}
        activeGoals={activeGoals}
        minutesToday={minutesToday}
        go={go}
        setTheme={async (t: ThemeName) => {
          setThemeName(t);
          await saveProfileTheme(t);
        }}
        themeName={themeName}
      />
    );
  else if (screen === "journal")
    content = (
      <JournalHome
        palette={palette}
        journals={journals}
        go={go}
        search={search}
        setSearch={setSearch}
        reload={reload}
        themeName={themeName}
      />
    );
  else if (screen === "newEntry")
    content = (
      <NewEntry
        palette={palette}
        go={go}
        themeName={themeName}
        reload={reload}
      />
    );
  else if (screen === "readEntry")
    content = (
      <ReadEntry
        entry={selectedEntry}
        palette={palette}
        go={go}
        reload={reload}
      />
    );
  else if (screen === "editEntry")
    content = (
      <EditEntry
        entry={selectedEntry}
        palette={palette}
        go={go}
        reload={reload}
      />
    );
  else if (screen === "explore")
    content = <Explore palette={palette} journals={journals} go={go} />;
  else if (screen === "tasks")
    content = (
      <Tasks
        palette={palette}
        tasks={tasks}
        go={go}
        reload={reload}
        category="assignment"
      />
    );
  else if (screen === "goals")
    content = (
      <Tasks
        palette={palette}
        tasks={tasks}
        go={go}
        reload={reload}
        category="goal"
      />
    );
  else if (screen === "leisure")
    content = (
      <Tasks
        palette={palette}
        tasks={tasks}
        go={go}
        reload={reload}
        category="leisure"
      />
    );
  else if (screen === "study")
    content = (
      <View style={{ flex: 1 }}>
        <HomeScreen onNavigate={(target: string) => go(target)} />
        <GlobalBottomNav active="study" palette={palette} go={go} />
      </View>
    );
  else if (screen === "feynman")
    content = (
      <View style={{ flex: 1 }}>
        <FeynmanScreen onBack={() => go("study")} />
        <GlobalBottomNav active="study" palette={palette} go={go} />
      </View>
    );
  else if (screen === "pomodoro")
    content = (
      <View style={{ flex: 1 }}>
        <PomodoroScreen onBack={() => go("study")} />
        <GlobalBottomNav active="study" palette={palette} go={go} />
      </View>
    );
  else
    content = (
      <Profile
        palette={palette}
        nickname={nickname}
        setNickname={setNickname}
        themeName={themeName}
        setTheme={setThemeName}
        go={go}
      />
    );

  return (
    <ThemeProvider>
      <StatusBar hidden />
      <ScreenTransition screenKey={screen + String(selectedId || "")}>
        {content}
      </ScreenTransition>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 34, paddingBottom: 138 },
  journalListScroll: {
    paddingHorizontal: 20,
    paddingTop: 38,
    paddingBottom: 138,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 22,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 23, fontWeight: "900" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  dashboardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
    marginBottom: 24,
    paddingHorizontal: 2,
  },
  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  greeting: { fontSize: 16, fontWeight: "800" },
  nameText: { fontSize: 22, fontWeight: "900", marginTop: -2 },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginLeft: 10,
  },
  smallIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF88",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubble: { alignItems: "center", justifyContent: "center" },
  welcomeCard: {
    minHeight: 132,
    borderRadius: 25,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 12,
  },
  welcomeTitle: { fontSize: 18, fontWeight: "900" },
  welcomeArt: {
    width: 125,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  progressCard: {
    borderRadius: 27,
    borderWidth: 1,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 125,
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSectionTitle: { fontSize: 14, fontWeight: "900" },
  progressNumber: { fontSize: 31, fontWeight: "900", marginTop: 14 },
  smallText: { fontSize: 11, lineHeight: 16 },
  reminder: {
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: { flex: 1, borderRadius: 20, padding: 13, minHeight: 112 },
  statNumber: { fontSize: 24, fontWeight: "900", marginTop: 10 },
  statLabel: { fontSize: 9, marginTop: 2 },
  loopTitle: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 9,
  },
  moduleCard: {
    width: "100%",
    borderRadius: 23,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 9,
  },
  moduleTitle: { fontSize: 15, fontWeight: "900", marginBottom: 2 },
  bottomNav: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#4B87B7",
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  globalBottomNav: { height: 92, paddingHorizontal: 7 },
  journalBottomNav: { height: 92, paddingHorizontal: 7 },
  journalTabs: {
    flexDirection: "row",
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 4,
    marginBottom: 18,
  },
  journalTab: {
    flex: 1,
    minWidth: 0,
    height: 38,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  journalTabText: { fontSize: 10, fontWeight: "900", textAlign: "center" },
  journalSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  newEntryTopButton: {
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  journalListCard: {
    width: "100%",
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    padding: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  journalListThumb: { width: 58, height: 58, borderRadius: 14 },
  journalListContent: { flex: 1, minWidth: 0, justifyContent: "center" },
  journalListTopRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  journalListTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    marginRight: 4,
  },
  journalListDate: { fontSize: 8, marginTop: 1 },
  journalMoodPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 4,
    backgroundColor: "#FFFFFFAA",
  },
  journalMoodText: { fontSize: 8, fontWeight: "900" },
  journalListPreview: { fontSize: 8, marginTop: 2 },
  journalListMainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 36,
  },
  favoriteButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFFCC",
  },
  globalNavButton: {
    flex: 1,
    minWidth: 0,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 22,
    paddingHorizontal: 2,
  },
  globalNavIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  navButton: {
    flex: 1,
    minWidth: 0,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 22,
    paddingHorizontal: 2,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.05,
    textAlign: "center",
  },
  centerFab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -27,
    shadowColor: "#1767B7",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ringOuter: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  ringScore: { fontSize: 17, fontWeight: "900" },
  ringLabel: { fontSize: 8 },
  cloud: { position: "absolute", borderRadius: 100, opacity: 0.7 },
  cloud1: { width: 240, height: 95, top: 55, right: -70 },
  cloud2: { width: 170, height: 75, top: 125, left: -65 },
  cloud3: { width: 210, height: 80, top: 190, right: -90 },
  mountain: {
    position: "absolute",
    top: 155,
    right: -30,
    width: 0,
    height: 0,
    borderLeftWidth: 120,
    borderRightWidth: 120,
    borderBottomWidth: 110,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF55",
  },
  mountainSmall: {
    position: "absolute",
    top: 185,
    left: 80,
    width: 0,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 75,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF33",
  },
  journalComposer: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 17,
    marginBottom: 13,
  },
  quickReflectionToggle: {
    minHeight: 68,
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 2,
  },
  quickReflectionPanel: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  plusSmall: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
    marginTop: 10,
  },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  buttonText: { fontSize: 13, fontWeight: "900" },
  buttonTextWhite: { color: "#fff", fontSize: 13, fontWeight: "900" },
  entryCountCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  emptyCard: {
    borderRadius: 25,
    borderWidth: 1,
    padding: 30,
    alignItems: "center",
    marginTop: 8,
  },
  quickBackdrop: {
    flex: 1,
    backgroundColor: "#10233F88",
    justifyContent: "flex-end",
  },
  quickModal: {
    width: "100%",
    maxHeight: "91%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  quickHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD4DF",
    alignSelf: "center",
    marginBottom: 10,
  },
  quickTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickTitle: { fontSize: 16, fontWeight: "900" },
  quickClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  quickSectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 7,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  quickChoice: {
    width: "48.3%",
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  quickChoiceText: { flex: 1, fontSize: 9, lineHeight: 13, fontWeight: "700" },
  quickInput: {
    minHeight: 76,
    borderRadius: 15,
    borderWidth: 1,
    padding: 11,
    fontSize: 11,
  },
  quickCounter: { textAlign: "right", fontSize: 8, marginTop: 3 },
  fullEntryLink: {
    height: 30,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 8,
  },
  fullEntryLinkText: { fontSize: 10, fontWeight: "900" },
  entryCard: {
    width: "100%",
    marginBottom: 14,
    borderRadius: 20,
    overflow: "hidden",
  },
  entryImage: { width: "100%", minHeight: 210, justifyContent: "flex-end" },
  entryShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#1E4F7A30",
  },
  entryGlass: {
    margin: 14,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    minHeight: 118,
  },
  entryTitle: { fontSize: 17, fontWeight: "900", marginTop: 7 },
  searchBox: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  input: { flex: 1, minHeight: 46, fontSize: 13 },
  inputBox: {
    minHeight: 50,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  bodyInput: {
    minHeight: 170,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
  },
  counter: { fontSize: 10, marginBottom: 6 },
  backgroundModeRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginTop: 16,
    gap: 4,
  },
  backgroundModeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 8,
  },
  backgroundModeText: { fontSize: 12, fontWeight: "800" },
  pickerSectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 2,
  },
  patternCategoryRow: { gap: 8, paddingVertical: 12 },
  patternCategoryButton: {
    minWidth: 62,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 2,
  },
  patternTile: {
    width: "31.5%",
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignSelf: "stretch",
    alignItems: "stretch",
  },
  patternTileImage: { width: "100%", height: "100%", alignSelf: "stretch" },
  patternCheck: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  patternNamePill: {
    position: "absolute",
    left: 5,
    right: 5,
    bottom: 5,
    backgroundColor: "#FFFFFFDD",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  inlineBackgroundChooser: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
    marginBottom: 12,
  },
  selectedBackgroundHint: {
    borderRadius: 13,
    padding: 9,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  backgroundSelector: {
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 82,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  solidColorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  solidColorTile: {
    width: "47%",
    minHeight: 118,
    borderRadius: 22,
    padding: 12,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    overflow: "hidden",
  },
  solidColorNamePill: {
    backgroundColor: "#FFFFFFCC",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  solidColorName: { color: "#4B5563", fontWeight: "800", fontSize: 12 },
  solidColorCheck: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreColorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  exploreColorCard: {
    width: "47%",
    minHeight: 105,
    borderRadius: 22,
    padding: 12,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  exploreColorLabel: {
    backgroundColor: "#FFFFFFCC",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  explorePatternsSection: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginTop: 20,
  },
  patternSectionLabel: { fontSize: 13, fontWeight: "900", marginBottom: 8 },
  explorePatternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  explorePatternTile: {
    width: "31.5%",
    height: 150,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignSelf: "stretch",
    alignItems: "stretch",
  },
  explorePatternNamePill: {
    position: "absolute",
    left: 5,
    right: 5,
    bottom: 5,
    backgroundColor: "#FFFFFFDD",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  affirmationIntro: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  affirmationCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  affirmationNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  affirmationNumberText: { fontWeight: "900", fontSize: 12 },
  affirmationText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  selectorImage: { width: 64, height: 64, borderRadius: 16 },
  photoBox: {
    marginTop: 12,
    minHeight: 74,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    gap: 5,
  },
  photoPreview: { width: "100%", height: 150 },
  photoChangePill: {
    position: "absolute",
    left: 10,
    bottom: 10,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "#00000088",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  photoChangeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 7,
  },
  moodItem: { alignItems: "center", width: 62 },
  moodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  moodLabel: { fontSize: 9, marginTop: 4 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#0A315655",
    justifyContent: "flex-end",
  },
  bgModal: {
    maxHeight: "88%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 17,
  },
  modalTitle: { fontSize: 19, fontWeight: "900" },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  bgGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    paddingBottom: 8,
  },
  bgTile: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  bgTileImage: { width: "100%", height: "100%" },
  checkOverlay: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  readScreen: { flex: 1 },
  readTop: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readRound: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#173F6B88",
    alignItems: "center",
    justifyContent: "center",
  },
  readDate: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "#173F6B88",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  readScroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 125 },
  readGlass: { borderRadius: 25, borderWidth: 1, padding: 18, marginTop: 18 },
  readTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  readMood: {
    alignSelf: "flex-start",
    marginTop: 10,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF22",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  readContent: { color: "#fff", fontSize: 15, lineHeight: 24, marginTop: 18 },
  readMoodItem: { alignItems: "center", width: 57 },
  readMoodCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF20",
    alignItems: "center",
    justifyContent: "center",
  },
  attachedPhoto: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    marginTop: 14,
  },
  segment: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#FFFFFF99",
    borderRadius: 22,
    padding: 4,
    marginBottom: 14,
    overflow: "hidden",
  },
  segmentActive: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    minHeight: 44,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActiveText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  segmentText: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  calendarCard: { borderRadius: 24, borderWidth: 1, padding: 14 },
  calendarArrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarMonthTitle: { fontSize: 17, fontWeight: "900" },
  weekRow: { flexDirection: "row", width: "100%", marginTop: 14 },
  weekText: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  dayCell: {
    width: "14.2857%",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    flexShrink: 0,
  },
  calendarDayNumber: {
    width: 24,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800",
  },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 3 },
  calendarHint: {
    marginTop: 10,
    minHeight: 36,
    borderRadius: 14,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  calendarPreviewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.48)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  calendarPreviewCard: {
    width: "100%",
    maxHeight: "82%",
    borderRadius: 26,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
  },
  calendarPreviewImage: {
    width: "100%",
    height: 150,
    marginTop: 14,
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  calendarPreviewImageShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  calendarPreviewGlass: {
    margin: 10,
    borderRadius: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  calendarPreviewTitle: {
    color: "#4B1833",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
  },
  calendarPreviewMood: {
    color: "#8A5870",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "800",
  },
  calendarPreviewContent: { fontSize: 14, lineHeight: 21, marginTop: 14 },
  emptyPreview: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  reflectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  tipCard: {
    borderRadius: 19,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 9,
  },
  explorePattern: {
    width: "31.5%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  explorePatternImage: { width: "100%", height: "100%" },
  addTaskCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  circleAdd: {
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  primarySmall: {
    paddingHorizontal: 15,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 9,
  },
  checkCircle: {
    width: 37,
    height: 37,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  studyHero: {
    borderRadius: 23,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  studyCard: { borderRadius: 23, borderWidth: 1, padding: 14 },
  stepInput: {
    minHeight: 80,
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 13,
  },
  profileHero: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
    marginBottom: 15,
  },
  profileName: { fontSize: 24, fontWeight: "900", marginTop: 10 },
  themeRow: { flexDirection: "row", gap: 10 },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  themeChoice: {
    width: "31.8%",
    minHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
});
