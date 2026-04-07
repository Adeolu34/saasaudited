interface MetricBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

export default function MetricBar({
  label,
  value,
  maxValue = 10,
}: MetricBarProps) {
  const percentage = (value / maxValue) * 100;

  // Color based on percentage
  const barColor =
    percentage >= 80
      ? "from-[#8d4b00] to-[#b15f00]"
      : percentage >= 60
        ? "from-amber-500 to-amber-600"
        : "from-red-400 to-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase font-bold text-outline mb-1">
        <span>{label}</span>
        <span className="font-mono">
          {maxValue === 100 ? `${value}%` : `${value}/${maxValue}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full metric-bar-fill`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
