interface MetricComparisonRowProps {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
  maxValue?: number;
}

export default function MetricComparisonRow({
  label,
  valueA,
  valueB,
  nameA,
  nameB,
  maxValue = 100,
}: MetricComparisonRowProps) {
  const pctA = (valueA / maxValue) * 100;
  const pctB = (valueB / maxValue) * 100;
  const winnerA = valueA > valueB;
  const winnerB = valueB > valueA;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-semibold text-on-surface">{label}</span>
      </div>
      <div className="space-y-2">
        {/* Tool A */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-on-surface-variant w-24 truncate">
            {nameA}
          </span>
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                winnerA ? "ember-gradient" : "bg-on-surface-variant/30"
              }`}
              style={{ width: `${pctA}%` }}
            />
          </div>
          <span
            className={`text-xs font-mono w-10 text-right ${winnerA ? "font-bold text-primary" : "text-on-surface-variant"}`}
          >
            {valueA}%
          </span>
        </div>
        {/* Tool B */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-on-surface-variant w-24 truncate">
            {nameB}
          </span>
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                winnerB ? "ember-gradient" : "bg-on-surface-variant/30"
              }`}
              style={{ width: `${pctB}%` }}
            />
          </div>
          <span
            className={`text-xs font-mono w-10 text-right ${winnerB ? "font-bold text-primary" : "text-on-surface-variant"}`}
          >
            {valueB}%
          </span>
        </div>
      </div>
    </div>
  );
}
