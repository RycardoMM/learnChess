"use client";

import { useMemo, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { getBestMove } from "@/lib/chessEngine";
import CoordBoard from "./CoordBoard";

type Difficulty = "facil" | "medio" | "dificil";

const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  facil: 2,
  medio: 6,
  dificil: 12,
};

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

function gameOverMessage(game: Chess): string | null {
  if (game.isCheckmate()) return game.turn() === "w" ? "Jaque mate, gana negras." : "Jaque mate, gana blancas.";
  if (game.isStalemate()) return "Tablas por ahogado.";
  if (game.isInsufficientMaterial()) return "Tablas por material insuficiente.";
  if (game.isThreefoldRepetition()) return "Tablas por repeticion.";
  if (game.isDraw()) return "Tablas.";
  return null;
}

export default function PlayBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>("facil");
  const [game, setGame] = useState(() => new Chess());
  const [thinking, setThinking] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: "w" | "b";
  } | null>(null);
  const moveLock = useRef(false);
  const position = useMemo(() => game.fen(), [game]);
  const overMessage = gameOverMessage(game);

  function newGame() {
    moveLock.current = false;
    setGame(new Chess());
    setThinking(false);
    setPendingPromotion(null);
  }

  async function playAiReply(afterHuman: Chess) {
    if (afterHuman.isGameOver()) return;
    setThinking(true);
    const engineMove = await getBestMove(afterHuman.fen(), DIFFICULTY_DEPTH[difficulty]);
    const next = new Chess(afterHuman.fen());
    try {
      if (engineMove) {
        next.move({
          from: engineMove.from,
          to: engineMove.to,
          promotion: engineMove.promotion as PieceSymbol | undefined,
        });
      } else {
        const legal = next.moves();
        if (legal.length > 0) next.move(legal[0]);
      }
    } catch {
      const legal = next.moves();
      if (legal.length > 0) next.move(legal[0]);
    }
    setGame(next);
    setThinking(false);
    moveLock.current = false;
  }

  function applyHumanMove(from: string, to: string, promotion?: PieceSymbol) {
    const next = new Chess(game.fen());
    let move;
    try {
      move = next.move({ from, to, promotion });
    } catch {
      move = null;
    }
    if (!move) return;
    setGame(next);
    playAiReply(next);
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare || thinking || moveLock.current || overMessage) return false;
    if (game.turn() !== "w") return false;

    const isPromotion = game
      .moves({ square: sourceSquare as Square, verbose: true })
      .some((m) => m.to === targetSquare && m.promotion);

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: game.turn() });
      return true;
    }

    moveLock.current = true;
    applyHumanMove(sourceSquare, targetSquare);
    return true;
  }

  function choosePromotion(piece: PieceSymbol) {
    if (!pendingPromotion) return;
    moveLock.current = true;
    applyHumanMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  }

  return (
    <div className="exercise-card play-card">
      <div className="exercise-card-header">
        <h3>Juega contra la IA</h3>
        {thinking && <span className="score-badge">Pensando…</span>}
      </div>

      <div className="mode-toggle">
        {(["facil", "medio", "dificil"] as Difficulty[]).map((d) => (
          <button
            key={d}
            className={`tab ${difficulty === d ? "tab-active" : ""}`}
            onClick={() => setDifficulty(d)}
          >
            {d === "facil" ? "Facil" : d === "medio" ? "Medio" : "Dificil"}
          </button>
        ))}
      </div>

      <CoordBoard
        options={{ position, onPieceDrop, id: "play-vs-ai" }}
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
            {overMessage && (
              <div className="correct-overlay">
                <p className="score-final">{overMessage}</p>
                <button onClick={newGame} className="btn-sm">
                  Nueva partida
                </button>
              </div>
            )}
          </>
        }
      />

      <div className="row-actions" style={{ marginTop: 12 }}>
        <button onClick={newGame} className="btn-sm">
          Reiniciar partida
        </button>
      </div>
    </div>
  );
}
