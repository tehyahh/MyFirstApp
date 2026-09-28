import { getDb } from '../../database/db';

export type LeisureData = {
  id: string;
  activity: string;
  duration: number;
  date: string;
  mood: 'Great' | 'Good' | 'Okay' | 'Low';
  notes: string;
  isFavorite: boolean;
};

export async function createLeisure(leisure: LeisureData) {
  const db = await getDb();

  const result = await db.runAsync(
    `
      INSERT INTO tasks (
        title,
        category,
        due_date,
        duration_minutes,
        notes
      )
      VALUES (?, 'leisure', ?, ?, ?)
    `,
    [
      leisure.activity,
      leisure.date,
      leisure.duration,
      `${leisure.mood}|${leisure.notes}|${leisure.isFavorite ? 1 : 0}`,
    ],
  );

  return String(result.lastInsertRowId);
}

export async function getLeisureEntries() {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    due_date: string;
    duration_minutes: number;
    notes: string;
  }>(
    `
      SELECT
        id,
        title,
        due_date,
        duration_minutes,
        notes
      FROM tasks
      WHERE category = 'leisure'
      ORDER BY due_date DESC
    `,
  );

  return rows.map((row) => {
    const parts = (row.notes || '').split('|');

    return {
      id: String(row.id),
      activity: row.title,
      duration: Number(row.duration_minutes || 0),
      date: row.due_date || '',
      mood: (parts[0] || 'Okay') as LeisureData['mood'],
      notes: parts[1] || '',
      isFavorite: parts[2] === '1',
    };
  });
}

export async function getLeisureById(id: string) {
  const db = await getDb();

  const row = await db.getFirstAsync<{
    id: number;
    title: string;
    due_date: string;
    duration_minutes: number;
    notes: string;
  }>(
    `
      SELECT
        id,
        title,
        due_date,
        duration_minutes,
        notes
      FROM tasks
      WHERE id = ?
        AND category = 'leisure'
    `,
    [Number(id)],
  );

  if (!row) return null;

  const parts = (row.notes || '').split('|');

  return {
    id: String(row.id),
    activity: row.title,
    duration: Number(row.duration_minutes || 0),
    date: row.due_date || '',
    mood: (parts[0] || 'Okay') as LeisureData['mood'],
    notes: parts[1] || '',
    isFavorite: parts[2] === '1',
  };
}

export async function updateLeisure(leisure: LeisureData) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        due_date = ?,
        duration_minutes = ?,
        notes = ?
      WHERE id = ?
        AND category = 'leisure'
    `,
    [
      leisure.activity,
      leisure.date,
      leisure.duration,
      `${leisure.mood}|${leisure.notes}|${leisure.isFavorite ? 1 : 0}`,
      Number(leisure.id),
    ],
  );
}

export async function toggleLeisureFavorite(
  id: string,
  isFavorite: boolean,
) {
  const db = await getDb();

  const row = await db.getFirstAsync<{ notes: string }>(
    `
      SELECT notes
      FROM tasks
      WHERE id = ?
        AND category = 'leisure'
    `,
    [Number(id)],
  );

  if (!row) return;

  const parts = (row.notes || '').split('|');
  const mood = parts[0] || 'Okay';
  const notes = parts[1] || '';

  await db.runAsync(
    `
      UPDATE tasks
      SET notes = ?
      WHERE id = ?
        AND category = 'leisure'
    `,
    [`${mood}|${notes}|${isFavorite ? 1 : 0}`, Number(id)],
  );
}

export async function deleteLeisure(id: string) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND category = 'leisure'
    `,
    [Number(id)],
  );
}