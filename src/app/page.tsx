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

const PIECE_ICONS: { match: string; icon: string }[] = [
  { match: "peon", icon: "♙" },
  { match: "torre", icon: "♖" },
  { match: "caballo", icon: "♘" },
  { match: "alfil", icon: "♗" },
  { match: "dama", icon: "♕" },
  { match: "rey", icon: "♔" },
];

function iconFor(title: string) {
  const lower = title.toLowerCase();
  return PIECE_ICONS.find((p) => lower.includes(p.match))?.icon ?? "♟";
}

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
              <ul className="card-list lesson-list">
                {items.map((l) => (
                  <li key={l.id} className="lesson-item">
                    <Link href={`/lesson/${l.id}`} className="lesson-link">
                      <span className="lesson-icon">{iconFor(l.title)}</span>
                      <span>{l.title}</span>
                    </Link>
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
