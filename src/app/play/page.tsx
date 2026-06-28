"use client";

import Link from "next/link";
import PlayBoard from "@/components/PlayBoard";

export default function PlayPage() {
  return (
    <main className="page">
      <Link href="/" className="back-link">
        ← Volver a lecciones
      </Link>
      <h1>Jugar contra la IA</h1>
      <p>Juegas con blancas. Elige la dificultad y mueve la primera pieza para empezar.</p>
      <PlayBoard />
    </main>
  );
}
