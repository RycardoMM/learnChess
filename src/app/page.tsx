"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLessons } from "@/lib/lessons";
import type { Lesson, Level } from "@/lib/types";

const LEVELS: Level[] = ["basico", "intermedio", "avanzado"];

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    getLessons().then(setLessons);
  }, []);

  return (
    <main style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>Portal de Aprendizaje de Ajedrez</h1>
      {LEVELS.map((level) => (
        <section key={level} style={{ marginBottom: 24 }}>
          <h2 style={{ textTransform: "capitalize" }}>{level}</h2>
          <ul>
            {lessons
              .filter((l) => l.level === level)
              .map((l) => (
                <li key={l.id}>
                  <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                </li>
              ))}
            {lessons.filter((l) => l.level === level).length === 0 && (
              <li style={{ color: "#888" }}>Sin lecciones todavía</li>
            )}
          </ul>
        </section>
      ))}
    </main>
  );
}
