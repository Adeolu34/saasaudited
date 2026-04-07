import ScrollReveal from "./ScrollReveal";
import NumberTicker from "./NumberTicker";

interface Stat {
  value: string;
  label: string;
}

export default function StatsBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-[#1C1917] py-20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left relative">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} direction="up" delay={i * 100}>
            <div>
              <NumberTicker
                value={stat.value}
                className="font-headline text-4xl text-stone-50 mb-2 block"
              />
              <p className="font-mono text-[12px] uppercase tracking-widest text-stone-500">
                {stat.label}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
