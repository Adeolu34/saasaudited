interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-12">
      <div className="bg-[#F0FDF4] p-6 rounded-xl">
        <h4 className="text-green-800 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span> Pros
        </h4>
        <ul className="space-y-3 text-green-700 text-sm">
          {pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2">
              <span>•</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-[#FEF2F2] p-6 rounded-xl">
        <h4 className="text-red-800 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">cancel</span> Cons
        </h4>
        <ul className="space-y-3 text-red-600 text-sm">
          {cons.map((con) => (
            <li key={con} className="flex items-start gap-2">
              <span>•</span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
