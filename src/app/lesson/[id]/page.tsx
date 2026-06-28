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

  if (!lesson) return <main style={{ maxWidth: 700, margin: "40px auto" }}>Cargando...</main>;

  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>{lesson.title}</h1>
      <p>{lesson.content}</p>

      <h2>Ejercicios</h2>
      {exercises.length === 0 && <p style={{ color: "#888" }}>Sin ejercicios todavía</p>}
      {exercises.map((ex) => (
        <ExerciseBoard key={ex.id} exercise={ex} />
      ))}
    </main>
  );
}
