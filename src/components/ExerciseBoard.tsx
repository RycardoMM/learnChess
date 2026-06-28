"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Exercise } from "@/lib/types";

type Status = "playing" | "correct";

export default function ExerciseBoard({ exercise }: { exercise: Exercise }) {
  const [game, setGame] = useState(() => new Chess(exercise.fen));
  const [status, setStatus] = useState<Status>("playing");
  const position = useMemo(() => game.fen(), [game]);

  function reset() {
    setGame(new Chess(exercise.fen));
    setStatus("playing");
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare || status !== "playing") return false;

    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    if (!move) return false;

    setGame(next);
    setStatus("correct");
    return true;
  }

  return (
    <div className="exercise-card">
      <h3>{exercise.title}</h3>
      <Chessboard
        options={{
          position,
          onPieceDrop,
          id: exercise.id,
        }}
      />
      {status === "correct" && (
        <div className="exercise-status correct">
          <p>¡Correcto! {exercise.explanation}</p>
          <button onClick={reset} className="btn-sm">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
