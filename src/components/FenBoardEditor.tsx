"use client";

import { useEffect, useRef, useState } from "react";
import { Chess, type PieceSymbol, type Color, type Square } from "chess.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const PIECE_TYPES: PieceSymbol[] = ["k", "q", "r", "b", "n", "p"];

const PIECE_UNICODE: Record<Color, Record<PieceSymbol, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

type Tool = { color: Color; type: PieceSymbol } | "erase";

export default function FenBoardEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (fen: string) => void;
}) {
  const gameRef = useRef(new Chess(isValidFen(value) ? value : undefined));
  const [, forceRender] = useState(0);
  const [tool, setTool] = useState<Tool>({ color: "w", type: "p" });

  useEffect(() => {
    if (isValidFen(value) && value !== gameRef.current.fen()) {
      gameRef.current.load(value);
      forceRender((n) => n + 1);
    }
  }, [value]);

  function emit() {
    onChange(gameRef.current.fen());
    forceRender((n) => n + 1);
  }

  function handleSquareClick(square: Square) {
    if (tool === "erase") {
      gameRef.current.remove(square);
    } else {
      gameRef.current.remove(square);
      gameRef.current.put({ type: tool.type, color: tool.color }, square);
    }
    emit();
  }

  function setTurn(color: Color) {
    gameRef.current.setTurn(color);
    emit();
  }

  function setCastle(color: Color, side: "k" | "q", checked: boolean) {
    gameRef.current.setCastlingRights(color, { [side === "k" ? "k" : "q"]: checked });
    emit();
  }

  function resetStart() {
    gameRef.current = new Chess();
    emit();
  }

  function clearBoard() {
    gameRef.current.clear();
    emit();
  }

  const board = gameRef.current.board();
  const turn = gameRef.current.turn();
  const castlingW = gameRef.current.getCastlingRights("w");
  const castlingB = gameRef.current.getCastlingRights("b");

  return (
    <div className="fen-editor">
      <div className="fen-palette">
        {PIECE_TYPES.map((t) => (
          <button
            key={`w${t}`}
            type="button"
            className={`fen-piece-btn ${
              tool !== "erase" && tool.color === "w" && tool.type === t ? "fen-piece-active" : ""
            }`}
            onClick={() => setTool({ color: "w", type: t })}
          >
            {PIECE_UNICODE.w[t]}
          </button>
        ))}
        <button
          type="button"
          className={`fen-piece-btn ${tool === "erase" ? "fen-piece-active" : ""}`}
          onClick={() => setTool("erase")}
          title="Borrar"
        >
          ✕
        </button>
      </div>
      <div className="fen-palette">
        {PIECE_TYPES.map((t) => (
          <button
            key={`b${t}`}
            type="button"
            className={`fen-piece-btn ${
              tool !== "erase" && tool.color === "b" && tool.type === t ? "fen-piece-active" : ""
            }`}
            onClick={() => setTool({ color: "b", type: t })}
          >
            {PIECE_UNICODE.b[t]}
          </button>
        ))}
      </div>

      <div className="fen-board">
        {board.map((row, ri) =>
          row.map((cell, fi) => {
            const square = `${FILES[fi]}${RANKS[ri]}` as Square;
            const dark = (ri + fi) % 2 === 1;
            return (
              <button
                type="button"
                key={square}
                className={`fen-square ${dark ? "fen-square-dark" : "fen-square-light"}`}
                onClick={() => handleSquareClick(square)}
              >
                {cell ? PIECE_UNICODE[cell.color][cell.type] : ""}
              </button>
            );
          })
        )}
      </div>

      <div className="fen-controls">
        <label>
          Turno
          <select value={turn} onChange={(e) => setTurn(e.target.value as Color)}>
            <option value="w">Blancas</option>
            <option value="b">Negras</option>
          </select>
        </label>

        <fieldset className="fen-castling">
          <legend>Enroque</legend>
          <label>
            <input
              type="checkbox"
              checked={castlingW.k}
              onChange={(e) => setCastle("w", "k", e.target.checked)}
            />
            Blancas O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingW.q}
              onChange={(e) => setCastle("w", "q", e.target.checked)}
            />
            Blancas O-O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingB.k}
              onChange={(e) => setCastle("b", "k", e.target.checked)}
            />
            Negras O-O
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingB.q}
              onChange={(e) => setCastle("b", "q", e.target.checked)}
            />
            Negras O-O-O
          </label>
        </fieldset>

        <div className="row-actions">
          <button type="button" className="btn-sm" onClick={resetStart}>
            Posición inicial
          </button>
          <button type="button" className="btn-sm" onClick={clearBoard}>
            Limpiar tablero
          </button>
        </div>
      </div>

      <input
        value={gameRef.current.fen()}
        readOnly
        className="fen-output"
        onFocus={(e) => e.target.select()}
      />
    </div>
  );
}

function isValidFen(fen: string): boolean {
  if (!fen) return false;
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}
