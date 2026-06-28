"use client";

import { useMemo, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Exercise } from "@/lib/types";

type Status = "playing" | "correct" | "wrong-piece" | "wrong-move-type";

const PROMOTION_CHOICES: { piece: PieceSymbol; label: string }[] = [
  { piece: "q", label: "Dama" },
  { piece: "r", label: "Torre" },
  { piece: "n", label: "Caballo" },
  { piece: "b", label: "Alfil" },
];

export default function ExerciseBoard({ exercise }: { exercise: Exercise }) {
  const [game, setGame] = useState(() => new Chess(exercise.fen));
  const [status, setStatus] = useState<Status>("playing");
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const position = useMemo(() => game.fen(), [game]);

  function reset() {
    setGame(new Chess(exercise.fen));
    setStatus("playing");
    setPendingPromotion(null);
  }

  function applyMove(from: string, to: string, promotion?: PieceSymbol) {
    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from, to, promotion });
    } catch {
      return;
    }
    if (!move) return;

    if (exercise.requireFlag && !move.flags.includes(exercise.requireFlag)) {
      setStatus("wrong-move-type");
      return;
    }

    setGame(next);
    setStatus("correct");
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

    const isPromotion = game
      .moves({ square: sourceSquare as Square, verbose: true })
      .some((m) => m.to === targetSquare && m.promotion);

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return true;
    }

    applyMove(sourceSquare, targetSquare);
    return true;
  }

  function choosePromotion(piece: PieceSymbol) {
    if (!pendingPromotion) return;
    applyMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  }

  return (
    <div className="exercise-card">
      <h3>{exercise.title}</h3>
      <div className="board-wrap">
        <Chessboard
          options={{
            position,
            onPieceDrop,
            id: exercise.id,
          }}
        />
        {pendingPromotion && (
          <div className="promotion-overlay">
            <p>Elige la pieza:</p>
            <div className="promotion-choices">
              {PROMOTION_CHOICES.map(({ piece, label }) => (
                <button key={piece} onClick={() => choosePromotion(piece)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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
