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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
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
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </Pressable>

            <View style={styles.headerTitleArea}>
              <Text style={styles.headerTitle}>
                Goals
              </Text>

              <Text style={styles.headerSubtitle}>
                Build habits and work toward
                what matters.
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconButton}
                onPress={() =>
                  setSearchVisible(
                    !searchVisible,
                  )
                }
              >
                <Text style={styles.iconText}>
                  ⌕
                </Text>
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={openGoalDateView}
              >
                <Text style={styles.iconText}>
                  ▣
                </Text>
              </Pressable>
            </View>
          </View>

          {/* SEARCH */}

          {searchVisible && (
            <Pressable
              style={styles.searchContainer}
              onPress={(event) =>
                event.stopPropagation()
              }
            >
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search goals..."
                placeholderTextColor="#888"
                style={styles.searchInput}
                autoFocus
              />

              {searchText.length > 0 && (
                <Pressable
                  onPress={() =>
                    setSearchText('')
                  }
                >
                  <Text
                    style={styles.clearSearch}
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
              <Text style={styles.pageTitle}>
                Goal
              </Text>

              <Text style={styles.summaryText}>
                {activeCount} active ·{' '}
                {completedCount} completed ·{' '}
                {pausedCount} paused
              </Text>
            </View>

            <Pressable
              style={styles.newGoalButton}
              onPress={openNewGoal}
            >
              <Text style={styles.plusText}>
                ＋
              </Text>

              <Text style={styles.newGoalText}>
                New Goal
              </Text>
            </Pressable>
          </View>

          {/* DATE VIEW */}

          {selectedCalendarDate && (
            <View style={styles.dateView}>
              <View>
                <Text
                  style={styles.dateViewLabel}
                >
                  DATE VIEW
                </Text>

                <Text
                  style={styles.dateViewDate}
                >
                  {displayDate(
                    selectedCalendarDate,
                  )}
                </Text>
              </View>

              <Pressable
                style={styles.clearDateButton}
                onPress={() =>
                  setSelectedCalendarDate('')
                }
              >
                <Text
                  style={styles.clearDateText}
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
                  style={styles.dateHeadingTitle}
                >
                  {displayDate(
                    selectedCalendarDate,
                  )}
                </Text>

                <Text
                  style={styles.dateHeadingSubtitle}
                >
                  Goals for this date
                </Text>
              </View>

              <View style={styles.dateCount}>
                <Text
                  style={styles.dateCountText}
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>
                  ✓
                </Text>

                <Text
                  style={styles.emptyTitle}
                >
                  {selectedCalendarDate
                    ? 'No goals on this date'
                    : 'No goals yet'}
                </Text>

                <Text
                  style={styles.emptySubtitle}
                >
                  {selectedCalendarDate
                    ? 'There are no goals recorded for this date.'
                    : 'Create a goal and start working toward it.'}
                </Text>

                {!selectedCalendarDate && (
                  <Pressable
                    style={styles.emptyButton}
                    onPress={openNewGoal}
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
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
            style={styles.menuCard}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text style={styles.menuTitle}>
              Goal Options
            </Text>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                if (menuGoal) {
                  openEditGoal(
                    menuGoal,
                  );
                }
              }}
            >
              <Text
                style={styles.menuItemText}
              >
                ✏️ Edit Goal
              </Text>
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                if (menuGoal) {
                  openProgressEditor(
                    menuGoal,
                  );
                }
              }}
            >
              <Text
                style={styles.menuItemText}
              >
                📈 Update Progress
              </Text>
            </Pressable>

            {menuGoal?.status ===
              'Active' && (
              <Pressable
                style={styles.menuItem}
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
                  style={
                    styles.menuItemText
                  }
                >
                  ⏸ Pause Goal
                </Text>
              </Pressable>
            )}

            {menuGoal?.status ===
              'Paused' && (
              <Pressable
                style={styles.menuItem}
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
                  style={
                    styles.menuItemText
                  }
                >
                  ▶️ Resume Goal
                </Text>
              </Pressable>
            )}

            {menuGoal?.status !==
              'Completed' && (
              <Pressable
                style={styles.menuItem}
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
                  style={
                    styles.menuItemText
                  }
                >
                  ✓ Complete Goal
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={() => {
                if (menuGoal) {
                  deleteGoal(
                    menuGoal.id,
                  );
                }
              }}
            >
              <Text style={styles.deleteText}>
                🗑️ Delete Goal
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelMenuButton}
              onPress={() =>
                setMenuGoal(null)
              }
            >
              <Text
                style={styles.cancelMenuText}
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
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>
                    {editingGoal
                      ? 'Edit Goal'
                      : 'New Goal'}
                  </Text>

                  <Pressable
                    style={
                      styles.closeButton
                    }
                    onPress={closeForm}
                  >
                    <Text
                      style={
                        styles.closeText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>

                {/* TITLE */}

                <Text style={styles.label}>
                  Goal Title
                </Text>

                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Get Stronger"
                  placeholderTextColor="#999"
                  style={styles.input}
                />

                {/* DESCRIPTION */}

                <Text style={styles.label}>
                  Description (Optional)
                </Text>

                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="e.g. I work out because I want to be stronger and healthier."
                  placeholderTextColor="#999"
                  style={[
                    styles.input,
                    styles.descriptionInput,
                  ]}
                  multiline
                  textAlignVertical="top"
                />

                {/* CATEGORY */}

                <Text style={styles.label}>
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
                        category === item &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() =>
                        setCategory(item)
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category === item &&
                            styles.categoryTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* TARGET DATE */}

                <Text style={styles.label}>
                  Target Date
                </Text>

                <Pressable
                  style={styles.dateInput}
                  onPress={
                    openFormDatePicker
                  }
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      !targetDate &&
                        styles.placeholderText,
                    ]}
                  >
                    {targetDate
                      ? displayDate(
                          targetDate,
                        )
                      : 'Select target date'}
                  </Text>

                  <Text
                    style={
                      styles.calendarIcon
                    }
                  >
                    ▣
                  </Text>
                </Pressable>

                {/* STARTING PROGRESS */}

                <Text style={styles.label}>
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
                          progress === value &&
                            customProgress === '' &&
                            styles.progressButtonActive,
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
                            progress ===
                              value &&
                              customProgress ===
                                '' &&
                              styles.progressButtonTextActive,
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
                    style={
                      styles.customProgressLabel
                    }
                  >
                    Custom:
                  </Text>

                  <TextInput
                    value={customProgress}
                    onChangeText={
                      handleStartingProgressInput
                    }
                    placeholder="e.g. 10"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={3}
                    style={
                      styles.customProgressInput
                    }
                  />

                  <Text
                    style={
                      styles.percentSymbol
                    }
                  >
                    %
                  </Text>
                </View>

                {/* FORM BUTTONS */}

                <View style={styles.formButtons}>
                  <Pressable
                    style={
                      styles.cancelButton
                    }
                    onPress={closeForm}
                  >
                    <Text
                      style={
                        styles.cancelButtonText
                      }
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
                    ]}
                    onPress={saveGoal}
                    disabled={
                      !title.trim() ||
                      !targetDate
                    }
                  >
                    <Text
                      style={
                        styles.saveButtonText
                      }
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
            style={styles.progressModal}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                Update Progress
              </Text>

              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setProgressVisible(false)
                }
              >
                <Text
                  style={styles.closeText}
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <Text
              style={
                styles.progressGoalTitle
              }
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
                      newProgress ===
                        value &&
                        customNewProgress ===
                          '' &&
                        styles.progressChoiceActive,
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
                        newProgress ===
                          value &&
                          customNewProgress ===
                            '' &&
                          styles.progressChoiceTextActive,
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
                style={
                  styles.customProgressLabel
                }
              >
                Custom:
              </Text>

              <TextInput
                value={customNewProgress}
                onChangeText={
                  handleUpdatedProgressInput
                }
                placeholder="e.g. 10"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
                style={
                  styles.customProgressInput
                }
              />

              <Text
                style={
                  styles.percentSymbol
                }
              >
                %
              </Text>
            </View>

            <View style={styles.formButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  setProgressVisible(false)
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={saveProgress}
              >
                <Text
                  style={
                    styles.saveButtonText
                  }
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
            style={styles.calendarCard}
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
                  style={styles.monthArrow}
                >
                  ‹
                </Text>
              </Pressable>

              <Text
                style={styles.monthTitle}
              >
                {MONTHS[calendarMonth]}{' '}
                {calendarYear}
              </Text>

              <Pressable
                onPress={goToNextMonth}
              >
                <Text
                  style={styles.monthArrow}
                >
                  ›
                </Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day) => (
                <Text
                  key={day}
                  style={styles.weekText}
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
                style={
                  styles.clearCalendarButton
                }
              >
                <Text
                  style={
                    styles.clearDateButtonText
                  }
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
                style={
                  styles.doneDateButton
                }
              >
                <Text
                  style={
                    styles.doneDateButtonText
                  }
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
  return (
    <Pressable
      style={[
        styles.filterButton,
        active &&
          styles.filterButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterLabel,
          active &&
            styles.filterLabelActive,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.filterCount,
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
  const statusStyle =
    goal.status === 'Active'
      ? styles.activeBadge
      : goal.status === 'Paused'
        ? styles.pausedBadge
        : styles.completedBadge;

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalTopRow}>
        <View style={styles.goalTitleArea}>
          <Text
            style={styles.goalTitle}
            numberOfLines={2}
          >
            {goal.title}
          </Text>

          <Text
            style={styles.goalDescription}
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
            ]}
          >
            <Text
              style={styles.statusText}
            >
              {goal.status}
            </Text>
          </View>

          <Pressable
            style={styles.moreButton}
            onPress={onMenu}
          >
            <Text
              style={styles.moreText}
            >
              ⋮
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.categoryPill}>
        <Text
          style={styles.categoryPillText}
        >
          {goal.category}
        </Text>
      </View>

      <View
        style={styles.progressHeader}
      >
        <Text
          style={styles.progressLabel}
        >
          Progress
        </Text>

        <Text
          style={styles.progressPercent}
        >
          {goal.progress}%
        </Text>
      </View>

      <View
        style={styles.progressTrack}
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
            style={styles.targetLabel}
          >
            Target date
          </Text>

          <Text
            style={styles.targetDate}
          >
            {displayDate(
              goal.targetDate,
            )}
          </Text>
        </View>

        {goal.status !==
        'Completed' ? (
          <Pressable
            style={
              styles.progressAction
            }
            onPress={onProgress}
          >
            <Text
              style={
                styles.progressActionText
              }
            >
              Update
            </Text>
          </Pressable>
        ) : (
          <View
            style={
              styles.completedCheck
            }
          >
            <Text
              style={
                styles.completedCheckText
              }
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

  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: '#222222',
    marginTop: -4,
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

  headerSubtitle: {
    fontSize: 11,
    color: '#777777',
    marginTop: 2,
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

  iconText: {
    fontSize: 23,
    color: '#222222',
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

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222222',
  },

  clearSearch: {
    fontSize: 24,
    color: '#777777',
    paddingLeft: 10,
  },

  searchDismissLayer: {
    position:'absolute', 
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

  summaryText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
  },

  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCEEFF',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 22,
  },

  plusText: {
    fontSize: 20,
    color: '#222222',
  },

  newGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginLeft: 3,
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

  dateViewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B8CA4',
    letterSpacing: 1,
  },

  dateViewDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2876A8',
    marginTop: 3,
  },

  clearDateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  clearDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2876A8',
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

  dateHeadingSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
  },

  dateCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2876A8',
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

  filterButtonActive: {
    backgroundColor: '#E5F3FF',
    borderColor: '#BBDDF5',
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
  },

  filterLabelActive: {
    color: '#2876A8',
  },

  filterCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#777777',
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

  goalDescription: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F7FB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginTop: 9,
  },

  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5C7890',
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

  pausedBadge: {
    backgroundColor: '#E2E2E2',
  },

  completedBadge: {
    backgroundColor: '#BFE4FF',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
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

  progressHeader: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 12,
    color: '#555555',
  },

  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
  },

  progressTrack: {
    height: 8,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    marginTop: 7,
    overflow: 'hidden',
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

  targetDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444444',
    marginTop: 2,
  },

  progressAction: {
    backgroundColor: '#E5F3FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },

  progressActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#377FA9',
  },

  completedCheck: {
    backgroundColor: '#E8F7EA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },

  completedCheckText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4C8B55',
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

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginTop: 12,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#777777',
    marginTop: 6,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: '#DCEEFF',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2876A8',
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

  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 8,
  },

  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  menuItemText: {
    fontSize: 14,
    color: '#333333',
  },

  deleteText: {
    fontSize: 14,
    color: '#D95353',
  },

  cancelMenuButton: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    borderRadius: 12,
  },

  cancelMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
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

  progressModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
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

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 23,
    color: '#555555',
    marginTop: -2,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 7,
    marginTop: 13,
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

  categoryButtonActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  categoryText: {
    fontSize: 12,
    color: '#555555',
  },

  categoryTextActive: {
    color: '#2876A8',
    fontWeight: '600',
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

  dateInputText: {
    fontSize: 13,
    color: '#333333',
  },

  placeholderText: {
    color: '#999999',
  },

  calendarIcon: {
    fontSize: 17,
    color: '#666666',
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

  progressButtonActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  progressButtonText: {
    fontSize: 11,
    color: '#666666',
  },

  progressButtonTextActive: {
    color: '#2876A8',
    fontWeight: '700',
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

  percentSymbol: {
    fontSize: 13,
    color: '#555555',
    marginLeft: 5,
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

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },

  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#B9E0FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonDisabled: {
    opacity: 0.45,
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2876A8',
  },

  progressGoalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    textAlign: 'center',
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

  progressChoiceActive: {
    backgroundColor: '#E2F3FF',
    borderColor: '#9FD0EF',
  },

  progressChoiceText: {
    fontSize: 11,
    color: '#666666',
  },

  progressChoiceTextActive: {
    color: '#2876A8',
    fontWeight: '700',
  },

  // CALENDAR

  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
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

  monthArrow: {
    fontSize: 30,
    color: '#555555',
    paddingHorizontal: 10,
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

  clearDateButtonText: {
    fontSize: 13,
    color: '#777777',
    fontWeight: '600',
  },

  doneDateButton: {
    backgroundColor: '#DCEEFF',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  doneDateButtonText: {
    fontSize: 13,
    color: '#2876A8',
    fontWeight: '700',
  },
});