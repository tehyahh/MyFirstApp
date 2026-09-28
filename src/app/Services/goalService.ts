import { getDb } from '../../database/db';

export type GoalData = {
  id: string;
  title: string;
  category: string;
  description: string;
  targetDate: string;
  progress: number;
  status: 'Active' | 'Paused' | 'Completed';
};

function dbStatus(status: GoalData['status']) {
  if (status === 'Completed') return 'completed';
  if (status === 'Paused') return 'in_progress';
  return 'todo';
}

function appStatus(status: string): GoalData['status'] {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'Paused';
  return 'Active';
}

export async function createGoal(goal: GoalData) {
  const db = await getDb();

  const result = await db.runAsync(
    `
      INSERT INTO tasks (
        title,
        category,
        due_date,
        progress,
        status,
        notes
      )
      VALUES (?, 'goal', ?, ?, ?, ?)
    `,
    [
      goal.title,
      goal.targetDate,
      goal.progress,
      dbStatus(goal.status),
      goal.description,
    ],
  );

  return String(result.lastInsertRowId);
}

export async function getGoals() {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    due_date: string;
    progress: number;
    status: string;
    notes: string;
  }>(
    `
      SELECT
        id,
        title,
        due_date,
        progress,
        status,
        notes
      FROM tasks
      WHERE category = 'goal'
      ORDER BY due_date ASC
    `,
  );

  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    category: 'Goal',
    description: row.notes || '',
    targetDate: row.due_date || '',
    progress: Number(row.progress || 0),
    status: appStatus(row.status),
  }));
}

export async function getGoalById(id: string) {
  const db = await getDb();

  const row = await db.getFirstAsync<{
    id: number;
    title: string;
    due_date: string;
    progress: number;
    status: string;
    notes: string;
  }>(
    `
      SELECT
        id,
        title,
        due_date,
        progress,
        status,
        notes
      FROM tasks
      WHERE id = ?
        AND category = 'goal'
    `,
    [Number(id)],
  );

  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title,
    category: 'Goal',
    description: row.notes || '',
    targetDate: row.due_date || '',
    progress: Number(row.progress || 0),
    status: appStatus(row.status),
  };
}

export async function updateGoal(goal: GoalData) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        due_date = ?,
        progress = ?,
        status = ?,
        notes = ?
      WHERE id = ?
        AND category = 'goal'
    `,
    [
      goal.title,
      goal.targetDate,
      goal.progress,
      dbStatus(goal.status),
      goal.description,
      Number(goal.id),
    ],
  );
}

export async function updateGoalProgress(
  id: string,
  progress: number,
) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET progress = ?
      WHERE id = ?
        AND category = 'goal'
    `,
    [progress, Number(id)],
  );
}

export async function updateGoalStatus(
  id: string,
  status: GoalData['status'],
) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET status = ?
      WHERE id = ?
        AND category = 'goal'
    `,
    [dbStatus(status), Number(id)],
  );
}

export async function deleteGoal(id: string) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND category = 'goal'
    `,
    [Number(id)],
  );
}