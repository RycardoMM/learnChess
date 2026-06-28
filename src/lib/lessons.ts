import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lesson } from "./types";

const lessonsRef = collection(db, "lessons");

export async function getLessons(): Promise<Lesson[]> {
  const snap = await getDocs(query(lessonsRef, orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
}

export async function createLesson(data: Omit<Lesson, "id">) {
  return addDoc(lessonsRef, data);
}

export async function updateLesson(id: string, data: Partial<Omit<Lesson, "id">>) {
  return updateDoc(doc(lessonsRef, id), data);
}

export async function deleteLesson(id: string) {
  return deleteDoc(doc(lessonsRef, id));
}
