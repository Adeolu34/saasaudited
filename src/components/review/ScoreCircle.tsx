interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function ScoreCircle({
  score,
  size = "md",
  label,
}: ScoreCircleProps) {
  const sizes = {
    sm: { w: 96, r: 40, sw: 8, text: "text-2xl" },
    md: { w: 128, r: 58, sw: 8, text: "text-3xl" },
    lg: { w: 192, r: 88, sw: 12, text: "text-5xl" },
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 10) * circumference;
  const center = s.w / 2;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: s.w, height: s.w }}
        role="img"
        aria-label={`Score: ${score.toFixed(1)} out of 10${label ? ` - ${label}` : ""}`}
      >
        <svg className="w-full h-full -rotate-90" aria-hidden="true">
          <circle
            className="text-surface-container-high"
            cx={center}
            cy={center}
            r={s.r}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={s.sw}
          />
          <circle
            className="text-primary transition-all duration-1000"
            cx={center}
            cy={center}
            r={s.r}
            fill="transparent"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth={s.sw + (size === "lg" ? 4 : 0)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono ${s.text} font-bold text-on-surface`}>
            {score.toFixed(1)}
          </span>
          {label && (
            <span className="font-mono text-[10px] text-on-surface-variant tracking-widest uppercase">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
