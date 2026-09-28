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
   *
   * Instead of putting the menu directly inside the card,
   * we use a Modal.
   *
   * This makes the three-dot menu reliable on Android.
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

    /*
     * If the form is open,
     * we're selecting an assignment due date.
     */
    if (formVisible) {
      setDueDate(selectedDate);
    } else {
      /*
       * Otherwise we're browsing assignments
       * by date.
       */
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

    const days: Array<number | null> =
      [];

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
      /*
       * SEARCH
       *
       * Searches EVERYTHING.
       */
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

      /*
       * CALENDAR MODE
       *
       * Shows ALL assignments on
       * selected date, including completed.
       */
      if (selectedCalendarDate) {
        return assignments.filter(
          (assignment) =>
            assignment.dueDate ===
            selectedCalendarDate
        );
      }

      /*
       * NORMAL FILTERS
       */

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
      style={styles.safeArea}
    >
      <View style={styles.screen}>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>

          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Text style={styles.backIcon}>
              ‹
            </Text>
          </Pressable>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={styles.headerTitle}
            >
              Assignments
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
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
                searchVisible &&
                  styles.iconButtonActive,
              ]}
            >
              <Text
                style={
                  styles.headerIcon
                }
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
                selectedCalendarDate &&
                  styles.iconButtonActive,
              ]}
            >
              <Text
                style={
                  styles.headerIcon
                }
              >
                □
              </Text>
            </Pressable>

          </View>
        </View>

        {/* ====================================================
            SEARCH BAR
        ==================================================== */}

        {searchVisible && (
          <View
            style={
              styles.searchContainer
            }
          >

            <Text
              style={
                styles.searchIcon
              }
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
              style={
                styles.searchInput
              }
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

        {/* ====================================================
            DATE MODE
        ==================================================== */}

        {selectedCalendarDate &&
          !searchText.trim() && (
            <View
              style={
                styles.dateModeBanner
              }
            >

              <View>
                <Text
                  style={
                    styles.dateModeLabel
                  }
                >
                  DATE VIEW
                </Text>

                <Text
                  style={
                    styles.dateModeText
                  }
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
                style={
                  styles.clearDateModeButton
                }
              >
                <Text
                  style={
                    styles.clearDateModeButtonText
                  }
                >
                  Clear
                </Text>
              </Pressable>

            </View>
          )}

        {/* ====================================================
            FILTERS
        ==================================================== */}

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

        {/* ====================================================
            SECTION HEADER
        ==================================================== */}

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
                style={
                  styles.sectionTitle
                }
              >
                {screenTitle}
              </Text>

              <View
                style={
                  styles.sectionCount
                }
              >
                <Text
                  style={
                    styles.sectionCountText
                  }
                >
                  {
                    filteredAssignments.length
                  }
                </Text>
              </View>

            </View>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              {screenSubtitle}
            </Text>

          </View>

          <Pressable
            onPress={
              openNewAssignment
            }
            style={
              styles.addTopButton
            }
          >
            <Text
              style={
                styles.addTopButtonText
              }
            >
              + Add
            </Text>
          </Pressable>

        </View>

        {/* ====================================================
            ASSIGNMENT LIST
        ==================================================== */}

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
                style={
                  styles.emptyIcon
                }
              >
                <Text
                  style={
                    styles.emptyIconText
                  }
                >
                  ✓
                </Text>
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {searchText.trim()
                  ? 'Nothing found'
                  : selectedCalendarDate
                  ? 'No assignments on this date'
                  : 'No assignments here'}
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
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
                    style={
                      styles.emptyButton
                    }
                  >
                    <Text
                      style={
                        styles.emptyButtonText
                      }
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

        {/* ====================================================
            FLOATING ADD BUTTON
        ==================================================== */}

        <Pressable
          onPress={
            openNewAssignment
          }
          style={({ pressed }) => [
            styles.floatingButton,
            pressed &&
              styles.floatingButtonPressed,
          ]}
        >
          <Text
            style={
              styles.floatingButtonText
            }
          >
            +
          </Text>
        </Pressable>

        {/* ====================================================
            THREE-DOT MENU MODAL
        ==================================================== */}

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
                Assignment Options
              </Text>

              {menuAssignment && (
                <Text
                  numberOfLines={1}
                  style={
                    styles.menuAssignmentTitle
                  }
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
                  style={
                    styles.menuItemIcon
                  }
                >
                  <Text
                    style={
                      styles.menuItemIconText
                    }
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
                    style={
                      styles.menuItemTitle
                    }
                  >
                    Edit Assignment
                  </Text>

                  <Text
                    style={
                      styles.menuItemSubtitle
                    }
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
                        style={
                          styles.menuItemTitle
                        }
                      >
                        Mark as Done
                      </Text>

                      <Text
                        style={
                          styles.menuItemSubtitle
                        }
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
                    style={
                      styles.menuItemSubtitle
                    }
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
                style={
                  styles.menuCancelButton
                }
              >
                <Text
                  style={
                    styles.menuCancelText
                  }
                >
                  Cancel
                </Text>
              </Pressable>

            </Pressable>

          </Pressable>

        </Modal>

        {/* ====================================================
            ADD / EDIT FORM
        ==================================================== */}

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
              style={
                styles.modalCard
              }
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
                      style={
                        styles.modalTitle
                      }
                    >
                      {editingAssignment
                        ? 'Edit Assignment'
                        : 'New Assignment'}
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
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
                    style={
                      styles.closeButton
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

                {/* TITLE */}

                <Text
                  style={
                    styles.inputLabel
                  }
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
                  style={
                    styles.input
                  }
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
                      style={
                        styles.inputLabel
                      }
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
                        styles.inputLabel
                      }
                    >
                      Due Date
                    </Text>

                    <Pressable
                      onPress={
                        openDatePicker
                      }
                      style={
                        styles.dateInput
                      }
                    >

                      <Text
                        style={[
                          styles.dateInputText,
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
                  style={
                    styles.inputLabel
                  }
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
                          priority ===
                            item &&
                            styles.priorityButtonActive,
                        ]}
                      >

                        <Text
                          style={[
                            styles.priorityText,
                            priority ===
                              item &&
                              styles.priorityTextActive,
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
                  style={
                    styles.inputLabel
                  }
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
                    style={
                      styles.cancelButton
                    }
                  >
                    <Text
                      style={
                        styles.cancelText
                      }
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
                      !title.trim() &&
                        styles.addButtonDisabled,
                    ]}
                  >
                    <Text
                      style={
                        styles.addButtonText
                      }
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

        {/* ====================================================
            CALENDAR MODAL
        ==================================================== */}

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
              style={
                styles.datePickerCard
              }
            >

              <View
                style={
                  styles.datePickerHandle
                }
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
                    style={
                      styles.datePickerTitle
                    }
                  >
                    {formVisible
                      ? 'Select Due Date'
                      : 'Browse by Date'}
                  </Text>

                  <Text
                    style={
                      styles.datePickerSubtitle
                    }
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
                  style={
                    styles.closeButton
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
                  style={
                    styles.monthArrow
                  }
                >
                  <Text
                    style={
                      styles.monthArrowText
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
                  style={
                    styles.monthArrow
                  }
                >
                  <Text
                    style={
                      styles.monthArrowText
                    }
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
                      style={
                        styles.weekdayText
                      }
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
                            isSelected &&
                              styles.calendarDayTextSelected,
                            isToday &&
                              !isSelected &&
                              styles.calendarTodayText,
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
                style={
                  styles.selectedDateBox
                }
              >

                <View
                  style={
                    styles.selectedDateIcon
                  }
                >
                  <Text
                    style={
                      styles.selectedDateIconText
                    }
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
                    style={
                      styles.selectedDateLabel
                    }
                  >
                    Selected date
                  </Text>

                  <Text
                    style={
                      styles.selectedDateText
                    }
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
                  style={
                    styles.clearDateButton
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterCard,
        active &&
          styles.filterCardActive,
        pressed &&
          styles.pressed,
      ]}
    >

      <View
        style={[
          styles.filterIcon,
          active &&
            styles.filterIconActive,
        ]}
      >
        <Text
          style={[
            styles.filterIconText,
            active &&
              styles.filterIconTextActive,
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
            active &&
              styles.filterLabelActive,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.filterCount,
            active &&
              styles.filterCountActive,
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              active &&
                styles.filterCountTextActive,
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
  const priorityStyle =
    assignment.priority ===
    'High'
      ? styles.highPriority
      : assignment.priority ===
        'Low'
      ? styles.lowPriority
      : styles.mediumPriority;

  return (
    <View
      style={
        styles.assignmentCard
      }
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
              ]}
            >
              <Text
                style={
                  styles.priorityBadgeText
                }
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
              style={
                styles.detailIcon
              }
            >
              □
            </Text>

            <Text
              style={
                styles.detailText
              }
            >
              {assignment.dueDate
                ? displayDate(
                    assignment.dueDate
                  )
                : 'No due date'}
            </Text>

            <Text
              style={
                styles.detailSeparator
              }
            >
              •
            </Text>

            <Text
              style={
                styles.detailText
              }
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
                style={
                  styles.detailIcon
                }
              >
                ≡
              </Text>

              <Text
                style={
                  styles.notesText
                }
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
        style={
          styles.cardBottomRow
        }
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
          ]}
        >
          <Text
            style={
              styles.statusText
            }
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
                  style={
                    styles.startButton
                  }
                >
                  <Text
                    style={
                      styles.startIcon
                    }
                  >
                    ▶
                  </Text>

                  <Text
                    style={
                      styles.startText
                    }
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
            style={
              styles.moreButton
            }
          >
            <Text
              style={
                styles.moreText
              }
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

  screen: {
    flex: 1,
  },

  pressed: {
    opacity: 0.7,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
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

  iconButtonActive: {
    backgroundColor: '#CDEFFF',
  },

  backIcon: {
    fontSize: 34,
    lineHeight: 36,
    color: '#318AB8',
    marginTop: -3,
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

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#7C8790',
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

  searchIcon: {
    fontSize: 21,
    color: '#7D8991',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#111827',
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

  dateModeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5E9BB8',
    letterSpacing: 1,
  },

  dateModeText: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '800',
    color: '#247DA7',
  },

  clearDateModeButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  clearDateModeButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#318AB8',
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

  filterCardActive: {
    backgroundColor: '#DDF3FF',
    borderColor: '#A8DDF2',
  },

  filterIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterIconActive: {
    backgroundColor: '#FFFFFF',
  },

  filterIconText: {
    fontSize: 21,
    color: '#7B858D',
  },

  filterIconTextActive: {
    color: '#3498C6',
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

  filterLabelActive: {
    color: '#267FA9',
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

  filterCountActive: {
    backgroundColor: '#FFFFFF',
  },

  filterCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#69747C',
  },

  filterCountTextActive: {
    color: '#318AB8',
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

  sectionCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#318AB8',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#8A949C',
  },

  addTopButton: {
    backgroundColor: '#BDE7F8',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 18,
    marginLeft: 10,
  },

  addTopButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#257DA7',
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

  emptyIconText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#63B8DC',
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17202A',
  },

  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#8A949C',
  },

  emptyButton: {
    marginTop: 19,
    backgroundColor: '#BDE7F8',
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 19,
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#257DA7',
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

  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#555B61',
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

  detailText: {
    fontSize: 12,
    color: '#727D85',
  },

  detailSeparator: {
    marginHorizontal: 6,
    color: '#B0B7BC',
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

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F3',
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

  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C666D',
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

  startIcon: {
    fontSize: 9,
    color: '#348BC0',
    marginRight: 5,
  },

  startText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#348BC0',
  },

  moreButton: {
    width: 36,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F2F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreText: {
    fontSize: 13,
    letterSpacing: 1,
    color: '#66727A',
    marginTop: -5,
  },

  /* ============================================================
     THREE DOT MENU
  ============================================================ */

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

  menuTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17202A',
    paddingHorizontal: 4,
  },

  menuAssignmentTitle: {
    fontSize: 12,
    color: '#89939A',
    marginTop: 4,
    marginBottom: 9,
    paddingHorizontal: 4,
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

  menuItemIconText: {
    fontSize: 20,
    color: '#318AB8',
  },

  doneMenuIcon: {
    backgroundColor: '#DDF8E2',
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

  menuItemSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    color: '#929BA1',
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

  menuCancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#657078',
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

  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8A949C',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 25,
    lineHeight: 27,
    color: '#68737B',
    fontWeight: '300',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5D666D',
    marginBottom: 7,
    marginTop: 12,
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

  dateInputText: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
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

  priorityButtonActive: {
    backgroundColor: '#DDF3FF',
    borderColor: '#8DD1ED',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B737A',
  },

  priorityTextActive: {
    color: '#2584AF',
    fontWeight: '800',
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

  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B737A',
  },

  addButton: {
    flex: 1.3,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#BDE7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonDisabled: {
    backgroundColor: '#E8EDF0',
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#257DA7',
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

  datePickerHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C9CED2',
    alignSelf: 'center',
    marginBottom: 17,
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

  datePickerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#8A949C',
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

  monthArrowText: {
    fontSize: 28,
    lineHeight: 30,
    color: '#318AB8',
  },

  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17202A',
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

  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  calendarTodayText: {
    color: '#318AB8',
    fontWeight: '800',
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

  selectedDateIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DDF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDateIconText: {
    fontSize: 19,
    color: '#318AB8',
  },

  selectedDateInfo: {
    marginLeft: 11,
  },

  selectedDateLabel: {
    fontSize: 10,
    color: '#87929A',
    fontWeight: '600',
  },

  selectedDateText: {
    marginTop: 2,
    fontSize: 14,
    color: '#1C2932',
    fontWeight: '800',
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

  clearDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#69747C',
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

  confirmDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});