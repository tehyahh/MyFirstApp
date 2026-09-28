import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { getDb, initializeDatabase } from '../../database/db';
import DashboardScreen from './DashboardScreen';

type WeeklyDay = { label: string; pct: number | null };

export default function DashboardRoute() {
  const [nickname, setNickname] = useState('Ally');
  const [aimScore, setAimScore] = useState(88);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [activeGoals, setActiveGoals] = useState(0);
  const [minutesToday, setMinutesToday] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(true);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeeklyDay[]>([
    { label: 'Mon', pct: null }, { label: 'Tue', pct: null },
    { label: 'Wed', pct: null }, { label: 'Thu', pct: null },
    { label: 'Fri', pct: null }, { label: 'Sat', pct: null },
    { label: 'Sun', pct: null },
  ]);

  const load = useCallback(async () => {
    await initializeDatabase();
    const db = await getDb();

    const profile = await db.getFirstAsync<any>('SELECT * FROM profile WHERE id = 1;');
    const journals = await db.getAllAsync<any>('SELECT id FROM journals;');
    const tasks = await db.getAllAsync<any>('SELECT status, progress, duration_minutes FROM tasks;');

    if (profile?.nickname) setNickname(profile.nickname);
    setJournalCount(journals.length);

    const completed = tasks.filter((t: any) => t.status === 'completed').length;
    const total = tasks.length;
    setWeeklyCompleted(completed);
    setWeeklyTotal(total);
    setAimScore(total ? Math.round((completed / total) * 100) : 88);
    setActiveGoals(tasks.filter((t: any) => t.status !== 'completed').length);
    setMinutesToday(tasks.reduce((sum: number, t: any) => sum + Number(t.duration_minutes || 0), 0));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <DashboardScreen
      nickname={nickname}
      aimScore={aimScore}
      weeklyCompleted={weeklyCompleted}
      weeklyTotal={weeklyTotal}
      journalCount={journalCount}
      activeGoals={activeGoals}
      minutesToday={minutesToday}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      onDashboard={() => router.replace('/')}
      onJournal={() => router.push('/journal/JournalScreen')}
      onTaskManager={() => {}}
      onStudyTechnique={() => {}}
      onProfile={() => {}}
      onSearch={() => {}}
      weeklyBreakdown={weeklyBreakdown}
      isWeeklyOpen={isWeeklyOpen}
      onToggleWeekly={() => setIsWeeklyOpen(v => !v)}
    />
  );
}
