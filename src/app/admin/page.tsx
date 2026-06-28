"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/lessons";
import type { Lesson, Level } from "@/lib/types";

export default function AdminPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<Level>("basico");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  async function refresh() {
    setLessons(await getLessons());
  }

  useEffect(() => {
    refresh();
  }, []);

  function resetForm() {
    setTitle("");
    setLevel("basico");
    setContent("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateLesson(editingId, { title, level, content });
    } else {
      await createLesson({ title, level, content, order: lessons.length });
    }
    resetForm();
    refresh();
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setLevel(lesson.level);
    setContent(lesson.content);
  }

  async function handleDelete(id: string) {
    await deleteLesson(id);
    refresh();
  }

  async function handleLogout() {
    await fetch("/api/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Admin - Lecciones</h1>
        <button onClick={handleLogout}>Salir</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as Level)}
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        >
          <option value="basico">Básico</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenido"
          required
          style={{ width: "100%", padding: 8, marginBottom: 8, minHeight: 100 }}
        />
        <button type="submit">{editingId ? "Actualizar" : "Crear"}</button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {lessons.map((lesson) => (
          <li key={lesson.id} style={{ marginBottom: 8 }}>
            <strong>{lesson.title}</strong> ({lesson.level})
            <Link href={`/admin/lessons/${lesson.id}`} style={{ marginLeft: 8 }}>
              Ejercicios
            </Link>
            <button onClick={() => startEdit(lesson)} style={{ marginLeft: 8 }}>
              Editar
            </button>
            <button onClick={() => handleDelete(lesson.id)} style={{ marginLeft: 8 }}>
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
