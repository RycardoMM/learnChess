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
  const [fromSquare, setFromSquare] = useState("");
  const [requireFlag, setRequireFlag] = useState("");
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
    setFromSquare("");
    setRequireFlag("");
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
      fromSquare,
      ...(requireFlag ? { requireFlag } : {}),
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
    setFromSquare(ex.fromSquare);
    setRequireFlag(ex.requireFlag ?? "");
    setSolution(ex.solution.join(", "));
    setExplanation(ex.explanation);
  }

  async function handleDelete(exId: string) {
    await deleteExercise(exId);
    refresh();
  }

  if (!lesson) return <main className="page">Cargando...</main>;

  return (
    <main className="page">
      <h1>Ejercicios: {lesson.title}</h1>

      <form onSubmit={handleSubmit} className="card" style={{ marginTop: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del ejercicio"
          required
        />
        <input
          value={fen}
          onChange={(e) => setFen(e.target.value)}
          placeholder="FEN (posición inicial)"
          required
        />
        <input
          value={fromSquare}
          onChange={(e) => setFromSquare(e.target.value)}
          placeholder="Casilla origen permitida (ej: e2)"
          required
        />
        <select value={requireFlag} onChange={(e) => setRequireFlag(e.target.value)}>
          <option value="">Cualquier jugada legal desde esa casilla</option>
          <option value="n">Solo avance normal (1 casilla)</option>
          <option value="b">Solo doble avance inicial (2 casillas)</option>
          <option value="c">Solo captura</option>
          <option value="e">Solo captura al paso</option>
          <option value="p">Solo promoción</option>
        </select>
        <input
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder="Solución en SAN, separada por comas (ej: Nf3, e5) — referencia"
          required
        />
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explicación al resolver"
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
        {exercises.map((ex) => (
          <li key={ex.id}>
            <strong>{ex.title}</strong>
            <span className="row-actions">
              <button onClick={() => startEdit(ex)} className="btn-sm">
                Editar
              </button>
              <button onClick={() => handleDelete(ex.id)} className="btn-sm btn-danger">
                Borrar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
