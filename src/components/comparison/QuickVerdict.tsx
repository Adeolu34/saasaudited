interface QuickVerdictProps {
  nameA: string;
  nameB: string;
  scoreA: number;
  scoreB: number;
  category: string;
}

export default function QuickVerdict({
  nameA,
  nameB,
  scoreA,
  scoreB,
  category,
}: QuickVerdictProps) {
  const winner = scoreA >= scoreB ? nameA : nameB;
  const winnerScore = Math.max(scoreA, scoreB);
  const loserScore = Math.min(scoreA, scoreB);
  const diff = winnerScore - loserScore;
  const isTie = diff === 0;

  return (
    <div className="bg-inverse-surface rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-editorial">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-3xl">
            {isTie ? "handshake" : "workspace_premium"}
          </span>
        </div>
        <div>
          <h2 className="font-headline text-2xl text-inverse-on-surface font-semibold tracking-tight">
            {isTie ? "It\u2019s a tie!" : `Our pick: ${winner}`}
          </h2>
          <p className="text-surface-container-highest/60 text-sm">
            {isTie
              ? `Both tools score ${winnerScore.toFixed(1)}/10 in ${category}`
              : `Leads by ${diff.toFixed(1)} points in our ${category} ratings`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-10">
        <div className="text-center">
          <div className="font-mono text-primary-fixed-dim text-xl font-bold tracking-tighter">
            {winnerScore.toFixed(1)}/10
          </div>
          <div className="text-[10px] uppercase tracking-widest text-surface-container-highest/40 font-bold">
            {isTie ? "Both" : "Winner"}
          </div>
        </div>
        {!isTie && (
          <div className="text-center">
            <div className="font-mono text-surface-container-highest/60 text-xl tracking-tighter">
              {loserScore.toFixed(1)}/10
            </div>
            <div className="text-[10px] uppercase tracking-widest text-surface-container-highest/40 font-bold">
              Runner-up
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
