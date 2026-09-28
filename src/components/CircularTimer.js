import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SIZE = 280;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STAR_SIZE = 30;
const INNER_CIRCLE_SIZE = 200;

// progress: 0 (just started) -> 1 (phase complete)
export default function CircularTimer({ progress, timeLabel, phaseLabel }) {
  const { colors } = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const dashOffset = CIRCUMFERENCE * (1 - clampedProgress);

  // Angle starts at the top (-90deg) and sweeps clockwise with progress.
  const angleDeg = -90 + clampedProgress * 360;
  const angleRad = (angleDeg * Math.PI) / 180;
  const starX = CENTER + RADIUS * Math.cos(angleRad) - STAR_SIZE / 2;
  const starY = CENTER + RADIUS * Math.sin(angleRad) - STAR_SIZE / 2;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Background track */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.timerTrack}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.timerProgress}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
      </Svg>

      {/* Center disc with the time */}
      <View style={[styles.centerDisc, { backgroundColor: colors.timerCenterBg }]}>
        <Text style={[styles.timeText, { color: colors.text }]}>{timeLabel}</Text>
        <Text style={[styles.phaseText, { color: colors.mutedText }]}>{phaseLabel}</Text>
      </View>

      {/* Star badge marking current progress position on the ring */}
      <View style={[styles.starBadge, { left: starX, top: starY }]}>
        <Ionicons name="star" size={15} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  centerDisc: {
    position: 'absolute',
    width: INNER_CIRCLE_SIZE,
    height: INNER_CIRCLE_SIZE,
    borderRadius: INNER_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  timeText: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1,
  },
  phaseText: {
    fontSize: 13,
    marginTop: 4,
  },
  starBadge: {
    position: 'absolute',
    width: STAR_SIZE,
    height: STAR_SIZE,
    borderRadius: STAR_SIZE / 2,
    backgroundColor: '#F5C542',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
