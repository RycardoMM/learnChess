"use client";

import { useMemo, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import type { Exercise } from "@/lib/types";
import CoordBoard from "./CoordBoard";

type Status = "playing" | "correct" | "incorrect" | "finished";
type ViewMode = "estudiar" | "practicar";

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

function fenAfter(fen: string, solution: string[], count: number) {
  const g = new Chess(fen);
  for (let i = 0; i < count; i++) g.move(solution[i]);
  return g.fen();
}

export default function SequenceExerciseBoard({ exercise }: { exercise: Exercise }) {
  const scored = !!exercise.scored;
  const [viewMode, setViewMode] = useState<ViewMode>(scored ? "estudiar" : "practicar");
  const [studyIndex, setStudyIndex] = useState(0);
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
  const studyPosition = useMemo(
    () => fenAfter(exercise.fen, exercise.solution, studyIndex),
    [exercise.fen, exercise.solution, studyIndex]
  );

  function reset() {
    if (opponentTimer.current) clearTimeout(opponentTimer.current);
    setGame(new Chess(exercise.fen));
    setMoveIndex(0);
    setStatus("playing");
    setScore(0);
    setPendingPromotion(null);
  }

  function startPractice() {
    reset();
    setViewMode("practicar");
  }

  function backToStudy() {
    reset();
    setStudyIndex(0);
    setViewMode("estudiar");
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
    if (viewMode !== "practicar" || !targetSquare || status !== "playing") return false;

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

  const movePairs = useMemo(() => {
    const pairs: { num: number; white?: string; black?: string }[] = [];
    for (let i = 0; i < exercise.solution.length; i += 2) {
      pairs.push({
        num: i / 2 + 1,
        white: exercise.solution[i],
        black: exercise.solution[i + 1],
      });
    }
    return pairs;
  }, [exercise.solution]);

  const displayPosition = viewMode === "estudiar" ? studyPosition : position;

  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3>{exercise.title}</h3>
        {scored && viewMode === "practicar" && (
          <span className="score-badge">Puntos: {score}</span>
        )}
      </div>

      {scored && (
        <div className="mode-toggle">
          <button
            className={`tab ${viewMode === "estudiar" ? "tab-active" : ""}`}
            onClick={backToStudy}
          >
            Estudiar
          </button>
          <button
            className={`tab ${viewMode === "practicar" ? "tab-active" : ""}`}
            onClick={startPractice}
          >
            Practicar
          </button>
        </div>
      )}

      {scored && viewMode === "estudiar" && (
        <>
          <div className="move-list">
            {movePairs.map((pair, i) => (
              <span key={pair.num} className="move-pair">
                <span className="move-num">{pair.num}.</span>
                {pair.white && (
                  <span className={`move-token ${studyIndex - 1 === i * 2 ? "move-active" : ""}`}>
                    {pair.white}
                  </span>
                )}
                {pair.black && (
                  <span
                    className={`move-token ${studyIndex - 1 === i * 2 + 1 ? "move-active" : ""}`}
                  >
                    {pair.black}
                  </span>
                )}
              </span>
            ))}
          </div>
          <div className="study-controls">
            <button
              className="btn-sm"
              onClick={() => setStudyIndex((i) => Math.max(0, i - 1))}
              disabled={studyIndex === 0}
            >
              ← Anterior
            </button>
            <button
              className="btn-sm"
              onClick={() => setStudyIndex((i) => Math.min(exercise.solution.length, i + 1))}
              disabled={studyIndex === exercise.solution.length}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}

      <CoordBoard
        options={{ position: displayPosition, onPieceDrop, id: exercise.id }}
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
          </>
        }
      />
    </div>
  );
}
