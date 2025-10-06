import { motion } from 'framer-motion';

const heroImages = [
  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516734212186-a967f81ad520?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1525253013412-55c1a69a5738?auto=format&fit=crop&w=900&q=80'
];

const modules = [
  {
    title: 'Narrative Atelier',
    description:
      'Map each chapter of your pet’s story with guided prompts, milestone timelines, ambient audio, and sentiment cues—all in one editor.'
  },
  {
    title: 'Immersive Galleries',
    description:
      'Blend filmic stills, slow-motion video loops, and vellum-style typography to create a high-gloss memorial microsite in minutes.'
  },
  {
    title: 'Concierge Launch',
    description:
      'Our team handles hosting, share cards, and password-protected access so families experience only joy—not logistics.'
  }
];

const highlights = [
  {
    stat: '98% retention',
    copy: 'Clients who return annually for remembrance updates and new tributes.'
  },
  {
    stat: '< 36 hrs',
    copy: 'Average turnaround from story intake to a share-ready memorial preview.'
  },
  {
    stat: 'Global delivery',
    copy: 'Secure hosting, uptime SLAs, and concierge support across time zones.'
  }
];

const testimonials = [
  {
    quote:
      'The studio translated our grief into a cinematic experience that family and clients still talk about months later.',
    author: 'Everly Grace — Lumière Pet Care'
  },
  {
    quote: 'Every tribute feels couture. The editor is intuitive, and the concierge team is a dream to work with.',
    author: 'Noah James — Beyond the Collar'
  }
];

export function LandingHero() {
  return (
    <div className="space-y-28">
      <section className="relative overflow-hidden rounded-[44px] border border-white/8 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 p-10 text-slate-100 shadow-[0_80px_160px_-60px_rgba(15,23,42,0.85)] sm:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,234,212,0.18),transparent_55%)]" aria-hidden="true" />
        <div className="relative grid gap-14 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-8">
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.38em] text-slate-200">
                <img src="/logo.svg" alt="Four Paws Studio" className="h-7 w-7" />
                Four Paws Studio
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6, ease: 'easeOut' }}
              className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
            >
              Modern memorial design for discerning pet parents and luxury pet brands.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl text-base text-slate-300 sm:text-lg"
            >
              We merge boutique art direction, motion design, and a concierge publishing flow so every tribute feels like a bespoke
              keepsake. Sign in to sculpt your story—or let our studio team shape it alongside you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.6, ease: 'easeOut' }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Schedule your private onboarding
              </a>
              <a
                href="/memorials"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition hover:border-primary/60 hover:text-primary"
              >
                Browse signature memorials
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
              className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:grid-cols-3"
            >
              {highlights.map((item) => (
                <div key={item.stat} className="flex flex-col gap-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.stat}</p>
                  <p className="text-sm text-slate-300">{item.copy}</p>
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.6, ease: 'easeOut' }}
            className="relative grid grid-cols-2 gap-6"
          >
            {heroImages.map((src, index) => (
              <motion.figure
                key={src}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
                className={`group relative overflow-hidden rounded-[28px] border border-white/12 bg-slate-900/60 shadow-[0_35px_120px_-50px_rgba(15,23,42,0.85)] ${
                  index === 0 ? 'col-span-2 h-[360px] lg:h-[420px]' : 'h-[200px] lg:h-[260px]'
                }`}
              >
                <img src={src} alt="Cherished pet memory" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
              </motion.figure>
            ))}
            <div className="absolute -bottom-10 left-1/2 hidden max-w-xs -translate-x-1/2 rounded-2xl border border-primary/30 bg-slate-900/90 p-5 text-sm text-slate-200 shadow-lg shadow-primary/40 md:block">
              Families worldwide trust our studio to transform memories into artful digital heirlooms.
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.45 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {modules.map((module, index) => (
          <motion.article
            key={module.title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.5 }}
            viewport={{ once: true, amount: 0.6 }}
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-slate-200 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.75)] transition hover:border-primary/50"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-xl font-semibold text-white">{module.title}</h3>
            <p className="text-sm leading-6 text-slate-300">{module.description}</p>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.35 }}
        className="grid gap-10 rounded-[36px] border border-white/10 bg-slate-950/80 p-10 text-slate-100 shadow-[0_50px_140px_-80px_rgba(15,23,42,0.85)] lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]"
      >
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Why partner with us</p>
          <h2 className="text-3xl font-semibold text-white">Premium storytelling, modern technology, unwavering empathy.</h2>
          <p className="text-sm text-slate-300">
            You invest in unforgettable service—we deliver digital experiences that match. We’re the only pet memorial studio blending
            couture design, editorial strategy, and concierge implementation.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a
              href="mailto:studio@fourpaws.com"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-secondary/60 hover:text-secondary"
            >
              Request a bespoke proposal
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-secondary/90"
            >
              Start designing now
            </a>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-200">
              <p className="leading-6">“{testimonial.quote}”</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{testimonial.author}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
