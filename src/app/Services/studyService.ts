import { getDb } from '../../database/db';

export const createStudyNote = async (topic: string) => {
  const db = await getDb();

  const result = await db.runAsync(
    `INSERT INTO study_notes (topic)
     VALUES (?)`,
    [topic],
  );

  return result.lastInsertRowId;
};

export const getStudyNotes = async () => {
  const db = await getDb();

  return await db.getAllAsync(
    `SELECT *
     FROM study_notes
     ORDER BY id DESC`,
  );
};

export const updateStudyNote = async (
  id: number,
  topic: string,
  step1: string,
  step2: string,
  step3: string,
  step4: string,
  step5: string,
) => {
  const db = await getDb();

  await db.runAsync(
    `UPDATE study_notes
     SET topic = ?,
         step_1_explanation = ?,
         step_2_simplify = ?,
         step_3_analogy = ?,
         step_4_gaps = ?,
         step_5_refined_understanding = ?
     WHERE id = ?`,
    [topic, step1, step2, step3, step4, step5, id],
  );
};

export const deleteStudyNote = async (id: number) => {
  const db = await getDb();

  await db.runAsync(
    `DELETE FROM study_notes
     WHERE id = ?`,
    [id],
  );
};
