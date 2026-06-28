export async function getBestMove(
  fen: string,
  depth?: number
): Promise<{ from: string; to: string; promotion?: string } | null> {
  try {
    const res = await fetch("https://chess-api.com/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, ...(depth ? { depth } : {}) }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.from || !data.to) return null;
    return { from: data.from, to: data.to, promotion: data.promotion || undefined };
  } catch {
    return null;
  }
}
