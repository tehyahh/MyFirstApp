import { getDb } from '../../database/db';

export type AssignmentData = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
  status: 'Pending' | 'In Progress' | 'Completed';
};

function dbStatus(status: AssignmentData['status']) {
  if (status === 'In Progress') return 'in_progress';
  if (status === 'Completed') return 'completed';
  return 'todo';
}

function appStatus(status: string): AssignmentData['status'] {
  if (status === 'in_progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return 'Pending';
}

export async function createAssignment(
  assignment: AssignmentData
) {
  const db = await getDb();

  const result = await db.runAsync(
    `
      INSERT INTO tasks (
        title,
        category,
        subject,
        due_date,
        priority,
        status,
        progress,
        notes
      )
      VALUES (?, 'assignment', ?, ?, ?, ?, 0, ?)
    `,
    [
      assignment.title,
      assignment.subject,
      assignment.dueDate,
      assignment.priority,
      dbStatus(assignment.status),
      assignment.notes,
    ],
  );

  return String(result.lastInsertRowId);
}

export async function getAssignments() {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id: number;
    title: string;
    subject: string;
    due_date: string;
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
    status: string;
  }>(
    `
      SELECT
        id,
        title,
        subject,
        due_date,
        priority,
        notes,
        status
      FROM tasks
      WHERE category = 'assignment'
      ORDER BY due_date ASC
    `,
  );

  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    subject: row.subject || '',
    dueDate: row.due_date || '',
    priority: row.priority,
    notes: row.notes || '',
    status: appStatus(row.status),
  }));
}

export async function getAssignmentById(id: string) {
  const db = await getDb();

  const row = await db.getFirstAsync<{
    id: number;
    title: string;
    subject: string;
    due_date: string;
    priority: 'Low' | 'Medium' | 'High';
    notes: string;
    status: string;
  }>(
    `
      SELECT
        id,
        title,
        subject,
        due_date,
        priority,
        notes,
        status
      FROM tasks
      WHERE id = ?
        AND category = 'assignment'
    `,
    [Number(id)],
  );

  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title,
    subject: row.subject || '',
    dueDate: row.due_date || '',
    priority: row.priority,
    notes: row.notes || '',
    status: appStatus(row.status),
  };
}

export async function updateAssignment(
  assignment: AssignmentData
) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        subject = ?,
        due_date = ?,
        priority = ?,
        notes = ?,
        status = ?
      WHERE id = ?
        AND category = 'assignment'
    `,
    [
      assignment.title,
      assignment.subject,
      assignment.dueDate,
      assignment.priority,
      assignment.notes,
      dbStatus(assignment.status),
      Number(assignment.id),
    ],
  );
}

export async function updateAssignmentStatus(
  id: string,
  status: AssignmentData['status']
) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE tasks
      SET status = ?
      WHERE id = ?
        AND category = 'assignment'
    `,
    [dbStatus(status), Number(id)],
  );
}

export async function deleteAssignment(id: string) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND category = 'assignment'
    `,
    [Number(id)],
  );
}