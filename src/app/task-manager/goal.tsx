import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  createGoal,
  deleteGoal as deleteGoalFromDb,
  getGoals,
  updateGoal,
  updateGoalProgress as updateGoalProgressInDb,
  updateGoalStatus as updateGoalStatusInDb,
} from '../Services/goalService';

import { initializeDatabase } from '../../database/db';
import { useTheme } from '../../components/ThemeContent';

type GoalStatus = 'Active' | 'Paused' | 'Completed';
type GoalFilter = 'All' | 'Active' | 'Paused' | 'Completed';
type CalendarMode = 'view' | 'form';

type Goal = {
  id: string;
  title: string;
  category: string;
  description: string;
  targetDate: string;
  progress: number;
  status: GoalStatus;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = [
  'Academic',
  'Personal',
  'Fitness',
  'Career',
  'Other',
];

const QUICK_PROGRESS = [0, 25, 50, 75, 100];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function displayDate(dateString: string) {
  if (!dateString) return 'No target date';

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getProgressValue(value: string) {
  const number = Number(value);

  if (value === '') return 0;
  if (Number.isNaN(number)) return 0;

  return Math.max(0, Math.min(100, Math.floor(number)));
}

export default function GoalScreen() {
  const router = useRouter();

  const { darkMode } = useTheme();

  const today = new Date();
  const todayString = formatDate(today);

  // TEMPORARY STORAGE
  // This will be replaced with SQLite during the database phase.
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        await initializeDatabase();

        const data = await getGoals();

        setGoals(data);
      } catch (error) {
        console.error(
          'Failed to load goals:',
          error
        );
      }
    };

    loadGoals();
  }, []);

  const [activeFilter, setActiveFilter] =
    useState<GoalFilter>('All');

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [formVisible, setFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] =
    useState<Goal | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [customProgress, setCustomProgress] = useState('');

  const [menuGoal, setMenuGoal] =
    useState<Goal | null>(null);

  const [progressVisible, setProgressVisible] =
    useState(false);

  const [progressGoal, setProgressGoal] =
    useState<Goal | null>(null);

  const [newProgress, setNewProgress] = useState(0);
  const [customNewProgress, setCustomNewProgress] =
    useState('');

  const [datePickerVisible, setDatePickerVisible] =
    useState(false);

  const [calendarMode, setCalendarMode] =
    useState<CalendarMode>('form');

  const [calendarYear, setCalendarYear] =
    useState(today.getFullYear());

  const [calendarMonth, setCalendarMonth] =
    useState(today.getMonth());

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState('');

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  function resetForm() {
    setTitle('');
    setCategory('Academic');
    setDescription('');
    setTargetDate('');
    setProgress(0);
    setCustomProgress('');
    setEditingGoal(null);
  }

  function closeForm() {
    setFormVisible(false);
    resetForm();
  }

  function openNewGoal() {
    resetForm();
    setFormVisible(true);
  }

  function openEditGoal(goal: Goal) {
    setMenuGoal(null);

    setEditingGoal(goal);
    setTitle(goal.title);
    setCategory(goal.category);
    setDescription(goal.description);
    setTargetDate(goal.targetDate);
    setProgress(goal.progress);

    if (
      !QUICK_PROGRESS.includes(goal.progress)
    ) {
      setCustomProgress(String(goal.progress));
    } else {
      setCustomProgress('');
    }

    setFormVisible(true);
  }

  async function saveGoal() {
    if (!title.trim()) return;
    if (!targetDate) return;

    try {
      const finalProgress = Math.max(
        0,
        Math.min(100, progress),
      );

      if (editingGoal) {
        const updatedGoal: Goal = {
          ...editingGoal,
          title: title.trim(),
          category,
          description: description.trim(),
          targetDate,
          progress: finalProgress,
          status:
            finalProgress >= 100
              ? 'Completed'
              : editingGoal.status ===
                  'Completed'
                ? 'Active'
                : editingGoal.status,
        };

        await updateGoal(updatedGoal);

        setGoals((currentGoals) =>
          currentGoals.map((goal) =>
            goal.id === editingGoal.id
              ? updatedGoal
              : goal,
          ),
        );
      } else {
        const newGoal: Goal = {
          id: Date.now().toString(),
          title: title.trim(),
          category,
          description: description.trim(),
          targetDate,
          progress: finalProgress,
          status:
            finalProgress >= 100
              ? 'Completed'
              : 'Active',
        };

        await createGoal(newGoal);

        setGoals((currentGoals) => [
          ...currentGoals,
          newGoal,
        ]);
      }

      closeForm();
    } catch (error) {
      console.error(
        'Failed to save goal:',
        error,
      );
    }
  }

  // --------------------------------------------------
  // GOAL ACTIONS
  // --------------------------------------------------

  async function updateGoalStatus(
    id: string,
    status: GoalStatus,
  ) {
    try {
      await updateGoalStatusInDb(
        id,
        status,
      );

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === id
            ? {
                ...goal,
                status,
              }
            : goal,
        ),
      );

      setMenuGoal(null);
    } catch (error) {
      console.error(
        'Failed to update goal status:',
        error,
      );
    }
  }

  async function deleteGoal(id: string) {
    try {
      await deleteGoalFromDb(id);

      setGoals((currentGoals) =>
        currentGoals.filter(
          (goal) => goal.id !== id,
        ),
      );

      setMenuGoal(null);
    } catch (error) {
      console.error(
        'Failed to delete goal:',
        error,
      );
    }
  }

  function openProgressEditor(goal: Goal) {
    setMenuGoal(null);
    setProgressGoal(goal);
    setNewProgress(goal.progress);

    if (
      !QUICK_PROGRESS.includes(goal.progress)
    ) {
      setCustomNewProgress(
        String(goal.progress),
      );
    } else {
      setCustomNewProgress('');
    }

    setProgressVisible(true);
  }

  async function saveProgress() {
    if (!progressGoal) return;

    try {
      const finalProgress = Math.max(
        0,
        Math.min(100, newProgress),
      );

      await updateGoalProgressInDb(
        progressGoal.id,
        finalProgress,
      );

      const newStatus =
        finalProgress >= 100
          ? 'Completed'
          : progressGoal.status ===
              'Completed'
            ? 'Active'
            : progressGoal.status;

      if (newStatus !== progressGoal.status) {
        await updateGoalStatusInDb(
          progressGoal.id,
          newStatus,
        );
      }

      setGoals((currentGoals) =>
        currentGoals.map((goal) =>
          goal.id === progressGoal.id
            ? {
                ...goal,
                progress: finalProgress,
                status: newStatus,
              }
            : goal,
        ),
      );

      setProgressVisible(false);
      setProgressGoal(null);
      setCustomNewProgress('');
    } catch (error) {
      console.error(
        'Failed to update goal progress:',
        error,
      );
    }
  }

  // --------------------------------------------------
  // SEARCH + FILTER
  // --------------------------------------------------

  const filteredGoals = useMemo(() => {
    let result = [...goals];

    if (searchText.trim()) {
      const search =
        searchText.toLowerCase();

      result = result.filter(
        (goal) =>
          goal.title
            .toLowerCase()
            .includes(search) ||
          goal.category
            .toLowerCase()
            .includes(search) ||
          goal.description
            .toLowerCase()
            .includes(search),
      );
    }

    if (selectedCalendarDate) {
      result = result.filter(
        (goal) =>
          goal.targetDate ===
          selectedCalendarDate,
      );
    } else if (activeFilter !== 'All') {
      result = result.filter(
        (goal) =>
          goal.status === activeFilter,
      );
    }

    return result;
  }, [
    goals,
    searchText,
    activeFilter,
    selectedCalendarDate,
  ]);

  const activeCount = goals.filter(
    (goal) => goal.status === 'Active',
  ).length;

  const completedCount = goals.filter(
    (goal) => goal.status === 'Completed',
  ).length;

  const pausedCount = goals.filter(
    (goal) => goal.status === 'Paused',
  ).length;

  // --------------------------------------------------
  // CALENDAR
  // --------------------------------------------------

  function openFormDatePicker() {
    setCalendarMode('form');

    if (targetDate) {
      const date = new Date(
        `${targetDate}T00:00:00`,
      );

      setCalendarYear(date.getFullYear());
      setCalendarMonth(date.getMonth());
    } else {
      setCalendarYear(today.getFullYear());
      setCalendarMonth(today.getMonth());
    }

    setDatePickerVisible(true);
  }

  function openGoalDateView() {
    setCalendarMode('view');

    const startingDate =
      selectedCalendarDate || todayString;

    const date = new Date(
      `${startingDate}T00:00:00`,
    );

    setCalendarYear(date.getFullYear());
    setCalendarMonth(date.getMonth());

    setDatePickerVisible(true);
  }

  function selectCalendarDate(date: string) {
    if (calendarMode === 'form') {
      setTargetDate(date);
      setDatePickerVisible(false);
      return;
    }

    setSelectedCalendarDate(date);
    setActiveFilter('All');
    setDatePickerVisible(false);
  }

  function clearTargetDate() {
    if (calendarMode === 'form') {
      setTargetDate('');
    } else {
      setSelectedCalendarDate('');
    }

    setDatePickerVisible(false);
  }

  function goToPreviousMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(
        calendarYear - 1,
      );
    } else {
      setCalendarMonth(
        calendarMonth - 1,
      );
    }
  }

  function goToNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(
        calendarYear + 1,
      );
    } else {
      setCalendarMonth(
        calendarMonth + 1,
      );
    }
  }

  const calendarDays = useMemo(() => {
    const daysInMonth =
      getDaysInMonth(
        calendarYear,
        calendarMonth,
      );

    const firstDay =
      getFirstDayOfMonth(
        calendarYear,
        calendarMonth,
      );

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    return days;
  }, [calendarYear, calendarMonth]);

  // --------------------------------------------------
  // PROGRESS INPUT
  // --------------------------------------------------

  function handleStartingProgressInput(
    value: string,
  ) {
    const cleanValue = value.replace(
      /[^0-9]/g,
      '',
    );

    setCustomProgress(cleanValue);

    if (cleanValue === '') {
      setProgress(0);
      return;
    }

    setProgress(
      getProgressValue(cleanValue),
    );
  }

  function handleUpdatedProgressInput(
    value: string,
  ) {
    const cleanValue = value.replace(
      /[^0-9]/g,
      '',
    );

    setCustomNewProgress(cleanValue);

    if (cleanValue === '') {
      setNewProgress(0);
      return;
    }

    setNewProgress(
      getProgressValue(cleanValue),
    );
  }

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        darkMode && styles.safeAreaDark,
      ]}
    >
      <View
        style={[
          styles.screen,
          darkMode && styles.screenDark,
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() =>
            searchVisible &&
            setSearchVisible(false)
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable
              style={[
                styles.backButton,
                darkMode &&
                  styles.backButtonDark,
              ]}
              onPress={() => router.back()}
            >
              <Text
                style={[
                  styles.backText,
                  darkMode &&
                    styles.backTextDark,
                ]}
              >
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerTitleArea}>
              <Text
                style={[
                  styles.headerTitle,
                  darkMode &&
                    styles.headerTitleDark,
                ]}
              >
                Goals
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  darkMode &&
                    styles.headerSubtitleDark,
                ]}
              >
                Build habits and work toward
                what matters.
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={[
                  styles.iconButton,
                  darkMode &&
                    styles.iconButtonDark,
                ]}
                onPress={() =>
                  setSearchVisible(
                    !searchVisible,
                  )
                }
              >
                <Text
                  style={[
                    styles.iconText,
                    darkMode &&
                      styles.iconTextDark,
                  ]}
                >
                  ⌕
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.iconButton,
                  darkMode &&
                    styles.iconButtonDark,
                ]}
                onPress={openGoalDateView}
              >
                <Text
                  style={[
                    styles.iconText,
                    darkMode &&
                      styles.iconTextDark,
                  ]}
                >
                  ▣
                </Text>
              </Pressable>
            </View>
          </View>

          {/* SEARCH */}

          {searchVisible && (
            <Pressable
              style={[
                styles.searchContainer,
                darkMode &&
                  styles.searchContainerDark,
              ]}
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search goals..."
                placeholderTextColor={
                  darkMode
                    ? '#9CA3AF'
                    : '#888'
                }
                style={[
                  styles.searchInput,
                  darkMode &&
                    styles.searchInputDark,
                ]}
                autoFocus
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={() =>
                    setSearchText('')
                  }
                >
                  <Text
                    style={[
                      styles.clearSearch,
                      darkMode &&
                        styles.clearSearchDark,
                    ]}
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </Pressable>
          )}

          {/* TITLE */}

          <View style={styles.titleSection}>
            <View style={styles.titleArea}>
              <Text
                style={[
                  styles.pageTitle,
                  darkMode &&
                    styles.pageTitleDark,
                ]}
              >
                Goal
              </Text>

              <Text
                style={[
                  styles.summaryText,
                  darkMode &&
                    styles.summaryTextDark,
                ]}
              >
                {activeCount} active ·{' '}
                {completedCount} completed ·{' '}
                {pausedCount} paused
              </Text>
            </View>

            <Pressable
              style={[
                styles.newGoalButton,
                darkMode &&
                  styles.newGoalButtonDark,
              ]}
              onPress={openNewGoal}
            >
              <Text
                style={[
                  styles.plusText,
                  darkMode &&
                    styles.plusTextDark,
                ]}
              >
                ＋
              </Text>

              <Text
                style={[
                  styles.newGoalText,
                  darkMode &&
                    styles.newGoalTextDark,
                ]}
              >
                New Goal
              </Text>
            </Pressable>
          </View>

          {/* DATE VIEW */}

          {selectedCalendarDate && (
            <View
              style={[
                styles.dateView,
                darkMode &&
                  styles.dateViewDark,
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.dateViewLabel,
                    darkMode &&
                      styles.dateViewLabelDark,
                  ]}
                >
                  DATE VIEW
                </Text>

                <Text
                  style={[
                    styles.dateViewDate,
                    darkMode &&
                      styles.dateViewDateDark,
                  ]}
                >
                  {displayDate(
                    selectedCalendarDate,
                  )}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.clearDateButton,
                  darkMode &&
                    styles.clearDateButtonDark,
                ]}
                onPress={() =>
                  setSelectedCalendarDate('')
                }
              >
                <Text
                  style={[
                    styles.clearDateText,
                    darkMode &&
                      styles.clearDateTextDark,
                  ]}
                >
                  Clear
                </Text>
              </Pressable>
            </View>
          )}

          {/* DATE VIEW HEADER */}

          {selectedCalendarDate && (
            <View
              style={styles.dateHeading}
            >
              <View>
                <Text
                  style={[
                    styles.dateHeadingTitle,
                    darkMode &&
                      styles.dateHeadingTitleDark,
                  ]}
                >
                  {displayDate(
                    selectedCalendarDate,
                  )}
                </Text>

                <Text
                  style={[
                    styles.dateHeadingSubtitle,
                    darkMode &&
                      styles.dateHeadingSubtitleDark,
                  ]}
                >
                  Goals for this date
                </Text>
              </View>

              <View
                style={[
                  styles.dateCount,
                  darkMode &&
                    styles.dateCountDark,
                ]}
              >
                <Text
                  style={[
                    styles.dateCountText,
                    darkMode &&
                      styles.dateCountTextDark,
                  ]}
                >
                  {filteredGoals.length}
                </Text>
              </View>
            </View>
          )}

          {/* FILTERS */}

          {!selectedCalendarDate && (
            <View style={styles.filterGrid}>
              <FilterButton
                label="All"
                count={goals.length}
                active={
                  activeFilter === 'All'
                }
                onPress={() => {
                  setActiveFilter('All');
                }}
              />

              <FilterButton
                label="Active"
                count={activeCount}
                active={
                  activeFilter === 'Active'
                }
                onPress={() => {
                  setActiveFilter('Active');
                }}
              />

              <FilterButton
                label="Paused"
                count={pausedCount}
                active={
                  activeFilter === 'Paused'
                }
                onPress={() => {
                  setActiveFilter('Paused');
                }}
              />

              <FilterButton
                label="Completed"
                count={completedCount}
                active={
                  activeFilter ===
                  'Completed'
                }
                onPress={() => {
                  setActiveFilter(
                    'Completed',
                  );
                }}
              />
            </View>
          )}

          {/* GOALS */}

          <View style={styles.goalList}>
            {filteredGoals.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                ]}
              >
                <Text
                  style={[
                    styles.emptyIcon,
                    darkMode &&
                      styles.emptyIconDark,
                  ]}
                >
                  ✓
                </Text>

                <Text
                  style={[
                    styles.emptyTitle,
                    darkMode &&
                      styles.emptyTitleDark,
                  ]}
                >
                  {selectedCalendarDate
                    ? 'No goals on this date'
                    : 'No goals yet'}
                </Text>

                <Text
                  style={[
                    styles.emptySubtitle,
                    darkMode &&
                      styles.emptySubtitleDark,
                  ]}
                >
                  {selectedCalendarDate
                    ? 'There are no goals recorded for this date.'
                    : 'Create a goal and start working toward it.'}
                </Text>

                {!selectedCalendarDate && (
                  <Pressable
                    style={[
                      styles.emptyButton,
                      darkMode &&
                        styles.emptyButtonDark,
                    ]}
                    onPress={openNewGoal}
                  >
                    <Text
                      style={[
                        styles.emptyButtonText,
                        darkMode &&
                          styles.emptyButtonTextDark,
                      ]}
                    >
                      ＋ Create Goal
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onMenu={() =>
                    setMenuGoal(goal)
                  }
                  onProgress={() =>
                    openProgressEditor(
                      goal,
                    )
                  }
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* CLOSE SEARCH WHEN TAPPING OUTSIDE */}

        {searchVisible && (
          <Pressable
            style={styles.searchDismissLayer}
            pointerEvents="box-none"
            onPress={() =>
              setSearchVisible(false)
            }
          />
        )}
      </View>

      {/* GOAL MENU */}

      <Modal
        visible={menuGoal !== null}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuGoal(null)
        }
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() =>
            setMenuGoal(null)
          }
        >
          <Pressable
            style={[
              styles.menuCard,
              darkMode &&
                styles.menuCardDark,
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={[
                styles.menuTitle,
                darkMode &&
                  styles.menuTitleDark,
              ]}
            >
              Goal Options
            </Text>

            <Pressable
              style={[
                styles.menuItem,
                darkMode &&
                  styles.menuItemDark,
              ]}
              onPress={() => {
                if (menuGoal) {
                  openEditGoal(
                    menuGoal,
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.menuItemText,
                  darkMode &&
                    styles.menuItemTextDark,
                ]}
              >
                ✏️ Edit Goal
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.menuItem,
                darkMode &&
                  styles.menuItemDark,
              ]}
              onPress={() => {
                if (menuGoal) {
                  openProgressEditor(
                    menuGoal,
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.menuItemText,
                  darkMode &&
                    styles.menuItemTextDark,
                ]}
              >
                📈 Update Progress
              </Text>
            </Pressable>

            {menuGoal?.status ===
              'Active' && (
              <Pressable
                style={[
                  styles.menuItem,
                  darkMode &&
                    styles.menuItemDark,
                ]}
                onPress={() => {
                  if (menuGoal) {
                    updateGoalStatus(
                      menuGoal.id,
                      'Paused',
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    darkMode &&
                      styles.menuItemTextDark,
                  ]}
                >
                  ⏸ Pause Goal
                </Text>
              </Pressable>
            )}

            {menuGoal?.status ===
              'Paused' && (
              <Pressable
                style={[
                  styles.menuItem,
                  darkMode &&
                    styles.menuItemDark,
                ]}
                onPress={() => {
                  if (menuGoal) {
                    updateGoalStatus(
                      menuGoal.id,
                      'Active',
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    darkMode &&
                      styles.menuItemTextDark,
                  ]}
                >
                  ▶️ Resume Goal
                </Text>
              </Pressable>
            )}

            {menuGoal?.status !==
              'Completed' && (
              <Pressable
                style={[
                  styles.menuItem,
                  darkMode &&
                    styles.menuItemDark,
                ]}
                onPress={async () => {
                  if (!menuGoal) return;

                  try {
                    await updateGoalProgressInDb(
                      menuGoal.id,
                      100,
                    );

                    await updateGoalStatusInDb(
                      menuGoal.id,
                      'Completed',
                    );

                    setGoals((currentGoals) =>
                      currentGoals.map((goal) =>
                        goal.id === menuGoal.id
                          ? {
                              ...goal,
                              progress: 100,
                              status: 'Completed',
                            }
                          : goal,
                      ),
                    );

                    setMenuGoal(null);
                  } catch (error) {
                    console.error(
                      'Failed to complete goal:',
                      error,
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    darkMode &&
                      styles.menuItemTextDark,
                  ]}
                >
                  ✓ Complete Goal
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[
                styles.menuItem,
                darkMode &&
                  styles.menuItemDark,
              ]}
              onPress={() => {
                if (menuGoal) {
                  deleteGoal(
                    menuGoal.id,
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.deleteText,
                  darkMode &&
                    styles.deleteTextDark,
                ]}
              >
                🗑️ Delete Goal
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.cancelMenuButton,
                darkMode &&
                  styles.cancelMenuButtonDark,
              ]}
              onPress={() =>
                setMenuGoal(null)
              }
            >
              <Text
                style={[
                  styles.cancelMenuText,
                  darkMode &&
                    styles.cancelMenuTextDark,
                ]}
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CREATE / EDIT GOAL */}

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={
                styles.formScroll
              }
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.formCard,
                  darkMode &&
                    styles.formCardDark,
                ]}
              >
                <View style={styles.formHeader}>
                  <Text
                    style={[
                      styles.formTitle,
                      darkMode &&
                        styles.formTitleDark,
                    ]}
                  >
                    {editingGoal
                      ? 'Edit Goal'
                      : 'New Goal'}
                  </Text>

                  <Pressable
                    style={[
                      styles.closeButton,
                      darkMode &&
                        styles.closeButtonDark,
                    ]}
                    onPress={closeForm}
                  >
                    <Text
                      style={[
                        styles.closeText,
                        darkMode &&
                          styles.closeTextDark,
                      ]}
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>

                {/* TITLE */}

                <Text
                  style={[
                    styles.label,
                    darkMode &&
                      styles.labelDark,
                  ]}
                >
                  Goal Title
                </Text>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Get Stronger"
                  placeholderTextColor={
                    darkMode
                      ? '#9CA3AF'
                      : '#999'
                  }
                  style={[
                    styles.input,
                    darkMode &&
                      styles.inputDark,
                  ]}
                />

                {/* DESCRIPTION */}

                <Text
                  style={[
                    styles.label,
                    darkMode &&
                      styles.labelDark,
                  ]}
                >
                  Description (Optional)
                </Text>

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. I work out because I want to be stronger and healthier."
                  placeholderTextColor={
                    darkMode
                      ? '#9CA3AF'
                      : '#999'
                  }
                  style={[
                    styles.input,
                    styles.descriptionInput,
                    darkMode &&
                      styles.inputDark,
                  ]}
                  multiline
                  textAlignVertical="top"
                />

                {/* CATEGORY */}

                <Text
                  style={[
                    styles.label,
                    darkMode &&
                      styles.labelDark,
                  ]}
                >
                  Category
                </Text>

                <View
                  style={
                    styles.categoryContainer
                  }
                >
                  {CATEGORIES.map((item) => (
                    <Pressable
                      key={item}
                      style={[
                        styles.categoryButton,
                        darkMode &&
                          styles.categoryButtonDark,
                        category === item &&
                          styles.categoryButtonActive,
                        category === item &&
                          darkMode &&
                          styles.categoryButtonActiveDark,
                      ]}
                      onPress={() =>
                        setCategory(item)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          darkMode &&
                            styles.categoryTextDark,
                          category === item &&
                            styles.categoryTextActive,
                          category === item &&
                            darkMode &&
                            styles.categoryTextActiveDark,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* TARGET DATE */}

                <Text
                  style={[
                    styles.label,
                    darkMode &&
                      styles.labelDark,
                  ]}
                >
                  Target Date
                </Text>

                <Pressable
                  style={[
                    styles.dateInput,
                    darkMode &&
                      styles.dateInputDark,
                  ]}
                  onPress={
                    openFormDatePicker
                  }
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      darkMode &&
                        styles.dateInputTextDark,
                      !targetDate &&
                        styles.placeholderText,
                      !targetDate &&
                        darkMode &&
                        styles.placeholderTextDark,
                    ]}
                  >
                    {targetDate
                      ? displayDate(
                          targetDate,
                        )
                      : 'Select target date'}
                  </Text>

                  <Text
                    style={[
                      styles.calendarIcon,
                      darkMode &&
                        styles.calendarIconDark,
                    ]}
                  >
                    ▣
                  </Text>
                </Pressable>

                {/* STARTING PROGRESS */}

                <Text
                  style={[
                    styles.label,
                    darkMode &&
                      styles.labelDark,
                  ]}
                >
                  Starting Progress:{' '}
                  {progress}%
                </Text>

                <View
                  style={
                    styles.progressButtons
                  }
                >
                  {QUICK_PROGRESS.map(
                    (value) => (
                      <Pressable
                        key={value}
                        style={[
                          styles.progressButton,
                          darkMode &&
                            styles.progressButtonDark,
                          progress === value &&
                            customProgress === '' &&
                            styles.progressButtonActive,
                          progress === value &&
                            customProgress === '' &&
                            darkMode &&
                            styles.progressButtonActiveDark,
                        ]}
                        onPress={() => {
                          setProgress(
                            value,
                          );
                          setCustomProgress(
                            '',
                          );
                        }}
                      >
                        <Text
                          style={[
                            styles.progressButtonText,
                            darkMode &&
                              styles.progressButtonTextDark,
                            progress ===
                              value &&
                              customProgress ===
                                '' &&
                              styles.progressButtonTextActive,
                            progress === value &&
                              customProgress === '' &&
                              darkMode &&
                              styles.progressButtonTextActiveDark,
                          ]}
                        >
                          {value}%
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>

                <View
                  style={
                    styles.customProgressRow
                  }
                >
                  <Text
                    style={[
                      styles.customProgressLabel,
                      darkMode &&
                        styles.customProgressLabelDark,
                    ]}
                  >
                    Custom:
                  </Text>

                  <TextInput
                    value={customProgress}
                    onChangeText={
                      handleStartingProgressInput
                    }
                    placeholder="e.g. 10"
                    placeholderTextColor={
                      darkMode
                        ? '#9CA3AF'
                        : '#999'
                    }
                    keyboardType="numeric"
                    maxLength={3}
                    style={[
                      styles.customProgressInput,
                      darkMode &&
                        styles.customProgressInputDark,
                    ]}
                  />

                  <Text
                    style={[
                      styles.percentSymbol,
                      darkMode &&
                        styles.percentSymbolDark,
                    ]}
                  >
                    %
                  </Text>
                </View>

                {/* FORM BUTTONS */}

                <View style={styles.formButtons}>
                  <Pressable
                    style={[
                      styles.cancelButton,
                      darkMode &&
                        styles.cancelButtonDark,
                    ]}
                    onPress={closeForm}
                  >
                    <Text
                      style={[
                        styles.cancelButtonText,
                        darkMode &&
                          styles.cancelButtonTextDark,
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.saveButton,
                      (!title.trim() ||
                        !targetDate) &&
                        styles.saveButtonDisabled,
                      darkMode &&
                        styles.saveButtonDark,
                    ]}
                    onPress={saveGoal}
                    disabled={
                      !title.trim() ||
                      !targetDate
                    }
                  >
                    <Text
                      style={[
                        styles.saveButtonText,
                        darkMode &&
                          styles.saveButtonTextDark,
                      ]}
                    >
                      {editingGoal
                        ? 'Save Changes'
                        : '＋ Add Goal'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* UPDATE PROGRESS */}

      <Modal
        visible={progressVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setProgressVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.progressModal,
              darkMode &&
                styles.progressModalDark,
            ]}
          >
            <View style={styles.formHeader}>
              <Text
                style={[
                  styles.formTitle,
                  darkMode &&
                    styles.formTitleDark,
                ]}
              >
                Update Progress
              </Text>

              <Pressable
                style={[
                  styles.closeButton,
                  darkMode &&
                    styles.closeButtonDark,
                ]}
                onPress={() =>
                  setProgressVisible(false)
                }
              >
                <Text
                  style={[
                    styles.closeText,
                    darkMode &&
                      styles.closeTextDark,
                  ]}
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.progressGoalTitle,
                darkMode &&
                  styles.progressGoalTitleDark,
              ]}
            >
              {progressGoal?.title}
            </Text>

            <Text
              style={styles.bigProgress}
            >
              {newProgress}%
            </Text>

            <View
              style={
                styles.progressChoiceGrid
              }
            >
              {QUICK_PROGRESS.map(
                (value) => (
                  <Pressable
                    key={value}
                    style={[
                      styles.progressChoice,
                      darkMode &&
                        styles.progressChoiceDark,
                      newProgress ===
                        value &&
                        customNewProgress ===
                          '' &&
                        styles.progressChoiceActive,
                      newProgress === value &&
                        customNewProgress === '' &&
                        darkMode &&
                        styles.progressChoiceActiveDark,
                    ]}
                    onPress={() => {
                      setNewProgress(
                        value,
                      );
                      setCustomNewProgress(
                        '',
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.progressChoiceText,
                        darkMode &&
                          styles.progressChoiceTextDark,
                        newProgress ===
                          value &&
                          customNewProgress ===
                            '' &&
                          styles.progressChoiceTextActive,
                        newProgress === value &&
                          customNewProgress === '' &&
                          darkMode &&
                          styles.progressChoiceTextActiveDark,
                      ]}
                    >
                      {value}%
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            <View
              style={
                styles.customProgressRow
              }
            >
              <Text
                style={[
                  styles.customProgressLabel,
                  darkMode &&
                    styles.customProgressLabelDark,
                ]}
              >
                Custom:
              </Text>

              <TextInput
                value={customNewProgress}
                onChangeText={
                  handleUpdatedProgressInput
                }
                placeholder="e.g. 10"
                placeholderTextColor={
                  darkMode
                    ? '#9CA3AF'
                    : '#999'
                }
                keyboardType="numeric"
                maxLength={3}
                style={[
                  styles.customProgressInput,
                  darkMode &&
                    styles.customProgressInputDark,
                ]}
              />

              <Text
                style={[
                  styles.percentSymbol,
                  darkMode &&
                    styles.percentSymbolDark,
                ]}
              >
                %
              </Text>
            </View>

            <View style={styles.formButtons}>
              <Pressable
                style={[
                  styles.cancelButton,
                  darkMode &&
                    styles.cancelButtonDark,
                ]}
                onPress={() =>
                  setProgressVisible(false)
                }
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    darkMode &&
                      styles.cancelButtonTextDark,
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  darkMode &&
                    styles.saveButtonDark,
                ]}
                onPress={saveProgress}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    darkMode &&
                      styles.saveButtonTextDark,
                  ]}
                >
                  Save Progress
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CALENDAR */}

      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDatePickerVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setDatePickerVisible(false)
          }
        >
          <Pressable
            style={[
              styles.calendarCard,
              darkMode &&
                styles.calendarCardDark,
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={styles.calendarHeader}
            >
              <Pressable
                onPress={
                  goToPreviousMonth
                }
              >
                <Text
                  style={[
                    styles.monthArrow,
                    darkMode &&
                      styles.monthArrowDark,
                  ]}
                >
                  ‹
                </Text>
              </Pressable>

              <Text
                style={[
                  styles.monthTitle,
                  darkMode &&
                    styles.monthTitleDark,
                ]}
              >
                {MONTHS[calendarMonth]}{' '}
                {calendarYear}
              </Text>

              <Pressable
                onPress={goToNextMonth}
              >
                <Text
                  style={[
                    styles.monthArrow,
                    darkMode &&
                      styles.monthArrowDark,
                  ]}
                >
                  ›
                </Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <Text
                  key={day}
                  style={[
                    styles.weekText,
                    darkMode &&
                      styles.weekTextDark,
                  ]}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View
              style={styles.calendarGrid}
            >
              {calendarDays.map(
                (day, index) => {
                  if (day === null) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={
                          styles.dayCell
                        }
                      />
                    );
                  }

                  const date = new Date(
                    calendarYear,
                    calendarMonth,
                    day,
                  );

                  const dateString =
                    formatDate(date);

                  const isSelected =
                    calendarMode ===
                    'form'
                      ? targetDate ===
                        dateString
                      : selectedCalendarDate ===
                        dateString;

                  const isToday =
                    todayString ===
                    dateString;

                  return (
                    <Pressable
                      key={dateString}
                      style={[
                        styles.dayCell,
                        isSelected &&
                          styles.selectedDay,
                        isToday &&
                          !isSelected &&
                          styles.todayDay,
                      ]}
                      onPress={() =>
                        selectCalendarDate(
                          dateString,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.dayText,
                          darkMode &&
                            styles.dayTextDark,
                          isSelected &&
                            styles.selectedDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            <View
              style={styles.calendarActions}
            >
              <Pressable
                onPress={
                  clearTargetDate
                }
                style={[
                  styles.clearCalendarButton,
                  darkMode &&
                    styles.clearCalendarButtonDark,
                ]}
              >
                <Text
                  style={[
                    styles.clearDateButtonText,
                    darkMode &&
                      styles.clearDateButtonTextDark,
                  ]}
                >
                  Clear
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setDatePickerVisible(
                    false,
                  )
                }
                style={[
                  styles.doneDateButton,
                  darkMode &&
                    styles.doneDateButtonDark,
                ]}
              >
                <Text
                  style={[
                    styles.doneDateButtonText,
                    darkMode &&
                      styles.doneDateButtonTextDark,
                  ]}
                >
                  Done
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ==================================================
// FILTER BUTTON
// ==================================================

function FilterButton({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const { darkMode } = useTheme();

  return (
    <Pressable
      style={[
        styles.filterButton,
        darkMode &&
          styles.filterButtonDark,
        active &&
          styles.filterButtonActive,
        active &&
          darkMode &&
          styles.filterButtonActiveDark,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterLabel,
          darkMode &&
            styles.filterLabelDark,
          active &&
            styles.filterLabelActive,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.filterCount,
          darkMode &&
            styles.filterCountDark,
          active &&
            styles.filterCountActive,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

// ==================================================
// GOAL CARD
// ==================================================

function GoalCard({
  goal,
  onMenu,
  onProgress,
}: {
  goal: Goal;
  onMenu: () => void;
  onProgress: () => void;
}) {
  const { darkMode } = useTheme();

  const statusStyle =
    goal.status === 'Active'
      ? styles.activeBadge
      : goal.status === 'Paused'
        ? styles.pausedBadge
        : styles.completedBadge;

  const darkStatusStyle =
    goal.status === 'Active'
      ? styles.activeBadgeDark
      : goal.status === 'Paused'
        ? styles.pausedBadgeDark
        : styles.completedBadgeDark;

  return (
    <View
      style={[
        styles.goalCard,
        darkMode &&
          styles.goalCardDark,
      ]}
    >
      <View style={styles.goalTopRow}>
        <View style={styles.goalTitleArea}>
          <Text
            style={[
              styles.goalTitle,
              darkMode &&
                styles.goalTitleDark,
            ]}
            numberOfLines={2}
          >
            {goal.title}
          </Text>

          <Text
            style={[
              styles.goalDescription,
              darkMode &&
                styles.goalDescriptionDark,
            ]}
            numberOfLines={2}
          >
            {goal.description ||
              'e.g. Working out'}
          </Text>
        </View>

        <View style={styles.goalRight}>
          <View
            style={[
              styles.statusBadge,
              statusStyle,
              darkMode &&
                darkStatusStyle,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                darkMode &&
                  styles.statusTextDark,
              ]}
            >
              {goal.status}
            </Text>
          </View>

          <Pressable
            style={styles.moreButton}
            onPress={onMenu}
          >
            <Text
              style={[
                styles.moreText,
                darkMode &&
                  styles.moreTextDark,
              ]}
            >
              ⋮
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.categoryPill,
          darkMode &&
            styles.categoryPillDark,
        ]}
      >
        <Text
          style={[
            styles.categoryPillText,
            darkMode &&
              styles.categoryPillTextDark,
          ]}
        >
          {goal.category}
        </Text>
      </View>

      <View
        style={styles.progressHeader}
      >
        <Text
          style={[
            styles.progressLabel,
            darkMode &&
              styles.progressLabelDark,
          ]}
        >
          Progress
        </Text>

        <Text
          style={[
            styles.progressPercent,
            darkMode &&
              styles.progressPercentDark,
          ]}
        >
          {goal.progress}%
        </Text>
      </View>

      <View
        style={[
          styles.progressTrack,
          darkMode &&
            styles.progressTrackDark,
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${goal.progress}%`,
            },
          ]}
        />
      </View>

      <View
        style={styles.goalBottomRow}
      >
        <View>
          <Text
            style={[
              styles.targetLabel,
              darkMode &&
                styles.targetLabelDark,
            ]}
          >
            Target date
          </Text>

          <Text
            style={[
              styles.targetDate,
              darkMode &&
                styles.targetDateDark,
            ]}
          >
            {displayDate(
              goal.targetDate,
            )}
          </Text>
        </View>

        {goal.status !==
        'Completed' ? (
          <Pressable
            style={[
              styles.progressAction,
              darkMode &&
                styles.progressActionDark,
            ]}
            onPress={onProgress}
          >
            <Text
              style={[
                styles.progressActionText,
                darkMode &&
                  styles.progressActionTextDark,
              ]}
            >
              Update
            </Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.completedCheck,
              darkMode &&
                styles.completedCheckDark,
            ]}
          >
            <Text
              style={[
                styles.completedCheckText,
                darkMode &&
                  styles.completedCheckTextDark,
              ]}
            >
              ✓ Done
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  safeAreaDark: {
    backgroundColor: '#111827',
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  screenDark: {
    backgroundColor: '#111827',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 50,
  },

  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonDark: {
    backgroundColor: '#193746',
  },

  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: '#222222',
    marginTop: -4,
  },

  backTextDark: {
    color: '#7CC7E7',
  },

  headerTitleArea: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  headerTitleDark: {
    color: '#F9FAFB',
  },

  headerSubtitle: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
  },

  headerSubtitleDark: {
    color: '#9CA3AF',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButtonDark: {
    backgroundColor: '#193746',
  },

  iconText: {
    fontSize: 23,
    color: '#222222',
  },

  iconTextDark: {
    color: '#7CC7E7',
  },

  searchContainer: {
    marginTop: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    zIndex: 10,
  },

  searchContainerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222222',
  },

  searchInputDark: {
    color: '#F9FAFB',
  },

  clearSearch: {
    fontSize: 24,
    color: '#777777',
    paddingLeft: 10,
  },

  clearSearchDark: {
    color: '#9CA3AF',
  },

  searchDismissLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },

  titleSection: {
    marginTop: 30,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  titleArea: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#111111',
  },

  pageTitleDark: {
    color: '#F9FAFB',
  },

  summaryText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
  },

  summaryTextDark: {
    color: '#9CA3AF',
  },

  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEEFF',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 22,
  },

  newGoalButtonDark: {
    backgroundColor: '#24566B',
  },

  plusText: {
    fontSize: 20,
    color: '#222222',
  },

  plusTextDark: {
    color: '#BDE7F8',
  },

  newGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginLeft: 3,
  },

  newGoalTextDark: {
    color: '#BDE7F8',
  },

  dateView: {
    backgroundColor: '#EEF7FF',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateViewDark: {
    backgroundColor: '#193746',
  },

  dateViewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B8CA4',
    letterSpacing: 1,
  },

  dateViewLabelDark: {
    color: '#9CCFE5',
  },

  dateViewDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2876A8',
    marginTop: 3,
  },

  dateViewDateDark: {
    color: '#7CC7E7',
  },

  clearDateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  clearDateButtonDark: {
    backgroundColor: '#1F2937',
  },

  clearDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2876A8',
  },

  clearDateTextDark: {
    color: '#7CC7E7',
  },

  dateHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  dateHeadingTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: '#222222',
  },

  dateHeadingTitleDark: {
    color: '#F9FAFB',
  },

  dateHeadingSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  dateHeadingSubtitleDark: {
    color: '#9CA3AF',
  },

  dateCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateCountDark: {
    backgroundColor: '#193746',
  },

  dateCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2876A8',
  },

  dateCountTextDark: {
    color: '#7CC7E7',
  },

  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },

  filterButton: {
    width: '48%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },

  filterButtonDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  filterButtonActive: {
    backgroundColor: '#E5F3FF',
    borderColor: '#BBDDF5',
  },

  filterButtonActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  filterLabelDark: {
    color: '#D1D5DB',
  },

  filterLabelActive: {
    color: '#2876A8',
  },

  filterCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777777',
  },

  filterCountDark: {
    color: '#9CA3AF',
  },

  filterCountActive: {
    color: '#2876A8',
  },

  goalList: {
    gap: 14,
  },

  goalCard: {
    borderWidth: 1,
    borderColor: '#CFCFCF',
    borderRadius: 20,
    padding: 17,
    backgroundColor: '#FFFFFF',
  },

  goalCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  goalTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171717',
  },

  goalTitleDark: {
    color: '#F9FAFB',
  },

  goalDescription: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  goalDescriptionDark: {
    color: '#9CA3AF',
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F7FB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 9,
  },

  categoryPillDark: {
    backgroundColor: '#193746',
  },

  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5C7890',
  },

  categoryPillTextDark: {
    color: '#9CCFE5',
  },

  goalRight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  activeBadge: {
    backgroundColor: '#CFF7D2',
  },

  activeBadgeDark: {
    backgroundColor: '#254C36',
  },

  pausedBadge: {
    backgroundColor: '#E2E2E2',
  },

  pausedBadgeDark: {
    backgroundColor: '#374151',
  },

  completedBadge: {
    backgroundColor: '#BFE4FF',
  },

  completedBadgeDark: {
    backgroundColor: '#24566B',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },

  statusTextDark: {
    color: '#D1D5DB',
  },

  moreButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreText: {
    fontSize: 24,
    color: '#555555',
    marginTop: -5,
  },

  moreTextDark: {
    color: '#D1D5DB',
  },

  progressHeader: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 12,
    color: '#555555',
  },

  progressLabelDark: {
    color: '#9CA3AF',
  },

  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
  },

  progressPercentDark: {
    color: '#D1D5DB',
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    marginTop: 7,
    overflow: 'hidden',
  },

  progressTrackDark: {
    backgroundColor: '#374151',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#9ED6FF',
    borderRadius: 5,
  },

  goalBottomRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  targetLabel: {
    fontSize: 10,
    color: '#888888',
  },

  targetLabelDark: {
    color: '#9CA3AF',
  },

  targetDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    marginTop: 2,
  },

  targetDateDark: {
    color: '#E5E7EB',
  },

  progressAction: {
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },

  progressActionDark: {
    backgroundColor: '#193746',
  },

  progressActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#377FA9',
  },

  progressActionTextDark: {
    color: '#7CC7E7',
  },

  completedCheck: {
    backgroundColor: '#E8F7EA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },

  completedCheckDark: {
    backgroundColor: '#254C36',
  },

  completedCheckText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4C8B55',
  },

  completedCheckTextDark: {
    color: '#9AD6A3',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 70,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 38,
    color: '#9ED6FF',
  },

  emptyIconDark: {
    color: '#7CC7E7',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginTop: 12,
    textAlign: 'center',
  },

  emptyTitleDark: {
    color: '#F9FAFB',
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#777777',
    marginTop: 6,
    textAlign: 'center',
  },

  emptySubtitleDark: {
    color: '#9CA3AF',
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#DCEEFF',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
  },

  emptyButtonDark: {
    backgroundColor: '#24566B',
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2876A8',
  },

  emptyButtonTextDark: {
    color: '#BDE7F8',
  },

  // MENU

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  menuCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },

  menuCardDark: {
    backgroundColor: '#1F2937',
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },

  menuTitleDark: {
    color: '#F9FAFB',
  },

  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  menuItemDark: {
    borderBottomColor: '#374151',
  },

  menuItemText: {
    fontSize: 14,
    color: '#333333',
  },

  menuItemTextDark: {
    color: '#E5E7EB',
  },

  deleteText: {
    fontSize: 14,
    color: '#D95353',
  },

  deleteTextDark: {
    color: '#F08080',
  },

  cancelMenuButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
  },

  cancelMenuButtonDark: {
    backgroundColor: '#374151',
  },

  cancelMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
  },

  cancelMenuTextDark: {
    color: '#D1D5DB',
  },

  // MODALS

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.30)',
    justifyContent: 'center',
    padding: 20,
  },

  keyboardView: {
    width: '100%',
  },

  formScroll: {
    paddingVertical: 20,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },

  formCardDark: {
    backgroundColor: '#1F2937',
  },

  progressModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },

  progressModalDark: {
    backgroundColor: '#1F2937',
  },

  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222222',
  },

  formTitleDark: {
    color: '#F9FAFB',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonDark: {
    backgroundColor: '#374151',
  },

  closeText: {
    fontSize: 23,
    color: '#555555',
    marginTop: -2,
  },

  closeTextDark: {
    color: '#D1D5DB',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 7,
    marginTop: 13,
  },

  labelDark: {
    color: '#D1D5DB',
  },

  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 13,
    color: '#222222',
    backgroundColor: '#FFFFFF',
  },

  inputDark: {
    color: '#F9FAFB',
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  descriptionInput: {
    height: 85,
    paddingTop: 12,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryButton: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  categoryButtonDark: {
    borderColor: '#4B5563',
  },

  categoryButtonActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  categoryButtonActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  categoryText: {
    fontSize: 12,
    color: '#555555',
  },

  categoryTextDark: {
    color: '#D1D5DB',
  },

  categoryTextActive: {
    color: '#2876A8',
    fontWeight: '600',
  },

  categoryTextActiveDark: {
    color: '#7CC7E7',
  },

  dateInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateInputDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  dateInputText: {
    fontSize: 13,
    color: '#333333',
  },

  dateInputTextDark: {
    color: '#F9FAFB',
  },

  placeholderText: {
    color: '#999999',
  },

  placeholderTextDark: {
    color: '#9CA3AF',
  },

  calendarIcon: {
    fontSize: 17,
    color: '#666666',
  },

  calendarIconDark: {
    color: '#7CC7E7',
  },

  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },

  progressButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: 'center',
  },

  progressButtonDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  progressButtonActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  progressButtonActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  progressButtonText: {
    fontSize: 11,
    color: '#666666',
  },

  progressButtonTextDark: {
    color: '#D1D5DB',
  },

  progressButtonTextActive: {
    color: '#2876A8',
    fontWeight: '700',
  },

  progressButtonTextActiveDark: {
    color: '#7CC7E7',
  },

  customProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
  },

  customProgressLabel: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },

  customProgressLabelDark: {
    color: '#9CA3AF',
  },

  customProgressInput: {
    width: 70,
    height: 38,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 9,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    color: '#222222',
  },

  customProgressInputDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    color: '#F9FAFB',
  },

  percentSymbol: {
    fontSize: 13,
    color: '#555555',
    marginLeft: 5,
  },

  percentSymbolDark: {
    color: '#D1D5DB',
  },

  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonDark: {
    borderColor: '#4B5563',
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },

  cancelButtonTextDark: {
    color: '#D1D5DB',
  },

  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#B9E0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDark: {
    backgroundColor: '#24566B',
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2876A8',
  },

  saveButtonTextDark: {
    color: '#BDE7F8',
  },

  progressGoalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
  },

  progressGoalTitleDark: {
    color: '#E5E7EB',
  },

  bigProgress: {
    fontSize: 42,
    fontWeight: '700',
    color: '#2876A8',
    textAlign: 'center',
    marginVertical: 20,
  },

  progressChoiceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 7,
  },

  progressChoice: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },

  progressChoiceDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  progressChoiceActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  progressChoiceActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  progressChoiceText: {
    fontSize: 11,
    color: '#666666',
  },

  progressChoiceTextDark: {
    color: '#D1D5DB',
  },

  progressChoiceTextActive: {
    color: '#2876A8',
    fontWeight: '700',
  },

  progressChoiceTextActiveDark: {
    color: '#7CC7E7',
  },

  // CALENDAR

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
  },

  calendarCardDark: {
    backgroundColor: '#1F2937',
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222222',
  },

  monthTitleDark: {
    color: '#F9FAFB',
  },

  monthArrow: {
    fontSize: 30,
    color: '#555555',
    paddingHorizontal: 10,
  },

  monthArrowDark: {
    color: '#7CC7E7',
  },

  weekRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 8,
  },

  weekText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#888888',
  },

  weekTextDark: {
    color: '#9CA3AF',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  dayText: {
    fontSize: 13,
    color: '#333333',
  },

  dayTextDark: {
    color: '#E5E7EB',
  },

  selectedDay: {
    backgroundColor: '#B9E0FA',
  },

  selectedDayText: {
    color: '#2876A8',
    fontWeight: '700',
  },

  todayDay: {
    borderWidth: 1,
    borderColor: '#9FD0EF',
  },

  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
  },

  clearCalendarButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  clearCalendarButtonDark: {
    backgroundColor: 'transparent',
  },

  clearDateButtonText: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '600',
  },

  clearDateButtonTextDark: {
    color: '#D1D5DB',
  },

  doneDateButton: {
    backgroundColor: '#DCEEFF',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  doneDateButtonDark: {
    backgroundColor: '#24566B',
  },

  doneDateButtonText: {
    fontSize: 13,
    color: '#2876A8',
    fontWeight: '700',
  },

  doneDateButtonTextDark: {
    color: '#BDE7F8',
  },
});