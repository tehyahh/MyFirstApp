import React, { useCallback, useState } from "react";

import { useFocusEffect, useRouter } from "expo-router";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BottomNavigation from "../../components/BottomNavigation";

import { useTheme } from "../../components/ThemeContent";

import { getAssignments } from "../Services/assignmentService";

import { getGoals } from "../Services/goalService";

import { getLeisureEntries } from "../Services/leisureService";

import { initializeDatabase } from "../../database/db";

// ==================================================
// TYPES
// ==================================================

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  darkMode: boolean;
  onPress: () => void;
};

// ==================================================
// FEATURE CARD
// ==================================================

function FeatureCard({
  icon,
  title,
  description,
  darkMode,
  onPress,
}: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,

        darkMode && styles.featureCardDark,

        pressed && styles.featureCardPressed,
      ]}
    >
      <View
        style={[styles.iconContainer, darkMode && styles.iconContainerDark]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, darkMode && styles.cardTitleDark]}>
          {title}
        </Text>

        <Text
          style={[
            styles.cardDescription,
            darkMode && styles.cardDescriptionDark,
          ]}
        >
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

// ==================================================
// TASK MANAGER SCREEN
// ==================================================

export default function TaskManagerScreen() {
  const router = useRouter();

  // ==================================================
  // GLOBAL THEME
  // ==================================================

  const { darkMode, toggleDarkMode } = useTheme();

  // ==================================================
  // PRODUCTIVITY SPACE
  // ==================================================

  const [completedTasks, setCompletedTasks] = useState(0);

  const [completedGoals, setCompletedGoals] = useState(0);

  const [leisureCount, setLeisureCount] = useState(0);

  // ==================================================
  // LOAD PRODUCTIVITY DATA
  // ==================================================

  useFocusEffect(
    useCallback(() => {
      const loadProductivityData = async () => {
        try {
          await initializeDatabase();

          const [assignments, goals, leisureEntries] = await Promise.all([
            getAssignments(),
            getGoals(),
            getLeisureEntries(),
          ]);

          const completedAssignmentCount = assignments.filter(
            (assignment) => assignment.status === "Completed",
          ).length;

          const completedGoalCount = goals.filter(
            (goal) => goal.status === "Completed",
          ).length;

          setCompletedTasks(completedAssignmentCount);

          setCompletedGoals(completedGoalCount);

          setLeisureCount(leisureEntries.length);
        } catch (error) {
          console.error("Failed to load productivity data:", error);
        }
      };

      loadProductivityData();
    }, []),
  );

  // ==================================================
  // SCREEN
  // ==================================================

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]}>
      <View style={[styles.screen, darkMode && styles.screenDark]}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            darkMode && styles.containerDark,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ==========================================
              HEADER
              ========================================== */}

          <View style={styles.header}>
            <View style={styles.headerTextArea}>
              <Text style={[styles.title, darkMode && styles.titleDark]}>
                Task Manager
              </Text>

              <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
                Organize your tasks, goals, and time.
              </Text>
            </View>

            {/* DARK MODE */}

            <Pressable
              style={[styles.headerIcon, darkMode && styles.headerIconDark]}
              onPress={toggleDarkMode}
            >
              <Text
                style={[
                  styles.headerIconText,
                  darkMode && styles.headerIconTextDark,
                ]}
              >
                ☾
              </Text>
            </Pressable>
          </View>

          {/* ==========================================
              PRODUCTIVITY SPACE
              ========================================== */}

          <View
            style={[styles.overviewCard, darkMode && styles.overviewCardDark]}
          >
            <View style={styles.overviewTop}>
              <View>
                <Text
                  style={[
                    styles.overviewTitle,
                    darkMode && styles.overviewTitleDark,
                  ]}
                >
                  Your productivity space
                </Text>

                <Text
                  style={[
                    styles.overviewDescription,
                    darkMode && styles.overviewDescriptionDark,
                  ]}
                >
                  Stay organized and make steady progress.
                </Text>
              </View>

              <Text style={[styles.star, darkMode && styles.starDark]}>✦</Text>
            </View>

            <View style={styles.statsRow}>
              {/* TASKS */}

              <View style={styles.stat}>
                <Text
                  style={[styles.statNumber, darkMode && styles.statNumberDark]}
                >
                  {completedTasks}
                </Text>

                <Text
                  style={[styles.statLabel, darkMode && styles.statLabelDark]}
                >
                  Tasks
                </Text>
              </View>

              <View style={[styles.divider, darkMode && styles.dividerDark]} />

              {/* GOALS */}

              <View style={styles.stat}>
                <Text
                  style={[styles.statNumber, darkMode && styles.statNumberDark]}
                >
                  {completedGoals}
                </Text>

                <Text
                  style={[styles.statLabel, darkMode && styles.statLabelDark]}
                >
                  Goals
                </Text>
              </View>

              <View style={[styles.divider, darkMode && styles.dividerDark]} />

              {/* LEISURE */}

              <View style={styles.stat}>
                <Text
                  style={[styles.statNumber, darkMode && styles.statNumberDark]}
                >
                  {leisureCount}
                </Text>

                <Text
                  style={[styles.statLabel, darkMode && styles.statLabelDark]}
                >
                  Leisure
                </Text>
              </View>
            </View>
          </View>

          {/* ==========================================
              ORGANIZE
              ========================================== */}

          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}
            >
              ORGANIZE
            </Text>

            <Text
              style={[styles.sectionCount, darkMode && styles.sectionCountDark]}
            >
              3 areas
            </Text>
          </View>

          {/* ASSIGNMENTS */}

          <FeatureCard
            icon="📚"
            title="Assignments"
            description="Keep track of school work and deadlines."
            darkMode={darkMode}
            onPress={() => router.push("/task-manager/assignment")}
          />

          {/* GOALS */}

          <FeatureCard
            icon="🎯"
            title="Goals"
            description="Turn your plans into achievable targets."
            darkMode={darkMode}
            onPress={() => router.push("/task-manager/goal")}
          />

          {/* LEISURE */}

          <FeatureCard
            icon="☕"
            title="Leisure"
            description="Track your breaks and maintain balance."
            darkMode={darkMode}
            onPress={() => router.push("/task-manager/leisure")}
          />

          {/* ==========================================
              FOOTER
              ========================================== */}

          <View style={styles.footer}>
            <Text style={styles.footerIcon}>✦</Text>

            <Text
              style={[styles.footerText, darkMode && styles.footerTextDark]}
            >
              Small progress is still progress.
            </Text>
          </View>
        </ScrollView>

        {/* ==========================================
            BOTTOM NAVIGATION
            ========================================== */}

<BottomNavigation
  activeTab="tasks"
  onTabPress={(tab) => {
    if (tab === "dashboard") {
      router.replace("/?screen=dashboard");
    }

    if (tab === "journal") {
      router.replace("/?screen=journal");
    }

    if (tab === "tasks") {
      router.replace("/task-manager");
    }

    if (tab === "study") {
      router.replace("/?screen=study");
    }

    if (tab === "profile") {
      router.replace("/?screen=profile");
    }
  }}
/>
      </View>
    </SafeAreaView>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  // ==================================================
  // SCREEN
  // ==================================================

  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  safeAreaDark: {
    backgroundColor: "#111827",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  screenDark: {
    backgroundColor: "#111827",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 115,
  },

  containerDark: {
    backgroundColor: "#111827",
  },

  // ==================================================
  // HEADER
  // ==================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 24,
  },

  headerTextArea: {
    flex: 1,
    paddingRight: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },

  titleDark: {
    color: "#F9FAFB",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
  },

  subtitleDark: {
    color: "#9CA3AF",
  },

  // LIGHT BLUE — NOT PINK

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DDF3FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C6E8F8",
  },

  headerIconDark: {
    backgroundColor: "#24485A",
    borderColor: "#356579",
  },

  headerIconText: {
    fontSize: 27,
    fontWeight: "400",
    color: "#2876A8",
  },

  headerIconTextDark: {
    color: "#BDE7F8",
  },

  // ==================================================
  // PRODUCTIVITY SPACE
  // ==================================================

  overviewCard: {
    backgroundColor: "#DDF3FF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#C6E8F8",
  },

  overviewCardDark: {
    backgroundColor: "#193746",
    borderColor: "#31586A",
  },

  overviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#183B4D",
  },

  overviewTitleDark: {
    color: "#E5F7FF",
  },

  overviewDescription: {
    marginTop: 5,
    fontSize: 13,
    color: "#587583",
  },

  overviewDescriptionDark: {
    color: "#A9C5D0",
  },

  star: {
    fontSize: 26,
    color: "#4AA7D4",
  },

  starDark: {
    color: "#7CC7E7",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#183B4D",
  },

  statNumberDark: {
    color: "#E5F7FF",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: "#587583",
  },

  statLabelDark: {
    color: "#A9C5D0",
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#B7DDEB",
  },

  dividerDark: {
    backgroundColor: "#456878",
  },

  // ==================================================
  // ORGANIZE
  // ==================================================

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#6B7280",
  },

  sectionTitleDark: {
    color: "#A9B4C2",
  },

  sectionCount: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  sectionCountDark: {
    color: "#6B7280",
  },

  // ==================================================
  // FEATURE CARDS
  // ==================================================

  featureCard: {
    minHeight: 112,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },

  featureCardDark: {
    backgroundColor: "#1F2937",
    borderColor: "#374151",
  },

  featureCardPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EAF8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainerDark: {
    backgroundColor: "#263F4D",
  },

  icon: {
    fontSize: 26,
  },

  cardContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  cardTitleDark: {
    color: "#F9FAFB",
  },

  cardDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },

  cardDescriptionDark: {
    color: "#9CA3AF",
  },

  arrow: {
    fontSize: 30,
    color: "#4AA7D4",
  },

  // ==================================================
  // FOOTER
  // ==================================================

  footer: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
  },

  footerIcon: {
    fontSize: 18,
    color: "#7CC7E7",
    marginBottom: 5,
  },

  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  footerTextDark: {
    color: "#6B7280",
  },
});
