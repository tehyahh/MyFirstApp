import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabKey =
  | 'home'
  | 'study'
  | 'notifications'
  | 'profile';

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
    key: 'home',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    key: 'study',
    label: 'Study',
    icon: 'book-outline',
    activeIcon: 'book',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'notifications-outline',
    activeIcon: 'notifications',
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

export default function BottomNavigation({
  activeTab,
  onTabPress,
}: BottomNavigationProps) {
  return (
    <View
      style={styles.navigationWrapper}
      accessible
      accessibilityRole="tablist"
    >
      <View style={styles.navigationBar}>
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
                color: '#E8E0F5',
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive &&
                    styles.activeIconContainer,
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
                      ? '#25233A'
                      : '#555555'
                  }
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },

  navigationBar: {
    height: 72,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  tabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconContainer: {
    backgroundColor: '#F0E6FF',
  },
});