"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLesson } from "@/lib/lessons";
import {
  getExercisesByLesson,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/lib/exercises";
import type { Lesson, Exercise } from "@/lib/types";

export default function AdminLessonExercisesPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [title, setTitle] = useState("");
  const [fen, setFen] = useState("");
  const [solution, setSolution] = useState("");
  const [explanation, setExplanation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    setExercises(await getExercisesByLesson(id));
  }

  useEffect(() => {
    getLesson(id).then(setLesson);
    refresh();
  }, [id]);

  function resetForm() {
    setTitle("");
    setFen("");
    setSolution("");
    setExplanation("");
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      lessonId: id,
      title,
      fen,
      solution: solution.split(",").map((s) => s.trim()).filter(Boolean),
      explanation,
      order: exercises.length,
    };
    if (editingId) {
      await updateExercise(editingId, data);
    } else {
      await createExercise(data);
    }
    resetForm();
    refresh();
  }

  function startEdit(ex: Exercise) {
    setEditingId(ex.id);
    setTitle(ex.title);
    setFen(ex.fen);
    setSolution(ex.solution.join(", "));
    setExplanation(ex.explanation);
  }

  async function handleDelete(exId: string) {
    await deleteExercise(exId);
    refresh();
  }

  if (!lesson) return <main style={{ maxWidth: 600, margin: "40px auto" }}>Cargando...</main>;

  return (
    <main style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Ejercicios: {lesson.title}</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del ejercicio"
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          value={fen}
          onChange={(e) => setFen(e.target.value)}
          placeholder="FEN (posición inicial)"
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Solución en SAN, separada por comas (ej: Nf3, e5)"
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explicación al resolver"
          style={{ width: "100%", padding: 8, marginBottom: 8, minHeight: 60 }}
        />
        <button type="submit">{editingId ? "Actualizar" : "Crear"}</button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }}>
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {exercises.map((ex) => (
          <li key={ex.id} style={{ marginBottom: 8 }}>
            <strong>{ex.title}</strong>
            <button onClick={() => startEdit(ex)} style={{ marginLeft: 8 }}>
              Editar
            </button>
            <button onClick={() => handleDelete(ex.id)} style={{ marginLeft: 8 }}>
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
