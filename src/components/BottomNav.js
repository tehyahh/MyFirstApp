import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const TABS = [
  { key: "home", icon: "home" },
  { key: "grid", icon: "grid" },
  { key: "notifications", icon: "notifications" },
  { key: "profile", icon: "person" },
];

export default function BottomNav({ activeTab = "home", onTabPress }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { backgroundColor: colors.navBg }]}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { backgroundColor: colors.navActiveBg },
              ]}
              onPress={() => onTabPress && onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={colors.icon}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    width: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  tab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
