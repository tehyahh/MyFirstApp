import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DashboardProps = {
  palette: any;
  nickname: string;
  journalsCount: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  activeGoals: number;
  minutesToday: number;
  go: (target: any) => void;
  themeName: string;
  setTheme: (theme: any) => void;
};

export default function DashboardScreen({
  palette,
  nickname,
  journalsCount,
  weeklyCompleted,
  weeklyTotal,
  activeGoals,
  minutesToday,
  go,
  themeName,
  setTheme,
}: DashboardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(false);

  const score =
    weeklyTotal > 0
      ? Math.round(
          (weeklyCompleted / weeklyTotal) * 100
        )
      : 0;

  const bg = isDarkMode
    ? '#11131A'
    : palette.bg || '#F8F8FB';

  const surface = isDarkMode
    ? '#1B1E27'
    : palette.card || '#FFFFFF';

  const text = isDarkMode
    ? '#F8FAFC'
    : palette.text || '#111827';

  const muted = isDarkMode
    ? '#A7ADBC'
    : palette.muted || '#667085';

  const primary = palette.primary || '#E55491';

  const toggleTheme = () => {
    const names = [
      'pink',
      'blue',
      'green',
      'purple',
      'red',
      'yellow',
    ];

    const currentIndex =
      names.indexOf(themeName);

    const next =
      names[
        (currentIndex + 1) %
          names.length
      ];

    setTheme(next);
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: bg,
        },
      ]}
    >
      <StatusBar
        hidden
        barStyle={
          isDarkMode
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIdentity}
            activeOpacity={0.8}
            onPress={() =>
              go('profile')
            }
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor:
                    isDarkMode
                      ? '#242936'
                      : '#F1F2F7',
                  borderColor:
                    primary,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={text}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.welcomeSmall,
                  {
                    color: muted,
                  },
                ]}
              >
                WELCOME BACK
              </Text>

              <Text
                style={[
                  styles.hello,
                  {
                    color: text,
                  },
                ]}
              >
                Hello, {nickname}!
              </Text>
            </View>
          </TouchableOpacity>

          <View
            style={
              styles.headerActions
            }
          >
            <TouchableOpacity
              onPress={() =>
                go('journal')
              }
              style={[
                styles.roundButton,
                {
                  backgroundColor:
                    surface,
                  borderColor:
                    palette.line ||
                    '#E8E8EF',
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={21}
                color={text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setIsDarkMode(
                  value => !value
                )
              }
              style={[
                styles.roundButton,
                {
                  backgroundColor:
                    surface,
                  borderColor:
                    palette.line ||
                    '#E8E8EF',
                },
              ]}
            >
              <Ionicons
                name={
                  isDarkMode
                    ? 'sunny-outline'
                    : 'moon-outline'
                }
                size={21}
                color={text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* =====================================================
            PROGRESS / AIMSCORE
        ===================================================== */}

        <View
          style={[
            styles.progressCard,
            {
              backgroundColor:
                surface,
              borderColor:
                isDarkMode
                  ? '#292E39'
                  : palette.line ||
                    '#ECECF1',
            },
          ]}
        >
          <View
            style={
              styles.progressLeft
            }
          >
            <View
              style={
                styles.progressTitleRow
              }
            >
              <View
                style={[
                  styles.progressIcon,
                  {
                    backgroundColor:
                      isDarkMode
                        ? '#382538'
                        : palette.soft ||
                          '#FCE7F3',
                  },
                ]}
              >
                <Ionicons
                  name="pulse-outline"
                  size={22}
                  color={primary}
                />
              </View>

              <Text
                style={[
                  styles.progressTitle,
                  {
                    color: text,
                  },
                ]}
              >
                Your Progress
              </Text>
            </View>

            <Text
              style={[
                styles.weeklyNumber,
                {
                  color: text,
                },
              ]}
            >
              {weeklyCompleted}/
              {weeklyTotal}
            </Text>

            <TouchableOpacity
              style={
                styles.weeklyLabelRow
              }
              onPress={() =>
                setIsWeeklyOpen(
                  value => !value
                )
              }
            >
              <Text
                style={[
                  styles.weeklyLabel,
                  {
                    color: muted,
                  },
                ]}
              >
                weekly tasks done
              </Text>

              <Ionicons
                name={
                  isWeeklyOpen
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={17}
                color={muted}
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.aimScoreWrap
            }
          >
            <View
              style={[
                styles.aimOuter,
                {
                  borderColor:
                    primary + '55',
                },
              ]}
            />

            <View
              style={[
                styles.aimInner,
                {
                  backgroundColor:
                    palette.soft ||
                    '#FFE7F0',
                  borderColor:
                    primary + '40',
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreNumber,
                  {
                    color: text,
                  },
                ]}
              >
                {score}%
              </Text>

              <Text
                style={[
                  styles.scoreLabel,
                  {
                    color: muted,
                  },
                ]}
              >
                Aimscore
              </Text>
            </View>

            <View
              style={[
                styles.starIndicator,
                {
                  backgroundColor:
                    '#FFD83D',
                  borderColor:
                    surface,
                },
              ]}
            >
              <Ionicons
                name="star"
                size={16}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* =====================================================
            WEEKLY DETAILS
        ===================================================== */}

        {isWeeklyOpen && (
          <View
            style={[
              styles.weeklyDropdown,
              {
                backgroundColor:
                  surface,
                borderColor:
                  palette.line ||
                  '#ECECF1',
              },
            ]}
          >
            <WeeklyRow
              label="Completed"
              value={`${weeklyCompleted}`}
              text={text}
            />

            <WeeklyRow
              label="Total"
              value={`${weeklyTotal}`}
              text={text}
            />

            <WeeklyRow
              label="Completion"
              value={`${score}%`}
              text={text}
            />
          </View>
        )}

        {/* =====================================================
            REMINDER
        ===================================================== */}

        <View
          style={[
            styles.reminder,
            {
              backgroundColor:
                isDarkMode
                  ? '#342744'
                  : '#EBD9FF',
            },
          ]}
        >
          <View
            style={[
              styles.reminderIcon,
              {
                backgroundColor:
                  isDarkMode
                    ? '#4A345D'
                    : '#E2C5FA',
              },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={23}
              color={
                isDarkMode
                  ? '#E9D5FF'
                  : '#5B21B6'
              }
            />
          </View>

          <View
            style={
              styles.reminderCopy
            }
          >
            <Text
              style={[
                styles.reminderTitle,
                {
                  color:
                    isDarkMode
                      ? '#D8B4FE'
                      : '#5B21B6',
                },
              ]}
            >
              A Gentle Reminder
            </Text>

            <Text
              style={[
                styles.reminderText,
                {
                  color: text,
                },
              ]}
            >
              You're allowed to
              grow at your own pace.
            </Text>
          </View>
        </View>

        {/* =====================================================
            APP SNAPSHOT
        ===================================================== */}

        <View style={styles.statsRow}>
          <StatCard
            value={`${journalsCount}`}
            label="journal entries"
            icon="book-outline"
            background={
              isDarkMode
                ? '#3A3420'
                : '#FFF4BD'
            }
            iconBackground={
              isDarkMode
                ? '#52482A'
                : '#FFE98A'
            }
            iconColor={
              isDarkMode
                ? '#FFE68A'
                : '#4A3500'
            }
            textColor={text}
            mutedColor={muted}
            onPress={() =>
              go('journal')
            }
          />

          <StatCard
            value={`${activeGoals}`}
            label="active goals"
            icon="locate-outline"
            background={
              isDarkMode
                ? '#402638'
                : '#FCE0EF'
            }
            iconBackground={
              isDarkMode
                ? '#58334B'
                : '#F7C1DC'
            }
            iconColor={
              isDarkMode
                ? '#F9A8D4'
                : '#9D174D'
            }
            textColor={text}
            mutedColor={muted}
            onPress={() =>
              go('goals')
            }
          />

          <StatCard
            value={`${minutesToday}`}
            label="mins today"
            icon="time-outline"
            background={
              isDarkMode
                ? '#26384E'
                : '#DCEBFF'
            }
            iconBackground={
              isDarkMode
                ? '#304966'
                : '#C5DFFF'
            }
            iconColor={
              isDarkMode
                ? '#93C5FD'
                : '#173B72'
            }
            textColor={text}
            mutedColor={muted}
            onPress={() =>
              go('leisure')
            }
          />
        </View>

        {/* =====================================================
            THRIVE LOOP
        ===================================================== */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: muted,
            },
          ]}
        >
          YOUR THRIVE LOOP
        </Text>

        <ModuleCard
          title="Journal"
          subtitle="Reflect. Grow. Repeat."
          icon="book-outline"
          background={
            isDarkMode
              ? '#3B3822'
              : '#FFF2A8'
          }
          iconBackground={
            isDarkMode
              ? '#514B2C'
              : '#FFE889'
          }
          iconColor={
            isDarkMode
              ? '#FFE98A'
              : '#3D2C00'
          }
          textColor={text}
          mutedColor={muted}
          onPress={() =>
            go('journal')
          }
        />

        <ModuleCard
          title="Task Manager"
          subtitle="Plan. Focus. Finish."
          icon="checkmark-circle-outline"
          background={
            isDarkMode
              ? '#402637'
              : '#F9D5E8'
          }
          iconBackground={
            isDarkMode
              ? '#57344B'
              : '#F5B8D5'
          }
          iconColor={
            isDarkMode
              ? '#F9A8D4'
              : '#8E174E'
          }
          textColor={text}
          mutedColor={muted}
          onPress={() =>
            go('tasks')
          }
        />

        <ModuleCard
          title="Study Technique"
          subtitle="Study smarter, not harder."
          icon="key-outline"
          background={
            isDarkMode
              ? '#263A54'
              : '#D9E9FF'
          }
          iconBackground={
            isDarkMode
              ? '#304B6C'
              : '#C1DCFF'
          }
          iconColor={
            isDarkMode
              ? '#93C5FD'
              : '#173B72'
          }
          textColor={text}
          mutedColor={muted}
          onPress={() =>
            go('study')
          }
        />

        {/* =====================================================
            PURPOSE
        ===================================================== */}

        <View
          style={[
            styles.purposeStrip,
            {
              backgroundColor:
                surface,
              borderColor:
                palette.line ||
                '#ECECF1',
            },
          ]}
        >
          <Ionicons
            name="sync-outline"
            size={20}
            color={primary}
          />

          <View
            style={
              styles.purposeCopy
            }
          >
            <Text
              style={[
                styles.purposeTitle,
                {
                  color: text,
                },
              ]}
            >
              Plan → Act → Reflect
            </Text>

            <Text
              style={[
                styles.purposeText,
                {
                  color: muted,
                },
              ]}
            >
              THRIVE keeps your
              academic work, study
              habits and reflection
              in one place.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.themeButton,
            {
              backgroundColor:
                palette.soft ||
                '#FFE7F0',
            },
          ]}
          onPress={toggleTheme}
        >
          <Ionicons
            name="color-palette-outline"
            size={19}
            color={primary}
          />

          <Text
            style={[
              styles.themeButtonText,
              {
                color: primary,
              },
            ]}
          >
            Change THRIVE theme
          </Text>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}

      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor:
              isDarkMode
                ? '#1B1E27'
                : '#FFFFFF',
            borderColor:
              isDarkMode
                ? '#303543'
                : '#E9E7EF',
          },
        ]}
      >
        <NavItem
          active
          icon="home-outline"
          label="Dashboard"
          activeColor={primary}
          color={muted}
          onPress={() =>
            go('dashboard')
          }
        />

        <NavItem
          icon="book-outline"
          label="Journal"
          activeColor={primary}
          color={muted}
          onPress={() =>
            go('journal')
          }
        />

        <NavItem
          icon="checkmark-circle-outline"
          label="Tasks"
          activeColor={primary}
          color={muted}
          onPress={() =>
            go('tasks')
          }
        />

        <NavItem
          icon="key-outline"
          label="Study"
          activeColor={primary}
          color={muted}
          onPress={() =>
            go('study')
          }
        />

        <NavItem
          icon="person-outline"
          label="Profile"
          activeColor={primary}
          color={muted}
          onPress={() =>
            go('profile')
          }
        />
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   WEEKLY ROW
============================================================ */

function WeeklyRow({
  label,
  value,
  text,
}: {
  label: string;
  value: string;
  text: string;
}) {
  return (
    <View
      style={
        styles.weeklyDropdownRow
      }
    >
      <Text
        style={[
          styles.weeklyDropdownDay,
          { color: text },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.weeklyDropdownPct,
          { color: text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  value,
  label,
  icon,
  background,
  iconBackground,
  iconColor,
  textColor,
  mutedColor,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.statCard,
        {
          backgroundColor:
            background,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.statValue,
          {
            color: textColor,
          },
        ]}
      >
        {value}
      </Text>

      <View
        style={styles.statBottom}
      >
        <Text
          style={[
            styles.statLabel,
            {
              color: mutedColor,
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>

        <Ionicons
          name="arrow-forward"
          size={20}
          color={textColor}
        />
      </View>
    </TouchableOpacity>
  );
}

/* ============================================================
   MODULE CARD
============================================================ */

function ModuleCard({
  title,
  subtitle,
  icon,
  background,
  iconBackground,
  iconColor,
  textColor,
  mutedColor,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.moduleCard,
        {
          backgroundColor:
            background,
        },
      ]}
    >
      <View
        style={[
          styles.moduleIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={28}
          color={iconColor}
        />
      </View>

      <View
        style={styles.moduleCopy}
      >
        <Text
          style={[
            styles.moduleTitle,
            {
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.moduleSubtitle,
            {
              color: mutedColor,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <View
        style={styles.moduleArrow}
      >
        <Ionicons
          name="arrow-forward"
          size={22}
          color={textColor}
        />
      </View>
    </TouchableOpacity>
  );
}

/* ============================================================
   NAV ITEM
============================================================ */

function NavItem({
  icon,
  label,
  active = false,
  color,
  activeColor,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.navItem}
    >
      <View
        style={[
          styles.navIconWrap,
          active && {
            backgroundColor:
              '#FCE0EF',
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            active
              ? activeColor
              : color
          }
        />
      </View>

      <Text
        style={[
          styles.navLabel,
          {
            color: active
              ? activeColor
              : color,
          },
          active &&
            styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 11,
  },

  welcomeSmall: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 1,
  },

  hello: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 7,
  },

  roundButton: {
    width: 41,
    height: 41,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  progressCard: {
    minHeight: 190,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  progressLeft: {
    flex: 1,
    paddingRight: 5,
  },

  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 10,
  },

  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  weeklyNumber: {
    fontSize: 46,
    lineHeight: 53,
    fontWeight: '900',
    marginTop: 15,
  },

  weeklyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf:
      'flex-start',
    gap: 3,
    paddingVertical: 2,
  },

  weeklyLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  weeklyDropdown: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: -6,
    marginBottom: 14,

    elevation: 5,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  weeklyDropdownRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingVertical: 9,
  },

  weeklyDropdownDay: {
    fontSize: 13,
    fontWeight: '600',
  },

  weeklyDropdownPct: {
    fontSize: 13,
    fontWeight: '800',
  },

  aimScoreWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent:
      'center',
    position: 'relative',
  },

  aimOuter: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 8,
  },

  aimInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  scoreNumber: {
    fontSize: 29,
    fontWeight: '900',
  },

  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  starIndicator: {
    position: 'absolute',
    right: 5,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent:
      'center',
    borderWidth: 3,
    elevation: 5,
  },

  reminder: {
    minHeight: 94,
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 13,
  },

  reminderCopy: {
    flex: 1,
  },

  reminderTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },

  reminderText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 17,
  },

  statCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: 20,
    padding: 12,
    justifyContent:
      'space-between',
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  statValue: {
    fontSize: 29,
    fontWeight: '900',
    marginTop: 7,
  },

  statBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent:
      'space-between',
    gap: 3,
  },

  statLabel: {
    fontSize: 10,
    lineHeight: 13,
    flex: 1,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 9,
    marginLeft: 2,
  },

  moduleCard: {
    minHeight: 96,
    borderRadius: 23,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  moduleIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  moduleCopy: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 8,
  },

  moduleTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  moduleSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  moduleArrow: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor:
      'rgba(255,255,255,0.52)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  purposeStrip: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  purposeCopy: {
    flex: 1,
    marginLeft: 11,
  },

  purposeTitle: {
    fontSize: 12,
    fontWeight: '800',
  },

  purposeText: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  themeButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 7,
  },

  themeButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  bottomNav: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 70,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
    paddingHorizontal: 4,

    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 7,
  },

  navItem: {
    flex: 1,
    height: 62,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  navIconWrap: {
    width: 40,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  navLabel: {
    fontSize: 8.5,
    marginTop: 1,
    fontWeight: '600',
  },

  navLabelActive: {
    fontWeight: '800',
  },
});