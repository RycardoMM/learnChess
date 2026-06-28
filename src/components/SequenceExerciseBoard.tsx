"use client";

import { useMemo, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Exercise } from "@/lib/types";

type Status = "playing" | "correct" | "incorrect" | "finished";

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

export default function SequenceExerciseBoard({ exercise }: { exercise: Exercise }) {
  const [game, setGame] = useState(() => new Chess(exercise.fen));
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [score, setScore] = useState(0);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: "w" | "b";
  } | null>(null);
  const opponentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const position = useMemo(() => game.fen(), [game]);
  const scored = !!exercise.scored;

  function reset() {
    if (opponentTimer.current) clearTimeout(opponentTimer.current);
    setGame(new Chess(exercise.fen));
    setMoveIndex(0);
    setStatus("playing");
    setScore(0);
    setPendingPromotion(null);
  }

  function playOpponentReply(afterGame: Chess, nextIndex: number) {
    const opponentSan = exercise.solution[nextIndex];
    if (!opponentSan) {
      setStatus(scored ? "finished" : "correct");
      return;
    }
    opponentTimer.current = setTimeout(() => {
      const next = new Chess(afterGame.fen());
      next.move(opponentSan);
      setGame(next);
      const afterOpponentIndex = nextIndex + 1;
      setMoveIndex(afterOpponentIndex);
      if (afterOpponentIndex >= exercise.solution.length) {
        setStatus(scored ? "finished" : "correct");
      }
    }, 600);
  }

  function applyMove(from: string, to: string, promotion?: PieceSymbol) {
    const expectedSan = exercise.solution[moveIndex];
    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from, to, promotion });
    } catch {
      move = null;
    }

    if (!move || move.san !== expectedSan) {
      if (scored) {
        setScore((s) => s - 1);
        return;
      }
      setStatus("incorrect");
      return;
    }

    if (scored) setScore((s) => s + 1);
    setGame(next);
    const nextIndex = moveIndex + 1;
    setMoveIndex(nextIndex);

    if (nextIndex >= exercise.solution.length) {
      setStatus(scored ? "finished" : "correct");
      return;
    }

    playOpponentReply(next, nextIndex);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare || status !== "playing") return false;

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
      <div className="exercise-card-header">
        <h3>{exercise.title}</h3>
        {scored && <span className="score-badge">Puntos: {score}</span>}
      </div>
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
        {status === "finished" && (
          <div className="correct-overlay">
            <div className="correct-circle">
              <svg viewBox="0 0 52 52" className="correct-tick">
                <circle cx="26" cy="26" r="25" />
                <path d="M14 27l7 7 17-17" />
              </svg>
            </div>
            <p className="score-final">Puntaje final: {score}</p>
            <button onClick={reset} className="btn-sm">
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
