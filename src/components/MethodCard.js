import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function MethodCard({ title, onPress }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.methodCardBg }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: colors.methodCardIconBg },
        ]}
      >
        <Ionicons name="key" size={18} color={colors.methodCardIconColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    minHeight: 220,
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: "#3B5FCC",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
