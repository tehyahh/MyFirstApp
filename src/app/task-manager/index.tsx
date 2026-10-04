import React from 'react';
import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function FeatureCard({
  icon,
  title,
  description,
  onPress,
}: FeatureCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featureCard,
        pressed && styles.featureCardPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>

        <Text style={styles.cardDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

export default function TaskManagerScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                Task Manager
              </Text>

              <Text style={styles.subtitle}>
                Organize your tasks, goals, and time.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>
                ✓
              </Text>
            </View>
          </View>

          {/* Overview */}

          <View style={styles.overviewCard}>
            <View style={styles.overviewTop}>
              <View>
                <Text style={styles.overviewTitle}>
                  Your productivity space
                </Text>

                <Text style={styles.overviewDescription}>
                  Stay organized and make steady progress.
                </Text>
              </View>

              <Text style={styles.star}>✦</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  0
                </Text>

                <Text style={styles.statLabel}>
                  Tasks
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  0
                </Text>

                <Text style={styles.statLabel}>
                  Goals
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  0
                </Text>

                <Text style={styles.statLabel}>
                  Leisure
                </Text>
              </View>
            </View>
          </View>

          {/* Section title */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              ORGANIZE
            </Text>

            <Text style={styles.sectionCount}>
              3 areas
            </Text>
          </View>

          {/* Assignment */}

          <FeatureCard
            icon="📚"
            title="Assignments"
            description="Keep track of school work and deadlines."
            onPress={() =>
              router.push(
                '/task-manager/assignment'
              )
            }
          />

          {/* Goals */}

          <FeatureCard
            icon="🎯"
            title="Goals"
            description="Turn your plans into achievable targets."
            onPress={() =>
              router.push(
                '/task-manager/goal'
              )
            }
          />

          {/* Leisure */}

          <FeatureCard
            icon="☕"
            title="Leisure"
            description="Track your breaks and maintain balance."
            onPress={() =>
              router.push(
                '/task-manager/leisure'
              )
            }
          />

          {/* Footer */}

          <View style={styles.footer}>
            <Text style={styles.footerIcon}>
              ✦
            </Text>

            <Text style={styles.footerText}>
              Small progress is still progress.
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}

        <BottomNavigation
          activeTab="home"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 24,

    // Space for the floating bottom navigation
    paddingBottom: 115,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DDF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4AA7D4',
  },

  overviewCard: {
    backgroundColor: '#DDF3FF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#C6E8F8',
  },

  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  overviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#183B4D',
  },

  overviewDescription: {
    marginTop: 5,
    fontSize: 13,
    color: '#587583',
  },

  star: {
    fontSize: 26,
    color: '#4AA7D4',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#183B4D',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    color: '#587583',
  },

  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#B7DDEB',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#6B7280',
  },

  sectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  featureCard: {
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
    backgroundColor: '#EAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '800',
    color: '#111827',
  },

  cardDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },

  arrow: {
    fontSize: 30,
    color: '#4AA7D4',
  },

  footer: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
  },

  footerIcon: {
    fontSize: 18,
    color: '#7CC7E7',
    marginBottom: 5,
  },

  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});