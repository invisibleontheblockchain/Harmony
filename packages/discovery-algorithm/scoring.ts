export function computeFinalScore(params: {
  audioSim: number;
  alsScore: number;
  genreMatch: number;
  freshness: number;
  popularityPenalty: number;
  weights?: {
    audio?: number;
    als?: number;
    genre?: number;
    freshness?: number;
    popularity?: number;
  };
}): number {
  const w = {
    audio: params.weights?.audio ?? 0.35,
    als: params.weights?.als ?? 0.25,
    genre: params.weights?.genre ?? 0.25,
    freshness: params.weights?.freshness ?? 0.10,
    popularity: params.weights?.popularity ?? 0.05,
  };
  return (
    w.audio * params.audioSim +
    w.als * params.alsScore +
    w.genre * params.genreMatch +
    w.freshness * params.freshness -
    w.popularity * params.popularityPenalty
  );
}

export function applySerendipity(
  ranked: Array<{ genre_l2?: string; score: number }>,
  nFinal = 50,
): Array<{ genre_l2?: string; score: number; is_serendipity?: boolean }> {
  const nSerendipity = Math.max(1, Math.floor(nFinal * 0.10));
  const nStandard = nFinal - nSerendipity;
  const standard = ranked.slice(0, nStandard);
  const primaryGenres = new Set(standard.map((t) => t.genre_l2).filter(Boolean));
  // In a real system, adjacent genres come from genre_graph_edges.
  // Here we just inject low-scoring tracks as a placeholder.
  const serendipityPool = ranked
    .slice(nStandard)
    .filter((t) => !primaryGenres.has(t.genre_l2))
    .slice(0, nSerendipity * 3);
  const picks = serendipityPool.slice(0, nSerendipity);
  const final = [...standard];
  picks.forEach((pick, i) => {
    const pos = (i + 1) * Math.floor(nStandard / nSerendipity);
    final.splice(Math.min(pos, final.length), 0, { ...pick, is_serendipity: true });
  });
  return final.slice(0, nFinal);
}
