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
  createLeisure,
  deleteLeisure as deleteLeisureFromDb,
  getLeisureEntries,
  toggleLeisureFavorite,
  updateLeisure,
} from '../Services/leisureService';

import { initializeDatabase } from '../../database/db';

type Mood = 'Great' | 'Good' | 'Okay' | 'Low';

type LeisureEntry = {
  id: string;
  activity: string;
  duration: number;
  date: string;
  mood: Mood;
  notes: string;
  isFavorite: boolean;
};

type Filter = 'All' | 'Today' | 'This Week';

type CalendarMode = 'view' | 'form';

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

const WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const MOODS: Mood[] = [
  'Great',
  'Good',
  'Okay',
  'Low',
];

const MOOD_EMOJIS: Record<Mood, string> = {
  Great: '😁',
  Good: '🙂',
  Okay: '😐',
  Low: '😟',
};

function formatDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function displayDate(dateString: string) {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(
    `${dateString}T00:00:00`,
  );

  return date.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  );
}

function getDaysInMonth(
  year: number,
  month: number,
) {
  return new Date(
    year,
    month + 1,
    0,
  ).getDate();
}

function getFirstDayOfMonth(
  year: number,
  month: number,
) {
  return new Date(
    year,
    month,
    1,
  ).getDay();
}

function isDateInCurrentWeek(
  dateString: string,
  today: Date,
) {
  const date = new Date(
    `${dateString}T00:00:00`,
  );

  const currentDay = today.getDay();

  const startOfWeek = new Date(today);

  startOfWeek.setDate(
    today.getDate() - currentDay,
  );

  startOfWeek.setHours(
    0,
    0,
    0,
    0,
  );

  const endOfWeek = new Date(
    startOfWeek,
  );

  endOfWeek.setDate(
    startOfWeek.getDate() + 6,
  );

  endOfWeek.setHours(
    23,
    59,
    59,
    999,
  );

  return (
    date >= startOfWeek &&
    date <= endOfWeek
  );
}

export default function LeisureScreen() {
  const router = useRouter();

  const today = new Date();

  const todayString =
    formatDate(today);


  const [
    leisureEntries,
    setLeisureEntries,
  ] = useState<LeisureEntry[]>([]);

  useEffect(() => {
  const loadLeisureEntries = async () => {
    try {
      await initializeDatabase();

      const data = await getLeisureEntries();

      setLeisureEntries(data);
    } catch (error) {
      console.error(
        'Failed to load leisure entries:',
        error
      );
    }
  };

  loadLeisureEntries();
}, []);

  // ==================================================
  // FILTER + SEARCH
  // ==================================================

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<Filter>('All');

  const [
    searchVisible,
    setSearchVisible,
  ] = useState(false);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  // ==================================================
  // FORM
  // ==================================================

  const [
    formVisible,
    setFormVisible,
  ] = useState(false);

  const [
    editingEntry,
    setEditingEntry,
  ] = useState<LeisureEntry | null>(
    null,
  );

  const [
    activity,
    setActivity,
  ] = useState('');

  const [
    duration,
    setDuration,
  ] = useState('');

  const [
    entryDate,
    setEntryDate,
  ] = useState(todayString);

  const [
    mood,
    setMood,
  ] = useState<Mood>('Good');

  const [
    notes,
    setNotes,
  ] = useState('');

  // ==================================================
  // MENU
  // ==================================================

  const [
    menuEntry,
    setMenuEntry,
  ] = useState<LeisureEntry | null>(
    null,
  );

  // ==================================================
  // CALENDAR
  // ==================================================

  const [
    datePickerVisible,
    setDatePickerVisible,
  ] = useState(false);

  const [
    calendarMode,
    setCalendarMode,
  ] = useState<CalendarMode>('form');

  const [
    calendarYear,
    setCalendarYear,
  ] = useState(
    today.getFullYear(),
  );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
    today.getMonth(),
  );

  const [
    selectedCalendarDate,
    setSelectedCalendarDate,
  ] = useState('');

  // ==================================================
  // FORM FUNCTIONS
  // ==================================================

  function resetForm() {
    setActivity('');
    setDuration('');
    setEntryDate(todayString);
    setMood('Good');
    setNotes('');
    setEditingEntry(null);
  }

  function closeForm() {
    setFormVisible(false);
    resetForm();
  }

  function openNewLeisure() {
    resetForm();
    setFormVisible(true);
  }

  function openEditLeisure(
    entry: LeisureEntry,
  ) {
    setMenuEntry(null);

    setEditingEntry(entry);

    setActivity(
      entry.activity,
    );

    setDuration(
      String(entry.duration),
    );

    setEntryDate(
      entry.date,
    );

    setMood(
      entry.mood,
    );

    setNotes(
      entry.notes,
    );

    setFormVisible(true);
  }

async function saveLeisure() {
  if (!activity.trim()) {
    return;
  }

  const finalDuration =
    Number(duration);

  if (
    !duration ||
    Number.isNaN(finalDuration) ||
    finalDuration <= 0
  ) {
    return;
  }

  if (!entryDate) {
    return;
  }

  const cleanDuration =
    Math.floor(finalDuration);

  try {
    if (editingEntry) {
      const updatedEntry: LeisureEntry = {
        ...editingEntry,
        activity: activity.trim(),
        duration: cleanDuration,
        date: entryDate,
        mood,
        notes: notes.trim(),
      };

      await updateLeisure(
        updatedEntry,
      );

      setLeisureEntries(
        (currentEntries) =>
          currentEntries.map(
            (entry) =>
              entry.id ===
              editingEntry.id
                ? updatedEntry
                : entry,
          ),
      );
    } else {
      const newEntry: LeisureEntry = {
        id: Date.now().toString(),
        activity: activity.trim(),
        duration: cleanDuration,
        date: entryDate,
        mood,
        notes: notes.trim(),
        isFavorite: false,
      };

      await createLeisure(
        newEntry,
      );

      setLeisureEntries(
        (currentEntries) => [
          ...currentEntries,
          newEntry,
        ],
      );
    }

    closeForm();
  } catch (error) {
    console.error(
      'Failed to save leisure entry:',
      error,
    );
  }
}

  // ==================================================
  // DELETE
  // ==================================================

  async function deleteLeisure(
   id: string,
) {
  try {
    await deleteLeisureFromDb(id);

    setLeisureEntries(
      (currentEntries) =>
        currentEntries.filter(
          (entry) =>
            entry.id !== id,
        ),
    );

    setMenuEntry(null);
  } catch (error) {
    console.error(
      'Failed to delete leisure entry:',
      error,
    );
  }
}
  // ==================================================
  // FAVORITES
  // ==================================================

  async function toggleFavorite(
    id: string,
) {
  try {
    const entry =
      leisureEntries.find(
        (item) =>
          item.id === id,
      );

    if (!entry) {
      return;
    }

    const newFavoriteStatus =
      !entry.isFavorite;

    await toggleLeisureFavorite(
      id,
      newFavoriteStatus,
    );

    setLeisureEntries(
      (currentEntries) =>
        currentEntries.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  isFavorite:
                    newFavoriteStatus,
                }
              : item,
        ),
    );

    setMenuEntry(null);
  } catch (error) {
    console.error(
      'Failed to update favorite status:',
      error,
    );
  }
}

  // ==================================================
  // SEARCH + FILTER
  // ==================================================

  const filteredEntries =
    useMemo(() => {
      let result = [
        ...leisureEntries,
      ];

      // Search across all leisure entries.
      if (searchText.trim()) {
        const search =
          searchText.toLowerCase();

        result = result.filter(
          (entry) =>
            entry.activity
              .toLowerCase()
              .includes(search) ||
            entry.mood
              .toLowerCase()
              .includes(search) ||
            entry.notes
              .toLowerCase()
              .includes(search),
        );
      }

      // Calendar date view.
      if (selectedCalendarDate) {
        result = result.filter(
          (entry) =>
            entry.date ===
            selectedCalendarDate,
        );
      }

      // Normal filters.
      else if (
        activeFilter === 'Today'
      ) {
        result = result.filter(
          (entry) =>
            entry.date ===
            todayString,
        );
      }

      else if (
        activeFilter ===
        'This Week'
      ) {
        result = result.filter(
          (entry) =>
            isDateInCurrentWeek(
              entry.date,
              today,
            ),
        );
      }

      return result.sort(
      (a, b) =>
      Number(b.isFavorite) -
 
  Number(a.isFavorite),
);
    }, [
      leisureEntries,
      searchText,
      activeFilter,
      selectedCalendarDate,
      todayString,
    ]);

  // ==================================================
  // TIME CALCULATIONS
  // ==================================================

  const minutesToday =
    leisureEntries
      .filter(
        (entry) =>
          entry.date ===
          todayString,
      )
      .reduce(
        (total, entry) =>
          total + entry.duration,
        0,
      );

  const minutesThisWeek =
    leisureEntries
      .filter((entry) =>
        isDateInCurrentWeek(
          entry.date,
          today,
        ),
      )
      .reduce(
        (total, entry) =>
          total + entry.duration,
        0,
      );

  // ==================================================
  // CALENDAR
  // ==================================================

  function openFormDatePicker() {
    setCalendarMode('form');

    const date = new Date(
      `${entryDate}T00:00:00`,
    );

    setCalendarYear(
      date.getFullYear(),
    );

    setCalendarMonth(
      date.getMonth(),
    );

    setDatePickerVisible(true);
  }

  function openLeisureDateView() {
    setCalendarMode('view');

    const startingDate =
      selectedCalendarDate ||
      todayString;

    const date = new Date(
      `${startingDate}T00:00:00`,
    );

    setCalendarYear(
      date.getFullYear(),
    );

    setCalendarMonth(
      date.getMonth(),
    );

    setDatePickerVisible(true);
  }

  function selectCalendarDate(
    date: string,
  ) {
    if (
      calendarMode ===
      'form'
    ) {
      setEntryDate(date);
      setDatePickerVisible(false);
      return;
    }

    setSelectedCalendarDate(
      date,
    );

    setActiveFilter('All');

    setDatePickerVisible(false);
  }

  function clearCalendarDate() {
    if (
      calendarMode ===
      'form'
    ) {
      setEntryDate('');
    } else {
      setSelectedCalendarDate(
        '',
      );
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

  const calendarDays =
    useMemo(() => {
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

      const days: (
        | number
        | null
      )[] = [];

      for (
        let i = 0;
        i < firstDay;
        i++
      ) {
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
    }, [
      calendarYear,
      calendarMonth,
    ]);

  // ==================================================
  // SCREEN
  // ==================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={
            styles.container
          }
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => {
            if (searchVisible) {
              setSearchVisible(
                false,
              );
            }
          }}
        >

          {/* HEADER */}

          <View
            style={styles.header}
          >
            <Pressable
              style={
                styles.backButton
              }
              onPress={() =>
                router.back()
              }
            >
              <Text
                style={
                  styles.backText
                }
              >
                ‹
              </Text>
            </Pressable>

            <View
              style={
                styles.headerTitleArea
              }
            >
              <Text
                style={
                  styles.headerTitle
                }
              >
                Leisure
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Rest, recharge, and enjoy
                your time.
              </Text>
            </View>

            <View
              style={
                styles.headerActions
              }
            >
              <Pressable
                style={
                  styles.iconButton
                }
                onPress={() =>
                  setSearchVisible(
                    !searchVisible,
                  )
                }
              >
                <Text
                  style={
                    styles.iconText
                  }
                >
                  ⌕
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.iconButton
                }
                onPress={
                  openLeisureDateView
                }
              >
                <Text
                  style={
                    styles.iconText
                  }
                >
                  ▣
                </Text>
              </Pressable>
            </View>
          </View>

          {/* SEARCH */}

          {searchVisible && (
            <View
              style={
                styles.searchContainer
              }
            >
              <TextInput
                value={searchText}
                onChangeText={
                  setSearchText
                }
                placeholder="Search leisure activities..."
                placeholderTextColor="#999"
                style={
                  styles.searchInput
                }
                autoFocus
              />

              {searchText.length >
                0 && (
                <Pressable
                  onPress={() =>
                    setSearchText(
                      '',
                    )
                  }
                >
                  <Text
                    style={
                      styles.clearSearch
                    }
                  >
                    ×
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* PAGE TITLE */}

          <View
            style={
              styles.titleSection
            }
          >
            <View
              style={
                styles.titleArea
              }
            >
              <Text
                style={
                  styles.pageTitle
                }
              >
                Leisure
              </Text>
            </View>

            <Pressable
              style={
                styles.logButton
              }
              onPress={
                openNewLeisure
              }
            >
              <Text
                style={
                  styles.plusText
                }
              >
                ＋
              </Text>

              <Text
                style={
                  styles.logButtonText
                }
              >
                Log Leisure
              </Text>
            </Pressable>
          </View>

          {/* WORK-LIFE BALANCE */}

          <View
            style={
              styles.balanceCard
            }
          >
            <View
              style={
                styles.balanceTitleRow
              }
            >
              <Text
                style={
                  styles.balanceIcon
                }
              >
                ☕
              </Text>

              <Text
                style={
                  styles.balanceTitle
                }
              >
                Work-Life Balance
              </Text>
            </View>

            <Text
              style={
                styles.balanceSubtitle
              }
            >
              Rest is part of the
              process. Take time to
              recharge without guilt.
            </Text>

            <View
              style={
                styles.balanceStats
              }
            >
              <View
                style={
                  styles.balanceStat
                }
              >
                <Text
                  style={
                    styles.balanceNumber
                  }
                >
                  {minutesToday}
                </Text>

                <View>
                  <Text
                    style={
                      styles.balanceUnit
                    }
                  >
                    min
                  </Text>

                  <Text
                    style={
                      styles.balancePeriod
                    }
                  >
                    today
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.balanceDivider
                }
              />

              <View
                style={
                  styles.balanceStat
                }
              >
                <Text
                  style={
                    styles.balanceNumber
                  }
                >
                  {minutesThisWeek}
                </Text>

                <View>
                  <Text
                    style={
                      styles.balanceUnit
                    }
                  >
                    min
                  </Text>

                  <Text
                    style={
                      styles.balancePeriod
                    }
                  >
                    this week
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* SUMMARY */}

          <View
            style={
              styles.summaryRow
            }
          >
            <Text
              style={
                styles.summaryText
              }
            >
              {leisureEntries.length}{' '}
              {leisureEntries.length ===
              1
                ? 'leisure'
                : 'leisure entries'}
            </Text>
          </View>

          {/* DATE VIEW */}

          {selectedCalendarDate && (
            <>
              <View
                style={
                  styles.dateView
                }
              >
                <View>
                  <Text
                    style={
                      styles.dateViewLabel
                    }
                  >
                    DATE VIEW
                  </Text>

                  <Text
                    style={
                      styles.dateViewDate
                    }
                  >
                    {displayDate(
                      selectedCalendarDate,
                    )}
                  </Text>
                </View>

                <Pressable
                  style={
                    styles.clearDateButton
                  }
                  onPress={() =>
                    setSelectedCalendarDate(
                      '',
                    )
                  }
                >
                  <Text
                    style={
                      styles.clearDateText
                    }
                  >
                    Clear
                  </Text>
                </Pressable>
              </View>

              <View
                style={
                  styles.dateHeading
                }
              >
                <View>
                  <Text
                    style={
                      styles.dateHeadingTitle
                    }
                  >
                    {displayDate(
                      selectedCalendarDate,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.dateHeadingSubtitle
                    }
                  >
                    Leisure for this date
                  </Text>
                </View>

                <View
                  style={
                    styles.dateCount
                  }
                >
                  <Text
                    style={
                      styles.dateCountText
                    }
                  >
                    {
                      filteredEntries.length
                    }
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* FILTERS */}

          {!selectedCalendarDate && (
            <View
              style={
                styles.filterGrid
              }
            >
              <FilterButton
                label="All"
                count={
                  leisureEntries.length
                }
                active={
                  activeFilter ===
                  'All'
                }
                onPress={() =>
                  setActiveFilter(
                    'All',
                  )
                }
              />

              <FilterButton
                label="Today"
                count={
                  leisureEntries.filter(
                    (entry) =>
                      entry.date ===
                      todayString,
                  ).length
                }
                active={
                  activeFilter ===
                  'Today'
                }
                onPress={() =>
                  setActiveFilter(
                    'Today',
                  )
                }
              />

              <FilterButton
                label="This Week"
                count={
                  leisureEntries.filter(
                    (entry) =>
                      isDateInCurrentWeek(
                        entry.date,
                        today,
                      ),
                  ).length
                }
                active={
                  activeFilter ===
                  'This Week'
                }
                onPress={() =>
                  setActiveFilter(
                    'This Week',
                  )
                }
              />
            </View>
          )}

          {/* LEISURE LIST */}

          <View
            style={
              styles.entryList
            }
          >
            {filteredEntries.length ===
            0 ? (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.emptyIconCircle
                  }
                >
                  <Text
                    style={
                      styles.emptyIcon
                    }
                  >
                    ☕
                  </Text>
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {selectedCalendarDate
                    ? 'No leisure logged on this date'
                    : 'No leisure logged yet'}
                </Text>

                <Text
                  style={
                    styles.emptySubtitle
                  }
                >
                  {selectedCalendarDate
                    ? 'There are no leisure activities recorded for this date.'
                    : 'Take a break, enjoy yourself, and log it when you are ready.'}
                </Text>

                {!selectedCalendarDate && (
                  <Pressable
                    style={
                      styles.emptyButton
                    }
                    onPress={
                      openNewLeisure
                    }
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      ＋ Log Leisure
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              filteredEntries.map(
                (entry) => (
                  <LeisureCard
                    key={
                      entry.id
                    }
                    entry={entry}
                    onMenu={() =>
                      setMenuEntry(
                        entry,
                      )
                    }
                  />
                ),
              )
            )}
          </View>
        </ScrollView>
      </View>

      {/* ==================================================
          MENU
          ================================================== */}

      <Modal
        visible={
          menuEntry !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMenuEntry(null)
        }
      >
        <Pressable
          style={
            styles.menuOverlay
          }
          onPress={() =>
            setMenuEntry(null)
          }
        >
          <Pressable
            style={
              styles.menuCard
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={
                styles.menuTitle
              }
            >
              Leisure Options
            </Text>

            {/* EDIT */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={() => {
                if (menuEntry) {
                  openEditLeisure(
                    menuEntry,
                  );
                }
              }}
            >
              <Text
                style={
                  styles.menuItemText
                }
              >
                ✏️ Edit Leisure
              </Text>
            </Pressable>

            {/* FAVORITE */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={() => {
                if (menuEntry) {
                  toggleFavorite(
                    menuEntry.id,
                  );
                }
              }}
            >
              <Text
                style={
                  styles.menuItemText
                }
              >
                {menuEntry?.isFavorite
                  ? '⭐ Remove from Favorites'
                  : '⭐ Add to Favorites'}
              </Text>
            </Pressable>

            {/* DELETE */}

            <Pressable
              style={
                styles.menuItem
              }
              onPress={() => {
                if (menuEntry) {
                  deleteLeisure(
                    menuEntry.id,
                  );
                }
              }}
            >
              <Text
                style={
                  styles.deleteText
                }
              >
                🗑️ Delete Leisure
              </Text>
            </Pressable>

            {/* CANCEL */}

            <Pressable
              style={
                styles.cancelMenuButton
              }
              onPress={() =>
                setMenuEntry(null)
              }
            >
              <Text
                style={
                  styles.cancelMenuText
                }
              >
                Cancel
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ==================================================
          LOG / EDIT LEISURE
          ================================================== */}

      <Modal
        visible={formVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeForm
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <KeyboardAvoidingView
            behavior={
              Platform.OS ===
              'ios'
                ? 'padding'
                : undefined
            }
            style={
              styles.keyboardView
            }
          >
            <ScrollView
              contentContainerStyle={
                styles.formScroll
              }
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={
                  styles.formCard
                }
              >
                {/* FORM HEADER */}

                <View
                  style={
                    styles.formHeader
                  }
                >
                  <Text
                    style={
                      styles.formTitle
                    }
                  >
                    {editingEntry
                      ? 'Edit Leisure'
                      : 'Log Leisure'}
                  </Text>

                  <Pressable
                    style={
                      styles.closeButton
                    }
                    onPress={
                      closeForm
                    }
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

                {/* ACTIVITY */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Activity
                </Text>

                <TextInput
                  value={activity}
                  onChangeText={
                    setActivity
                  }
                  placeholder="What did you do?"
                  placeholderTextColor="#999"
                  style={
                    styles.input
                  }
                />

                {/* DURATION + DATE */}

                <View
                  style={
                    styles.twoColumnRow
                  }
                >
                  <View
                    style={
                      styles.column
                    }
                  >
                    <Text
                      style={
                        styles.label
                      }
                    >
                      Duration
                      (minutes)
                    </Text>

                    <TextInput
                      value={
                        duration
                      }
                      onChangeText={(
                        value,
                      ) =>
                        setDuration(
                          value.replace(
                            /[^0-9]/g,
                            '',
                          ),
                        )
                      }
                      placeholder="30"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      style={
                        styles.input
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.column
                    }
                  >
                    <Text
                      style={
                        styles.label
                      }
                    >
                      Date
                    </Text>

                    <Pressable
                      style={
                        styles.dateInput
                      }
                      onPress={
                        openFormDatePicker
                      }
                    >
                      <Text
                        style={[
                          styles.dateInputText,
                          !entryDate &&
                            styles.placeholderText,
                        ]}
                        numberOfLines={
                          1
                        }
                      >
                        {entryDate
                          ? displayDate(
                              entryDate,
                            )
                          : 'Select date'}
                      </Text>

                      <Text
                        style={
                          styles.calendarIcon
                        }
                      >
                        ▣
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* MOOD */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Mood
                </Text>

                <View
                  style={
                    styles.moodRow
                  }
                >
                  {MOODS.map(
                    (item) => (
                      <Pressable
                        key={
                          item
                        }
                        style={[
                          styles.moodButton,
                          mood ===
                            item &&
                            styles.moodButtonActive,
                        ]}
                        onPress={() =>
                          setMood(
                            item,
                          )
                        }
                      >
                        <Text
                          style={
                            styles.moodEmoji
                          }
                        >
                          {
                            MOOD_EMOJIS[
                              item
                            ]
                          }
                        </Text>

                        <Text
                          style={[
                            styles.moodText,
                            mood ===
                              item &&
                              styles.moodTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    ),
                  )}
                </View>

                {/* NOTES */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Notes (Optional)
                </Text>

                <TextInput
                  value={notes}
                  onChangeText={
                    setNotes
                  }
                  placeholder="Any extra details..."
                  placeholderTextColor="#999"
                  style={[
                    styles.input,
                    styles.notesInput,
                  ]}
                  multiline
                  textAlignVertical="top"
                />

                {/* BUTTONS */}

                <View
                  style={
                    styles.formButtons
                  }
                >
                  <Pressable
                    style={
                      styles.cancelButton
                    }
                    onPress={
                      closeForm
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
                    style={[
                      styles.saveButton,
                      (!activity.trim() ||
                        !duration ||
                        !entryDate) &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={
                      saveLeisure
                    }
                    disabled={
                      !activity.trim() ||
                      !duration ||
                      !entryDate
                    }
                  >
                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      {editingEntry
                        ? 'Save Changes'
                        : '＋ Log Leisure'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ==================================================
          CALENDAR
          ================================================== */}

      <Modal
        visible={
          datePickerVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDatePickerVisible(
            false,
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setDatePickerVisible(
              false,
            )
          }
        >
          <Pressable
            style={
              styles.calendarCard
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {/* CALENDAR HEADER */}

            <View
              style={
                styles.calendarHeader
              }
            >
              <Pressable
                onPress={
                  goToPreviousMonth
                }
              >
                <Text
                  style={
                    styles.monthArrow
                  }
                >
                  ‹
                </Text>
              </Pressable>

              <Text
                style={
                  styles.monthTitle
                }
              >
                {
                  MONTHS[
                    calendarMonth
                  ]
                }{' '}
                {calendarYear}
              </Text>

              <Pressable
                onPress={
                  goToNextMonth
                }
              >
                <Text
                  style={
                    styles.monthArrow
                  }
                >
                  ›
                </Text>
              </Pressable>
            </View>

            {/* WEEKDAYS */}

            <View
              style={
                styles.weekRow
              }
            >
              {WEEKDAYS.map(
                (day) => (
                  <Text
                    key={day}
                    style={
                      styles.weekText
                    }
                  >
                    {day}
                  </Text>
                ),
              )}
            </View>

            {/* DAYS */}

            <View
              style={
                styles.calendarGrid
              }
            >
              {calendarDays.map(
                (
                  day,
                  index,
                ) => {
                  if (
                    day ===
                    null
                  ) {
                    return (
                      <View
                        key={`empty-${index}`}
                        style={
                          styles.dayCell
                        }
                      />
                    );
                  }

                  const date =
                    new Date(
                      calendarYear,
                      calendarMonth,
                      day,
                    );

                  const dateString =
                    formatDate(
                      date,
                    );

                  const isSelected =
                    calendarMode ===
                    'form'
                      ? entryDate ===
                        dateString
                      : selectedCalendarDate ===
                        dateString;

                  const isToday =
                    todayString ===
                    dateString;

                  return (
                    <Pressable
                      key={
                        dateString
                      }
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

            {/* CALENDAR ACTIONS */}

            <View
              style={
                styles.calendarActions
              }
            >
              <Pressable
                onPress={
                  clearCalendarDate
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
// LEISURE CARD
// ==================================================

function LeisureCard({
  entry,
  onMenu,
}: {
  entry: LeisureEntry;
  onMenu: () => void;
}) {
  return (
    <View
      style={
        styles.entryCard
      }
    >
      <View
        style={
          styles.entryTopRow
        }
      >
        {/* MOOD ICON */}

        <View
          style={
            styles.entryIconContainer
          }
        >
          <Text
            style={
              styles.entryEmoji
            }
          >
            {
              MOOD_EMOJIS[
                entry.mood
              ]
            }
          </Text>
        </View>

        {/* MAIN CONTENT */}

        <View
          style={
            styles.entryMain
          }
        >
          <View
            style={
              styles.entryTitleRow
            }
          >
            <Text
              style={
                styles.entryTitle
              }
              numberOfLines={1}
            >
              {entry.activity}
            </Text>

            {entry.isFavorite && (
              <Text
                style={
                  styles.favoriteIcon
                }
              >
                ⭐
              </Text>
            )}
          </View>

          <View
            style={
              styles.entryMeta
            }
          >
            <Text
              style={
                styles.entryMetaText
              }
            >
              ◷ {entry.duration} min
            </Text>

            <Text
              style={
                styles.entryMetaText
              }
            >
              {displayDate(
                entry.date,
              )}
            </Text>
          </View>

          {entry.notes ? (
            <Text
              style={
                styles.entryNotes
              }
              numberOfLines={2}
            >
              {entry.notes}
            </Text>
          ) : (
            <Text
              style={
                styles.entryNotesEmpty
              }
            >
              No notes
            </Text>
          )}
        </View>

        {/* RIGHT SIDE */}

        <View
          style={
            styles.entryRight
          }
        >
          <View
            style={[
              styles.moodBadge,
              getMoodStyle(
                entry.mood,
              ),
            ]}
          >
            <Text
              style={
                styles.moodBadgeText
              }
            >
              {entry.mood}
            </Text>
          </View>

          <Pressable
            style={
              styles.moreButton
            }
            onPress={onMenu}
          >
            <Text
              style={
                styles.moreText
              }
            >
              ⋮
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ==================================================
// MOOD STYLE
// ==================================================

function getMoodStyle(
  mood: Mood,
) {
  switch (mood) {
    case 'Great':
      return styles.greatMood;

    case 'Good':
      return styles.goodMood;

    case 'Okay':
      return styles.okayMood;

    case 'Low':
      return styles.lowMood;

    default:
      return styles.goodMood;
  }
}

// ==================================================
// STYLES
// ==================================================

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#FFFFFF',
    },

    screen: {
      flex: 1,
      backgroundColor:
        '#FFFFFF',
    },

    container: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 50,
    },

    // HEADER

    header: {
      minHeight: 62,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        '#F0F0F0',
      alignItems:
        'center',
      justifyContent:
        'center',
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
      fontWeight:
        '700',
      color: '#111111',
    },

    headerSubtitle: {
      fontSize: 11,
      color: '#777777',
      marginTop: 2,
    },

    headerActions: {
      flexDirection:
        'row',
      gap: 10,
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        '#F0F0F0',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    iconText: {
      fontSize: 23,
      color: '#222222',
    },

    // SEARCH

    searchContainer: {
      marginTop: 12,
      height: 48,
      borderWidth: 1,
      borderColor:
        '#D5D5D5',
      borderRadius: 14,
      paddingHorizontal: 14,
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        '#FAFAFA',
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

    // TITLE

    titleSection: {
      marginTop: 30,
      marginBottom: 20,
      flexDirection:
        'row',
      alignItems:
        'flex-end',
      justifyContent:
        'space-between',
    },

    titleArea: {
      flex: 1,
    },

    pageTitle: {
      fontSize: 34,
      fontWeight:
        '700',
      color: '#111111',
    },

    logButton: {
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        '#DCEEFF',
      paddingHorizontal: 15,
      paddingVertical: 11,
      borderRadius: 22,
    },

    plusText: {
      fontSize: 20,
      color: '#222222',
    },

    logButtonText: {
      fontSize: 14,
      fontWeight:
        '600',
      color: '#222222',
      marginLeft: 3,
    },

    // WORK-LIFE BALANCE

    balanceCard: {
      backgroundColor:
        '#DFF3F1',
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
    },

    balanceTitleRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    balanceIcon: {
      fontSize: 20,
      marginRight: 8,
    },

    balanceTitle: {
      fontSize: 15,
      fontWeight:
        '700',
      color: '#315F5A',
    },

    balanceSubtitle: {
      fontSize: 11,
      lineHeight: 17,
      color: '#597A76',
      marginTop: 8,
    },

    balanceStats: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 15,
    },

    balanceStat: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    balanceNumber: {
      fontSize: 34,
      fontWeight:
        '700',
      color: '#315F5A',
      marginRight: 7,
    },

    balanceUnit: {
      fontSize: 11,
      fontWeight:
        '600',
      color: '#52716D',
    },

    balancePeriod: {
      fontSize: 10,
      color: '#6E8985',
      marginTop: 1,
    },

    balanceDivider: {
      width: 1,
      height: 38,
      backgroundColor:
        '#B9D8D4',
    },

    // SUMMARY

    summaryRow: {
      marginBottom: 15,
    },

    summaryText: {
      fontSize: 12,
      color: '#666666',
    },

    // DATE VIEW

    dateView: {
      backgroundColor:
        '#EEF7FF',
      borderRadius: 14,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    dateViewLabel: {
      fontSize: 10,
      fontWeight:
        '700',
      color: '#6B8CA4',
      letterSpacing: 1,
    },

    dateViewDate: {
      fontSize: 16,
      fontWeight:
        '700',
      color: '#2876A8',
      marginTop: 3,
    },

    clearDateButton: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },

    clearDateText: {
      fontSize: 12,
      fontWeight:
        '700',
      color: '#2876A8',
    },

    dateHeading: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom: 18,
    },

    dateHeadingTitle: {
      fontSize: 23,
      fontWeight:
        '700',
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
      backgroundColor:
        '#E5F3FF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    dateCountText: {
      fontSize: 13,
      fontWeight:
        '700',
      color: '#2876A8',
    },

    // FILTERS

    filterGrid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: 10,
      marginBottom: 18,
    },

    filterButton: {
      flex: 1,
      minWidth: '30%',
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        '#E0E0E0',
      borderRadius: 14,
      paddingHorizontal: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      backgroundColor:
        '#FAFAFA',
    },

    filterButtonActive: {
      backgroundColor:
        '#E5F3FF',
      borderColor:
        '#BBDDF5',
    },

    filterLabel: {
      fontSize: 12,
      fontWeight:
        '600',
      color: '#555555',
    },

    filterLabelActive: {
      color: '#2876A8',
    },

    filterCount: {
      fontSize: 12,
      fontWeight:
        '700',
      color: '#777777',
    },

    filterCountActive: {
      color: '#2876A8',
    },

    // ENTRIES

    entryList: {
      gap: 14,
    },

    entryCard: {
      borderWidth: 1,
      borderColor:
        '#D3D3D3',
      borderRadius: 20,
      padding: 15,
      backgroundColor:
        '#FFFFFF',
    },

    entryTopRow: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
    },

    entryIconContainer: {
      width: 54,
      height: 54,
      borderRadius: 10,
      backgroundColor:
        '#FFF0F5',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 12,
    },

    entryEmoji: {
      fontSize: 27,
    },

    entryMain: {
      flex: 1,
      paddingRight: 6,
    },

    entryTitleRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    entryTitle: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight:
        '700',
      color: '#222222',
    },

    favoriteIcon: {
      fontSize: 13,
      marginLeft: 6,
    },

    entryMeta: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 12,
      marginTop: 5,
    },

    entryMetaText: {
      fontSize: 11,
      color: '#888888',
    },

    entryNotes: {
      fontSize: 11,
      color: '#777777',
      marginTop: 8,
      lineHeight: 16,
    },

    entryNotesEmpty: {
      fontSize: 11,
      color: '#AAAAAA',
      marginTop: 8,
    },

    entryRight: {
      alignItems:
        'flex-end',
    },

    moodBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 7,
    },

    moodBadgeText: {
      fontSize: 10,
      fontWeight:
        '700',
      color: '#555555',
    },

    greatMood: {
      backgroundColor:
        '#D9F7D8',
    },

    goodMood: {
      backgroundColor:
        '#CFF7D2',
    },

    okayMood: {
      backgroundColor:
        '#FFF0C7',
    },

    lowMood: {
      backgroundColor:
        '#FFE0E0',
    },

    moreButton: {
      width: 30,
      height: 30,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop: 7,
    },

    moreText: {
      fontSize: 24,
      color: '#555555',
      marginTop: -5,
    },

    // EMPTY STATE

    emptyState: {
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        '#D3D3D3',
      borderRadius: 20,
      paddingVertical: 75,
      paddingHorizontal: 20,
      minHeight: 270,
    },

    emptyIconCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor:
        '#F1F7F6',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyIcon: {
      fontSize: 28,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight:
        '700',
      color: '#333333',
      marginTop: 14,
      textAlign:
        'center',
    },

    emptySubtitle: {
      fontSize: 12,
      lineHeight: 18,
      color: '#888888',
      marginTop: 7,
      textAlign:
        'center',
      maxWidth: 290,
    },

    emptyButton: {
      marginTop: 18,
      backgroundColor:
        '#DCEEFF',
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 20,
    },

    emptyButtonText: {
      fontSize: 13,
      fontWeight:
        '600',
      color: '#2876A8',
    },

    // MENU

    menuOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.25)',
      justifyContent:
        'center',
      alignItems:
        'center',
      padding: 25,
    },

    menuCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 18,
    },

    menuTitle: {
      fontSize: 18,
      fontWeight:
        '700',
      color: '#222222',
      marginBottom: 8,
    },

    menuItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EEEEEE',
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
      alignItems:
        'center',
      backgroundColor:
        '#F1F1F1',
      borderRadius: 12,
    },

    cancelMenuText: {
      fontSize: 14,
      fontWeight:
        '600',
      color: '#555555',
    },

    // MODAL

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0,0,0,0.30)',
      justifyContent:
        'center',
      padding: 20,
    },

    keyboardView: {
      width: '100%',
    },

    formScroll: {
      paddingVertical: 20,
    },

    formCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 22,
      padding: 20,
    },

    formHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom: 20,
    },

    formTitle: {
      fontSize: 24,
      fontWeight:
        '700',
      color: '#222222',
    },

    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor:
        '#EEEEEE',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    closeText: {
      fontSize: 23,
      color: '#555555',
      marginTop: -2,
    },

    label: {
      fontSize: 13,
      fontWeight:
        '600',
      color: '#555555',
      marginBottom: 7,
      marginTop: 13,
    },

    input: {
      minHeight: 46,
      borderWidth: 1,
      borderColor:
        '#BDBDBD',
      borderRadius: 11,
      paddingHorizontal: 13,
      fontSize: 13,
      color: '#222222',
      backgroundColor:
        '#FFFFFF',
    },

    twoColumnRow: {
      flexDirection:
        'row',
      gap: 12,
    },

    column: {
      flex: 1,
    },

    dateInput: {
      height: 46,
      borderWidth: 1,
      borderColor:
        '#BDBDBD',
      borderRadius: 11,
      paddingHorizontal: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    dateInputText: {
      flex: 1,
      fontSize: 12,
      color: '#333333',
    },

    placeholderText: {
      color: '#999999',
    },

    calendarIcon: {
      fontSize: 17,
      color: '#666666',
      marginLeft: 5,
    },

    moodRow: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      gap: 7,
    },

    moodButton: {
      flex: 1,
      minHeight: 58,
      borderWidth: 1,
      borderColor:
        '#CCCCCC',
      borderRadius: 11,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        '#FFFFFF',
    },

    moodButtonActive: {
      backgroundColor:
        '#FFF0F5',
      borderColor:
        '#FF9FC0',
    },

    moodEmoji: {
      fontSize: 23,
    },

    moodText: {
      fontSize: 10,
      color: '#777777',
      marginTop: 2,
    },

    moodTextActive: {
      color: '#D95F88',
      fontWeight:
        '700',
    },

    notesInput: {
      height: 85,
      paddingTop: 12,
    },

    formButtons: {
      flexDirection:
        'row',
      gap: 12,
      marginTop: 24,
    },

    cancelButton: {
      flex: 1,
      height: 46,
      borderWidth: 1,
      borderColor:
        '#CCCCCC',
      borderRadius: 13,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    cancelButtonText: {
      fontSize: 13,
      fontWeight:
        '600',
      color: '#666666',
    },

    saveButton: {
      flex: 1,
      height: 46,
      borderRadius: 13,
      backgroundColor:
        '#B9E0FA',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    saveButtonDisabled: {
      opacity: 0.45,
    },

    saveButtonText: {
      fontSize: 13,
      fontWeight:
        '700',
      color: '#2876A8',
    },

    // CALENDAR

    calendarCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 22,
      padding: 20,
    },

    calendarHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    monthTitle: {
      fontSize: 17,
      fontWeight:
        '700',
      color: '#222222',
    },

    monthArrow: {
      fontSize: 30,
      color: '#555555',
      paddingHorizontal: 10,
    },

    weekRow: {
      flexDirection:
        'row',
      marginTop: 20,
      marginBottom: 8,
    },

    weekText: {
      width: '14.28%',
      textAlign:
        'center',
      fontSize: 11,
      fontWeight:
        '600',
      color: '#888888',
    },

    calendarGrid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
    },

    dayCell: {
      width: '14.28%',
      height: 42,
      alignItems:
        'center',
      justifyContent:
        'center',
      borderRadius: 21,
    },

    dayText: {
      fontSize: 13,
      color: '#333333',
    },

    selectedDay: {
      backgroundColor:
        '#B9E0FA',
    },

    selectedDayText: {
      color: '#2876A8',
      fontWeight:
        '700',
    },

    todayDay: {
      borderWidth: 1,
      borderColor:
        '#9FD0EF',
    },

    calendarActions: {
      flexDirection:
        'row',
      justifyContent:
        'flex-end',
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
      fontWeight:
        '600',
    },

    doneDateButton: {
      backgroundColor:
        '#DCEEFF',
      borderRadius: 10,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },

    doneDateButtonText: {
      fontSize: 13,
      color: '#2876A8',
      fontWeight:
        '700',
    },
  });