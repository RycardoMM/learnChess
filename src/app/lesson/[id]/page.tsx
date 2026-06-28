"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLesson } from "@/lib/lessons";
import { getExercisesByLesson } from "@/lib/exercises";
import type { Lesson, Exercise } from "@/lib/types";
import ExerciseBoard from "@/components/ExerciseBoard";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    getLesson(id).then(setLesson);
    getExercisesByLesson(id).then(setExercises);
  }, [id]);

  if (!lesson) return <main className="page">Cargando...</main>;

  return (
    <main className="page">
      <span className={`badge badge-${lesson.level}`}>{lesson.level}</span>
      <h1>{lesson.title}</h1>
      <p>{lesson.content}</p>

      <h2>Ejercicios</h2>
      {exercises.length === 0 && <p className="empty-state">Sin ejercicios todavía</p>}
      {exercises.map((ex) => (
        <ExerciseBoard key={ex.id} exercise={ex} />
      ))}
    </main>
  );
}
