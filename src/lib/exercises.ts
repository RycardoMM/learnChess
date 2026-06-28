import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Exercise } from "./types";

const exercisesRef = collection(db, "exercises");

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  const snap = await getDocs(
    query(exercisesRef, where("lessonId", "==", lessonId), orderBy("order"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Exercise));
}

export async function createExercise(data: Omit<Exercise, "id">) {
  return addDoc(exercisesRef, data);
}

export async function updateExercise(id: string, data: Partial<Omit<Exercise, "id">>) {
  return updateDoc(doc(exercisesRef, id), data);
}

export async function deleteExercise(id: string) {
  return deleteDoc(doc(exercisesRef, id));
}
