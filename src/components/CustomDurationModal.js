import React, { useEffect, useState } from 'react';
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

const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

function clamp(value) {
  if (Number.isNaN(value)) return MIN_MINUTES;
  return Math.min(Math.max(value, MIN_MINUTES), MAX_MINUTES);
}

function StepperField({ icon, label, value, onChange, colors }) {
  const handleTextChange = (text) => {
    if (text === '') {
      onChange('');
      return;
    }
    const numeric = parseInt(text.replace(/[^0-9]/g, ''), 10);
    onChange(Number.isNaN(numeric) ? '' : numeric);
  };

  const handleBlur = () => {
    onChange(clamp(typeof value === 'number' ? value : parseInt(value, 10) || MIN_MINUTES));
  };

  const increment = () => onChange(clamp((typeof value === 'number' ? value : MIN_MINUTES) + 1));
  const decrement = () => onChange(clamp((typeof value === 'number' ? value : MIN_MINUTES) - 1));

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon} size={15} color={colors.subtext} style={{ marginRight: 6 }} />
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.inputText, backgroundColor: colors.inputBg }]}
          value={String(value)}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          keyboardType="number-pad"
          maxLength={3}
        />
        <View style={[styles.stepperColumn, { borderLeftColor: colors.border }]}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={increment}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-up" size={14} color={colors.subtext} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={decrement}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-down" size={14} color={colors.subtext} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CustomDurationModal({
  visible,
  initialFocus,
  initialBreak,
  onClose,
  onApply,
}) {
  const { colors } = useTheme();
  const [focusMinutes, setFocusMinutes] = useState(initialFocus);
  const [breakMinutes, setBreakMinutes] = useState(initialBreak);

  // Reset the fields to the current session values every time the modal opens
  useEffect(() => {
    if (visible) {
      setFocusMinutes(initialFocus);
      setBreakMinutes(initialBreak);
    }
  }, [visible, initialFocus, initialBreak]);

  const handleApply = () => {
    const finalFocus = clamp(typeof focusMinutes === 'number' ? focusMinutes : parseInt(focusMinutes, 10) || MIN_MINUTES);
    const finalBreak = clamp(typeof breakMinutes === 'number' ? breakMinutes : parseInt(breakMinutes, 10) || MIN_MINUTES);
    onApply(finalFocus, finalBreak);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={[styles.card, { backgroundColor: colors.modalBg }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>Custom Duration</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.iconButtonBg }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <StepperField
            icon="time-outline"
            label="Focus (min)"
            value={focusMinutes}
            onChange={setFocusMinutes}
            colors={colors}
          />
          <StepperField
            icon="cafe-outline"
            label="Break (min)"
            value={breakMinutes}
            onChange={setBreakMinutes}
            colors={colors}
          />

          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.applyButtonBg }]}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
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
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  stepperColumn: {
    borderLeftWidth: 1,
    justifyContent: 'center',
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButton: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
