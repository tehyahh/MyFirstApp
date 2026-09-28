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

  await db.runAsync(
    `
      INSERT INTO tasks (
        id,
        type,
        title,
        date,
        duration,
        mood,
        notes,
        is_favorite
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      leisure.id,
      'leisure',
      leisure.activity,
      leisure.date,
      leisure.duration,
      leisure.mood,
      leisure.notes,
      leisure.isFavorite ? 1 : 0,
    ],
  );
}

export async function getLeisureEntries() {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    date: string;
    duration: number;
    mood: LeisureData['mood'];
    notes: string;
    is_favorite: number;
  }>(
    `
      SELECT
        id,
        title,
        date,
        duration,
        mood,
        notes,
        is_favorite
      FROM tasks
      WHERE type = 'leisure'
      ORDER BY date DESC
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    activity: row.title,
    duration: row.duration,
    date: row.date,
    mood: row.mood,
    notes: row.notes,
    isFavorite: row.is_favorite === 1,
  }));
}

export async function getLeisureById(id: string) {
  const db = await getDb();

  const row = await db.getFirstAsync<{
    id: string;
    title: string;
    date: string;
    duration: number;
    mood: LeisureData['mood'];
    notes: string;
    is_favorite: number;
  }>(
    `
      SELECT
        id,
        title,
        date,
        duration,
        mood,
        notes,
        is_favorite
      FROM tasks
      WHERE id = ?
        AND type = 'leisure'
    `,
    [id],
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    activity: row.title,
    duration: row.duration,
    date: row.date,
    mood: row.mood,
    notes: row.notes,
    isFavorite: row.is_favorite === 1,
  };
}

export async function updateLeisure(leisure: LeisureData) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        date = ?,
        duration = ?,
        mood = ?,
        notes = ?,
        is_favorite = ?
      WHERE id = ?
        AND type = 'leisure'
    `,
    [
      leisure.activity,
      leisure.date,
      leisure.duration,
      leisure.mood,
      leisure.notes,
      leisure.isFavorite ? 1 : 0,
      leisure.id,
    ],
  );
}

export async function toggleLeisureFavorite(
  id: string,
  isFavorite: boolean,
) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET is_favorite = ?
      WHERE id = ?
        AND type = 'leisure'
    `,
    [isFavorite ? 1 : 0, id],
  );
}

export async function deleteLeisure(id: string) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND type = 'leisure'
    `,
    [id],
  );
}