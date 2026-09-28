import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from './AppHeader';
import CircularTimer from './CircularTimer';
import CustomDurationModal from './CustomDurationModal';
import {
  POMODORO_PRESETS,
  formatPresetDisplay,
  formatTime,
} from '../constants/pomodoro';
import { useTheme } from '../context/ThemeContext';

export default function PomodoroScreen({ onBack }) {
  const { colors } = useTheme();
  const [selectedPresetId, setSelectedPresetId] = useState('classic');
  const [focusMinutes, setFocusMinutes] = useState(POMODORO_PRESETS[0].focus);
  const [breakMinutes, setBreakMinutes] = useState(POMODORO_PRESETS[0].break);

  // phase + secondsLeft live together so a phase transition updates both
  // atomically — no risk of one state lagging behind the other.
  const [timerState, setTimerState] = useState({
    phase: 'focus',
    secondsLeft: focusMinutes * 60,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const intervalRef = useRef(null);
  const { phase, secondsLeft } = timerState;

  const currentPhaseTotalSeconds =
    (phase === 'focus' ? focusMinutes : breakMinutes) * 60;

  // Countdown tick — runs only while isRunning is true, cleans up on pause/unmount.
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        if (prev.secondsLeft <= 1) {
          // Phase complete — switch to the other phase and keep running.
          const nextPhase = prev.phase === 'focus' ? 'break' : 'focus';
          const nextTotal =
            (nextPhase === 'focus' ? focusMinutes : breakMinutes) * 60;
          return { phase: nextPhase, secondsLeft: nextTotal };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, focusMinutes, breakMinutes]);

  const handleSelectPreset = useCallback((preset) => {
    setSelectedPresetId(preset.id);
    setFocusMinutes(preset.focus);
    setBreakMinutes(preset.break);
    setTimerState({ phase: 'focus', secondsLeft: preset.focus * 60 });
    setIsRunning(false);
  }, []);

  const handleApplyCustom = useCallback((customFocus, customBreak) => {
    setSelectedPresetId(null);
    setFocusMinutes(customFocus);
    setBreakMinutes(customBreak);
    setTimerState({ phase: 'focus', secondsLeft: customFocus * 60 });
    setIsRunning(false);
    setModalVisible(false);
  }, []);

  const handlePlayPause = () => setIsRunning((prev) => !prev);

  const handleReset = () => {
    setIsRunning(false);
    setTimerState((prev) => ({ ...prev, secondsLeft: currentPhaseTotalSeconds }));
  };

  const handleSkip = () => {
    setTimerState((prev) => {
      const nextPhase = prev.phase === 'focus' ? 'break' : 'focus';
      const nextTotal =
        (nextPhase === 'focus' ? focusMinutes : breakMinutes) * 60;
      return { phase: nextPhase, secondsLeft: nextTotal };
    });
  };

  const progress =
    currentPhaseTotalSeconds > 0
      ? (currentPhaseTotalSeconds - secondsLeft) / currentPhaseTotalSeconds
      : 0;

  const upNextLabel =
    phase === 'focus'
      ? `${breakMinutes}mins Break`
      : `${focusMinutes}mins Focus`;

  return (
    <LinearGradient
      colors={colors.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.screen}
    >
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

        <View style={styles.titleRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Pomodoro</Text>
          <TouchableOpacity
            style={[styles.customDurationButton, { backgroundColor: colors.secondaryButtonBg }]}
            activeOpacity={0.85}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={colors.secondaryButtonText} />
            <Text style={[styles.customDurationText, { color: colors.secondaryButtonText }]}>
              Custom Duration
            </Text>
          </TouchableOpacity>
        </View>

        <CircularTimer
          progress={progress}
          timeLabel={formatTime(secondsLeft)}
          phaseLabel={phase === 'focus' ? 'Focus' : 'Break'}
        />

        <Text style={[styles.upNextText, { color: colors.subtext }]}>
          Up Next:{' '}
          <Text style={[styles.upNextBold, { color: colors.text }]}>
            {upNextLabel}
          </Text>
        </Text>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              { backgroundColor: colors.sideButtonBg, borderColor: colors.sideButtonBorder },
            ]}
            onPress={handleSkip}
            activeOpacity={0.75}
          >
            <Ionicons name="play-skip-forward" size={20} color="#E8B923" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: colors.playButtonBg }]}
            onPress={handlePlayPause}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={30}
              color="#FFFFFF"
              style={!isRunning ? { marginLeft: 3 } : undefined}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sideButton,
              { backgroundColor: colors.sideButtonBg, borderColor: colors.sideButtonBorder },
            ]}
            onPress={handleReset}
            activeOpacity={0.75}
          >
            <Ionicons name="refresh" size={20} color="#E8B923" />
          </TouchableOpacity>
        </View>

        <View style={styles.presetsRow}>
          {POMODORO_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  { backgroundColor: colors.presetCardBg },
                  isSelected && styles.presetCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectPreset(preset)}
              >
                <Text style={[styles.presetDuration, { color: colors.text }]}>
                  {formatPresetDisplay(preset)}
                </Text>
                <Text style={[styles.presetLabel, { color: colors.presetLabelColor }]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <CustomDurationModal
        visible={modalVisible}
        initialFocus={focusMinutes}
        initialBreak={breakMinutes}
        onClose={() => setModalVisible(false)}
        onApply={handleApplyCustom}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 50,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  customDurationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  customDurationText: {
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  upNextText: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 20,
  },
  upNextBold: {
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 30,
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F2A0BE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  presetCardSelected: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  presetDuration: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
