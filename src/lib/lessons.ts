import { ref, get, query, orderByChild } from "firebase/database";
import { rtdb } from "./firebase";
import type { Lesson } from "./types";

export async function getLessons(): Promise<Lesson[]> {
  const snap = await get(query(ref(rtdb, "lessons"), orderByChild("order")));
  if (!snap.exists()) return [];
  const data = snap.val() as Record<string, Omit<Lesson, "id">>;
  return Object.entries(data).map(([id, value]) => ({ id, ...value }));
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const snap = await get(ref(rtdb, `lessons/${id}`));
  if (!snap.exists()) return null;
  return { id, ...(snap.val() as Omit<Lesson, "id">) };
}

export async function createLesson(data: Omit<Lesson, "id">) {
  const res = await fetch("/api/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo crear la lección");
  return res.json();
}

export async function updateLesson(id: string, data: Partial<Omit<Lesson, "id">>) {
  const res = await fetch(`/api/lessons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la lección");
  return res.json();
}

export async function deleteLesson(id: string) {
  const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("No se pudo borrar la lección");
  return res.json();
}
