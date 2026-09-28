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
  createAssignment,
  deleteAssignment as deleteAssignmentFromDb,
  getAssignments,
  updateAssignment,
  updateAssignmentStatus,
} from '../Services/assignmentService';

import { initializeDatabase } from '../../database/db';

import { useTheme } from '../../components/ThemeContent';

type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Pending' | 'In Progress' | 'Completed';
type Filter = 'Today' | 'Scheduled' | 'Important' | 'Completed';

type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: Priority;
  notes: string;
  status: Status;
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

const WEEKDAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function displayDate(dateString: string) {
  if (!dateString) return 'No due date';

  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Date(year, month - 1, day).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AssignmentScreen() {
  const router = useRouter();
  const { darkMode } = useTheme();

  const today = new Date();
  const todayString = formatDate(today);

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        await initializeDatabase();

        const data = await getAssignments();

        setAssignments(data);
      } catch (error) {
        console.error(
          'Failed to load assignments:',
          error
        );
      }
    };

    loadAssignments();
  }, []);

  /*
   * ============================================================
   * SCREEN STATE
   * ============================================================
   */

  const [activeFilter, setActiveFilter] =
    useState<Filter>('Today');

  const [searchVisible, setSearchVisible] =
    useState(false);

  const [searchText, setSearchText] =
    useState('');

  const [selectedCalendarDate, setSelectedCalendarDate] =
    useState<string | null>(null);

  /*
   * ============================================================
   * FORM STATE
   * ============================================================
   */

  const [formVisible, setFormVisible] =
    useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<Assignment | null>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] =
    useState<Priority>('Medium');
  const [notes, setNotes] = useState('');

  /*
   * ============================================================
   * MENU STATE
   * ============================================================
   */

  const [menuAssignment, setMenuAssignment] =
    useState<Assignment | null>(null);

  /*
   * ============================================================
   * DATE PICKER STATE
   * ============================================================
   */

  const [datePickerVisible, setDatePickerVisible] =
    useState(false);

  const [calendarYear, setCalendarYear] =
    useState(today.getFullYear());

  const [calendarMonth, setCalendarMonth] =
    useState(today.getMonth());

  const [selectedDate, setSelectedDate] =
    useState('');

  /*
   * ============================================================
   * FORM FUNCTIONS
   * ============================================================
   */

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDueDate('');
    setPriority('Medium');
    setNotes('');
    setEditingAssignment(null);
  };

  const closeForm = () => {
    setFormVisible(false);
    resetForm();
  };

  const openNewAssignment = () => {
    resetForm();
    setFormVisible(true);
  };

  const openEditAssignment = (
    assignment: Assignment
  ) => {
    setEditingAssignment(assignment);

    setTitle(assignment.title);
    setSubject(assignment.subject);
    setDueDate(assignment.dueDate);
    setPriority(assignment.priority);
    setNotes(assignment.notes);

    setMenuAssignment(null);
    setFormVisible(true);
  };

  /*
   * ============================================================
   * SAVE ASSIGNMENT
   * ============================================================
   */

  const saveAssignment = async () => {
    if (!title.trim()) return;

    try {
      if (editingAssignment) {
        const updatedAssignment: Assignment = {
          ...editingAssignment,
          title: title.trim(),
          subject:
            subject.trim() || 'General',
          dueDate,
          priority,
          notes: notes.trim(),
        };

        await updateAssignment(
          updatedAssignment
        );

        setAssignments((current) =>
          current.map((assignment) =>
            assignment.id ===
            editingAssignment.id
              ? updatedAssignment
              : assignment
          )
        );
      } else {
        const newAssignment: Assignment = {
          id: Date.now().toString(),
          title: title.trim(),
          subject:
            subject.trim() || 'General',
          dueDate,
          priority,
          notes: notes.trim(),
          status: 'Pending',
        };

        await createAssignment(
          newAssignment
        );

        setAssignments((current) => [
          newAssignment,
          ...current,
        ]);
      }

      closeForm();
    } catch (error) {
      console.error(
        'Failed to save assignment:',
        error
      );
    }
  };

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  const updateStatus = async (
    id: string,
    status: Status
  ) => {
    try {
      await updateAssignmentStatus(
        id,
        status
      );

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                status,
              }
            : assignment
        )
      );

      setMenuAssignment(null);
    } catch (error) {
      console.error(
        'Failed to update assignment status:',
        error
      );
    }
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const deleteAssignment = async (
    id: string
  ) => {
    try {
      await deleteAssignmentFromDb(id);

      setAssignments((current) =>
        current.filter(
          (assignment) =>
            assignment.id !== id
        )
      );

      setMenuAssignment(null);
    } catch (error) {
      console.error(
        'Failed to delete assignment:',
        error
      );
    }
  };

  /*
   * ============================================================
   * THREE-DOT MENU
   * ============================================================
   */

  const openAssignmentMenu = (
    assignment: Assignment
  ) => {
    setMenuAssignment(assignment);
  };

  const closeAssignmentMenu = () => {
    setMenuAssignment(null);
  };

  /*
   * ============================================================
   * DATE PICKER
   * ============================================================
   */

  const openDatePicker = () => {
    const dateToOpen =
      dueDate ||
      selectedCalendarDate ||
      todayString;

    const [year, month] =
      dateToOpen.split('-').map(Number);

    setCalendarYear(year);
    setCalendarMonth(month - 1);
    setSelectedDate(dateToOpen);

    setDatePickerVisible(true);
  };

  const selectCalendarDate = (day: number) => {
    const date = new Date(
      calendarYear,
      calendarMonth,
      day
    );

    setSelectedDate(formatDate(date));
  };

  const confirmDate = () => {
    if (!selectedDate) return;

    if (formVisible) {
      setDueDate(selectedDate);
    } else {
      setSelectedCalendarDate(selectedDate);
    }

    setDatePickerVisible(false);
  };

  const clearSelectedDate = () => {
    setSelectedDate('');

    if (formVisible) {
      setDueDate('');
    } else {
      setSelectedCalendarDate(null);
    }

    setDatePickerVisible(false);
  };

  const goToPreviousMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(
        (year) => year - 1
      );
    } else {
      setCalendarMonth(
        (month) => month - 1
      );
    }
  };

  const goToNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(
        (year) => year + 1
      );
    } else {
      setCalendarMonth(
        (month) => month + 1
      );
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay =
      getFirstDayOfMonth(
        calendarYear,
        calendarMonth
      );

    const daysInMonth =
      getDaysInMonth(
        calendarYear,
        calendarMonth
      );

    const days: Array<number | null> = [];

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

  /*
   * ============================================================
   * COUNTS
   * ============================================================
   */

  const todayCount =
    assignments.filter(
      (assignment) =>
        assignment.dueDate ===
          todayString &&
        assignment.status !==
          'Completed'
    ).length;

  const scheduledCount =
    assignments.filter(
      (assignment) =>
        assignment.dueDate >
          todayString &&
        assignment.status !==
          'Completed'
    ).length;

  const importantCount =
    assignments.filter(
      (assignment) =>
        assignment.priority ===
          'High' &&
        assignment.status !==
          'Completed'
    ).length;

  const completedCount =
    assignments.filter(
      (assignment) =>
        assignment.status ===
        'Completed'
    ).length;

  /*
   * ============================================================
   * DISPLAY FILTER
   * ============================================================
   */

  const filteredAssignments =
    useMemo(() => {
      if (searchText.trim()) {
        const search =
          searchText
            .trim()
            .toLowerCase();

        return assignments.filter(
          (assignment) =>
            assignment.title
              .toLowerCase()
              .includes(search) ||
            assignment.subject
              .toLowerCase()
              .includes(search) ||
            assignment.notes
              .toLowerCase()
              .includes(search)
        );
      }

      if (selectedCalendarDate) {
        return assignments.filter(
          (assignment) =>
            assignment.dueDate ===
            selectedCalendarDate
        );
      }

      if (activeFilter === 'Today') {
        return assignments.filter(
          (assignment) =>
            assignment.dueDate ===
              todayString &&
            assignment.status !==
              'Completed'
        );
      }

      if (
        activeFilter ===
        'Scheduled'
      ) {
        return assignments.filter(
          (assignment) =>
            assignment.dueDate >
              todayString &&
            assignment.status !==
              'Completed'
        );
      }

      if (
        activeFilter ===
        'Important'
      ) {
        return assignments.filter(
          (assignment) =>
            assignment.priority ===
              'High' &&
            assignment.status !==
              'Completed'
        );
      }

      if (
        activeFilter ===
        'Completed'
      ) {
        return assignments.filter(
          (assignment) =>
            assignment.status ===
            'Completed'
        );
      }

      return assignments;
    }, [
      assignments,
      activeFilter,
      todayString,
      searchText,
      selectedCalendarDate,
    ]);

  /*
   * ============================================================
   * SCREEN TITLE
   * ============================================================
   */

  const screenTitle =
    searchText.trim()
      ? 'Search Results'
      : selectedCalendarDate
      ? displayDate(
          selectedCalendarDate
        )
      : activeFilter;

  const screenSubtitle =
    searchText.trim()
      ? `Results for "${searchText.trim()}"`
      : selectedCalendarDate
      ? 'Assignments for this date'
      : activeFilter === 'Today'
      ? 'Tasks due today'
      : activeFilter ===
        'Scheduled'
      ? 'Upcoming assignments'
      : activeFilter ===
        'Important'
      ? 'High priority assignments'
      : 'Finished assignments';

  /*
   * ============================================================
   * MAIN SCREEN
   * ============================================================
   */

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

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            onPress={() => router.back()}
            style={[
              styles.iconButton,
              darkMode &&
                styles.iconButtonDark,
            ]}
          >
            <Text
              style={[
                styles.backIcon,
                darkMode &&
                  styles.backIconDark,
              ]}
            >
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={[
                styles.headerTitle,
                darkMode &&
                  styles.headerTitleDark,
              ]}
            >
              Assignments
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                darkMode &&
                  styles.headerSubtitleDark,
              ]}
            >
              Stay on top of your school
              work.
            </Text>
          </View>

          <View
            style={styles.headerActions}
          >

            {/* SEARCH BUTTON */}

            <Pressable
              onPress={() => {
                setSearchVisible(
                  (visible) =>
                    !visible
                );

                if (searchVisible) {
                  setSearchText('');
                }
              }}
              style={[
                styles.iconButton,
                darkMode &&
                  styles.iconButtonDark,
                searchVisible &&
                  styles.iconButtonActive,
                searchVisible &&
                  darkMode &&
                  styles.iconButtonActiveDark,
              ]}
            >
              <Text
                style={[
                  styles.headerIcon,
                  darkMode &&
                    styles.headerIconDark,
                ]}
              >
                ⌕
              </Text>
            </Pressable>

            {/* CALENDAR BUTTON */}

            <Pressable
              onPress={
                openDatePicker
              }
              style={[
                styles.iconButton,
                darkMode &&
                  styles.iconButtonDark,
                selectedCalendarDate &&
                  styles.iconButtonActive,
                selectedCalendarDate &&
                  darkMode &&
                  styles.iconButtonActiveDark,
              ]}
            >
              <Text
                style={[
                  styles.headerIcon,
                  darkMode &&
                    styles.headerIconDark,
                ]}
              >
                □
              </Text>
            </Pressable>

          </View>
        </View>

        {/* SEARCH BAR */}

        {searchVisible && (
          <View
            style={[
              styles.searchContainer,
              darkMode &&
                styles.searchContainerDark,
            ]}
          >

            <Text
              style={[
                styles.searchIcon,
                darkMode &&
                  styles.searchIconDark,
              ]}
            >
              ⌕
            </Text>

            <TextInput
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);

                if (text.trim()) {
                  setSelectedCalendarDate(
                    null
                  );
                }
              }}
              placeholder="Search title, subject, or notes..."
              placeholderTextColor="#9CA3AF"
              style={[
                styles.searchInput,
                darkMode &&
                  styles.searchInputDark,
              ]}
              autoFocus
            />

            {searchText.length >
              0 && (
              <Pressable
                onPress={() =>
                  setSearchText('')
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

        {/* DATE MODE */}

        {selectedCalendarDate &&
          !searchText.trim() && (
            <View
              style={[
                styles.dateModeBanner,
                darkMode &&
                  styles.dateModeBannerDark,
              ]}
            >

              <View>
                <Text
                  style={[
                    styles.dateModeLabel,
                    darkMode &&
                      styles.dateModeLabelDark,
                  ]}
                >
                  DATE VIEW
                </Text>

                <Text
                  style={[
                    styles.dateModeText,
                    darkMode &&
                      styles.dateModeTextDark,
                  ]}
                >
                  {displayDate(
                    selectedCalendarDate
                  )}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setSelectedCalendarDate(
                    null
                  )
                }
                style={[
                  styles.clearDateModeButton,
                  darkMode &&
                    styles.clearDateModeButtonDark,
                ]}
              >
                <Text
                  style={[
                    styles.clearDateModeButtonText,
                    darkMode &&
                      styles.clearDateModeButtonTextDark,
                  ]}
                >
                  Clear
                </Text>
              </Pressable>

            </View>
          )}

        {/* FILTERS */}

        {!searchText.trim() &&
          !selectedCalendarDate && (
            <View
              style={
                styles.filterGrid
              }
            >

              <FilterCard
                icon="□"
                label="Today"
                count={todayCount}
                active={
                  activeFilter ===
                  'Today'
                }
                onPress={() => {
                  setSelectedCalendarDate(
                    null
                  );
                  setActiveFilter(
                    'Today'
                  );
                }}
              />

              <FilterCard
                icon="◷"
                label="Scheduled"
                count={
                  scheduledCount
                }
                active={
                  activeFilter ===
                  'Scheduled'
                }
                onPress={() => {
                  setSelectedCalendarDate(
                    null
                  );
                  setActiveFilter(
                    'Scheduled'
                  );
                }}
              />

              <FilterCard
                icon="★"
                label="Important"
                count={
                  importantCount
                }
                active={
                  activeFilter ===
                  'Important'
                }
                onPress={() => {
                  setSelectedCalendarDate(
                    null
                  );
                  setActiveFilter(
                    'Important'
                  );
                }}
              />

              <FilterCard
                icon="✓"
                label="Completed"
                count={
                  completedCount
                }
                active={
                  activeFilter ===
                  'Completed'
                }
                onPress={() => {
                  setSelectedCalendarDate(
                    null
                  );
                  setActiveFilter(
                    'Completed'
                  );
                }}
              />

            </View>
          )}

        {/* SECTION HEADER */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <View
            style={{ flex: 1 }}
          >

            <View
              style={
                styles.sectionTitleRow
              }
            >

              <Text
                style={[
                  styles.sectionTitle,
                  darkMode &&
                    styles.sectionTitleDark,
                ]}
              >
                {screenTitle}
              </Text>

              <View
                style={[
                  styles.sectionCount,
                  darkMode &&
                    styles.sectionCountDark,
                ]}
              >
                <Text
                  style={[
                    styles.sectionCountText,
                    darkMode &&
                      styles.sectionCountTextDark,
                  ]}
                >
                  {
                    filteredAssignments.length
                  }
                </Text>
              </View>

            </View>

            <Text
              style={[
                styles.sectionSubtitle,
                darkMode &&
                  styles.sectionSubtitleDark,
              ]}
            >
              {screenSubtitle}
            </Text>

          </View>

          <Pressable
            onPress={
              openNewAssignment
            }
            style={[
              styles.addTopButton,
              darkMode &&
                styles.addTopButtonDark,
            ]}
          >
            <Text
              style={[
                styles.addTopButtonText,
                darkMode &&
                  styles.addTopButtonTextDark,
              ]}
            >
              + Add
            </Text>
          </Pressable>

        </View>

        {/* ASSIGNMENT LIST */}

        <ScrollView
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            filteredAssignments.length ===
              0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={
            false
          }
        >

          {filteredAssignments.length ===
          0 ? (

            <View
              style={
                styles.emptyState
              }
            >

              <View
                style={[
                  styles.emptyIcon,
                  darkMode &&
                    styles.emptyIconDark,
                ]}
              >
                <Text
                  style={[
                    styles.emptyIconText,
                    darkMode &&
                      styles.emptyIconTextDark,
                  ]}
                >
                  ✓
                </Text>
              </View>

              <Text
                style={[
                  styles.emptyTitle,
                  darkMode &&
                    styles.emptyTitleDark,
                ]}
              >
                {searchText.trim()
                  ? 'Nothing found'
                  : selectedCalendarDate
                  ? 'No assignments on this date'
                  : 'No assignments here'}
              </Text>

              <Text
                style={[
                  styles.emptyDescription,
                  darkMode &&
                    styles.emptyDescriptionDark,
                ]}
              >
                {searchText.trim()
                  ? 'Try another title, subject, or keyword.'
                  : selectedCalendarDate
                  ? 'There are no assignments recorded for this date.'
                  : 'Add your first assignment and start keeping track of your work.'}
              </Text>

              {!searchText.trim() &&
                !selectedCalendarDate && (
                  <Pressable
                    onPress={
                      openNewAssignment
                    }
                    style={[
                      styles.emptyButton,
                      darkMode &&
                        styles.emptyButtonDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.emptyButtonText,
                        darkMode &&
                          styles.emptyButtonTextDark,
                      ]}
                    >
                      + Add Assignment
                    </Text>
                  </Pressable>
                )}

            </View>

          ) : (

            filteredAssignments.map(
              (assignment) => (
                <AssignmentCard
                  key={
                    assignment.id
                  }
                  assignment={
                    assignment
                  }
                  onMenu={() =>
                    openAssignmentMenu(
                      assignment
                    )
                  }
                />
              )
            )

          )}

        </ScrollView>

        {/* FLOATING ADD BUTTON */}

        <Pressable
          onPress={
            openNewAssignment
          }
          style={({ pressed }) => [
            styles.floatingButton,
            darkMode &&
              styles.floatingButtonDark,
            pressed &&
              styles.floatingButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.floatingButtonText,
              darkMode &&
                styles.floatingButtonTextDark,
            ]}
          >
            +
          </Text>
        </Pressable>

        {/* THREE-DOT MENU MODAL */}

        <Modal
          visible={
            menuAssignment !== null
          }
          transparent
          animationType="fade"
          onRequestClose={
            closeAssignmentMenu
          }
        >

          <Pressable
            style={
              styles.menuModalOverlay
            }
            onPress={
              closeAssignmentMenu
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
                Assignment Options
              </Text>

              {menuAssignment && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.menuAssignmentTitle,
                    darkMode &&
                      styles.menuAssignmentTitleDark,
                  ]}
                >
                  {menuAssignment.title}
                </Text>
              )}

              {/* EDIT */}

              <Pressable
                onPress={() => {
                  if (
                    menuAssignment
                  ) {
                    openEditAssignment(
                      menuAssignment
                    );
                  }
                }}
                style={
                  styles.menuItem
                }
              >

                <View
                  style={[
                    styles.menuItemIcon,
                    darkMode &&
                      styles.menuItemIconDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.menuItemIconText,
                      darkMode &&
                        styles.menuItemIconTextDark,
                    ]}
                  >
                    ✎
                  </Text>
                </View>

                <View
                  style={
                    styles.menuItemTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.menuItemTitle,
                      darkMode &&
                        styles.menuItemTitleDark,
                    ]}
                  >
                    Edit Assignment
                  </Text>

                  <Text
                    style={[
                      styles.menuItemSubtitle,
                      darkMode &&
                        styles.menuItemSubtitleDark,
                    ]}
                  >
                    Change title, date, priority,
                    or notes
                  </Text>
                </View>

              </Pressable>

              {/* MARK AS DONE */}

              {menuAssignment &&
                menuAssignment.status !==
                  'Completed' && (
                  <Pressable
                    onPress={() => {
                      if (
                        menuAssignment
                      ) {
                        updateStatus(
                          menuAssignment.id,
                          'Completed'
                        );
                      }
                    }}
                    style={
                      styles.menuItem
                    }
                  >

                    <View
                      style={[
                        styles.menuItemIcon,
                        styles.doneMenuIcon,
                        darkMode &&
                          styles.doneMenuIconDark,
                      ]}
                    >
                      <Text
                        style={
                          styles.doneMenuIconText
                        }
                      >
                        ✓
                      </Text>
                    </View>

                    <View
                      style={
                        styles.menuItemTextContainer
                      }
                    >
                      <Text
                        style={[
                          styles.menuItemTitle,
                          darkMode &&
                            styles.menuItemTitleDark,
                        ]}
                      >
                        Mark as Done
                      </Text>

                      <Text
                        style={[
                          styles.menuItemSubtitle,
                          darkMode &&
                            styles.menuItemSubtitleDark,
                        ]}
                      >
                        Move this assignment to
                        Completed
                      </Text>
                    </View>

                  </Pressable>
                )}

              {/* DELETE */}

              <Pressable
                onPress={() => {
                  if (
                    menuAssignment
                  ) {
                    deleteAssignment(
                      menuAssignment.id
                    );
                  }
                }}
                style={
                  styles.menuItem
                }
              >

                <View
                  style={[
                    styles.menuItemIcon,
                    styles.deleteMenuIcon,
                  ]}
                >
                  <Text
                    style={
                      styles.deleteMenuIconText
                    }
                  >
                    ×
                  </Text>
                </View>

                <View
                  style={
                    styles.menuItemTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.menuItemTitle,
                      styles.deleteMenuTitle,
                    ]}
                  >
                    Delete Assignment
                  </Text>

                  <Text
                    style={[
                      styles.menuItemSubtitle,
                      darkMode &&
                        styles.menuItemSubtitleDark,
                    ]}
                  >
                    Permanently remove this
                    assignment
                  </Text>
                </View>

              </Pressable>

              {/* CANCEL */}

              <Pressable
                onPress={
                  closeAssignmentMenu
                }
                style={[
                  styles.menuCancelButton,
                  darkMode &&
                    styles.menuCancelButtonDark,
                ]}
              >
                <Text
                  style={[
                    styles.menuCancelText,
                    darkMode &&
                      styles.menuCancelTextDark,
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

            </Pressable>

          </Pressable>

        </Modal>

        {/* ADD / EDIT FORM */}

        <Modal
          visible={formVisible}
          transparent
          animationType="fade"
          onRequestClose={
            closeForm
          }
        >

          <KeyboardAvoidingView
            style={
              styles.modalOverlay
            }
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : undefined
            }
          >

            <View
              style={[
                styles.modalCard,
                darkMode &&
                  styles.modalCardDark,
              ]}
            >

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
              >

                <View
                  style={
                    styles.modalHeader
                  }
                >

                  <View
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={[
                        styles.modalTitle,
                        darkMode &&
                          styles.modalTitleDark,
                      ]}
                    >
                      {editingAssignment
                        ? 'Edit Assignment'
                        : 'New Assignment'}
                    </Text>

                    <Text
                      style={[
                        styles.modalSubtitle,
                        darkMode &&
                          styles.modalSubtitleDark,
                      ]}
                    >
                      {editingAssignment
                        ? 'Update your assignment details.'
                        : 'Add something you need to accomplish.'}
                    </Text>
                  </View>

                  <Pressable
                    onPress={
                      closeForm
                    }
                    style={[
                      styles.closeButton,
                      darkMode &&
                        styles.closeButtonDark,
                    ]}
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
                    styles.inputLabel,
                    darkMode &&
                      styles.inputLabelDark,
                  ]}
                >
                  Title
                </Text>

                <TextInput
                  value={title}
                  onChangeText={
                    setTitle
                  }
                  placeholder="e.g. Calculus problem set 4"
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    darkMode &&
                      styles.inputDark,
                  ]}
                />

                {/* SUBJECT + DATE */}

                <View
                  style={
                    styles.twoColumn
                  }
                >

                  <View
                    style={
                      styles.column
                    }
                  >

                    <Text
                      style={[
                        styles.inputLabel,
                        darkMode &&
                          styles.inputLabelDark,
                      ]}
                    >
                      Subject
                    </Text>

                    <TextInput
                      value={
                        subject
                      }
                      onChangeText={
                        setSubject
                      }
                      placeholder="General"
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.input,
                        darkMode &&
                          styles.inputDark,
                      ]}
                    />

                  </View>

                  <View
                    style={
                      styles.column
                    }
                  >

                    <Text
                      style={[
                        styles.inputLabel,
                        darkMode &&
                          styles.inputLabelDark,
                      ]}
                    >
                      Due Date
                    </Text>

                    <Pressable
                      onPress={
                        openDatePicker
                      }
                      style={[
                        styles.dateInput,
                        darkMode &&
                          styles.dateInputDark,
                      ]}
                    >

                      <Text
                        style={[
                          styles.dateInputText,
                          darkMode &&
                            styles.dateInputTextDark,
                          !dueDate &&
                            styles.placeholderText,
                        ]}
                      >
                        {dueDate
                          ? displayDate(
                              dueDate
                            )
                          : 'Select date'}
                      </Text>

                      <Text
                        style={
                          styles.dateInputIcon
                        }
                      >
                        □
                      </Text>

                    </Pressable>

                  </View>

                </View>

                {/* PRIORITY */}

                <Text
                  style={[
                    styles.inputLabel,
                    darkMode &&
                      styles.inputLabelDark,
                  ]}
                >
                  Priority
                </Text>

                <View
                  style={
                    styles.priorityRow
                  }
                >

                  {(
                    [
                      'Low',
                      'Medium',
                      'High',
                    ] as Priority[]
                  ).map(
                    (item) => (
                      <Pressable
                        key={item}
                        onPress={() =>
                          setPriority(
                            item
                          )
                        }
                        style={[
                          styles.priorityButton,
                          darkMode &&
                            styles.priorityButtonDark,
                          priority ===
                            item &&
                            styles.priorityButtonActive,
                          priority ===
                            item &&
                            darkMode &&
                            styles.priorityButtonActiveDark,
                        ]}
                      >

                        <Text
                          style={[
                            styles.priorityText,
                            darkMode &&
                              styles.priorityTextDark,
                            priority ===
                              item &&
                              styles.priorityTextActive,
                            priority ===
                              item &&
                              darkMode &&
                              styles.priorityTextActiveDark,
                          ]}
                        >
                          {item}
                        </Text>

                      </Pressable>
                    )
                  )}

                </View>

                {/* NOTES */}

                <Text
                  style={[
                    styles.inputLabel,
                    darkMode &&
                      styles.inputLabelDark,
                  ]}
                >
                  Notes
                </Text>

                <TextInput
                  value={notes}
                  onChangeText={
                    setNotes
                  }
                  placeholder="Any extra details..."
                  placeholderTextColor="#9CA3AF"
                  style={[
                    styles.input,
                    styles.notesInput,
                    darkMode &&
                      styles.inputDark,
                  ]}
                  multiline
                  textAlignVertical="top"
                />

                {/* ACTIONS */}

                <View
                  style={
                    styles.modalActions
                  }
                >

                  <Pressable
                    onPress={
                      closeForm
                    }
                    style={[
                      styles.cancelButton,
                      darkMode &&
                        styles.cancelButtonDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cancelText,
                        darkMode &&
                          styles.cancelTextDark,
                      ]}
                    >
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={
                      saveAssignment
                    }
                    disabled={
                      !title.trim()
                    }
                    style={[
                      styles.addButton,
                      darkMode &&
                        styles.addButtonDark,
                      !title.trim() &&
                        styles.addButtonDisabled,
                      !title.trim() &&
                        darkMode &&
                        styles.addButtonDisabledDark,
                    ]}
                  >
                    <Text
                      style={[
                        styles.addButtonText,
                        darkMode &&
                          styles.addButtonTextDark,
                      ]}
                    >
                      {editingAssignment
                        ? 'Save Changes'
                        : '+ Add Assignment'}
                    </Text>
                  </Pressable>

                </View>

              </ScrollView>

            </View>

          </KeyboardAvoidingView>

        </Modal>

        {/* CALENDAR MODAL */}

        <Modal
          visible={
            datePickerVisible
          }
          transparent
          animationType="slide"
          onRequestClose={() =>
            setDatePickerVisible(
              false
            )
          }
        >

          <View
            style={
              styles.dateModalOverlay
            }
          >

            <View
              style={[
                styles.datePickerCard,
                darkMode &&
                  styles.datePickerCardDark,
              ]}
            >

              <View
                style={[
                  styles.datePickerHandle,
                  darkMode &&
                    styles.datePickerHandleDark,
                ]}
              />

              <View
                style={
                  styles.datePickerHeader
                }
              >

                <View
                  style={{ flex: 1 }}
                >

                  <Text
                    style={[
                      styles.datePickerTitle,
                      darkMode &&
                        styles.datePickerTitleDark,
                    ]}
                  >
                    {formVisible
                      ? 'Select Due Date'
                      : 'Browse by Date'}
                  </Text>

                  <Text
                    style={[
                      styles.datePickerSubtitle,
                      darkMode &&
                        styles.datePickerSubtitleDark,
                    ]}
                  >
                    {formVisible
                      ? 'Choose when this assignment is due.'
                      : 'View assignments from a specific date.'}
                  </Text>

                </View>

                <Pressable
                  onPress={() =>
                    setDatePickerVisible(
                      false
                    )
                  }
                  style={[
                    styles.closeButton,
                    darkMode &&
                      styles.closeButtonDark,
                  ]}
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

              {/* MONTH */}

              <View
                style={
                  styles.monthHeader
                }
              >

                <Pressable
                  onPress={
                    goToPreviousMonth
                  }
                  style={[
                    styles.monthArrow,
                    darkMode &&
                      styles.monthArrowDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthArrowText,
                      darkMode &&
                        styles.monthArrowTextDark,
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
                  style={[
                    styles.monthArrow,
                    darkMode &&
                      styles.monthArrowDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthArrowText,
                      darkMode &&
                        styles.monthArrowTextDark,
                    ]}
                  >
                    ›
                  </Text>
                </Pressable>

              </View>

              {/* WEEKDAYS */}

              <View
                style={
                  styles.weekdayRow
                }
              >

                {WEEKDAYS.map(
                  (day) => (
                    <Text
                      key={day}
                      style={[
                        styles.weekdayText,
                        darkMode &&
                          styles.weekdayTextDark,
                      ]}
                    >
                      {day}
                    </Text>
                  )
                )}

              </View>

              {/* CALENDAR DAYS */}

              <View
                style={
                  styles.calendarGrid
                }
              >

                {calendarDays.map(
                  (
                    day,
                    index
                  ) => {

                    if (
                      day ===
                      null
                    ) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={
                            styles.calendarDay
                          }
                        />
                      );
                    }

                    const date =
                      new Date(
                        calendarYear,
                        calendarMonth,
                        day
                      );

                    const dateString =
                      formatDate(
                        date
                      );

                    const isSelected =
                      selectedDate ===
                      dateString;

                    const isToday =
                      todayString ===
                      dateString;

                    return (
                      <Pressable
                        key={
                          dateString
                        }
                        onPress={() =>
                          selectCalendarDate(
                            day
                          )
                        }
                        style={[
                          styles.calendarDay,
                          isSelected &&
                            styles.calendarDaySelected,
                        ]}
                      >

                        <Text
                          style={[
                            styles.calendarDayText,
                            darkMode &&
                              styles.calendarDayTextDark,
                            isSelected &&
                              styles.calendarDayTextSelected,
                            isToday &&
                              !isSelected &&
                              styles.calendarTodayText,
                            isToday &&
                              !isSelected &&
                              darkMode &&
                              styles.calendarTodayTextDark,
                          ]}
                        >
                          {day}
                        </Text>

                        {isToday &&
                          !isSelected && (
                            <View
                              style={
                                styles.todayDot
                              }
                            />
                          )}

                      </Pressable>
                    );
                  }
                )}

              </View>

              {/* SELECTED DATE */}

              <View
                style={[
                  styles.selectedDateBox,
                  darkMode &&
                    styles.selectedDateBoxDark,
                ]}
              >

                <View
                  style={[
                    styles.selectedDateIcon,
                    darkMode &&
                      styles.selectedDateIconDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectedDateIconText,
                      darkMode &&
                        styles.selectedDateIconTextDark,
                    ]}
                  >
                    □
                  </Text>
                </View>

                <View
                  style={
                    styles.selectedDateInfo
                  }
                >

                  <Text
                    style={[
                      styles.selectedDateLabel,
                      darkMode &&
                        styles.selectedDateLabelDark,
                    ]}
                  >
                    Selected date
                  </Text>

                  <Text
                    style={[
                      styles.selectedDateText,
                      darkMode &&
                        styles.selectedDateTextDark,
                    ]}
                  >
                    {selectedDate
                      ? displayDate(
                          selectedDate
                        )
                      : 'No date selected'}
                  </Text>

                </View>

              </View>

              {/* DATE ACTIONS */}

              <View
                style={
                  styles.datePickerActions
                }
              >

                <Pressable
                  onPress={
                    clearSelectedDate
                  }
                  style={[
                    styles.clearDateButton,
                    darkMode &&
                      styles.clearDateButtonDark,
                  ]}
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

                <Pressable
                  onPress={
                    confirmDate
                  }
                  disabled={
                    !selectedDate
                  }
                  style={[
                    styles.confirmDateButton,
                    !selectedDate &&
                      styles.confirmDateDisabled,
                    !selectedDate &&
                      darkMode &&
                      styles.confirmDateDisabledDark,
                  ]}
                >
                  <Text
                    style={
                      styles.confirmDateText
                    }
                  >
                    {formVisible
                      ? 'Use This Date'
                      : 'View Date'}
                  </Text>
                </Pressable>

              </View>

            </View>

          </View>

        </Modal>

      </View>
    </SafeAreaView>
  );
}

/* ==============================================================
   FILTER CARD
============================================================== */

function FilterCard({
  icon,
  label,
  count,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const { darkMode } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterCard,
        darkMode &&
          styles.filterCardDark,
        active &&
          styles.filterCardActive,
        active &&
          darkMode &&
          styles.filterCardActiveDark,
        pressed &&
          styles.pressed,
      ]}
    >

      <View
        style={[
          styles.filterIcon,
          darkMode &&
            styles.filterIconDark,
          active &&
            styles.filterIconActive,
          active &&
            darkMode &&
            styles.filterIconActiveDark,
        ]}
      >
        <Text
          style={[
            styles.filterIconText,
            darkMode &&
              styles.filterIconTextDark,
            active &&
              styles.filterIconTextActive,
            active &&
              darkMode &&
              styles.filterIconTextActiveDark,
          ]}
        >
          {icon}
        </Text>
      </View>

      <View
        style={
          styles.filterTextContainer
        }
      >

        <Text
          style={[
            styles.filterLabel,
            darkMode &&
              styles.filterLabelDark,
            active &&
              styles.filterLabelActive,
            active &&
              darkMode &&
              styles.filterLabelActiveDark,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.filterCount,
            darkMode &&
              styles.filterCountDark,
            active &&
              styles.filterCountActive,
            active &&
              darkMode &&
              styles.filterCountActiveDark,
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              darkMode &&
                styles.filterCountTextDark,
              active &&
                styles.filterCountTextActive,
              active &&
                darkMode &&
                styles.filterCountTextActiveDark,
            ]}
          >
            {count}
          </Text>
        </View>

      </View>

    </Pressable>
  );
}

/* ==============================================================
   ASSIGNMENT CARD
============================================================== */

function AssignmentCard({
  assignment,
  onMenu,
}: {
  assignment: Assignment;
  onMenu: () => void;
}) {
  const { darkMode } = useTheme();

  const priorityStyle =
    assignment.priority ===
    'High'
      ? styles.highPriority
      : assignment.priority ===
        'Low'
      ? styles.lowPriority
      : styles.mediumPriority;

  const darkPriorityStyle =
    assignment.priority ===
    'High'
      ? styles.highPriorityDark
      : assignment.priority ===
        'Low'
      ? styles.lowPriorityDark
      : styles.mediumPriorityDark;

  return (
    <View
      style={[
        styles.assignmentCard,
        darkMode &&
          styles.assignmentCardDark,
      ]}
    >

      {/* MAIN */}

      <View
        style={
          styles.cardMainRow
        }
      >

        <View
          style={[
            styles.checkbox,
            darkMode &&
              styles.checkboxDark,
            assignment.status ===
              'Completed' &&
              styles.checkboxCompleted,
          ]}
        >
          {assignment.status ===
            'Completed' && (
            <Text
              style={
                styles.checkmark
              }
            >
              ✓
            </Text>
          )}
        </View>

        <View
          style={
            styles.assignmentInfo
          }
        >

          <View
            style={
              styles.assignmentTitleRow
            }
          >

            <Text
              style={[
                styles.assignmentTitle,
                darkMode &&
                  styles.assignmentTitleDark,
                assignment.status ===
                  'Completed' &&
                  styles.completedTitle,
              ]}
              numberOfLines={2}
            >
              {assignment.title}
            </Text>

            <View
              style={[
                styles.priorityBadge,
                priorityStyle,
                darkMode &&
                  darkPriorityStyle,
              ]}
            >
              <Text
                style={[
                  styles.priorityBadgeText,
                  darkMode &&
                    styles.priorityBadgeTextDark,
                ]}
              >
                {assignment.priority}
              </Text>
            </View>

          </View>

          <View
            style={
              styles.detailsRow
            }
          >

            <Text
              style={[
                styles.detailIcon,
                darkMode &&
                  styles.detailIconDark,
              ]}
            >
              □
            </Text>

            <Text
              style={[
                styles.detailText,
                darkMode &&
                  styles.detailTextDark,
              ]}
            >
              {assignment.dueDate
                ? displayDate(
                    assignment.dueDate
                  )
                : 'No due date'}
            </Text>

            <Text
              style={[
                styles.detailSeparator,
                darkMode &&
                  styles.detailSeparatorDark,
              ]}
            >
              •
            </Text>

            <Text
              style={[
                styles.detailText,
                darkMode &&
                  styles.detailTextDark,
              ]}
            >
              {assignment.subject}
            </Text>

          </View>

          {assignment.notes ? (
            <View
              style={
                styles.notesRow
              }
            >

              <Text
                style={[
                  styles.detailIcon,
                  darkMode &&
                    styles.detailIconDark,
                ]}
              >
                ≡
              </Text>

              <Text
                style={[
                  styles.notesText,
                  darkMode &&
                    styles.notesTextDark,
                ]}
                numberOfLines={2}
              >
                {assignment.notes}
              </Text>

            </View>
          ) : null}

        </View>

      </View>

      {/* BOTTOM */}

      <View
        style={[
          styles.cardBottomRow,
          darkMode &&
            styles.cardBottomRowDark,
        ]}
      >

        <View
          style={[
            styles.statusBadge,
            assignment.status ===
              'Completed'
              ? styles.completedStatus
              : assignment.status ===
                'In Progress'
              ? styles.progressStatus
              : styles.pendingStatus,
            darkMode &&
              styles.statusBadgeDark,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              darkMode &&
                styles.statusTextDark,
            ]}
          >
            {assignment.status}
          </Text>
        </View>

        <View
          style={
            styles.actionRow
          }
        >

          {assignment.status !==
            'Completed' && (
            <>
              {assignment.status !==
                'In Progress' && (
                <Pressable
                  onPress={() => {
                    /*
                     * This button only changes
                     * the visual status.
                     *
                     * The parent will handle
                     * database integration later.
                     */
                  }}
                  style={[
                    styles.startButton,
                    darkMode &&
                      styles.startButtonDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.startIcon,
                      darkMode &&
                        styles.startIconDark,
                    ]}
                  >
                    ▶
                  </Text>

                  <Text
                    style={[
                      styles.startText,
                      darkMode &&
                        styles.startTextDark,
                    ]}
                  >
                    Start
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {/* THREE DOTS */}

          <Pressable
            onPress={onMenu}
            style={[
              styles.moreButton,
              darkMode &&
                styles.moreButtonDark,
            ]}
          >
            <Text
              style={[
                styles.moreText,
                darkMode &&
                  styles.moreTextDark,
              ]}
            >
              •••
            </Text>
          </Pressable>

        </View>

      </View>

    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },

  safeAreaDark: {
    backgroundColor: '#111827',
  },

  screen: {
    flex: 1,
  },

  screenDark: {
    backgroundColor: '#111827',
  },

  pressed: {
    opacity: 0.7,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 35,
    paddingBottom: 14,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconButtonDark: {
    backgroundColor: '#193746',
  },

  iconButtonActive: {
    backgroundColor: '#CDEFFF',
  },

  iconButtonActiveDark: {
    backgroundColor: '#24566B',
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 36,
    color: '#318AB8',
    marginTop: -3,
  },

  backIconDark: {
    color: '#7CC7E7',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111827',
  },

  headerTitleDark: {
    color: '#F9FAFB',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#7C8790',
  },

  headerSubtitleDark: {
    color: '#9CA3AF',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 7,
  },

  headerIcon: {
    fontSize: 23,
    color: '#287FA9',
    fontWeight: '600',
  },

  headerIconDark: {
    color: '#7CC7E7',
  },

  /* SEARCH */

  searchContainer: {
    marginHorizontal: 18,
    marginBottom: 13,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE4E8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchContainerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  searchIcon: {
    fontSize: 21,
    color: '#7D8991',
  },

  searchIconDark: {
    color: '#9CA3AF',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#111827',
  },

  searchInputDark: {
    color: '#F9FAFB',
  },

  clearSearch: {
    fontSize: 22,
    color: '#9CA3AF',
  },

  /* DATE MODE */

  dateModeBanner: {
    marginHorizontal: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#EAF7FD',
    borderWidth: 1,
    borderColor: '#C8E9F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateModeBannerDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  dateModeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5E9BB8',
    letterSpacing: 1,
  },

  dateModeLabelDark: {
    color: '#7CC7E7',
  },

  dateModeText: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '800',
    color: '#247DA7',
  },

  dateModeTextDark: {
    color: '#7CC7E7',
  },

  clearDateModeButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  clearDateModeButtonDark: {
    backgroundColor: '#1F2937',
  },

  clearDateModeButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#318AB8',
  },

  clearDateModeButtonTextDark: {
    color: '#7CC7E7',
  },

  /* FILTER */

  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 9,
    marginBottom: 18,
  },

  filterCard: {
    width: '48%',
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E7EB',
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  filterCardActive: {
    backgroundColor: '#DDF3FF',
    borderColor: '#A8DDF2',
  },

  filterCardActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  filterIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterIconDark: {
    backgroundColor: '#374151',
  },

  filterIconActive: {
    backgroundColor: '#FFFFFF',
  },

  filterIconActiveDark: {
    backgroundColor: '#1F2937',
  },

  filterIconText: {
    fontSize: 21,
    color: '#7B858D',
  },

  filterIconTextDark: {
    color: '#9CA3AF',
  },

  filterIconTextActive: {
    color: '#3498C6',
  },

  filterIconTextActiveDark: {
    color: '#7CC7E7',
  },

  filterTextContainer: {
    marginLeft: 10,
    flex: 1,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4E5961',
  },

  filterLabelDark: {
    color: '#D1D5DB',
  },

  filterLabelActive: {
    color: '#267FA9',
  },

  filterLabelActiveDark: {
    color: '#7CC7E7',
  },

  filterCount: {
    alignSelf: 'flex-start',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EEF1F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 5,
  },

  filterCountDark: {
    backgroundColor: '#374151',
  },

  filterCountActive: {
    backgroundColor: '#FFFFFF',
  },

  filterCountActiveDark: {
    backgroundColor: '#1F2937',
  },

  filterCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#69747C',
  },

  filterCountTextDark: {
    color: '#9CA3AF',
  },

  filterCountTextActive: {
    color: '#318AB8',
  },

  filterCountTextActiveDark: {
    color: '#7CC7E7',
  },

  /* SECTION */

  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },

  sectionTitleDark: {
    color: '#F9FAFB',
  },

  sectionCount: {
    minWidth: 26,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DDF3FF',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  sectionCountDark: {
    backgroundColor: '#193746',
  },

  sectionCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#318AB8',
  },

  sectionCountTextDark: {
    color: '#7CC7E7',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#8A949C',
  },

  sectionSubtitleDark: {
    color: '#9CA3AF',
  },

  addTopButton: {
    backgroundColor: '#BDE7F8',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 18,
    marginLeft: 10,
  },

  addTopButtonDark: {
    backgroundColor: '#24566B',
  },

  addTopButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#257DA7',
  },

  addTopButtonTextDark: {
    color: '#BDE7F8',
  },

  /* LIST */

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 35,
    paddingBottom: 65,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EAF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyIconDark: {
    backgroundColor: '#193746',
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#63B8DC',
  },

  emptyIconTextDark: {
    color: '#7CC7E7',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17202A',
  },

  emptyTitleDark: {
    color: '#F9FAFB',
  },

  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#8A949C',
  },

  emptyDescriptionDark: {
    color: '#9CA3AF',
  },

  emptyButton: {
    marginTop: 19,
    backgroundColor: '#BDE7F8',
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 19,
  },

  emptyButtonDark: {
    backgroundColor: '#24566B',
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#257DA7',
  },

  emptyButtonTextDark: {
    color: '#BDE7F8',
  },

  /* ASSIGNMENT CARD */

  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E1E7EB',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
  },

  assignmentCardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },

  cardMainRow: {
    flexDirection: 'row',
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#AEB8BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  checkboxDark: {
    borderColor: '#6B7280',
  },

  checkboxCompleted: {
    backgroundColor: '#DDF8E2',
    borderColor: '#7CC88A',
  },

  checkmark: {
    fontSize: 14,
    fontWeight: '800',
    color: '#36A44E',
  },

  assignmentInfo: {
    flex: 1,
    marginLeft: 12,
  },

  assignmentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  assignmentTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  assignmentTitleDark: {
    color: '#F9FAFB',
  },

  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },

  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },

  lowPriority: {
    backgroundColor: '#EDFBD9',
  },

  mediumPriority: {
    backgroundColor: '#FFF0C7',
  },

  highPriority: {
    backgroundColor: '#FFE0E4',
  },

  lowPriorityDark: {
    backgroundColor: '#304229',
  },

  mediumPriorityDark: {
    backgroundColor: '#4A4027',
  },

  highPriorityDark: {
    backgroundColor: '#4A2F35',
  },

  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555B61',
  },

  priorityBadgeTextDark: {
    color: '#D1D5DB',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  detailIcon: {
    fontSize: 13,
    color: '#6AAFD0',
    marginRight: 5,
  },

  detailIconDark: {
    color: '#7CC7E7',
  },

  detailText: {
    fontSize: 12,
    color: '#727D85',
  },

  detailTextDark: {
    color: '#9CA3AF',
  },

  detailSeparator: {
    marginHorizontal: 6,
    color: '#B0B7BC',
  },

  detailSeparatorDark: {
    color: '#6B7280',
  },

  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 7,
  },

  notesText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#8A949C',
  },

  notesTextDark: {
    color: '#9CA3AF',
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F3',
  },

  cardBottomRowDark: {
    borderTopColor: '#374151',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  pendingStatus: {
    backgroundColor: '#F0F2F4',
  },

  progressStatus: {
    backgroundColor: '#DCEBFF',
  },

  completedStatus: {
    backgroundColor: '#D9F8DD',
  },

  statusBadgeDark: {
    backgroundColor: '#374151',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C666D',
  },

  statusTextDark: {
    color: '#D1D5DB',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F3FF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },

  startButtonDark: {
    backgroundColor: '#193746',
  },

  startIcon: {
    fontSize: 9,
    color: '#348BC0',
    marginRight: 5,
  },

  startIconDark: {
    color: '#7CC7E7',
  },

  startText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#348BC0',
  },

  startTextDark: {
    color: '#7CC7E7',
  },

  moreButton: {
    width: 36,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreButtonDark: {
    backgroundColor: '#374151',
  },

  moreText: {
    fontSize: 13,
    letterSpacing: 1,
    color: '#66727A',
    marginTop: -5,
  },

  moreTextDark: {
    color: '#D1D5DB',
  },

  /* THREE DOT MENU */

  menuModalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  menuCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },

  menuCardDark: {
    backgroundColor: '#1F2937',
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17202A',
    paddingHorizontal: 4,
  },

  menuTitleDark: {
    color: '#F9FAFB',
  },

  menuAssignmentTitle: {
    fontSize: 12,
    color: '#89939A',
    marginTop: 4,
    marginBottom: 9,
    paddingHorizontal: 4,
  },

  menuAssignmentTitleDark: {
    color: '#9CA3AF',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 4,
  },

  menuItemIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EAF6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuItemIconDark: {
    backgroundColor: '#193746',
  },

  menuItemIconText: {
    fontSize: 20,
    color: '#318AB8',
  },

  menuItemIconTextDark: {
    color: '#7CC7E7',
  },

  doneMenuIcon: {
    backgroundColor: '#DDF8E2',
  },

  doneMenuIconDark: {
    backgroundColor: '#24432A',
  },

  doneMenuIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#36A44E',
  },

  deleteMenuIcon: {
    backgroundColor: '#FFE8EB',
  },

  deleteMenuIconText: {
    fontSize: 24,
    color: '#D85D6A',
    fontWeight: '300',
  },

  menuItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  menuItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#303A41',
  },

  menuItemTitleDark: {
    color: '#F9FAFB',
  },

  menuItemSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: '#929BA1',
  },

  menuItemSubtitleDark: {
    color: '#9CA3AF',
  },

  deleteMenuTitle: {
    color: '#D85D6A',
  },

  menuCancelButton: {
    marginTop: 7,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuCancelButtonDark: {
    backgroundColor: '#374151',
  },

  menuCancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#657078',
  },

  menuCancelTextDark: {
    color: '#D1D5DB',
  },

  /* FLOATING BUTTON */

  floatingButton: {
    position: 'absolute',
    right: 21,
    bottom: 23,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#BDE7F8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },

  floatingButtonDark: {
    backgroundColor: '#24566B',
  },

  floatingButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  floatingButtonText: {
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
    color: '#257DA7',
  },

  floatingButtonTextDark: {
    color: '#BDE7F8',
  },

  /* FORM */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
  },

  modalCardDark: {
    backgroundColor: '#1F2937',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  modalTitleDark: {
    color: '#F9FAFB',
  },

  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8A949C',
  },

  modalSubtitleDark: {
    color: '#9CA3AF',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonDark: {
    backgroundColor: '#374151',
  },

  closeText: {
    fontSize: 25,
    lineHeight: 27,
    color: '#68737B',
    fontWeight: '300',
  },

  closeTextDark: {
    color: '#D1D5DB',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5D666D',
    marginBottom: 7,
    marginTop: 12,
  },

  inputLabelDark: {
    color: '#D1D5DB',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD2D7',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  inputDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    color: '#F9FAFB',
  },

  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },

  column: {
    flex: 1,
  },

  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD2D7',
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
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },

  dateInputTextDark: {
    color: '#F9FAFB',
  },

  placeholderText: {
    color: '#9CA3AF',
  },

  dateInputIcon: {
    fontSize: 18,
    color: '#5BA9CF',
  },

  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },

  priorityButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD2D7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priorityButtonDark: {
    backgroundColor: '#111827',
    borderColor: '#374151',
  },

  priorityButtonActive: {
    backgroundColor: '#DDF3FF',
    borderColor: '#8DD1ED',
  },

  priorityButtonActiveDark: {
    backgroundColor: '#193746',
    borderColor: '#24566B',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B737A',
  },

  priorityTextDark: {
    color: '#D1D5DB',
  },

  priorityTextActive: {
    color: '#2584AF',
    fontWeight: '800',
  },

  priorityTextActiveDark: {
    color: '#7CC7E7',
  },

  notesInput: {
    height: 88,
    paddingTop: 12,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8CDD1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonDark: {
    borderColor: '#4B5563',
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B737A',
  },

  cancelTextDark: {
    color: '#D1D5DB',
  },

  addButton: {
    flex: 1.3,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#BDE7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonDark: {
    backgroundColor: '#24566B',
  },

  addButtonDisabled: {
    backgroundColor: '#E8EDF0',
  },

  addButtonDisabledDark: {
    backgroundColor: '#374151',
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#257DA7',
  },

  addButtonTextDark: {
    color: '#BDE7F8',
  },

  /* DATE PICKER */

  dateModalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.30)',
    justifyContent: 'flex-end',
  },

  datePickerCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },

  datePickerCardDark: {
    backgroundColor: '#1F2937',
  },

  datePickerHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C9CED2',
    alignSelf: 'center',
    marginBottom: 17,
  },

  datePickerHandleDark: {
    backgroundColor: '#4B5563',
  },

  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  datePickerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#111827',
  },

  datePickerTitleDark: {
    color: '#F9FAFB',
  },

  datePickerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8A949C',
  },

  datePickerSubtitleDark: {
    color: '#9CA3AF',
  },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 14,
  },

  monthArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  monthArrowDark: {
    backgroundColor: '#193746',
  },

  monthArrowText: {
    fontSize: 28,
    lineHeight: 30,
    color: '#318AB8',
  },

  monthArrowTextDark: {
    color: '#7CC7E7',
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17202A',
  },

  monthTitleDark: {
    color: '#F9FAFB',
  },

  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 7,
  },

  weekdayText: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#8B949C',
  },

  weekdayTextDark: {
    color: '#9CA3AF',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarDay: {
    width: '14.2857%',
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },

  calendarDaySelected: {
    backgroundColor: '#55A9DE',
  },

  calendarDayText: {
    fontSize: 13,
    color: '#26313A',
  },

  calendarDayTextDark: {
    color: '#E5E7EB',
  },

  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  calendarTodayText: {
    color: '#318AB8',
    fontWeight: '800',
  },

  calendarTodayTextDark: {
    color: '#7CC7E7',
  },

  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#55A9DE',
    position: 'absolute',
    bottom: 4,
  },

  selectedDateBox: {
    marginTop: 15,
    backgroundColor: '#F1F9FD',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedDateBoxDark: {
    backgroundColor: '#193746',
  },

  selectedDateIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DDF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDateIconDark: {
    backgroundColor: '#24566B',
  },

  selectedDateIconText: {
    fontSize: 19,
    color: '#318AB8',
  },

  selectedDateIconTextDark: {
    color: '#7CC7E7',
  },

  selectedDateInfo: {
    marginLeft: 11,
  },

  selectedDateLabel: {
    fontSize: 10,
    color: '#87929A',
    fontWeight: '600',
  },

  selectedDateLabelDark: {
    color: '#9CA3AF',
  },

  selectedDateText: {
    marginTop: 2,
    fontSize: 14,
    color: '#1C2932',
    fontWeight: '800',
  },

  selectedDateTextDark: {
    color: '#F9FAFB',
  },

  datePickerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  clearDateButton: {
    flex: 0.8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD2D7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearDateButtonDark: {
    borderColor: '#4B5563',
  },

  clearDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#69747C',
  },

  clearDateTextDark: {
    color: '#D1D5DB',
  },

  confirmDateButton: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#55A9DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmDateDisabled: {
    backgroundColor: '#DCE4E8',
  },

  confirmDateDisabledDark: {
    backgroundColor: '#374151',
  },

  confirmDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});