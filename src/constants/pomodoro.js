// Preset focus/break combinations shown as cards below the timer.
export const POMODORO_PRESETS = [
  { id: 'classic', label: 'Classic', focus: 25, break: 5 },
  { id: 'deep', label: 'Deep', focus: 50, break: 10 },
  { id: 'short', label: 'Short', focus: 15, break: 3 },
];

export function formatPresetDisplay(preset) {
  return `${preset.focus}m / ${preset.break}m`;
}

// mm:ss display, e.g. 1502 seconds -> "25:02"
export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
