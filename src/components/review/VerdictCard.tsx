interface VerdictCardProps {
  verdict: string;
}

export default function VerdictCard({ verdict }: VerdictCardProps) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-8 rounded-r-xl mb-12 shadow-sm">
      <span className="text-[11px] font-bold tracking-[0.2em] text-amber-700 uppercase block mb-3">
        Our Verdict
      </span>
      <p className="text-on-background text-lg leading-relaxed font-medium italic">
        &ldquo;{verdict}&rdquo;
      </p>
    </div>
  );
}
