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

export async function createGoal(goal: GoalData) {
  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO tasks (
        id,
        type,
        title,
        category,
        description,
        date,
        progress,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      goal.id,
      'goal',
      goal.title,
      goal.category,
      goal.description,
      goal.targetDate,
      goal.progress,
      goal.status,
    ],
  );
}

export async function getGoals() {
  const db = await getDb();

  return await db.getAllAsync<GoalData>(
    `
      SELECT
        id,
        title,
        category,
        description,
        date AS targetDate,
        progress,
        status
      FROM tasks
      WHERE type = 'goal'
      ORDER BY date ASC
    `,
  );
}

export async function getGoalById(id: string) {
  const db = await getDb();

  return await db.getFirstAsync<GoalData>(
    `
      SELECT
        id,
        title,
        category,
        description,
        date AS targetDate,
        progress,
        status
      FROM tasks
      WHERE id = ?
        AND type = 'goal'
    `,
    [id],
  );
}

export async function updateGoal(goal: GoalData) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        category = ?,
        description = ?,
        date = ?,
        progress = ?,
        status = ?
      WHERE id = ?
        AND type = 'goal'
    `,
    [
      goal.title,
      goal.category,
      goal.description,
      goal.targetDate,
      goal.progress,
      goal.status,
      goal.id,
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
        AND type = 'goal'
    `,
    [progress, id],
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
        AND type = 'goal'
    `,
    [status, id],
  );
}

export async function deleteGoal(id: string) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND type = 'goal'
    `,
    [id],
  );
}