import * as SQLite from 'expo-sqlite';

export type Profile = {
  id: number;
  nickname: string;
  avatar_url?: string | null;
  theme_color?: 'blue' | 'pink' | 'green' | 'purple' | 'red' | 'yellow';
  nickname_customized?: number;
};

export type Journal = {
  id: number;
  title: string;
  content: string;
  mood: string;
  entry_date: string;
  bg_theme: string;
  photo_uri?: string | null;
  is_favorite?: number;
  created_at?: string;
};

export type Task = {
  id: number;
  title: string;
  category: 'assignment' | 'goal' | 'leisure';
  subject?: string | null;
  due_date?: string | null;
  priority?: 'Low' | 'Medium' | 'High' | null;
  status: 'todo' | 'in_progress' | 'completed';
  progress: number;
  duration_minutes?: number | null;
  notes?: string | null;
};

export type StudyNote = {
  id: number;
  topic: string;
  step_1_explanation?: string | null;
  step_2_simplify?: string | null;
  step_3_analogy?: string | null;
  step_4_gaps?: string | null;
  step_5_refined_understanding?: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('thrive.db');
  }
  return dbPromise;
};

export function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await getDb();

    // Keep the setup in ONE initialization promise. The previous version
    // could open/initialize the same Android database several times at once,
    // which is what was triggering the NativeDatabase.execAsync NPE.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        nickname TEXT NOT NULL,
        avatar_url TEXT,
        theme_color TEXT DEFAULT 'pink',
        nickname_customized INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        entry_date TEXT,
        bg_theme TEXT,
        photo_uri TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT CHECK (category IN ('assignment','goal','leisure')) NOT NULL,
        subject TEXT,
        due_date TEXT,
        priority TEXT CHECK (priority IN ('Low','Medium','High')),
        status TEXT CHECK (status IN ('todo','in_progress','completed')) DEFAULT 'todo',
        progress INTEGER DEFAULT 0,
        duration_minutes INTEGER,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS study_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        step_1_explanation TEXT,
        step_2_simplify TEXT,
        step_3_analogy TEXT,
        step_4_gaps TEXT,
        step_5_refined_understanding TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journal_reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL UNIQUE,
        mood TEXT,
        mind_message TEXT,
        went_well TEXT,
        difficult TEXT,
        learned TEXT,
        proud TEXT,
        tomorrow_intention TEXT,
        helped TEXT,
        photo_uri TEXT,
        related_area TEXT,
        tags TEXT,
        reminder_enabled INTEGER DEFAULT 0,
        reminder_date TEXT,
        reminder_time TEXT,
        is_saved INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Safe migrations for databases created by older Thrive versions.
    for (const sql of [
      `ALTER TABLE profile ADD COLUMN theme_color TEXT DEFAULT 'pink';`,
      `ALTER TABLE profile ADD COLUMN nickname_customized INTEGER DEFAULT 0;`,
      `ALTER TABLE journals ADD COLUMN bg_theme TEXT;`,
      `ALTER TABLE journals ADD COLUMN photo_uri TEXT;`,
      `ALTER TABLE journals ADD COLUMN is_favorite INTEGER DEFAULT 0;`,
      `ALTER TABLE journal_reflections ADD COLUMN mind_message TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN went_well TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN difficult TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN learned TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN proud TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN tomorrow_intention TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN helped TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN photo_uri TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN related_area TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN tags TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN reminder_enabled INTEGER DEFAULT 0;`,
      `ALTER TABLE journal_reflections ADD COLUMN reminder_date TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN reminder_time TEXT;`,
      `ALTER TABLE journal_reflections ADD COLUMN is_saved INTEGER DEFAULT 0;`,
      `ALTER TABLE journal_reflections ADD COLUMN updated_at TEXT;`,
    ]) {
      try {
        await db.execAsync(sql);
      } catch {
        // Existing columns are expected on later launches.
      }
    }

    try {
      await db.runAsync(`UPDATE journals SET is_favorite = 0 WHERE is_favorite IS NULL`);
    } catch {}

    const profile = await db.getFirstAsync<Profile>(`SELECT * FROM profile WHERE id = 1`);

    if (!profile) {
      await db.runAsync(
        `INSERT INTO profile (id, nickname, theme_color, nickname_customized)
         VALUES (1, ?, ?, 0)`,
        ['Teya', 'pink']
      );
    } else if (
      Number(profile.nickname_customized || 0) === 0 &&
      String(profile.nickname || '').trim().toLowerCase() === 'ally'
    ) {
      await db.runAsync(`UPDATE profile SET nickname = 'Teya' WHERE id = 1`);
    }

    return db;
  })().catch(error => {
    // Allow a future retry instead of permanently caching a rejected promise.
    initPromise = null;
    throw error;
  });

  return initPromise;
}

export async function getProfile() {
  const db = await initializeDatabase();
  return db.getFirstAsync<Profile>(`SELECT * FROM profile WHERE id = 1`);
}

export async function saveProfileNickname(nickname: string) {
  const db = await initializeDatabase();
  const clean = nickname.trim();
  await db.runAsync(
    `UPDATE profile SET nickname = ?, nickname_customized = 1 WHERE id = 1`,
    [clean || 'Teya']
  );
}

export async function saveProfileTheme(theme: 'blue' | 'pink' | 'green' | 'purple' | 'red' | 'yellow') {
  const db = await initializeDatabase();
  await db.runAsync(`UPDATE profile SET theme_color = ? WHERE id = 1`, [theme]);
}

export async function getJournals() {
  const db = await initializeDatabase();
  return db.getAllAsync<Journal>(
    `SELECT * FROM journals ORDER BY id DESC`
  );
}

export async function getJournal(id: number) {
  const db = await initializeDatabase();
  return db.getFirstAsync<Journal>(
    `SELECT * FROM journals WHERE id = ?`,
    [id]
  );
}

export async function createJournal(input: {
  title: string;
  content: string;
  mood: string;
  entry_date: string;
  bg_theme: string;
  photo_uri?: string | null;
  is_favorite?: number;
}) {
  const db = await initializeDatabase();
  const result = await db.runAsync(
    `INSERT INTO journals
      (title, content, mood, entry_date, bg_theme, photo_uri, is_favorite)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.content,
      input.mood,
      input.entry_date,
      input.bg_theme,
      input.photo_uri || null,
      Number(input.is_favorite || 0),
    ]
  );
  return result.lastInsertRowId;
}

export async function updateJournal(
  id: number,
  input: Partial<Omit<Journal, 'id' | 'created_at'>>
) {
  const db = await initializeDatabase();
  await db.runAsync(
    `UPDATE journals
     SET title = COALESCE(?, title),
         content = COALESCE(?, content),
         mood = COALESCE(?, mood),
         entry_date = COALESCE(?, entry_date),
         bg_theme = COALESCE(?, bg_theme),
         photo_uri = COALESCE(?, photo_uri),
         is_favorite = COALESCE(?, is_favorite)
     WHERE id = ?`,
    [
      input.title ?? null,
      input.content ?? null,
      input.mood ?? null,
      input.entry_date ?? null,
      input.bg_theme ?? null,
      input.photo_uri ?? null,
      input.is_favorite ?? null,
      id,
    ]
  );
}

export async function toggleJournalFavorite(id: number, favorite?: boolean) {
  const db = await initializeDatabase();

  if (typeof favorite === 'boolean') {
    await db.runAsync(
      `UPDATE journals SET is_favorite = ? WHERE id = ?`,
      [favorite ? 1 : 0, id]
    );
    return favorite ? 1 : 0;
  }

  await db.runAsync(
    `UPDATE journals
     SET is_favorite = CASE WHEN COALESCE(is_favorite, 0) = 1 THEN 0 ELSE 1 END
     WHERE id = ?`,
    [id]
  );

  const row = await db.getFirstAsync<{ is_favorite: number }>(
    `SELECT is_favorite FROM journals WHERE id = ?`,
    [id]
  );

  return Number(row?.is_favorite || 0);
}

export async function getFavoriteJournals() {
  const db = await initializeDatabase();
  return db.getAllAsync<Journal>(
    `SELECT * FROM journals WHERE COALESCE(is_favorite, 0) = 1 ORDER BY id DESC`
  );
}

export async function deleteJournal(id: number) {
  const db = await initializeDatabase();
  await db.runAsync(`DELETE FROM journals WHERE id = ?`, [id]);
}

export async function getTasks() {
  const db = await initializeDatabase();
  return db.getAllAsync<Task>(`SELECT * FROM tasks ORDER BY id DESC`);
}

export async function createTask(input: {
  title: string;
  category: 'assignment' | 'goal' | 'leisure';
  subject?: string;
  due_date?: string;
  priority?: 'Low' | 'Medium' | 'High';
  duration_minutes?: number;
  notes?: string;
}) {
  const db = await initializeDatabase();
  const result = await db.runAsync(
    `INSERT INTO tasks
      (title, category, subject, due_date, priority, status, progress, duration_minutes, notes)
     VALUES (?, ?, ?, ?, ?, 'todo', 0, ?, ?)`,
    [
      input.title,
      input.category,
      input.subject || null,
      input.due_date || null,
      input.priority || 'Medium',
      input.duration_minutes || 0,
      input.notes || null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateTask(id: number, patch: Partial<Task>) {
  const db = await initializeDatabase();
  await db.runAsync(
    `UPDATE tasks
     SET title = COALESCE(?, title),
         status = COALESCE(?, status),
         progress = COALESCE(?, progress),
         priority = COALESCE(?, priority),
         due_date = COALESCE(?, due_date),
         notes = COALESCE(?, notes)
     WHERE id = ?`,
    [
      patch.title ?? null,
      patch.status ?? null,
      patch.progress ?? null,
      patch.priority ?? null,
      patch.due_date ?? null,
      patch.notes ?? null,
      id,
    ]
  );
}

export async function deleteTask(id: number) {
  const db = await initializeDatabase();
  await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
}

export async function getStudyNotes() {
  const db = await initializeDatabase();
  return db.getAllAsync<StudyNote>(
    `SELECT * FROM study_notes ORDER BY id DESC`
  );
}

export async function createStudyNote(topic: string) {
  const db = await initializeDatabase();
  const result = await db.runAsync(
    `INSERT INTO study_notes (topic) VALUES (?)`,
    [topic]
  );
  return result.lastInsertRowId;
}

export async function updateStudyNote(id: number, patch: Partial<StudyNote>) {
  const db = await initializeDatabase();
  await db.runAsync(
    `UPDATE study_notes
     SET step_1_explanation = COALESCE(?, step_1_explanation),
         step_2_simplify = COALESCE(?, step_2_simplify),
         step_3_analogy = COALESCE(?, step_3_analogy),
         step_4_gaps = COALESCE(?, step_4_gaps),
         step_5_refined_understanding = COALESCE(?, step_5_refined_understanding)
     WHERE id = ?`,
    [
      patch.step_1_explanation ?? null,
      patch.step_2_simplify ?? null,
      patch.step_3_analogy ?? null,
      patch.step_4_gaps ?? null,
      patch.step_5_refined_understanding ?? null,
      id,
    ]
  );
}
