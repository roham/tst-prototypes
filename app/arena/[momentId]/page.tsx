'use client';

import { use, useState, useEffect, useRef } from 'react';
import { getMoment, SALE_DURATION_MS, type Moment, type RarityTier } from '@/lib/mock-data';
import { useCountdown } from '@/lib/use-countdown';
import { usePrototypeState } from '@/lib/use-prototype-state';

/* ─── Constants ────────────────────────────────────────────────── */

const BUYER_NAMES = [
  'Mike J.', 'Sarah K.', 'James L.', 'Emma R.', 'Chris T.',
  'Ava M.', 'Noah P.', 'Mia D.', 'Liam W.', 'Olivia S.',
  'Ethan B.', 'Sophia C.', 'Mason H.', 'Isabella F.', 'Logan N.',
  'Charlotte G.', 'Aiden V.', 'Harper Q.', 'Lucas Z.', 'Ella Y.',
];

const CITIES = [
  'Miami', 'New York', 'LA', 'Chicago', 'Houston', 'Denver',
  'Atlanta', 'Boston', 'Phoenix', 'Dallas', 'Portland', 'Toronto',
  'Oakland', 'Detroit', 'Memphis', 'Charlotte', 'San Antonio',
];

function randomBuyer(): string {
  return BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
}

function randomCity(): string {
  return CITIES[Math.floor(Math.random() * CITIES.length)];
}

/* ─── Types ────────────────────────────────────────────────────── */

interface PurchaseEvent {
  id: string;
  name: string;
  city: string;
  edition: number;
}

/* ─── Confetti (CSS-only falling pieces) ───────────────────────── */

function Confetti({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 48 }, (_, i) => {
    const color = colors[i % colors.length];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;
    return (
      <div
        key={i}
        className="absolute rounded-sm"
        style={{
          left: `${left}%`,
          top: '-5%',
          width: `${size}px`,
          height: `${size * 0.6}px`,
          backgroundColor: color,
          opacity: 0.9,
          transform: `rotate(${rotation}deg)`,
          animation: `confetti-fall ${duration}s ease-in ${delay}s infinite`,
        }}
      />
    );
  });
  return <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">{pieces}</div>;
}

/* ─── Live Purchase Feed (horizontal scrolling pills) ──────────── */

function LiveFeed({ events, teamColor }: { events: PurchaseEvent[]; teamColor?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#0B0E14] to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#0B0E14] to-transparent" />
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3"
        style={{ scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {events.map((ev) => (
          <div
            key={ev.id}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs backdrop-blur-sm"
            style={{ animation: 'fadeSlideIn 0.4s ease-out' }}
          >
            {teamColor && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: teamColor }}
              />
            )}
            <span className="text-white/70">{ev.name}</span>
            <span className="text-white/30">{ev.city}</span>
            <span className="font-mono font-semibold text-[#00E5A0]">
              #{ev.edition.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Velocity Sparkline ──────────────────────────────────────── */

function VelocitySparkline({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const max = Math.max(...history, 1);
  const w = 60;
  const h = 20;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="mt-1.5 mx-auto" viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke="#00E5A0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Panic Banner ─────────────────────────────────────────────── */

function PanicBanner({ claimed, total, isCritical, isClosing }: {
  claimed: number;
  total: number;
  isCritical: boolean;
  isClosing: boolean;
}) {
  const pct = (claimed / total) * 100;
  const remaining = total - claimed;

  let copy: string | null = null;
  let color = '#F59E0B';

  if (isCritical || remaining < 200) {
    copy = `ALMOST GONE — ${remaining.toLocaleString()} LEFT`;
    color = '#EF4444';
  } else if (isClosing || pct >= 75) {
    copy = `SELLING FAST — ${remaining.toLocaleString()} REMAINING`;
    color = '#F59E0B';
  }

  if (!copy) return null;

  return (
    <div
      className="mx-4 mb-3 flex items-center justify-center gap-2 rounded-lg py-2 px-3"
      style={{
        backgroundColor: `${color}10`,
        border: `1px solid ${color}25`,
        animation: isCritical ? 'urgency-pulse-fast 0.5s ease-in-out infinite' : undefined,
      }}
    >
      <div
        className="h-1.5 w-1.5 rounded-full animate-pulse flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span
        className="text-[11px] font-bold uppercase tracking-[0.15em]"
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          color,
        }}
      >
        {copy}
      </span>
    </div>
  );
}

/* ─── Stats Bar (three-column real-time metrics) ───────────────── */

function StatsBar({
  claimed,
  total,
  minutes,
  seconds,
  totalSeconds,
  isClosing,
  isCritical,
  velocity,
  velocityHistory,
}: {
  claimed: number;
  total: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isClosing: boolean;
  isCritical: boolean;
  velocity: number;
  velocityHistory: number[];
}) {
  const pct = Math.min(100, (claimed / total) * 100);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-3 gap-3 px-4">
      {/* Claimed */}
      <div className="rounded-xl bg-white/[0.04] p-3">
        <div className="text-center">
          <span className="text-lg font-bold tabular-nums text-white">
            {claimed.toLocaleString()}
          </span>
          <span className="text-lg text-white/40"> / {total.toLocaleString()}</span>
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Claimed
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-[#00E5A0] transition-all duration-1000 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Countdown */}
      <div className="rounded-xl bg-white/[0.04] p-3">
        <div className="text-center">
          <span
            className={`text-lg font-bold font-mono tabular-nums ${
              isCritical
                ? 'text-red-400 animate-urgency-fast'
                : isClosing
                  ? 'text-amber-400 animate-urgency'
                  : 'text-white'
            }`}
          >
            {timeStr}
          </span>
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Remaining
        </p>
      </div>

      {/* Velocity */}
      <div className="rounded-xl bg-white/[0.04] p-3">
        <div className="text-center">
          <span className="text-lg font-bold tabular-nums text-[#00E5A0]">{velocity}</span>
          <span className="text-sm text-white/40">/min</span>
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Velocity
        </p>
        <VelocitySparkline history={velocityHistory} />
      </div>
    </div>
  );
}

/* ─── Rarity Tier Cards (horizontal scroll) ────────────────────── */

function RarityCards({ tiers }: { tiers: RarityTier[] }) {
  // Skip the Open tier — that's the main CTA
  const premiumTiers = tiers.filter((t) => t.tier !== 'Open');

  const tierColor: Record<string, string> = {
    Rare: '#3B82F6',
    Legendary: '#A855F7',
    Ultimate: '#F59E0B',
  };

  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {premiumTiers.map((tier) => {
        const color = tierColor[tier.tier] ?? '#6B7A99';
        return (
          <button
            key={tier.tier}
            className="group relative flex shrink-0 flex-col items-center rounded-xl border bg-white/[0.03] px-5 py-3 transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.97]"
            style={{ borderColor: `${color}40` }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
              style={{ boxShadow: `inset 0 0 20px ${color}20, 0 0 15px ${color}15` }}
            />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
              {tier.tier}
            </span>
            <span className="mt-1 text-lg font-bold text-white">${tier.price}</span>
            <span className="mt-0.5 text-[10px] text-white/40">
              {tier.remaining} left of {tier.size}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Celebration (Confirmed) Screen ───────────────────────────── */

function CelebrationScreen({
  editionNumber,
  total,
  moment,
  feedEvents,
  onReset,
}: {
  editionNumber: number;
  total: number;
  moment: Moment;
  feedEvents: PurchaseEvent[];
  onReset: () => void;
}) {
  const acquireTime = (1.5 + Math.random() * 3).toFixed(1);
  const percentile = Math.max(1, Math.round((1 - editionNumber / total) * 100));
  const [flash, setFlash] = useState(true);
  const [shake, setShake] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setShake(false), 500);
    const t1 = setTimeout(() => setFlash(false), 400);
    const t2 = setTimeout(() => setShowDetails(true), 700);
    const t3 = setTimeout(() => setShowShare(true), 1400);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0B0E14]"
      style={{
        animation: shake ? 'arena-rumble 0.5s ease-out' : undefined,
      }}
    >
      {/* Entry flash — team color, brighter for arena energy */}
      <div
        className="absolute inset-0 z-[60] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: moment.teamColors.primary,
          opacity: flash ? 0.35 : 0,
        }}
      />

      <Confetti
        colors={[
          '#00E5A0', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444',
          moment.teamColors.primary, moment.teamColors.secondary,
        ]}
      />

      {/* Team-color ambient glow — intensified */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 45%, ${moment.teamColors.primary}25 0%, transparent 65%)`,
        }}
      />

      {/* Player image backdrop — faint arena jumbotron feel */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${moment.actionImageUrl})`,
          backgroundPosition: 'center 30%',
          opacity: 0.06,
          filter: 'grayscale(0.5) contrast(1.2)',
        }}
      />

      <div className="relative z-50 flex flex-col items-center px-6">
        {/* YOU'RE IN — bigger, arena-jumbotron energy */}
        <div style={{ animation: 'bounceIn 0.6s ease-out' }}>
          <h1
            className="text-7xl uppercase tracking-tight text-white sm:text-8xl"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              textShadow: `0 0 50px rgba(0,229,160,0.4), 0 0 100px ${moment.teamColors.primary}40`,
            }}
          >
            YOU&apos;RE IN!
          </h1>
        </div>

        {/* Player name + play type */}
        <p
          className="mt-1 text-xl uppercase tracking-[0.12em] text-white/40"
          style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
        >
          {moment.player} · {moment.playType}
        </p>

        {/* Edition Jumbotron — with team-color glow */}
        <div
          className="mt-7 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] px-10 py-6 backdrop-blur-sm transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.92)',
            boxShadow: showDetails
              ? `0 0 60px ${moment.teamColors.primary}20, inset 0 1px 0 rgba(255,255,255,0.05)`
              : 'none',
          }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
            Your Edition
          </span>
          <span
            className="mt-1 text-7xl font-black tabular-nums sm:text-8xl arena-edition-glow"
            style={{
              color: '#00E5A0',
              textShadow: `0 0 30px rgba(0,229,160,0.4), 0 0 60px ${moment.teamColors.primary}30`,
            }}
          >
            #{editionNumber.toLocaleString()}
          </span>
          <span className="mt-2 text-sm text-white/35">
            of {total.toLocaleString()} editions
          </span>
        </div>

        {/* Competition stats — three columns */}
        <div
          className="mt-5 grid grid-cols-3 gap-4 text-center transition-all duration-500 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: '0.2s',
          }}
        >
          <div>
            <span className="block text-lg font-bold tabular-nums text-white/80">{acquireTime}s</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">Acquired</span>
          </div>
          <div>
            <span className="block text-lg font-bold tabular-nums text-[#00E5A0]">Top {percentile}%</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">Speed</span>
          </div>
          <div>
            <span className="block text-lg font-bold tabular-nums text-white/80">#{editionNumber.toLocaleString()}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">Collector</span>
          </div>
        </div>

        {/* Share section */}
        <div
          className="mt-7 flex flex-col items-center transition-all duration-500 ease-out"
          style={{
            opacity: showShare ? 1 : 0,
            transform: showShare ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* Primary share CTA */}
          <button className="rounded-full bg-[#00E5A0] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-95">
            Flex Your W
          </button>

          {/* Secondary share */}
          <div className="mt-3 flex items-center gap-3">
            <button className="rounded-full bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50 transition-colors hover:bg-white/10">
              Share on X
            </button>
            <button className="rounded-full bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50 transition-colors hover:bg-white/10">
              Copy Link
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={onReset}
            className="mt-4 text-[10px] text-white/20 hover:text-white/40 transition-colors"
          >
            Reset demo
          </button>
        </div>
      </div>

      {/* Feed continues at bottom — YOUR purchase highlighted */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        {/* Your purchase banner */}
        <div
          className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-lg py-2 px-3"
          style={{
            backgroundColor: `${moment.teamColors.primary}15`,
            border: `1px solid ${moment.teamColors.primary}30`,
          }}
        >
          <span className="text-[11px] font-bold text-[#00E5A0]">YOU</span>
          <span className="text-[11px] text-white/50">just claimed</span>
          <span className="text-[11px] font-mono font-bold text-[#00E5A0]">
            #{editionNumber.toLocaleString()}
          </span>
        </div>
        <div className="opacity-50">
          <LiveFeed events={feedEvents} teamColor={moment.teamColors.primary} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function ArenaPage({
  params,
}: {
  params: Promise<{ momentId: string }>;
}) {
  const { momentId } = use(params);
  const moment = getMoment(momentId);

  /* ── Hooks (called unconditionally) ─────────────────────────── */
  const countdown = useCountdown(SALE_DURATION_MS[momentId] ?? 12 * 60 * 1000);
  const proto = usePrototypeState(momentId);

  /* ── Live feed state ────────────────────────────────────────── */
  const [feedEvents, setFeedEvents] = useState<PurchaseEvent[]>([]);
  const editionCounter = useRef(moment?.editionsClaimed ?? 0);

  /* ── Animated metrics ───────────────────────────────────────── */
  const [liveVelocity, setLiveVelocity] = useState(14);
  const [viewers, setViewers] = useState(847);
  const [liveClaimed, setLiveClaimed] = useState(moment?.editionsClaimed ?? 0);
  const [recentBuyers, setRecentBuyers] = useState(23);
  const [shaking, setShaking] = useState(false);

  /* ── Feed simulation: add fake purchases every 2-5 seconds ── */
  useEffect(() => {
    if (!moment) return;

    const addPurchase = () => {
      editionCounter.current += 1;
      const newEvent: PurchaseEvent = {
        id: `${Date.now()}-${Math.random()}`,
        name: randomBuyer(),
        city: randomCity(),
        edition: editionCounter.current,
      };
      setFeedEvents((prev) => [...prev.slice(-9), newEvent]);
      setLiveClaimed((prev) => Math.min(prev + 1, moment.editionSize));
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
    };

    const firstTimeout = setTimeout(addPurchase, 1000);
    let next: ReturnType<typeof setTimeout>;
    const schedule = () => {
      next = setTimeout(() => {
        addPurchase();
        schedule();
      }, 2000 + Math.random() * 3000);
    };
    schedule();

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(next);
    };
  }, [moment]);

  /* ── Velocity jitter + history ──────────────────────────────── */
  const [velocityHistory, setVelocityHistory] = useState<number[]>([14]);
  useEffect(() => {
    if (!moment) return;
    const id = setInterval(() => {
      setLiveVelocity((v) => {
        const next = Math.max(1, v + Math.floor(Math.random() * 5) - 2);
        setVelocityHistory((h) => [...h.slice(-11), next]);
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [moment]);

  /* ── Viewer count jitter ────────────────────────────────────── */
  useEffect(() => {
    if (!moment) return;
    const id = setInterval(() => {
      setViewers((v) => Math.max(50, v + Math.floor(Math.random() * 11) - 4));
    }, 3000);
    return () => clearInterval(id);
  }, [moment]);

  /* ── Recent buyers jitter ───────────────────────────────────── */
  useEffect(() => {
    if (!moment) return;
    const id = setInterval(() => {
      setRecentBuyers((v) => Math.max(3, v + Math.floor(Math.random() * 7) - 2));
    }, 5000);
    return () => clearInterval(id);
  }, [moment]);

  /* ── Not found ──────────────────────────────────────────────── */
  if (!moment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] text-white/60">
        <p className="text-lg">Moment not found.</p>
      </div>
    );
  }

  /* ── Confirmed state → celebration ──────────────────────────── */
  if (proto.state === 'confirmed' && proto.editionNumber) {
    return (
      <CelebrationScreen
        editionNumber={proto.editionNumber}
        total={moment.editionSize}
        moment={moment}
        feedEvents={feedEvents}
        onReset={proto.reset}
      />
    );
  }

  /* ── Derive closing/critical from countdown phase ───────────── */
  const { isClosing, isCritical } = countdown;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0B0E14]">
      {/* ─── Animated background gradient pulse ─── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${moment.teamColors.primary}, transparent 60%), radial-gradient(ellipse at 80% 70%, ${moment.teamColors.secondary}, transparent 50%)`,
          opacity: 0.07,
          animation: 'bgPulse 4s ease-in-out infinite',
        }}
      />

      {/* ─── Fixed Header Bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0B0E14]/90 px-4 py-3 backdrop-blur-md">
        {/* LIVE badge */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live</span>
          </div>
        </div>

        {/* Logo */}
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Top Shot This
        </span>

        {/* Viewers */}
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="tabular-nums">{viewers.toLocaleString()} watching</span>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-12" />

      {/* ─── Moment Hero Section (40vh) ─── */}
      <section className="relative flex h-[40vh] min-h-[260px] flex-col justify-end overflow-hidden">
        {/* Gradient "thumbnail" */}
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
          backgroundSize: 'cover, cover',
          backgroundPosition: 'center top, center',
        }} />
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

        {/* Player info — jumbotron style */}
        <div className="relative z-10 px-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
              {moment.team} vs {moment.opponent}
            </span>
            <span className="rounded bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">
              {moment.playType}
            </span>
          </div>
          <h1
            className="mt-2 text-4xl uppercase leading-[0.9] tracking-tight text-white sm:text-5xl"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            {moment.player}
          </h1>
          <p
            className="mt-1.5 text-base font-medium text-white/70"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
          >
            {moment.statLine}
          </p>
          {/* Context line for emotional weight */}
          <p className="mt-1 text-xs text-white/30 tracking-wide">
            {moment.context}
          </p>
        </div>
      </section>

      {/* ─── Live Activity Feed ─── */}
      <LiveFeed events={feedEvents} teamColor={moment.teamColors.primary} />

      {/* ─── Stats Bar ─── */}
      <StatsBar
        claimed={liveClaimed}
        total={moment.editionSize}
        minutes={countdown.minutes}
        seconds={countdown.seconds}
        totalSeconds={countdown.totalSeconds}
        isClosing={isClosing}
        isCritical={isCritical}
        velocity={liveVelocity}
        velocityHistory={velocityHistory}
      />

      {/* ─── Panic Banner ─── */}
      <PanicBanner
        claimed={liveClaimed}
        total={moment.editionSize}
        isCritical={isCritical}
        isClosing={isClosing}
      />

      {/* ─── CTA Section ─── */}
      <div className="px-4 pt-1">
        <button
          onClick={proto.purchase}
          disabled={proto.state === 'purchasing'}
          className={`relative w-full rounded-xl py-4 text-base font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-wait ${
            proto.state === 'purchasing'
              ? 'bg-[#00E5A0]/60 text-black/60'
              : isCritical
                ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                : isClosing
                  ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : 'bg-[#00E5A0] text-black shadow-[0_0_30px_rgba(0,229,160,0.3)]'
          } ${isCritical && proto.state !== 'purchasing' ? 'animate-urgency-fast' : ''}`}
          style={shaking && proto.state === 'browsing' ? { animation: 'buttonShake 0.3s ease-in-out' } : undefined}
        >
          {proto.state === 'purchasing' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              SECURING YOUR MOMENT...
            </span>
          ) : isCritical ? (
            `LAST CHANCE — $${moment.price}`
          ) : (
            `OWN THIS MOMENT — $${moment.price}`
          )}
        </button>

        {/* Social proof */}
        <p className="mt-2 text-center text-xs text-white/40">
          &#128293; {recentBuyers} people bought in the last minute
        </p>
      </div>

      {/* ─── Rarity Tiers ─── */}
      <div className="mt-4">
        <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Premium Tiers
        </p>
        <RarityCards tiers={moment.rarityTiers} />
      </div>

      {/* Bottom safe area */}
      <div className="h-8" />

      {/* Keyframes in globals.css: fadeSlideIn, bounceIn, buttonShake, bgPulse */}
    </div>
  );
}
