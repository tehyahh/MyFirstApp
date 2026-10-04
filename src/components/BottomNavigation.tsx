import React from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "./ThemeContent";

type TabKey =
  | "dashboard"
  | "journal"
  | "tasks"
  | "study"
  | "profile";

type BottomNavigationProps = {
  activeTab: TabKey;
  onTabPress?: (tab: TabKey) => void;
};

const tabs: {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "journal",
    label: "Journal",
    icon: "book-outline",
    activeIcon: "book",
  },
  {
    key: "tasks",
    label: "Tasks",
    icon: "checkmark-outline",
    activeIcon: "checkmark",
  },
  {
    key: "study",
    label: "Study",
    icon: "key-outline",
    activeIcon: "key",
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function BottomNavigation({
  activeTab,
  onTabPress,
}: BottomNavigationProps) {
  const { darkMode } = useTheme();

  return (
    <View
      style={styles.navigationWrapper}
      accessible
      accessibilityRole="tablist"
    >
      <View
        style={[
          styles.navigationBar,
          darkMode && styles.navigationBarDark,
        ]}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => onTabPress?.(tab.key)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{
                selected: isActive,
              }}
              android_ripple={{
                color: darkMode
                  ? "#263B46"
                  : "#DDF3FF",
              }}
            >
              {/* ICON */}

              <View
                style={[
                  styles.iconContainer,

                  isActive &&
                    styles.activeIconContainer,

                  isActive &&
                    darkMode &&
                    styles.activeIconContainerDark,
                ]}
              >
                <Ionicons
                  name={
                    isActive
                      ? tab.activeIcon
                      : tab.icon
                  }
                  size={25}
                  color={
                    isActive
                      ? darkMode
                        ? "#BDE7F8"
                        : "#2876A8"
                      : darkMode
                        ? "#9CA3AF"
                        : "#555555"
                  }
                />
              </View>

              {/* TEXT */}

              <Text
                style={[
                  styles.tabLabel,

                  isActive &&
                    styles.tabLabelActive,

                  isActive &&
                    darkMode &&
                    styles.tabLabelActiveDark,

                  !isActive &&
                    darkMode &&
                    styles.tabLabelDark,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 12,
  },

  navigationBar: {
    height: 86,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,

    paddingHorizontal: 4,
  },

  navigationBarDark: {
    backgroundColor: "#111827",
  },

  tabButton: {
    width: 70,
    height: 76,

    borderRadius: 28,

    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    backgroundColor: "rgba(66, 153, 225, 0.22)",
  },

  activeIconContainerDark: {
    backgroundColor: "rgba(124, 199, 231, 0.20)",
  },

  tabLabel: {
    marginTop: 2,

    fontSize: 11,
    fontWeight: "600",

    color: "#777777",

    textAlign: "center",
  },

  tabLabelActive: {
    color: "#2876A8",
    fontWeight: "700",
  },

  tabLabelDark: {
    color: "#9CA3AF",
  },

  tabLabelActiveDark: {
    color: "#BDE7F8",
  },
});