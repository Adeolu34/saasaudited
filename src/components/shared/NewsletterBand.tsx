import NewsletterForm from "./NewsletterForm";
import ScrollReveal from "./ScrollReveal";

export default function NewsletterBand() {
  return (
    <section id="newsletter" className="bg-stone-900 py-24 text-white overflow-hidden relative">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-primary/5 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

      {/* Decorative dot pattern */}
      <div className="absolute top-12 right-12 w-32 h-32 hidden lg:block">
        <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffb77d 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div>
              <span className="section-marker mb-6 block !text-stone-500 before:!bg-stone-500">
                Newsletter
              </span>
              <h2 className="font-headline text-5xl mb-6 leading-tight">
                Stay ahead
                <br />
                <span className="italic text-primary-fixed-dim">of the stack.</span>
              </h2>
              <p className="text-stone-400 text-lg max-w-md">
                Join 12,000+ CTOs and Product Managers who receive our monthly
                breakdown of the B2B landscape.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={150}>
            <div>
              <NewsletterForm />
              <p className="text-stone-500 text-xs mt-4">
                No spam. Unsubscribe anytime. 100% curated content.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
