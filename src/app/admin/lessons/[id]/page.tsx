"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLesson, updateLesson } from "@/lib/lessons";
import {
  getExercisesByLesson,
  createExercise,
  updateExercise,
  deleteExercise,
} from "@/lib/exercises";
import type { Lesson, Exercise, Level, Category } from "@/lib/types";
import FenBoardEditor from "@/components/FenBoardEditor";

export default function AdminLessonExercisesPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonLevel, setLessonLevel] = useState<Level>("basico");
  const [lessonCategory, setLessonCategory] = useState<Category>("movimientos");
  const [lessonContent, setLessonContent] = useState("");

  const [title, setTitle] = useState("");
  const [fen, setFen] = useState("");
  const [mode, setMode] = useState<"free" | "sequence">("free");
  const [scored, setScored] = useState(false);
  const [fromSquare, setFromSquare] = useState("");
  const [requireFlag, setRequireFlag] = useState("");
  const [solution, setSolution] = useState("");
  const [explanation, setExplanation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBoardEditor, setShowBoardEditor] = useState(false);

  async function refresh() {
    setExercises(await getExercisesByLesson(id));
  }

  useEffect(() => {
    getLesson(id).then((l) => {
      setLesson(l);
      if (l) {
        setLessonTitle(l.title);
        setLessonLevel(l.level);
        setLessonCategory(l.category);
        setLessonContent(l.content);
      }
    });
    refresh();
  }, [id]);

  async function handleLessonSubmit(e: React.FormEvent) {
    e.preventDefault();
    await updateLesson(id, {
      title: lessonTitle,
      level: lessonLevel,
      category: lessonCategory,
      content: lessonContent,
    });
    setLesson((l) =>
      l ? { ...l, title: lessonTitle, level: lessonLevel, category: lessonCategory, content: lessonContent } : l
    );
  }

  function resetForm() {
    setTitle("");
    setFen("");
    setMode("free");
    setScored(false);
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
      mode,
      ...(scored ? { scored: true } : {}),
      ...(mode === "free" ? { fromSquare } : {}),
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
    setMode(ex.mode ?? "free");
    setScored(!!ex.scored);
    setFromSquare(ex.fromSquare ?? "");
    setRequireFlag(ex.requireFlag ?? "");
    setSolution(ex.solution.join(", "));
    setExplanation(ex.explanation);
    setShowBoardEditor(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(exId: string) {
    await deleteExercise(exId);
    refresh();
  }

  if (!lesson) return <main className="page">Cargando...</main>;

  return (
    <main className="page">
      <h1>Editar lección: {lesson.title}</h1>

      <form onSubmit={handleLessonSubmit} className="card" style={{ marginTop: 16 }}>
        <input
          value={lessonTitle}
          onChange={(e) => setLessonTitle(e.target.value)}
          placeholder="Título"
          required
        />
        <select value={lessonLevel} onChange={(e) => setLessonLevel(e.target.value as Level)}>
          <option value="basico">Básico</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
        <select
          value={lessonCategory}
          onChange={(e) => setLessonCategory(e.target.value as Category)}
        >
          <option value="movimientos">Movimientos de las piezas</option>
          <option value="jaquemate">Jaque mate</option>
          <option value="apertura">Aperturas</option>
        </select>
        <textarea
          value={lessonContent}
          onChange={(e) => setLessonContent(e.target.value)}
          placeholder="Contenido"
          required
        />
        <button type="submit">Guardar lección</button>
      </form>

      <h2>Ejercicios</h2>

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
        <button
          type="button"
          className="btn-sm"
          style={{ marginBottom: 10 }}
          onClick={() => setShowBoardEditor((s) => !s)}
        >
          {showBoardEditor ? "Ocultar editor visual" : "Editar tablero visualmente"}
        </button>
        {showBoardEditor && <FenBoardEditor value={fen} onChange={setFen} />}
        <select value={mode} onChange={(e) => setMode(e.target.value as "free" | "sequence")}>
          <option value="free">Libre (cualquier jugada legal desde una casilla)</option>
          <option value="sequence">Secuencia (movimientos exactos, rival automático)</option>
        </select>
        {mode === "sequence" && (
          <label style={{ display: "flex", gap: 8, marginBottom: 10, color: "var(--text-dim)", fontSize: "0.85rem" }}>
            <input
              type="checkbox"
              checked={scored}
              onChange={(e) => setScored(e.target.checked)}
              style={{ width: "auto", marginBottom: 0 }}
            />
            Con puntaje (correcto +1, incorrecto -1)
          </label>
        )}
        {mode === "free" && (
          <input
            value={fromSquare}
            onChange={(e) => setFromSquare(e.target.value)}
            placeholder="Casilla origen permitida (ej: e2)"
            required
          />
        )}
        {mode === "free" && (
          <select value={requireFlag} onChange={(e) => setRequireFlag(e.target.value)}>
            <option value="">Cualquier jugada legal desde esa casilla</option>
            <option value="n">Solo avance normal (1 casilla)</option>
            <option value="b">Solo doble avance inicial (2 casillas)</option>
            <option value="c">Solo captura</option>
            <option value="e">Solo captura al paso</option>
            <option value="p">Solo promoción</option>
          </select>
        )}
        <input
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder={
            mode === "sequence"
              ? "Movimientos en SAN, en orden (ej: Qh5, g6, Qxf7)"
              : "Solución en SAN, separada por comas — referencia"
          }
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
