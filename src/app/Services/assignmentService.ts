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

export async function createAssignment(
  assignment: AssignmentData
) {
  const db = await getDb();

  await db.runAsync(
    `
      INSERT INTO tasks (
        id,
        type,
        title,
        subject,
        date,
        priority,
        notes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      assignment.id,
      'assignment',
      assignment.title,
      assignment.subject,
      assignment.dueDate,
      assignment.priority,
      assignment.notes,
      assignment.status,
    ],
  );
}

export async function getAssignments() {
  const db = await getDb();

  return await db.getAllAsync<AssignmentData>(
    `
      SELECT
        id,
        title,
        subject,
        date AS dueDate,
        priority,
        notes,
        status
      FROM tasks
      WHERE type = 'assignment'
      ORDER BY date ASC
    `,
  );
}

export async function getAssignmentById(
  id: string
) {
  const db = await getDb();

  return await db.getFirstAsync<AssignmentData>(
    `
      SELECT
        id,
        title,
        subject,
        date AS dueDate,
        priority,
        notes,
        status
      FROM tasks
      WHERE id = ?
        AND type = 'assignment'
    `,
    [id],
  );
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
        date = ?,
        priority = ?,
        notes = ?,
        status = ?
      WHERE id = ?
        AND type = 'assignment'
    `,
    [
      assignment.title,
      assignment.subject,
      assignment.dueDate,
      assignment.priority,
      assignment.notes,
      assignment.status,
      assignment.id,
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
        AND type = 'assignment'
    `,
    [status, id],
  );
}

export async function deleteAssignment(
  id: string
) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM tasks
      WHERE id = ?
        AND type = 'assignment'
    `,
    [id],
  );
}