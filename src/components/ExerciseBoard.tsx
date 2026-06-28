"use client";

import { useMemo, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import type { Exercise } from "@/lib/types";
import CoordBoard from "./CoordBoard";

type Status = "playing" | "correct" | "incorrect";

const PROMOTION_CHOICES: { piece: PieceSymbol; label: string }[] = [
  { piece: "q", label: "Dama" },
  { piece: "r", label: "Torre" },
  { piece: "n", label: "Caballo" },
  { piece: "b", label: "Alfil" },
];

const PROMOTION_ICONS: Record<"w" | "b", Record<PieceSymbol, string>> = {
  w: { q: "♕", r: "♖", n: "♘", b: "♗", p: "♙", k: "♔" },
  b: { q: "♛", r: "♜", n: "♞", b: "♝", p: "♟", k: "♚" },
};

export default function ExerciseBoard({ exercise }: { exercise: Exercise }) {
  const [game, setGame] = useState(() => new Chess(exercise.fen));
  const [status, setStatus] = useState<Status>("playing");
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: "w" | "b";
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
      setStatus("incorrect");
      return;
    }
    if (!move) {
      setStatus("incorrect");
      return;
    }

    if (exercise.requireFlag && !move.flags.includes(exercise.requireFlag)) {
      setStatus("incorrect");
      return;
    }

    if (exercise.requireDirection) {
      const fileDiff = Math.abs(from.charCodeAt(0) - to.charCodeAt(0));
      const rankDiff = Math.abs(Number(from[1]) - Number(to[1]));
      const direction =
        fileDiff === 0 ? "vertical" : rankDiff === 0 ? "horizontal" : "diagonal";
      if (direction !== exercise.requireDirection) {
        setStatus("incorrect");
        return;
      }
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
      setStatus("incorrect");
      return false;
    }

    const isPromotion = game
      .moves({ square: sourceSquare as Square, verbose: true })
      .some((m) => m.to === targetSquare && m.promotion);

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: game.turn() });
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
      <CoordBoard
        options={{ position, onPieceDrop, id: exercise.id }}
        overlay={
          <>
            {pendingPromotion && (
              <div className="promotion-overlay">
                <p>Elige la pieza:</p>
                <div className="promotion-choices">
                  {PROMOTION_CHOICES.map(({ piece, label }) => (
                    <button
                      key={piece}
                      onClick={() => choosePromotion(piece)}
                      className="promotion-choice"
                      title={label}
                      aria-label={label}
                    >
                      {PROMOTION_ICONS[pendingPromotion.color][piece]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {status === "correct" && (
              <div className="correct-overlay">
                <div className="correct-circle">
                  <svg viewBox="0 0 52 52" className="correct-tick">
                    <circle cx="26" cy="26" r="25" />
                    <path d="M14 27l7 7 17-17" />
                  </svg>
                </div>
                <button onClick={reset} className="btn-sm">
                  Volver
                </button>
              </div>
            )}
            {status === "incorrect" && (
              <div className="correct-overlay incorrect-overlay">
                <div className="correct-circle incorrect-circle">
                  <svg viewBox="0 0 52 52" className="correct-tick incorrect-cross">
                    <circle cx="26" cy="26" r="25" />
                    <path d="M16 16l20 20M36 16l-20 20" />
                  </svg>
                </div>
                <button onClick={reset} className="btn-sm">
                  Reintentar
                </button>
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
