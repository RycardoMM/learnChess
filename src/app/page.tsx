"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLessons } from "@/lib/lessons";
import type { Lesson, Level } from "@/lib/types";

const LEVELS: { value: Level; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    getLessons().then(setLessons);
  }, []);

  return (
    <main className="page">
      <h1>Portal de Aprendizaje de Ajedrez</h1>
      <p>Aprende ajedrez paso a paso, desde lo básico hasta conceptos avanzados.</p>

      {LEVELS.map(({ value, label }) => {
        const items = lessons.filter((l) => l.level === value);
        return (
          <section key={value} className="level-section">
            <h2>{label}</h2>
            {items.length === 0 ? (
              <p className="empty-state">Sin lecciones todavía</p>
            ) : (
              <ul className="card-list">
                {items.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lesson/${l.id}`}>{l.title}</Link>
                    <span className={`badge badge-${l.level}`}>{label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
