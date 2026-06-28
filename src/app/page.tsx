"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLessons } from "@/lib/lessons";
import type { Lesson, Level, Category } from "@/lib/types";

const LEVELS: { value: Level; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
];

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "movimientos", label: "Movimientos de las piezas" },
  { value: "jaquemate", label: "Jaque mate" },
  { value: "apertura", label: "Aperturas" },
];

const PIECE_ICONS: { match: string; icon: string }[] = [
  { match: "peon", icon: "♙" },
  { match: "torre", icon: "♖" },
  { match: "caballo", icon: "♘" },
  { match: "alfil", icon: "♗" },
  { match: "dama", icon: "♕" },
  { match: "rey", icon: "♔" },
  { match: "mate", icon: "♚" },
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

      {LEVELS.map(({ value: levelValue, label: levelLabel }) => {
        const levelLessons = lessons.filter((l) => l.level === levelValue);
        return (
          <section key={levelValue} id={`nivel-${levelValue}`} className="level-section">
            <h2>{levelLabel}</h2>
            {levelLessons.length === 0 ? (
              <p className="empty-state">Sin lecciones todavía</p>
            ) : (
              CATEGORIES.map(({ value: catValue, label: catLabel }) => {
                const items = levelLessons.filter((l) => l.category === catValue);
                if (items.length === 0) return null;
                return (
                  <div key={catValue} className="category-block">
                    <h3 className="category-title">{catLabel}</h3>
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
                  </div>
                );
              })
            )}
          </section>
        );
      })}
    </main>
  );
}
