import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider } from "../constants/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </ThemeProvider>
  );
}
