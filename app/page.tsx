import Link from "next/link";

const DIRECTIONS = [
  {
    slug: "supreme",
    name: "Supreme",
    tagline: "The page IS the purchase.",
    description:
      "Minimal, high-fashion product drop. Every pixel earns its place. The moment sells itself.",
    gradient: "from-white/5 to-white/[0.02]",
    accentColor: "#F0F2F5",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 opacity-40"
        stroke="currentColor"
        strokeWidth={1}
      >
        <rect x="8" y="8" width="32" height="32" rx="2" />
        <line x1="8" y1="24" x2="40" y2="24" />
        <line x1="24" y1="8" x2="24" y2="40" />
      </svg>
    ),
  },
  {
    slug: "broadcast",
    name: "Broadcast",
    tagline: "You just witnessed history.",
    description:
      "Cinematic reveal. ESPN-grade storytelling meets purchase flow. Context makes the moment legendary.",
    gradient: "from-amber-500/10 to-orange-500/5",
    accentColor: "#F59E0B",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 opacity-40"
        stroke="currentColor"
        strokeWidth={1}
      >
        <circle cx="24" cy="24" r="4" />
        <path d="M16 16a12 12 0 0 1 16 0" />
        <path d="M12 12a18 18 0 0 1 24 0" />
        <path d="M32 32a12 12 0 0 1-16 0" />
        <path d="M36 36a18 18 0 0 1-24 0" />
      </svg>
    ),
  },
  {
    slug: "arena",
    name: "Arena",
    tagline: "You\u2019re courtside. Buy in the moment.",
    description:
      "Live social energy. Real-time crowd, live ticker, social proof everywhere. FOMO as a feature.",
    gradient: "from-emerald-500/10 to-teal-500/5",
    accentColor: "#00E5A0",
    icon: (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="w-12 h-12 opacity-40"
        stroke="currentColor"
        strokeWidth={1}
      >
        <ellipse cx="24" cy="34" rx="18" ry="8" />
        <path d="M6 34V14c0-4.4 8-8 18-8s18 3.6 18 8v20" />
        <ellipse cx="24" cy="14" rx="18" ry="8" />
      </svg>
    ),
  },
];

const MOMENTS = [
  { id: "bam", label: "Bam Adebayo", team: "MIA" },
  { id: "jokic", label: "Nikola Joki\u0107", team: "DEN" },
  { id: "sga", label: "Shai Gilgeous-Alexander", team: "OKC" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center pt-24 pb-16 px-6">
        <div className="relative">
          <h1
            className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter uppercase text-center leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Top Shot This
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-[#00E5A0]/10 via-transparent to-[#FF6B35]/10 blur-3xl -z-10" />
        </div>
        <p className="mt-6 text-lg sm:text-xl text-[#6B7A99] text-center max-w-lg">
          3 directions. Same moment. Which converts?
        </p>
      </header>

      {/* Direction Cards */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DIRECTIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}/bam`}
              className="group relative flex flex-col rounded-2xl border border-[#1E2A3D] bg-[#141925] overflow-hidden transition-all duration-300 hover:border-[#3D4B66] hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-black/40"
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${d.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <div className="relative flex flex-col p-8 flex-1">
                {/* Icon */}
                <div className="mb-8" style={{ color: d.accentColor }}>
                  {d.icon}
                </div>

                {/* Name */}
                <h2
                  className="text-3xl font-bold tracking-tight uppercase mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {d.name}
                </h2>

                {/* Tagline */}
                <p
                  className="text-base font-medium mb-4"
                  style={{ color: d.accentColor }}
                >
                  {d.tagline}
                </p>

                {/* Description */}
                <p className="text-sm text-[#6B7A99] leading-relaxed flex-1">
                  {d.description}
                </p>

                {/* CTA hint */}
                <div className="mt-8 flex items-center gap-2 text-sm text-[#3D4B66] group-hover:text-[#6B7A99] transition-colors">
                  <span>Explore direction</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Moment Switcher */}
        <div className="mt-16 flex flex-col items-center">
          <p className="text-xs uppercase tracking-widest text-[#3D4B66] mb-4">
            Switch Moment
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {MOMENTS.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#3D4B66]">{m.team}</span>
                <div className="flex gap-2">
                  {DIRECTIONS.map((d) => (
                    <Link
                      key={`${d.slug}-${m.id}`}
                      href={`/${d.slug}/${m.id}`}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[#1E2A3D] bg-[#141925] text-[#6B7A99] hover:text-[#F0F2F5] hover:border-[#3D4B66] transition-all"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
                <span className="text-sm text-[#6B7A99]">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-[#3D4B66]">
          Daemon-built prototype &middot; Cycle 1
        </p>
      </footer>
    </div>
  );
}
