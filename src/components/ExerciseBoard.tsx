"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Exercise } from "@/lib/types";

type Status = "playing" | "correct" | "wrong-piece" | "wrong-move-type";

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

    if (sourceSquare !== exercise.fromSquare) {
      setStatus("wrong-piece");
      return false;
    }

    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }
    if (!move) return false;

    if (exercise.requireFlag && !move.flags.includes(exercise.requireFlag)) {
      setStatus("wrong-move-type");
      return false;
    }

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
      {status === "wrong-piece" && (
        <div className="exercise-status incorrect">
          <p>Mueve la pieza que se está enseñando en este ejercicio.</p>
          <button onClick={reset} className="btn-sm">
            Reintentar
          </button>
        </div>
      )}
      {status === "wrong-move-type" && (
        <div className="exercise-status incorrect">
          <p>Ese movimiento es legal, pero no es el tipo de jugada que este ejercicio enseña.</p>
          <button onClick={reset} className="btn-sm">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
