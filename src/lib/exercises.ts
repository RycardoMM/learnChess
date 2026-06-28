import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { rtdb } from "./firebase";
import type { Exercise } from "./types";

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  const snap = await get(
    query(ref(rtdb, "exercises"), orderByChild("lessonId"), equalTo(lessonId))
  );
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, Omit<Exercise, "id">>;
  return Object.entries(data)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => a.order - b.order);
}

export async function createExercise(data: Omit<Exercise, "id">) {
  const res = await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear el ejercicio");
  return res.json();
}

export async function updateExercise(id: string, data: Partial<Omit<Exercise, "id">>) {
  const res = await fetch(`/api/exercises/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el ejercicio");
  return res.json();
}

export async function deleteExercise(id: string) {
  const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo borrar el ejercicio");
  return res.json();
}
