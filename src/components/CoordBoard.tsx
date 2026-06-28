"use client";

import { Chessboard } from "react-chessboard";

type ChessboardOptions = NonNullable<Parameters<typeof Chessboard>[0]["options"]>;

const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function CoordBoard({
  options,
  overlay,
}: {
  options: ChessboardOptions;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="board-frame">
      <div className="board-with-ranks">
        <div className="rank-labels">
          {RANKS.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
        <div className="board-wrap">
          <Chessboard options={{ ...options, showNotation: false }} />
          {overlay}
        </div>
      </div>
      <div className="file-labels">
        <span className="file-labels-spacer" />
        <div className="file-labels-grid">
          {FILES.map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
