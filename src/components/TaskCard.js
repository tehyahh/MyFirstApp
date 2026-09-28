import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FEYNMAN_STEPS } from '../constants/feynmanSteps';
import { useTheme } from '../context/ThemeContext';

// A single study note. Collapsed: a pill with the topic + date.
// Expanded: the same pill on top, followed by the 5 Feynman step inputs.
export default function TaskCard({ note, expanded, onToggle, onChangeStep, onDelete }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        expanded && [
          styles.wrapperExpanded,
          { backgroundColor: colors.expandedCardBg },
        ],
      ]}
    >
      <TouchableOpacity
        style={[styles.pill, { backgroundColor: colors.pillBg }]}
        activeOpacity={0.85}
        onPress={onToggle}
      >
        <View style={styles.pillLeft}>
          <View style={[styles.iconCircle, { backgroundColor: colors.pillIconCircleBg }]}>
            <Ionicons name="bulb" size={20} color="#E8B923" />
          </View>
          <View style={styles.pillTextBlock}>
            <Text
              style={[styles.pillTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {note.topic}
            </Text>
            <Text style={[styles.pillSubtitle, { color: colors.subtext }]}>
              {note.date}
            </Text>
          </View>
        </View>

        <View style={styles.pillRight}>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={17} color={colors.mutedText} />
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.stepsContainer}>
          {FEYNMAN_STEPS.map((step, index) => (
            <View
              key={step.key}
              style={[
                styles.stepBlock,
                index === FEYNMAN_STEPS.length - 1 && styles.stepBlockLast,
              ]}
            >
              <View style={styles.stepHeaderRow}>
                <View style={[styles.stepNumber, { backgroundColor: colors.stepNumberBg }]}>
                  <Text style={[styles.stepNumberText, { color: colors.stepNumberText }]}>
                    {index + 1}
                  </Text>
                </View>
                <Ionicons
                  name={step.icon}
                  size={16}
                  color={colors.text}
                  style={styles.stepIcon}
                />
                <Text style={[styles.stepTitle, { color: colors.text }]}>
                  {step.title}
                </Text>
              </View>
              <Text style={[styles.stepDescription, { color: colors.mutedText }]}>
                {step.description}
              </Text>
              <TextInput
                style={[
                  styles.stepInput,
                  {
                    borderColor: colors.border,
                    color: colors.inputText,
                    backgroundColor: colors.inputBg,
                  },
                ]}
                placeholder={step.placeholder}
                placeholderTextColor={colors.placeholder}
                multiline
                value={note.steps[step.key]}
                onChangeText={(text) => onChangeStep(step.key, text)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  wrapperExpanded: {
    borderRadius: 28,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  pill: {
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
  },
  pillTextBlock: {
    flexShrink: 1,
  },
  pillRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginRight: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pillSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  stepsContainer: {
    marginTop: 14,
    paddingHorizontal: 8,
  },
  stepBlock: {
    marginBottom: 18,
  },
  stepBlockLast: {
    marginBottom: 4,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepIcon: {
    marginRight: 6,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepDescription: {
    fontSize: 12.5,
    marginLeft: 30,
    marginBottom: 8,
    lineHeight: 17,
  },
  stepInput: {
    marginLeft: 30,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 64,
    fontSize: 13.5,
    textAlignVertical: 'top',
  },
});
