import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from './AppHeader';
import TaskCard from './TaskCard';
import NewStudyNoteModal from './NewStudyNoteModal';
import { useTheme } from '../context/ThemeContext';
import {
  getStudyNotes,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
} from '../services/studyService';

// How long to wait after the user stops typing before writing to SQLite.
// Keeps typing responsive without hitting the DB on every keystroke.
const DEBOUNCE_MS = 600;

// SQLite's CURRENT_TIMESTAMP looks like "2026-09-23 10:15:00" (UTC, no "Z").
// Parse that safely and format it the way the UI expects.
function formatDbDate(createdAt) {
  if (!createdAt) return '';
  const iso = createdAt.includes('T') ? createdAt : createdAt.replace(' ', 'T') + 'Z';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return createdAt;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Maps a raw study_notes row (DB column names) to the shape the UI uses.
function mapRowToNote(row) {
  return {
    id: row.id,
    topic: row.topic,
    date: formatDbDate(row.created_at),
    steps: {
      explainIt: row.step_1_explanation || '',
      simplifyIt: row.step_2_simplify || '',
      findAnalogy: row.step_3_analogy || '',
      spotGaps: row.step_4_gaps || '',
      reviewRefine: row.step_5_refined_understanding || '',
    },
  };
}

export default function FeynmanScreen({ onBack }) {
  const { colors } = useTheme();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const debounceTimers = useRef({});

  // Load existing notes from SQLite on mount.
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const rows = await getStudyNotes();
        if (isMounted) setNotes(rows.map(mapRowToNote));
      } catch (err) {
        console.error('Failed to load study notes:', err);
        Alert.alert(
          "Couldn't load your notes",
          'Something went wrong reading from the database.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Clear any pending debounced writes if the screen unmounts mid-typing.
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const persistNote = useCallback((note) => {
    updateStudyNote(
      note.id,
      note.topic,
      note.steps.explainIt,
      note.steps.simplifyIt,
      note.steps.findAnalogy,
      note.steps.spotGaps,
      note.steps.reviewRefine
    ).catch((err) => console.error('Failed to save study note:', err));
  }, []);

  const handleCreateNote = async (topic) => {
    try {
      const newId = await createStudyNote(topic);
      const newNote = {
        id: newId,
        topic,
        date: formatDbDate(new Date().toISOString().slice(0, 19).replace('T', ' ')),
        steps: {
          explainIt: '',
          simplifyIt: '',
          findAnalogy: '',
          spotGaps: '',
          reviewRefine: '',
        },
      };
      setNotes((prev) => [newNote, ...prev]);
      setExpandedId(newId); // open the new note right away so it's ready to fill in
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to create study note:', err);
      Alert.alert("Couldn't create note", 'Please try again.');
    }
  };

  const handleToggle = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleChangeStep = (noteId, stepKey, text) => {
    setNotes((prev) => {
      const updated = prev.map((note) =>
        note.id === noteId
          ? { ...note, steps: { ...note.steps, [stepKey]: text } }
          : note
      );

      // Debounce the DB write per note so rapid typing doesn't hammer SQLite.
      const changedNote = updated.find((n) => n.id === noteId);
      if (changedNote) {
        clearTimeout(debounceTimers.current[noteId]);
        debounceTimers.current[noteId] = setTimeout(() => {
          persistNote(changedNote);
        }, DEBOUNCE_MS);
      }

      return updated;
    });
  };

  const handleDeleteNote = (id) => {
    Alert.alert(
      'Delete study note?',
      'This permanently removes this note and everything in it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              clearTimeout(debounceTimers.current[id]);
              await deleteStudyNote(id);
              setNotes((prev) => prev.filter((note) => note.id !== id));
              setExpandedId((current) => (current === id ? null : current));
            } catch (err) {
              console.error('Failed to delete study note:', err);
              Alert.alert("Couldn't delete note", 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const noteCountLabel = `${notes.length} ${notes.length === 1 ? 'Note' : 'Notes'}`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        {onBack && (
          <TouchableOpacity
            style={styles.backRow}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color={colors.subtext} />
            <Text style={[styles.backText, { color: colors.subtext }]}>Back</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.pageTitle, { color: colors.text }]}>Feynman</Text>

        <View style={styles.subHeaderRow}>
          <Text style={[styles.noteCount, { color: colors.subtext }]}>
            {noteCountLabel}
          </Text>
          <TouchableOpacity
            style={[styles.newNoteButton, { backgroundColor: colors.secondaryButtonBg }]}
            activeOpacity={0.85}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={colors.secondaryButtonText} />
            <Text style={[styles.newNoteButtonText, { color: colors.secondaryButtonText }]}>
              New Study Note
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="small" color={colors.subtext} />
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.mutedText }]}>
              No study notes yet. Tap "New Study Note" to start your first one.
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <TaskCard
              key={note.id}
              note={note}
              expanded={expandedId === note.id}
              onToggle={() => handleToggle(note.id)}
              onChangeStep={(stepKey, text) =>
                handleChangeStep(note.id, stepKey, text)
              }
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        )}
      </ScrollView>

      <NewStudyNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateNote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 60,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backText: {
    fontSize: 13,
    marginLeft: 2,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 20,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  noteCount: {
    fontSize: 13,
  },
  newNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  newNoteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  loadingState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
});
