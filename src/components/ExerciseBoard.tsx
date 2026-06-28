"use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Exercise } from "@/lib/types";

type Status = "playing" | "correct" | "incorrect";

export default function ExerciseBoard({ exercise }: { exercise: Exercise }) {
  const [game, setGame] = useState(() => new Chess(exercise.fen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const position = useMemo(() => game.fen(), [game]);

  function reset() {
    setGame(new Chess(exercise.fen));
    setMoveIndex(0);
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

    const expected = exercise.solution[moveIndex];
    if (move.san !== expected) {
      setStatus("incorrect");
      return false;
    }

    setGame(next);
    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);
    if (nextIndex >= exercise.solution.length) {
      setStatus("correct");
    }
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
        <p className="exercise-status correct">¡Correcto! {exercise.explanation}</p>
      )}
      {status === "incorrect" && (
        <div className="exercise-status incorrect">
          <p>Movimiento incorrecto.</p>
          <button onClick={reset} className="btn-sm">
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
