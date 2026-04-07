interface Feature {
  name: string;
  tool_a: string;
  tool_b: string;
  winner?: "a" | "b" | "tie";
}

interface ComparisonTableProps {
  toolAName: string;
  toolBName: string;
  features: Feature[];
}

export default function ComparisonTable({
  toolAName,
  toolBName,
  features,
}: ComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl ghost-border">
      <table className="w-full text-left font-body border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant/10">
            <th className="p-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
              Capability
            </th>
            <th className="p-6 font-headline text-xl font-bold">
              {toolAName}
            </th>
            <th className="p-6 font-headline text-xl font-bold">
              {toolBName}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/5">
          {features.map((f, i) => (
            <tr
              key={f.name}
              className={
                i % 2 === 0 ? "bg-surface" : "bg-surface-container-low/30"
              }
            >
              <td className="p-6 font-medium">{f.name}</td>
              <td className="p-6">
                {f.winner === "a" && (
                  <span className="material-symbols-outlined text-green-600 mr-2 align-middle">
                    check_circle
                  </span>
                )}
                <span
                  className={`text-sm ${f.winner === "a" ? "font-medium" : "text-on-surface-variant"}`}
                >
                  {f.tool_a}
                </span>
              </td>
              <td className="p-6">
                {f.winner === "b" && (
                  <span className="material-symbols-outlined text-green-600 mr-2 align-middle">
                    check_circle
                  </span>
                )}
                <span
                  className={`text-sm ${f.winner === "b" ? "font-medium" : "text-on-surface-variant"}`}
                >
                  {f.tool_b}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
