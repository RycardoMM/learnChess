"use client";

import { useRef, useState } from "react";
import { Chess, type PieceSymbol, type Square } from "chess.js";
import { getBestMove } from "@/lib/chessEngine";
import CoordBoard from "./CoordBoard";

const ELO_OPTIONS = [
  { elo: 800, depth: 1 },
  { elo: 1200, depth: 3 },
  { elo: 1600, depth: 6 },
  { elo: 2000, depth: 9 },
  { elo: 2350, depth: 12 },
  { elo: 2750, depth: 18 },
];

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

function movePairs(history: string[]) {
  const pairs: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ num: i / 2 + 1, white: history[i], black: history[i + 1] });
  }
  return pairs;
}

export default function PlayBoard() {
  const gameRef = useRef(new Chess());
  const [elo, setElo] = useState(ELO_OPTIONS[0].elo);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
    color: "w" | "b";
  } | null>(null);
  const moveLock = useRef(false);
  const overMessage = gameOverMessage(gameRef.current);

  function syncState() {
    setFen(gameRef.current.fen());
    setHistory(gameRef.current.history());
  }

  function newGame() {
    moveLock.current = false;
    gameRef.current = new Chess();
    setThinking(false);
    setPendingPromotion(null);
    syncState();
  }

  async function playAiReply() {
    if (gameRef.current.isGameOver()) {
      moveLock.current = false;
      return;
    }
    setThinking(true);
    const depth = ELO_OPTIONS.find((o) => o.elo === elo)?.depth ?? 2;
    const engineMove = await getBestMove(gameRef.current.fen(), depth);
    try {
      if (engineMove) {
        gameRef.current.move({
          from: engineMove.from,
          to: engineMove.to,
          promotion: engineMove.promotion as PieceSymbol | undefined,
        });
      } else {
        const legal = gameRef.current.moves();
        if (legal.length > 0) gameRef.current.move(legal[0]);
      }
    } catch {
      const legal = gameRef.current.moves();
      if (legal.length > 0) gameRef.current.move(legal[0]);
    }
    syncState();
    setThinking(false);
    moveLock.current = false;
  }

  function applyHumanMove(from: string, to: string, promotion?: PieceSymbol) {
    let move;
    try {
      move = gameRef.current.move({ from, to, promotion });
    } catch {
      move = null;
    }
    if (!move) {
      moveLock.current = false;
      return;
    }
    syncState();
    playAiReply();
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) {
    if (!targetSquare || thinking || moveLock.current || overMessage) return false;
    if (gameRef.current.turn() !== "w") return false;

    const candidateMoves = gameRef.current.moves({ square: sourceSquare as Square, verbose: true });
    const isLegal = candidateMoves.some((m) => m.to === targetSquare);
    if (!isLegal) return false;

    const isPromotion = candidateMoves.some((m) => m.to === targetSquare && m.promotion);

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: gameRef.current.turn() });
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

      <label className="elo-select">
        Nivel ELO de la IA
        <select value={elo} onChange={(e) => setElo(Number(e.target.value))}>
          {ELO_OPTIONS.map((o) => (
            <option key={o.elo} value={o.elo}>
              {o.elo}
            </option>
          ))}
        </select>
      </label>

      <div className="play-layout">
        <CoordBoard
          options={{ position: fen, onPieceDrop, id: "play-vs-ai" }}
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

        <div className="move-panel">
          <p className="sidebar-title" style={{ marginTop: 0 }}>
            Jugadas
          </p>
          {history.length === 0 ? (
            <p className="empty-state">Sin jugadas todavía</p>
          ) : (
            <ol className="move-panel-list">
              {movePairs(history).map((pair) => (
                <li key={pair.num}>
                  <span className="move-num">{pair.num}.</span>
                  <span>{pair.white}</span>
                  <span>{pair.black ?? ""}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="row-actions" style={{ marginTop: 12 }}>
        <button onClick={newGame} className="btn-sm">
          Reiniciar partida
        </button>
      </div>
    </div>
  );
}
