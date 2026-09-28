import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function NewStudyNoteModal({ visible, onClose, onCreate }) {
  const { colors } = useTheme();
  const [topic, setTopic] = useState('');

  const handleClose = () => {
    setTopic('');
    onClose();
  };

  const handleCreate = () => {
    const trimmed = topic.trim();
    if (!trimmed) return; // require a topic before creating the note
    onCreate(trimmed);
    setTopic('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Tapping the dimmed backdrop closes the modal */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={[styles.card, { backgroundColor: colors.modalBg }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>New Study Note</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.iconButtonBg }]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            What topic are you learning?
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.inputText,
                backgroundColor: colors.inputBg,
              },
            ]}
            placeholder="e.g. Photosynthesis, the French Revolution, recursion"
            placeholderTextColor={colors.placeholder}
            value={topic}
            onChangeText={setTopic}
            autoFocus
          />
          <Text style={[styles.helperText, { color: colors.mutedText }]}>
            You'll fill in the five Feynman steps after creating the note.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primaryButtonBg },
                !topic.trim() && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              activeOpacity={0.8}
              disabled={!topic.trim()}
            >
              <Ionicons name="add" size={18} color={colors.primaryButtonText} />
              <Text style={[styles.createButtonText, { color: colors.primaryButtonText }]}>
                Create Note
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createButton: {
    flex: 1.3,
    borderRadius: 30,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});
