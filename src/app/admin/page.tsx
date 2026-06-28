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
import type { Lesson, Level, Category } from "@/lib/types";

export default function AdminPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<Level>("basico");
  const [category, setCategory] = useState<Category>("movimientos");
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
    setCategory("movimientos");
    setContent("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateLesson(editingId, { title, level, category, content });
    } else {
      await createLesson({ title, level, category, content, order: lessons.length });
    }
    resetForm();
    refresh();
  }

  function startEdit(lesson: Lesson) {
    setEditingId(lesson.id);
    setTitle(lesson.title);
    setLevel(lesson.level);
    setCategory(lesson.category);
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
    <main className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin · Lecciones</h1>
        <button onClick={handleLogout} className="btn-sm">
          Salir
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
        />
        <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          <option value="basico">Básico</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          <option value="movimientos">Movimientos de las piezas</option>
          <option value="jaquemate">Jaque mate</option>
          <option value="apertura">Aperturas</option>
        </select>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenido"
          required
        />
        <div className="row-actions">
          <button type="submit">{editingId ? "Actualizar" : "Crear"}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="card-list" style={{ marginTop: 16 }}>
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <span>
              <strong>{lesson.title}</strong>{" "}
              <span className={`badge badge-${lesson.level}`}>{lesson.level}</span>{" "}
              <span className="badge">{lesson.category}</span>
            </span>
            <span className="row-actions">
              <Link href={`/admin/lessons/${lesson.id}`} className="btn btn-sm">
                Ejercicios
              </Link>
              <button onClick={() => startEdit(lesson)} className="btn-sm">
                Editar
              </button>
              <button onClick={() => handleDelete(lesson.id)} className="btn-sm btn-danger">
                Borrar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
