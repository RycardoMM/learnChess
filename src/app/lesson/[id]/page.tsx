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
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getLesson(id).then(setLesson);
    getExercisesByLesson(id).then((data) => {
      setExercises(data);
      setActiveIndex(0);
    });
  }, [id]);

  if (!lesson) return <main className="page">Cargando...</main>;

  const active = exercises[activeIndex];

  return (
    <main className="page">
      <span className={`badge badge-${lesson.level}`}>{lesson.level}</span>
      <h1>{lesson.title}</h1>
      <p>{lesson.content}</p>

      <h2>Ejercicios</h2>
      {exercises.length === 0 && <p className="empty-state">Sin ejercicios todavía</p>}

      {exercises.length > 0 && (
        <>
          <div className="tabs">
            {exercises.map((ex, i) => (
              <button
                key={ex.id}
                className={`tab ${i === activeIndex ? "tab-active" : ""}`}
                onClick={() => setActiveIndex(i)}
              >
                {i + 1}. {ex.title}
              </button>
            ))}
          </div>
          {active && <ExerciseBoard key={active.id} exercise={active} />}
        </>
      )}
    </main>
  );
}
