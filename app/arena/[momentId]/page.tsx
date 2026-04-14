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

/* ─── Confetti Cannon — arena-style burst from bottom corners ──── */
/* Real arena confetti cannons fire from the corners/edges of the    */
/* court. Pieces launch upward in a V-pattern, arc at apex, then    */
/* flutter down with gravity and drift. Each cannon fires a burst    */
/* with staggered timing for natural feel.                           */

function ConfettiCannon({ colors, teamColor }: { colors: string[]; teamColor: string }) {
  // 4 cannon positions: bottom-left, bottom-right, center-left, center-right
  const cannons = [
    { x: 5, angle: 65 },   // bottom-left, fires up-right
    { x: 95, angle: 115 },  // bottom-right, fires up-left
    { x: 20, angle: 75 },   // mid-left, fires up-right
    { x: 80, angle: 105 },  // mid-right, fires up-left
  ];

  const pieces = cannons.flatMap((cannon, ci) =>
    Array.from({ length: 16 }, (_, pi) => {
      const idx = ci * 16 + pi;
      const color = colors[idx % colors.length];
      // Spread angle around cannon direction (±25°)
      const spread = (Math.random() - 0.5) * 50;
      const launchAngle = cannon.angle + spread;
      // Convert to radians for trajectory
      const rad = (launchAngle * Math.PI) / 180;
      // Random launch power (determines arc height)
      const power = 60 + Math.random() * 40; // vh units
      const dx = Math.cos(rad) * power * 0.6; // horizontal distance
      const peakY = Math.sin(rad) * power; // vertical peak
      const size = 5 + Math.random() * 7;
      const delay = ci * 0.15 + Math.random() * 0.4; // stagger per cannon
      const duration = 2.2 + Math.random() * 1.5;
      const spin = 360 + Math.random() * 720;
      const isRibbon = Math.random() > 0.6; // some pieces are long ribbons

      return (
        <div
          key={idx}
          className="absolute rounded-sm"
          style={{
            left: `${cannon.x}%`,
            bottom: '0%',
            width: isRibbon ? `${size * 0.4}px` : `${size}px`,
            height: isRibbon ? `${size * 2.5}px` : `${size * 0.6}px`,
            backgroundColor: color,
            opacity: 0,
            // CSS custom properties for the keyframe
            ['--cannon-dx' as string]: `${dx}vw`,
            ['--cannon-peak' as string]: `${peakY}vh`,
            ['--cannon-spin' as string]: `${spin}deg`,
            animation: `arena-confetti-cannon ${duration}s cubic-bezier(0.2, 0.8, 0.3, 1) ${delay}s forwards`,
          }}
        />
      );
    })
  );

  // Also keep a lighter version of classic falling confetti for sustained effect
  const falling = Array.from({ length: 20 }, (_, i) => {
    const color = colors[i % colors.length];
    const left = 10 + Math.random() * 80;
    const delay = 1.5 + Math.random() * 2; // starts after cannons fire
    const duration = 2.5 + Math.random() * 2;
    const size = 5 + Math.random() * 6;
    return (
      <div
        key={`f${i}`}
        className="absolute rounded-sm"
        style={{
          left: `${left}%`,
          top: '-3%',
          width: `${size}px`,
          height: `${size * 0.5}px`,
          backgroundColor: color,
          opacity: 0.7,
          animation: `confetti-fall ${duration}s ease-in ${delay}s infinite`,
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces}
      {falling}
    </div>
  );
}

/* ─── Pyrotechnics — arena rafter mortar starbursts on W screen ── */

const PYRO_BURSTS = [
  { x: 18, y: 12, delay: 0.15, sparks: 14, size: 38 },
  { x: 78, y: 8, delay: 0.55, sparks: 16, size: 44 },
  { x: 35, y: 22, delay: 0.95, sparks: 12, size: 32 },
  { x: 65, y: 18, delay: 1.35, sparks: 14, size: 40 },
  { x: 50, y: 6, delay: 1.7, sparks: 18, size: 48 },
] as const;

function Pyrotechnics({ teamColor, secondaryColor }: { teamColor: string; secondaryColor: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[49] overflow-hidden">
      {PYRO_BURSTS.map((burst, bi) => (
        <div
          key={bi}
          className="absolute"
          style={{ left: `${burst.x}%`, top: `${burst.y}%` }}
        >
          {/* Core flash — white-hot center */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: '#fff',
              boxShadow: `0 0 12px #fff, 0 0 24px ${teamColor}`,
              animation: `arena-pyro-core 0.8s ease-out ${burst.delay}s both`,
            }}
          />
          {/* Radial spark lines */}
          {Array.from({ length: burst.sparks }).map((_, si) => {
            const angle = (360 / burst.sparks) * si;
            const isAccent = si % 3 === 0;
            return (
              <div
                key={si}
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  width: 2,
                  height: burst.size,
                  transformOrigin: '50% 0%',
                  transform: `rotate(${angle}deg)`,
                  animation: `arena-pyro-spark 0.9s ease-out ${burst.delay + si * 0.015}s both`,
                }}
              >
                <div
                  className="w-full rounded-full"
                  style={{
                    height: isAccent ? '60%' : '45%',
                    background: `linear-gradient(to bottom, ${isAccent ? secondaryColor : teamColor}, transparent)`,
                    boxShadow: `0 0 4px ${isAccent ? secondaryColor : teamColor}80`,
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
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
        {events.map((ev, i) => (
          <div
            key={ev.id}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs backdrop-blur-sm"
            style={{
              animation: 'fadeSlideIn 0.4s ease-out',
              boxShadow: i === events.length - 1 && teamColor ? `0 0 12px ${teamColor}30` : undefined,
            }}
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

/* ─── Crowd Reactions (floating emoji burst on purchases) ──────── */

const REACTION_EMOJIS = ['🔥', '💯', '🏀', '⚡', '🎯', '👀', '🙌', '💪'];

function CrowdReactions({ events }: { events: PurchaseEvent[] }) {
  const [reactions, setReactions] = useState<{ id: string; emoji: string; left: number; delay: number }[]>([]);

  useEffect(() => {
    if (events.length === 0) return;
    // Spawn 4-8 reactions per purchase event
    const count = 4 + Math.floor(Math.random() * 5);
    const batch = Array.from({ length: count }, (_, i) => ({
      id: `${events[events.length - 1].id}-r${i}`,
      emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)],
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.4,
    }));
    setReactions((prev) => [...prev.slice(-24), ...batch]);
  }, [events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pointer-events-none fixed inset-0 z-[25] overflow-hidden">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute bottom-16 text-xl"
          style={{
            left: `${r.left}%`,
            animation: `arena-reaction-float 1.8s ease-out ${r.delay}s forwards`,
            opacity: 0,
          }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

/* ─── Jumbotron Stat Counter (animated roll-up on page load) ───── */

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / durationMs, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function JumbotronStatLine({ statLine, teamColor }: { statLine: string; teamColor: string }) {
  const stats = statLine.split('/').map((s) => {
    const trimmed = s.trim();
    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    return match ? { value: parseInt(match[1], 10), label: match[2] } : { value: 0, label: trimmed };
  });

  return (
    <div className="flex items-baseline gap-1.5">
      <div
        className="h-[14px] w-[2px] rounded-full"
        style={{ backgroundColor: teamColor }}
      />
      {stats.map((stat, i) => (
        <span key={stat.label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="text-white/20 mx-1">/</span>}
          <CountUpNumber target={stat.value} />
          <span
            className="text-sm font-medium text-white/50 uppercase"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
          >
            {stat.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function CountUpNumber({ target }: { target: number }) {
  const displayValue = useCountUp(target, 1400);
  return (
    <span
      className="text-lg font-bold text-white/90 tabular-nums"
      style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 700 }}
    >
      {displayValue}
    </span>
  );
}

/* ─── Arena LED Flash — pulses team-color on each purchase ────── */

function ArenaLedFlash({ events, teamColor }: { events: PurchaseEvent[]; teamColor: string }) {
  const [flash, setFlash] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => {
    if (events.length > prevLen.current && prevLen.current > 0) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 350);
      prevLen.current = events.length;
      return () => clearTimeout(t);
    }
    prevLen.current = events.length;
  }, [events.length]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[20] transition-opacity duration-300"
      style={{
        opacity: flash ? 1 : 0,
        boxShadow: `inset 0 0 80px ${teamColor}18, inset 0 0 160px ${teamColor}08`,
      }}
    />
  );
}

/* ─── Arena Ribbon Board Pulse — 360° traveling color wave ──────── */
/* Every NBA arena with continuous LED ribbon boards fires a traveling  */
/* color burst when the home team scores. The light races the full     */
/* perimeter from the scoring end. We animate SVG stroke-dashoffset    */
/* to create a team-color light chasing around the page border.        */

function ArenaRibbonPulse({ events, teamColor }: { events: PurchaseEvent[]; teamColor: string }) {
  const [active, setActive] = useState(false);
  const prevLen = useRef(0);
  const rectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    if (events.length > prevLen.current && prevLen.current > 0) {
      // Only fire ~60% of purchases (alternate with other effects)
      if (Math.random() > 0.4) {
        prevLen.current = events.length;
        return;
      }
      setActive(true);
      // Restart animation by toggling
      if (rectRef.current) {
        rectRef.current.style.animation = 'none';
        rectRef.current.getBBox(); // force reflow for SVG
        rectRef.current.style.animation = '';
      }
      const t = setTimeout(() => setActive(false), 700);
      prevLen.current = events.length;
      return () => clearTimeout(t);
    }
    prevLen.current = events.length;
  }, [events.length]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[21]">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <rect
          ref={rectRef}
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          stroke={teamColor}
          strokeWidth="1.5"
          strokeDasharray="40 358"
          style={{
            filter: `drop-shadow(0 0 6px ${teamColor}) drop-shadow(0 0 12px ${teamColor}60)`,
            animation: 'arena-ribbon-chase 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        />
      </svg>
    </div>
  );
}

/* ─── Arena Flame Jets — pyrotechnic columns on purchases ─────── */
/* Simulates the flame effects that fire from scorer's tables during   */
/* big plays and player intros. Brief vertical fire burst from edges.  */

function ArenaFlameJets({ events, teamColor }: { events: PurchaseEvent[]; teamColor: string }) {
  const [active, setActive] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => {
    if (events.length > prevLen.current && prevLen.current > 0) {
      // Only fire ~50% of purchases for natural, non-overwhelming feel
      if (Math.random() > 0.5) {
        setActive(true);
        const t = setTimeout(() => setActive(false), 500);
        prevLen.current = events.length;
        return () => clearTimeout(t);
      }
    }
    prevLen.current = events.length;
  }, [events.length]);

  if (!active) return null;

  // 3 jets on each side (left + right), staggered timing
  const jets = [
    // Left side jets
    { side: 'left', offset: '2%', delay: 0, height: '28%' },
    { side: 'left', offset: '4.5%', delay: 40, height: '22%' },
    { side: 'left', offset: '7%', delay: 80, height: '18%' },
    // Right side jets
    { side: 'right', offset: '2%', delay: 20, height: '26%' },
    { side: 'right', offset: '4.5%', delay: 60, height: '24%' },
    { side: 'right', offset: '7%', delay: 100, height: '16%' },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[18] overflow-hidden">
      {jets.map((jet, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            [jet.side]: jet.offset,
            width: '8px',
            height: jet.height,
            background: `linear-gradient(to top, ${teamColor}00 0%, #FF6B35 15%, #F59E0B 40%, #FEC524 65%, rgba(255,255,255,0.7) 85%, transparent 100%)`,
            borderRadius: '4px 4px 0 0',
            filter: `blur(2px)`,
            animation: `arena-flame-jet 500ms cubic-bezier(0.16, 1, 0.3, 1) ${jet.delay}ms forwards`,
            boxShadow: `0 0 12px #FF6B3580, 0 0 24px ${teamColor}30`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Purchase Streak Counter — combo multiplier on rapid buys ── */

function usePurchaseStreak(events: PurchaseEvent[]) {
  const [streak, setStreak] = useState(0);
  const [visible, setVisible] = useState(false);
  const lastTime = useRef(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (events.length === 0) return;
    const now = Date.now();
    const gap = now - lastTime.current;
    lastTime.current = now;

    if (gap < 4000 && gap > 0) {
      // Rapid succession — streak!
      setStreak((s) => s + 1);
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setStreak(0), 400);
      }, 2500);
    } else {
      setStreak(1);
    }

    return () => clearTimeout(hideTimer.current);
  }, [events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return { streak, visible };
}

function StreakBadge({ streak, visible, teamColor }: { streak: number; visible: boolean; teamColor: string }) {
  if (streak < 2) return null;

  const label = streak >= 5 ? 'ON FIRE' : streak >= 3 ? 'STREAK' : 'COMBO';

  return (
    <div
      className="pointer-events-none fixed top-16 left-0 right-0 z-[30] flex justify-center transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
      }}
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm"
        style={{
          backgroundColor: streak >= 5 ? 'rgba(239,68,68,0.2)' : `${teamColor}20`,
          border: `1px solid ${streak >= 5 ? 'rgba(239,68,68,0.3)' : `${teamColor}30`}`,
          boxShadow: streak >= 5 ? '0 0 20px rgba(239,68,68,0.15)' : `0 0 16px ${teamColor}15`,
        }}
      >
        <span className="text-sm">{streak >= 5 ? '🔥' : '⚡'}</span>
        <span
          className="text-[12px] font-bold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: streak >= 5 ? '#EF4444' : teamColor,
          }}
        >
          {streak}x {label}
        </span>
      </div>
    </div>
  );
}

/* ─── Scoring Run Banner — basketball "5-0 RUN" momentum announcement ── */

function useScoringRun(events: PurchaseEvent[]) {
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(false);
  const timestamps = useRef<number[]>([]);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (events.length === 0) return;
    const now = Date.now();
    timestamps.current = [...timestamps.current.filter((t) => now - t < 10000), now];
    const rapid = timestamps.current.length;

    if (rapid >= 4) {
      setRun(rapid);
      setVisible(true);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setRun(0), 500);
      }, 3500);
    }

    return () => clearTimeout(hideTimer.current);
  }, [events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return { run, visible };
}

function ScoringRunBanner({ run, visible, teamColor }: { run: number; visible: boolean; teamColor: string }) {
  if (run < 4 && !visible) return null;

  return (
    <div
      className="pointer-events-none fixed top-28 left-0 right-0 z-[32] flex justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      <div
        className="flex items-center gap-3 rounded-lg px-5 py-2 backdrop-blur-md"
        style={{
          backgroundColor: `${teamColor}20`,
          border: `1px solid ${teamColor}35`,
          boxShadow: `0 0 24px ${teamColor}20, 0 4px 16px rgba(0,0,0,0.4)`,
          animation: visible ? 'arena-scoring-run-in 3.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
        }}
      >
        {/* Basketball icon */}
        <span className="text-base">🏀</span>
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-black tabular-nums"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: teamColor,
              textShadow: `0 0 12px ${teamColor}60`,
            }}
          >
            {run}-0
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            SCORING RUN
          </span>
        </div>
        {/* Momentum spark */}
        <span className="text-base">⚡</span>
      </div>
    </div>
  );
}

/* ─── Fast Break Banner — jumbotron velocity surge announcement ────── */
// When purchase velocity spikes >= 17, a "FAST BREAK" jumbotron graphic
// slides in from the right, holds briefly showing velocity + editions/min,
// then exits left. Cooldown 20s. Every NBA broadcast shows a "FAST BREAK"
// graphic when the pace accelerates — this is the purchase equivalent.

function useVelocitySurge(velocity: number, isEnded: boolean) {
  const [visible, setVisible] = useState(false);
  const [peakVelocity, setPeakVelocity] = useState(0);
  const lastShown = useRef(0);

  useEffect(() => {
    if (isEnded || velocity < 17) return;
    const now = Date.now();
    if (now - lastShown.current < 20_000) return;
    lastShown.current = now;
    setPeakVelocity(velocity);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(t);
  }, [velocity, isEnded]);

  return { visible, peakVelocity };
}

function FastBreakBanner({ visible, velocity, teamColor }: { visible: boolean; velocity: number; teamColor: string }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('done');

  useEffect(() => {
    if (visible) {
      setPhase('in');
      const t1 = setTimeout(() => setPhase('hold'), 500);
      const t2 = setTimeout(() => setPhase('out'), 2400);
      const t3 = setTimeout(() => setPhase('done'), 3200);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    setPhase('done');
  }, [visible]);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed left-0 right-0 z-[53] pointer-events-none flex justify-center"
      style={{ top: '28%' }}
    >
      <div
        className="relative overflow-hidden rounded-lg px-6 py-3"
        style={{
          background: `linear-gradient(135deg, ${teamColor}dd, ${teamColor}99)`,
          boxShadow: `0 0 40px ${teamColor}50, 0 0 80px ${teamColor}20, inset 0 1px 0 rgba(255,255,255,0.2)`,
          animation: phase === 'in'
            ? 'arena-fastbreak-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : phase === 'out'
              ? 'arena-fastbreak-out 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards'
              : undefined,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Light streak — sweeping highlight across the banner */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
        >
          <div
            className="absolute top-0 bottom-0 w-[30%]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation: phase === 'hold' ? 'arena-fastbreak-streak 1.2s ease-in-out 0.2s' : undefined,
            }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          {/* Lightning bolt icon */}
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="white">
            <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 01.12-.381z" />
          </svg>

          <div className="flex flex-col">
            <span
              className="text-sm font-bold uppercase tracking-[0.2em] text-white"
              style={{ fontFamily: 'var(--font-oswald), sans-serif', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              Fast Break
            </span>
            <span
              className="text-[10px] font-mono tabular-nums text-white/70 tracking-wider"
            >
              {velocity} editions/min
            </span>
          </div>

          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0 ml-1">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-white"
              style={{ animation: 'arena-fastbreak-pulse 0.8s ease-in-out infinite' }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Jumbotron Noise Prompt — "MAKE SOME NOISE" crowd engagement ─── */
// Triggers when velocity spikes >= 16, shows for 2.5s, cooldown 35s.
// Every arena fan has seen the jumbotron tell the crowd to get louder.

function useJumbotronNoise(velocity: number, isEnded: boolean) {
  const [visible, setVisible] = useState(false);
  const lastShown = useRef(0);

  useEffect(() => {
    if (isEnded || velocity < 16) return;
    const now = Date.now();
    if (now - lastShown.current < 35000) return;
    lastShown.current = now;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [velocity, isEnded]);

  return visible;
}

function JumbotronNoisePrompt({ visible, teamColor }: { visible: boolean; teamColor: string }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[36] pointer-events-none flex items-center justify-center"
      style={{
        animation: 'arena-noise-prompt 2.5s ease-out forwards',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Megaphone icon */}
        <span className="text-3xl" style={{ filter: `drop-shadow(0 0 12px ${teamColor})` }}>📣</span>
        <h2
          className="text-[clamp(2.5rem,10vw,5rem)] uppercase leading-[0.85] tracking-tight text-white text-center px-4"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            textShadow: `0 0 30px ${teamColor}, 0 0 60px ${teamColor}60, 0 4px 20px rgba(0,0,0,0.5)`,
          }}
        >
          Make Some<br />Noise!
        </h2>
        {/* Pulsing team-color underline */}
        <div
          className="h-[3px] w-32 rounded-full"
          style={{
            backgroundColor: teamColor,
            boxShadow: `0 0 12px ${teamColor}, 0 0 24px ${teamColor}60`,
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Crowd Noise Equalizer — mini bars suggesting live arena audio ── */

function CrowdNoiseEQ({ teamColor, isActive }: { teamColor: string; isActive: boolean }) {
  const bars = [
    { height: '60%', duration: '0.43s', delay: '0s' },
    { height: '80%', duration: '0.55s', delay: '0.12s' },
    { height: '45%', duration: '0.38s', delay: '0.07s' },
    { height: '70%', duration: '0.48s', delay: '0.18s' },
    { height: '50%', duration: '0.42s', delay: '0.05s' },
  ];

  return (
    <div className="flex items-end gap-[2px] h-3 w-[18px]" title="Arena crowd noise">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full transition-all duration-300"
          style={{
            height: isActive ? bar.height : '15%',
            backgroundColor: isActive ? teamColor : 'rgba(255,255,255,0.15)',
            animation: isActive ? `arena-eq-bar ${bar.duration} ease-in-out ${bar.delay} infinite` : 'none',
            opacity: isActive ? 0.7 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Arena Camera Flash — brief white burst simulating crowd cameras ── */

function ArenaCameraFlash({ events }: { events: PurchaseEvent[] }) {
  const [flash, setFlash] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => {
    if (events.length > prevLen.current && prevLen.current > 0) {
      // Only flash ~40% of the time for natural randomness
      if (Math.random() < 0.4) {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 80);
        prevLen.current = events.length;
        return () => clearTimeout(t);
      }
    }
    prevLen.current = events.length;
  }, [events.length]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[22] transition-opacity"
      style={{
        backgroundColor: 'white',
        opacity: flash ? 0.04 : 0,
        transitionDuration: flash ? '0ms' : '120ms',
      }}
    />
  );
}

/* ─── Crowd Energy Meter — jumbotron noise/decibel gauge ──────── */

const ENERGY_LEVELS = [
  { threshold: 0, label: 'QUIET', color: '#3D4B66' },
  { threshold: 4, label: 'BUILDING', color: '#6B7A99' },
  { threshold: 8, label: 'LOUD', color: '#F59E0B' },
  { threshold: 14, label: 'ROARING', color: '#FF6B35' },
  { threshold: 20, label: 'DEAFENING', color: '#EF4444' },
];

function CrowdEnergyMeter({ velocity, teamColor, isEnded }: { velocity: number; teamColor: string; isEnded: boolean }) {
  if (isEnded) return null;

  // Map velocity (0-30+) to fill percentage (5-100%)
  const fillPct = Math.min(100, Math.max(5, (velocity / 25) * 100));
  // Determine current energy level
  const level = [...ENERGY_LEVELS].reverse().find((l) => velocity >= l.threshold) ?? ENERGY_LEVELS[0];
  const isHot = velocity >= 14;

  return (
    <div className="mx-4 mt-2 mb-1">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/25"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Crowd Energy
          </span>
          {isHot && (
            <span
              className="h-[5px] w-[5px] rounded-full animate-ping"
              style={{ backgroundColor: level.color }}
            />
          )}
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-500"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: level.color,
            textShadow: isHot ? `0 0 8px ${level.color}40` : 'none',
          }}
        >
          {level.label}
        </span>
      </div>

      {/* Meter bar — segmented like a real decibel gauge */}
      <div className="flex gap-[2px] h-[8px] rounded-sm overflow-hidden bg-white/[0.03]">
        {Array.from({ length: 20 }).map((_, i) => {
          const segPct = ((i + 1) / 20) * 100;
          const isActive = segPct <= fillPct;
          // Color ramp: green → yellow → orange → red
          const segColor = i < 8 ? '#22c55e' : i < 12 ? '#F59E0B' : i < 16 ? '#FF6B35' : '#EF4444';
          return (
            <div
              key={i}
              className="flex-1 rounded-[1px] transition-all duration-500"
              style={{
                backgroundColor: isActive ? segColor : 'rgba(255,255,255,0.04)',
                opacity: isActive ? (isHot && i >= 14 ? undefined : 0.7) : 1,
                boxShadow: isActive && i >= 14 ? `0 0 4px ${segColor}40` : 'none',
                animation: isActive && isHot && i >= 16 ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Buyer Heat Map — mini US map with purchase dots ─────────── */

const CITY_COORDS: Record<string, [number, number]> = {
  'Miami': [251, 152], 'New York': [272, 58], 'LA': [28, 98],
  'Chicago': [200, 52], 'Houston': [162, 138], 'Denver': [118, 74],
  'Atlanta': [233, 112], 'Boston': [280, 46], 'Phoenix': [68, 112],
  'Dallas': [158, 122], 'Portland': [28, 28], 'Toronto': [242, 28],
  'Oakland': [20, 78], 'Detroit': [224, 48], 'Memphis': [198, 108],
  'Charlotte': [248, 96], 'San Antonio': [148, 140],
};

// Simplified continental US outline
const US_PATH = 'M24,18 L36,14 L52,12 L68,14 L82,10 L98,12 L118,14 L138,10 L160,12 L178,16 L196,14 L214,18 L230,20 L248,22 L260,28 L272,32 L280,38 L284,50 L278,62 L274,72 L270,82 L264,88 L258,96 L254,108 L256,120 L260,132 L252,146 L246,156 L238,158 L228,150 L218,142 L208,138 L196,134 L184,138 L172,144 L158,146 L144,142 L132,138 L120,130 L108,126 L96,120 L84,118 L72,116 L60,112 L48,108 L36,100 L28,92 L22,82 L18,70 L16,58 L18,46 L20,34 L24,18 Z';

interface HeatDot {
  id: string;
  x: number;
  y: number;
  age: number; // 0 = fresh, increments
}

function BuyerHeatMap({ events, teamColor, isEnded }: { events: PurchaseEvent[]; teamColor: string; isEnded: boolean }) {
  const [dots, setDots] = useState<HeatDot[]>([]);
  const prevLen = useRef(0);

  useEffect(() => {
    if (events.length > prevLen.current && prevLen.current > 0) {
      const ev = events[events.length - 1];
      const coords = CITY_COORDS[ev.city];
      if (coords) {
        // Add jitter so dots don't stack perfectly
        const jx = coords[0] + (Math.random() - 0.5) * 10;
        const jy = coords[1] + (Math.random() - 0.5) * 8;
        setDots((prev) => [
          ...prev.slice(-20),
          { id: ev.id, x: jx, y: jy, age: 0 },
        ]);
      }
    }
    prevLen.current = events.length;
  }, [events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Age out dots every 3 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => prev.map((d) => ({ ...d, age: d.age + 1 })).filter((d) => d.age < 4));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  if (isEnded) return null;

  return (
    <div className="mx-4 my-2 rounded-xl bg-white/[0.03] border border-white/[0.04] overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Live Buyers
        </span>
        <span className="text-[9px] tabular-nums text-white/20">
          {dots.length} recent
        </span>
      </div>
      <svg viewBox="0 0 300 170" className="w-full h-auto px-2 pb-2" style={{ maxHeight: '80px' }}>
        {/* US outline — very faint */}
        <path
          d={US_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        {/* Purchase dots */}
        {dots.map((dot) => {
          const opacity = dot.age === 0 ? 0.9 : dot.age === 1 ? 0.5 : dot.age === 2 ? 0.25 : 0.1;
          const r = dot.age === 0 ? 4 : 2.5;
          return (
            <g key={dot.id}>
              {/* Glow ring on fresh dots */}
              {dot.age === 0 && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={8}
                  fill="none"
                  stroke={teamColor}
                  strokeWidth={0.8}
                  opacity={0.3}
                >
                  <animate attributeName="r" from="4" to="12" dur="0.6s" fill="freeze" />
                  <animate attributeName="opacity" from="0.4" to="0" dur="0.6s" fill="freeze" />
                </circle>
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={r}
                fill={teamColor}
                opacity={opacity}
              >
                {dot.age === 0 && (
                  <animate attributeName="r" from="1" to={String(r)} dur="0.2s" fill="freeze" />
                )}
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
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
  isEnded,
  velocity,
  velocityHistory,
  teamColor,
}: {
  claimed: number;
  total: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isClosing: boolean;
  isCritical: boolean;
  isEnded: boolean;
  velocity: number;
  velocityHistory: number[];
  teamColor?: string;
}) {
  const pct = Math.min(100, (claimed / total) * 100);
  const timeStr = isEnded ? '00:00' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Clock tick pulse — dramatic per-second visual "tick" in CRITICAL phase
  const [clockTick, setClockTick] = useState(false);
  const prevSeconds = useRef(totalSeconds);
  useEffect(() => {
    if (isCritical && !isEnded && totalSeconds !== prevSeconds.current) {
      setClockTick(true);
      const t = setTimeout(() => setClockTick(false), 200);
      prevSeconds.current = totalSeconds;
      return () => clearTimeout(t);
    }
    prevSeconds.current = totalSeconds;
  }, [totalSeconds, isCritical, isEnded]);

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {/* Claimed */}
      <div className="relative rounded-xl bg-white/[0.04] p-3 overflow-hidden border border-white/[0.04]">
        {/* Scoreboard top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: isEnded ? 'rgba(255,255,255,0.1)' : (teamColor ?? '#00E5A0'), opacity: isEnded ? 1 : 0.6 }}
        />
        <div className="text-center">
          <span className={`text-lg font-bold tabular-nums ${isEnded ? 'text-white/50' : 'text-white'}`}>
            {claimed.toLocaleString()}
          </span>
          <span className="text-lg text-white/40"> / {total.toLocaleString()}</span>
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {isEnded ? 'Collected' : 'Claimed'}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isEnded ? 'bg-white/20' : isCritical ? 'bg-red-500' : 'bg-[#00E5A0]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Countdown — with shot clock ring */}
      <div className="relative rounded-xl bg-white/[0.04] p-3 overflow-hidden border border-white/[0.04]">
        {/* Scoreboard top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            backgroundColor: isEnded ? 'rgba(255,255,255,0.1)' : isCritical ? '#EF4444' : isClosing ? '#F59E0B' : (teamColor ?? '#00E5A0'),
            opacity: isEnded ? 1 : 0.6,
          }}
        />
        {/* Shot clock ring — circular countdown like NBA shot clock */}
        {!isEnded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="58" height="58" viewBox="0 0 58 58" className="transition-opacity duration-150" style={{ opacity: clockTick && isCritical ? 0.45 : 0.25 }}>
              <circle
                cx="29" cy="29" r="25"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
              />
              <circle
                cx="29" cy="29" r="25"
                fill="none"
                stroke={isCritical ? '#EF4444' : isClosing ? '#F59E0B' : (teamColor ?? '#00E5A0')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 25}`}
                strokeDashoffset={`${2 * Math.PI * 25 * (1 - Math.min(1, totalSeconds / ((12 * 60))))}`}
                transform="rotate(-90 29 29)"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                className={isCritical ? 'arena-shot-clock-critical' : ''}
              />
            </svg>
          </div>
        )}
        <div className="relative text-center">
          <span
            className={`font-bold font-mono tabular-nums transition-all ${
              isEnded
                ? 'text-lg text-white/25 duration-500'
                : isCritical
                  ? 'text-xl text-red-400 animate-urgency-fast'
                  : isClosing
                    ? 'text-lg text-amber-400 animate-urgency duration-500'
                    : 'text-lg text-white duration-500'
            }`}
            style={isCritical && !isEnded ? {
              transform: clockTick ? 'scale(1.12)' : 'scale(1)',
              textShadow: clockTick
                ? '0 0 12px rgba(239,68,68,0.8), 0 0 24px rgba(239,68,68,0.4)'
                : '0 0 4px rgba(239,68,68,0.3)',
              transition: clockTick
                ? 'transform 80ms cubic-bezier(0.16, 1, 0.3, 1), text-shadow 80ms ease-out'
                : 'transform 150ms ease-out, text-shadow 200ms ease-out',
            } : undefined}
          >
            {timeStr}
          </span>
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          {isEnded ? 'Closed' : 'Remaining'}
        </p>
      </div>

      {/* Velocity */}
      <div className="relative rounded-xl bg-white/[0.04] p-3 overflow-hidden border border-white/[0.04]">
        {/* Scoreboard top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: isEnded ? 'rgba(255,255,255,0.1)' : '#00E5A0', opacity: isEnded ? 1 : 0.6 }}
        />
        <div className="text-center">
          <span className={`text-lg font-bold tabular-nums ${isEnded ? 'text-white/25' : 'text-[#00E5A0]'}`}>
            {isEnded ? '—' : velocity}
          </span>
          {!isEnded && <span className="text-sm text-white/40">/min</span>}
        </div>
        <p className="mt-0.5 text-center text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Velocity
        </p>
        {!isEnded && <VelocitySparkline history={velocityHistory} />}
      </div>
    </div>
  );
}

/* ─── Rarity Tier Cards (selectable, all tiers) ────────────────── */

const TIER_COLOR: Record<string, string> = {
  Open: '#00E5A0',
  Rare: '#3B82F6',
  Legendary: '#A855F7',
  Ultimate: '#F59E0B',
};

/* ─── Live Bidder Indicators — other users "selecting" each tier ── */

function useTierBidders(tierCount: number) {
  // Seed per-tier bidder counts: Open has most, Ultimate fewest
  const baseCounts = useRef(
    Array.from({ length: tierCount }, (_, i) => Math.max(2, Math.floor(18 / (i + 1)) + Math.floor(Math.random() * 5)))
  );
  const [counts, setCounts] = useState<number[]>(baseCounts.current);

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) =>
        prev.map((c, i) => {
          const drift = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
          const min = i === 0 ? 5 : Math.max(1, 3 - i);
          return Math.max(min, c + drift);
        })
      );
    }, 2200 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  return counts;
}

function BidderDots({ count, color }: { count: number; color: string }) {
  const shown = Math.min(count, 5);
  return (
    <div className="flex items-center -space-x-1">
      {Array.from({ length: shown }, (_, i) => (
        <div
          key={i}
          className="h-[6px] w-[6px] rounded-full border border-[#0B0E14]"
          style={{
            backgroundColor: color,
            opacity: 0.4 + (i / shown) * 0.4,
            animation: `arena-bidder-pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      {count > 5 && (
        <span
          className="ml-0.5 text-[8px] font-bold tabular-nums"
          style={{ color, opacity: 0.5 }}
        >
          +{count - 5}
        </span>
      )}
    </div>
  );
}

function RarityCards({
  tiers,
  selectedIdx,
  onSelect,
  bidderCounts,
  isEnded,
}: {
  tiers: RarityTier[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  bidderCounts: number[];
  isEnded: boolean;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {tiers.map((tier, idx) => {
        const color = TIER_COLOR[tier.tier] ?? '#6B7A99';
        const isSelected = idx === selectedIdx;
        const isLow = tier.tier !== 'Open' && tier.remaining <= 5;
        const isUrgent = tier.tier !== 'Open' && tier.remaining <= 10;
        const bidders = bidderCounts[idx] ?? 0;

        return (
          <button
            key={tier.tier}
            onClick={() => onSelect(idx)}
            className={`group relative flex shrink-0 flex-col items-center rounded-xl border px-4 py-3 transition-all duration-200 active:scale-[0.97] min-w-[80px] ${
              isLow && isSelected ? 'arena-tier-urgent' : isSelected && !isEnded ? 'arena-tier-selected-glow' : ''
            }`}
            style={{
              borderColor: isSelected ? color : 'rgba(255,255,255,0.06)',
              backgroundColor: isSelected ? `${color}12` : 'rgba(255,255,255,0.03)',
              boxShadow: isSelected
                ? `0 0 20px ${color}20, inset 0 0 12px ${color}08`
                : 'none',
            }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-opacity duration-200"
              style={{
                backgroundColor: color,
                opacity: isSelected ? 1 : 0,
              }}
            />

            <span
              className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-200"
              style={{ color: isSelected ? color : 'rgba(255,255,255,0.35)' }}
            >
              {tier.tier}
            </span>
            <span className={`mt-1 text-lg font-bold tabular-nums transition-colors duration-200 ${
              isSelected ? 'text-white' : 'text-white/50'
            }`}>
              ${tier.price}
            </span>
            <span
              className={`mt-0.5 text-[10px] tabular-nums transition-colors duration-200 ${
                isLow ? 'font-semibold' : ''
              }`}
              style={{
                color: isLow ? '#EF4444' : isUrgent ? '#F59E0B' : 'rgba(255,255,255,0.3)',
              }}
            >
              {tier.tier === 'Open' ? `${tier.remaining.toLocaleString()} left` :
               isLow ? `${tier.remaining} LEFT!` :
               `${tier.remaining} of ${tier.size}`}
            </span>

            {/* Live bidder indicator — auction energy */}
            {!isEnded && bidders > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <BidderDots count={bidders} color={color} />
                <span
                  className="text-[8px] font-semibold uppercase tracking-wider tabular-nums"
                  style={{ color, opacity: 0.45 }}
                >
                  {bidders} selecting
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Celebration (Confirmed) Screen ───────────────────────────── */

/* ─── Crowd Decibel Meter — jumbotron noise level on W screen ── */
// Arena jumbotrons display noise/decibel meters to hype the crowd.
// This shows vertical EQ-style bars that spike on reveal, simulating
// the crowd's reaction to the collection announcement.

function DecibelMeter({ teamColor, show }: { teamColor: string; show: boolean }) {
  const barCount = 16;
  return (
    <div
      className="mt-4 flex items-end justify-center gap-[3px] h-8 transition-all duration-600 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scaleY(1)' : 'translateY(6px) scaleY(0.5)',
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const center = barCount / 2;
        const dist = Math.abs(i - center) / center;
        const height = show ? (1 - dist * 0.6) * 100 : 8;
        const isTeal = i >= Math.floor(center) - 2 && i <= Math.ceil(center) + 2;
        return (
          <div
            key={i}
            className="w-[4px] rounded-t-sm"
            style={{
              backgroundColor: isTeal ? '#00E5A0' : teamColor,
              height: `${height}%`,
              opacity: 0.3 + (1 - dist) * 0.4,
              transition: `height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.02}s, opacity 0.4s ease-out ${i * 0.02}s`,
              animation: show ? `arena-roar-idle ${1.4 + (i % 5) * 0.15}s ease-in-out ${0.6 + i * 0.02}s infinite` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Arena PA Announcement — typewriter text reveal ─────────── */
/* Every NBA arena has a PA announcer: "NOW ON THE COURT, NUMBER   */
/* 22..." This hook types out text character-by-character like the */
/* arena PA system announcing your collection to the crowd.        */

function usePATypewriter(text: string, startDelay: number, charSpeed = 35) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(delayTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) return;
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, charSpeed);
    return () => clearTimeout(timer);
  }, [started, displayed, text, charSpeed]);

  return { displayed, done: displayed.length >= text.length };
}

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
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const [flash, setFlash] = useState(true);
  const [shake, setShake] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // PA announcement typing — starts after headline bounce-in settles
  const paText = `NOW COLLECTING... ${moment.player.toUpperCase()} · ${moment.playType.toUpperCase()}`;
  const pa = usePATypewriter(paText, 800, 40);

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

      <ConfettiCannon
        colors={[
          '#00E5A0', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444',
          moment.teamColors.primary, moment.teamColors.secondary,
        ]}
        teamColor={moment.teamColors.primary}
      />

      {/* Pyrotechnic starbursts — arena rafter mortar effects */}
      <Pyrotechnics teamColor={moment.teamColors.primary} secondaryColor={moment.teamColors.secondary} />

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
        {/* Crowd roar EQ bars — spike behind the headline on reveal */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-32 pointer-events-none opacity-20"
          style={{ width: 'min(80%, 320px)' }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                backgroundColor: i >= 9 && i <= 14
                  ? '#00E5A0'
                  : moment.teamColors.primary,
                height: '8%',
                animation: `arena-roar-bar 1.2s ease-out ${i * 0.03}s forwards, arena-roar-idle ${1.4 + (i % 5) * 0.15}s ease-in-out ${1.2 + i * 0.03}s infinite`,
              }}
            />
          ))}
        </div>

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

        {/* PA Announcement — typewriter reveal like arena public address */}
        <p
          className="mt-2 text-sm uppercase tracking-[0.18em] text-white/35"
          style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500, minHeight: '1.4em' }}
        >
          <span>{pa.displayed}</span>
          {!pa.done && (
            <span
              className="inline-block w-[2px] h-[0.9em] ml-[2px] align-middle"
              style={{
                backgroundColor: moment.teamColors.primary,
                animation: 'arena-pa-cursor 0.6s step-end infinite',
                boxShadow: `0 0 4px ${moment.teamColors.primary}60`,
              }}
            />
          )}
        </p>

        {/* Crowd Decibel Meter — arena jumbotron noise level visualization */}
        <DecibelMeter teamColor={moment.teamColors.primary} show={showDetails} />

        {/* Jumbotron FAN CAM — edition card framed like arena big screen */}
        <div
          className="mt-7 relative transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.92)',
          }}
        >
          {/* FAN CAM badge — top-left corner like broadcast overlay */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              backgroundColor: 'rgba(239,68,68,0.9)',
              boxShadow: '0 0 12px rgba(239,68,68,0.4), 0 0 24px rgba(239,68,68,0.15)',
              animation: showDetails ? 'arena-fancam-badge 2s ease-in-out 0.3s infinite' : undefined,
            }}
          >
            <span className="relative flex h-[6px] w-[6px]">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-white" />
            </span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Fan Cam
            </span>
          </div>

          {/* Animated team-color border frame */}
          <div
            className="relative rounded-2xl p-[2px] overflow-hidden"
            style={{
              background: showDetails
                ? `conic-gradient(from 0deg, ${moment.teamColors.primary}, ${moment.teamColors.secondary ?? moment.teamColors.primary}, ${moment.teamColors.primary}, ${moment.teamColors.secondary ?? moment.teamColors.primary}, ${moment.teamColors.primary})`
                : 'transparent',
              animation: showDetails ? 'arena-fancam-border 3s linear infinite' : undefined,
            }}
          >
            {/* Inner card */}
            <div
              className="relative flex flex-col items-center rounded-2xl bg-[#0B0E14] px-10 py-6"
              style={{
                boxShadow: showDetails
                  ? `0 0 60px ${moment.teamColors.primary}20, inset 0 1px 0 rgba(255,255,255,0.05)`
                  : 'none',
              }}
            >
              {/* Camera viewfinder corners — 4 L-shaped brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 pointer-events-none border-t-2 border-l-2" style={{ borderColor: `${moment.teamColors.primary}80` }} />
              <div className="absolute top-2 right-2 w-4 h-4 pointer-events-none border-t-2 border-r-2" style={{ borderColor: `${moment.teamColors.primary}80` }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 pointer-events-none border-b-2 border-l-2" style={{ borderColor: `${moment.teamColors.primary}80` }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 pointer-events-none border-b-2 border-r-2" style={{ borderColor: `${moment.teamColors.primary}80` }} />

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
          </div>
        </div>

        {/* Matchup + date — screenshot permanence */}
        <div
          className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/25 transition-all duration-500 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transitionDelay: '0.15s',
          }}
        >
          <span>{moment.team} vs {moment.opponent}</span>
          <span className="text-white/10">·</span>
          <span className="font-mono tabular-nums">{dateStr}</span>
        </div>

        {/* Scoreboard Matchup Card — YOU vs FIELD jumbotron comparison */}
        <div
          className="mt-4 w-full max-w-[280px] transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
            transitionDelay: '0.2s',
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl border"
            style={{
              borderColor: `${moment.teamColors.primary}25`,
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            {/* Scoreboard header bar */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                background: `linear-gradient(90deg, ${moment.teamColors.primary}18, transparent, ${moment.teamColors.secondary}12)`,
                borderBottom: `1px solid ${moment.teamColors.primary}15`,
              }}
            >
              <span
                className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Matchup
              </span>
              <span
                className="text-[7px] font-mono uppercase tracking-wider"
                style={{ color: '#00E5A0', opacity: 0.6 }}
              >
                FINAL
              </span>
            </div>

            {/* Head-to-head comparison rows */}
            <div className="px-4 py-3">
              {/* Column headers */}
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: moment.teamColors.primary,
                    textShadow: `0 0 8px ${moment.teamColors.primary}40`,
                  }}
                >
                  YOU
                </span>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/20"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  vs
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/35"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  FIELD
                </span>
              </div>

              {/* Stat rows */}
              {[
                {
                  label: 'EDITION',
                  you: `#${editionNumber.toLocaleString()}`,
                  field: `#${Math.round(total * 0.52).toLocaleString()}`,
                  youWins: editionNumber < total * 0.52,
                },
                {
                  label: 'SPEED',
                  you: `${acquireTime}s`,
                  field: `${(3.2 + Math.random() * 2).toFixed(1)}s`,
                  youWins: parseFloat(acquireTime) < 3.5,
                },
                {
                  label: 'RANK',
                  you: `Top ${percentile}%`,
                  field: 'Top 50%',
                  youWins: percentile < 50,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="text-[12px] font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: row.youWins ? '#00E5A0' : 'rgba(255,255,255,0.5)',
                      textShadow: row.youWins ? '0 0 6px rgba(0,229,160,0.3)' : 'none',
                    }}
                  >
                    {row.you}
                  </span>
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/15"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="text-[12px] tabular-nums text-white/25"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {row.field}
                  </span>
                </div>
              ))}
            </div>

            {/* Winner bar — bottom accent */}
            <div
              className="flex items-center justify-center gap-2 py-2"
              style={{
                background: `linear-gradient(90deg, ${moment.teamColors.primary}10, rgba(0,229,160,0.08), ${moment.teamColors.primary}10)`,
                borderTop: `1px solid ${moment.teamColors.primary}15`,
              }}
            >
              <div
                className="h-[1px] w-4"
                style={{ backgroundColor: `${moment.teamColors.primary}30` }}
              />
              <span
                className="text-[8px] font-bold uppercase tracking-[0.3em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: '#00E5A0',
                  textShadow: '0 0 8px rgba(0,229,160,0.3)',
                }}
              >
                Winner
              </span>
              <div
                className="h-[1px] w-4"
                style={{ backgroundColor: `${moment.teamColors.primary}30` }}
              />
            </div>
          </div>
        </div>

        {/* Digital Ticket Stub — arena keepsake for screenshots */}
        <div
          className="mt-5 w-full max-w-[280px] transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
            transitionDelay: '0.25s',
          }}
        >
          <div
            className="relative overflow-hidden rounded-lg border border-white/[0.08]"
            style={{
              background: `linear-gradient(135deg, ${moment.teamColors.primary}12 0%, rgba(255,255,255,0.03) 50%, ${moment.teamColors.secondary}08 100%)`,
            }}
          >
            {/* Perforated edge — left side torn ticket effect */}
            <div className="absolute left-0 top-0 bottom-0 w-[6px] flex flex-col justify-center gap-[6px] overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[4px] w-[8px] rounded-full bg-[#0B0E14] -ml-[2px]" />
              ))}
            </div>
            {/* Team-color top accent */}
            <div
              className="h-[2px]"
              style={{ background: `linear-gradient(90deg, ${moment.teamColors.primary}, ${moment.teamColors.secondary ?? moment.teamColors.primary})` }}
            />
            <div className="px-4 pl-5 py-3">
              {/* Ticket header */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/20"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Event Ticket
                </span>
                <span
                  className="text-[7px] font-mono uppercase tracking-wider text-white/15"
                >
                  TST-{moment.id.slice(0, 4).toUpperCase()}-{editionNumber.toString().padStart(4, '0')}
                </span>
              </div>
              {/* Ticket body — 3 columns */}
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-white/20">Sec</span>
                  <span
                    className="block text-lg font-bold text-white/70 tabular-nums"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {(moment.id.charCodeAt(0) % 20) + 101}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-white/20">Row</span>
                  <span
                    className="block text-lg font-bold text-white/70"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {String.fromCharCode(65 + (moment.id.charCodeAt(1) % 8))}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] uppercase tracking-wider text-white/20">Seat</span>
                  <span
                    className="block text-lg font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: moment.teamColors.primary,
                    }}
                  >
                    {(moment.id.charCodeAt(2) % 24) + 1}
                  </span>
                </div>
              </div>
              {/* Divider */}
              <div className="mt-2 mb-2 border-t border-dashed border-white/[0.06]" />
              {/* Bottom row — stats */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] tabular-nums text-white/25">{acquireTime}s acquire</span>
                <span
                  className="text-[9px] font-bold tabular-nums"
                  style={{ color: '#00E5A0' }}
                >
                  Top {percentile}%
                </span>
                <span className="text-[9px] tabular-nums text-white/25">#{editionNumber.toLocaleString()}</span>
              </div>
            </div>
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

          {/* Secondary share — team-color hover */}
          <div className="mt-3 flex items-center gap-3">
            {[
              { label: 'Share on X', icon: '𝕏' },
              { label: 'Copy Link', icon: '⎘' },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50 transition-all duration-200 hover:text-white/70"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = `${moment.teamColors.primary}40`;
                  (e.currentTarget as HTMLElement).style.backgroundColor = `${moment.teamColors.primary}15`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                }}
              >
                <span className="text-[13px]">{icon}</span>
                {label}
              </button>
            ))}
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

/* ─── Arena Buzzer — red LED flash + FINAL overlay when drop ends ── */

function useArenaBuzzer(isEnded: boolean) {
  const [active, setActive] = useState(false);
  const wasEnded = useRef(isEnded);

  useEffect(() => {
    // Detect transition from not-ended → ended
    if (isEnded && !wasEnded.current) {
      setActive(true);
      const t = setTimeout(() => setActive(false), 2200);
      wasEnded.current = true;
      return () => clearTimeout(t);
    }
    wasEnded.current = isEnded;
  }, [isEnded]);

  return active;
}

function BuzzerOverlay({ active, teamColor }: { active: boolean; teamColor: string }) {
  if (!active) return null;

  return (
    <>
      {/* Red LED edge flash — mimics NBA backboard LED strips */}
      <div
        className="pointer-events-none fixed inset-0 z-[45]"
        style={{
          boxShadow: 'inset 0 0 100px rgba(239,68,68,0.5), inset 0 0 200px rgba(239,68,68,0.2)',
          animation: 'arena-buzzer-flash 2s ease-out forwards',
        }}
      />
      {/* Red border strips — top and bottom like LED scorer table */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 z-[46] h-[3px]"
        style={{
          backgroundColor: '#EF4444',
          animation: 'arena-buzzer-flash 2s ease-out forwards',
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-[46] h-[3px]"
        style={{
          backgroundColor: '#EF4444',
          animation: 'arena-buzzer-flash 2s ease-out forwards',
        }}
      />
      {/* FINAL text — jumbotron announcement */}
      <div
        className="pointer-events-none fixed inset-0 z-[47] flex items-center justify-center"
        style={{ animation: 'arena-buzzer-shake 0.5s ease-out' }}
      >
        <span
          className="text-6xl uppercase tracking-[0.15em] sm:text-7xl"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            color: '#EF4444',
            textShadow: '0 0 40px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.3)',
            animation: 'arena-buzzer-text 2.2s ease-out forwards',
          }}
        >
          FINAL
        </span>
      </div>
    </>
  );
}

/* ─── Arena Timeout — jumbotron "OFFICIAL TIMEOUT" on phase transitions ── */

function useArenaTimeout(totalSeconds: number) {
  type Phase = 'OPEN' | 'CLOSING' | 'CRITICAL' | 'ENDED';
  const deriveP = (s: number): Phase => {
    if (s <= 0) return 'ENDED';
    if (s <= 120) return 'CRITICAL';
    if (s <= 600) return 'CLOSING';
    return 'OPEN';
  };
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('');
  const prevPhase = useRef<Phase>('OPEN');

  useEffect(() => {
    const cur = deriveP(totalSeconds);
    const prev = prevPhase.current;
    prevPhase.current = cur;
    if (
      (prev === 'OPEN' && cur === 'CLOSING') ||
      (prev === 'CLOSING' && cur === 'CRITICAL')
    ) {
      setLabel(cur === 'CLOSING' ? 'OFFICIAL TIMEOUT' : '20 SECOND TIMEOUT');
      setActive(true);
      const t = setTimeout(() => setActive(false), 2000);
      return () => clearTimeout(t);
    }
  }, [totalSeconds]);

  return { active, label };
}

function TimeoutOverlay({ active, label, teamColor }: { active: boolean; label: string; teamColor: string }) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[38] flex items-center justify-center"
      style={{ animation: 'arena-timeout-in 2s ease-out forwards' }}
    >
      {/* Dark backdrop flash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(11,14,20,0.6)',
          animation: 'arena-timeout-backdrop 2s ease-out forwards',
        }}
      />
      {/* Jumbotron text */}
      <div className="relative flex flex-col items-center gap-2">
        <div
          className="h-[2px] w-16"
          style={{ backgroundColor: teamColor, animation: 'arena-timeout-line 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        />
        <span
          className="text-3xl uppercase tracking-[0.2em] sm:text-4xl"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            color: teamColor,
            textShadow: `0 0 40px ${teamColor}60, 0 0 80px ${teamColor}30`,
            animation: 'arena-timeout-text 2s ease-out forwards',
          }}
        >
          {label}
        </span>
        <div
          className="h-[2px] w-16"
          style={{ backgroundColor: teamColor, animation: 'arena-timeout-line 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        />
      </div>
    </div>
  );
}

/* ─── Arena Horn Shockwave — concentric rings on CRITICAL entry ───── */
/* The horn blast at the end of an NBA quarter — 3 expanding rings      */
/* emanate from center screen when countdown enters CRITICAL phase.     */
/* Distinct from the buzzer (fires at END) — this warns time is short.  */

function useHornShockwave(totalSeconds: number, isEnded: boolean) {
  const [active, setActive] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    // Fire once when entering CRITICAL (<=120s) from above
    if (!isEnded && totalSeconds <= 120 && totalSeconds > 0 && !firedRef.current) {
      firedRef.current = true;
      setActive(true);
      const t = setTimeout(() => setActive(false), 1800);
      return () => clearTimeout(t);
    }
  }, [totalSeconds, isEnded]);

  return active;
}

function HornShockwave({ active, teamColor }: { active: boolean; teamColor: string }) {
  if (!active) return null;

  const rings = [
    { delay: '0s', duration: '1.2s' },
    { delay: '0.15s', duration: '1.3s' },
    { delay: '0.3s', duration: '1.4s' },
  ];

  return (
    <>
      {/* Brief screen flash — horn blast concussion */}
      <div
        className="pointer-events-none fixed inset-0 z-[39]"
        style={{
          backgroundColor: teamColor,
          animation: 'arena-horn-flash 0.6s ease-out forwards',
        }}
      />
      {/* Concentric expanding rings */}
      <div className="pointer-events-none fixed inset-0 z-[39] flex items-center justify-center">
        {rings.map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '120px',
              height: '120px',
              border: `2px solid ${teamColor}`,
              boxShadow: `0 0 16px ${teamColor}50, inset 0 0 16px ${teamColor}20`,
              animation: `arena-horn-ring ${ring.duration} cubic-bezier(0.16, 1, 0.3, 1) ${ring.delay} forwards`,
              opacity: 0,
            }}
          />
        ))}
        {/* Center horn icon — brief flash */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            animation: 'arena-horn-flash 0.8s ease-out 0.1s forwards',
            opacity: 0.8,
          }}
        >
          <span
            className="text-2xl uppercase tracking-[0.3em] font-bold"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: teamColor,
              textShadow: `0 0 20px ${teamColor}, 0 0 40px ${teamColor}60`,
            }}
          >
            ⚠ 2:00
          </span>
        </div>
      </div>
    </>
  );
}

/* ─── Arena Court Lines — basketball half-court SVG background ───── */

function CourtLines({ teamColor, isEnded }: { teamColor: string; isEnded: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700"
      style={{ opacity: isEnded ? 0.015 : 0.035 }}
    >
      <svg
        viewBox="0 0 300 400"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '120%', height: '120%' }}
        fill="none"
        stroke={teamColor}
        strokeWidth="1"
      >
        {/* Half-court line */}
        <line x1="0" y1="200" x2="300" y2="200" opacity="0.6" />
        {/* Center circle */}
        <circle cx="150" cy="200" r="36" opacity="0.5" />
        {/* Center dot */}
        <circle cx="150" cy="200" r="3" fill={teamColor} opacity="0.4" />
        {/* Three-point arc (top half) */}
        <path d="M 22 0 L 22 140 A 120 120 0 0 0 278 140 L 278 0" opacity="0.3" />
        {/* Free throw box */}
        <rect x="100" y="0" width="100" height="140" rx="0" opacity="0.25" />
        {/* Free throw circle (top half visible) */}
        <path d="M 100 140 A 50 50 0 0 0 200 140" opacity="0.2" />
        {/* Baseline */}
        <line x1="0" y1="0" x2="300" y2="0" opacity="0.15" />
      </svg>
    </div>
  );
}

/* ─── Arena CO2 Fog — low-lying atmospheric haze like NBA player intros ── */
/* Every NBA arena fires CO2 fog machines during player introductions —     */
/* thick low-lying clouds that hug the court. Three staggered fog layers    */
/* drift at different speeds with team-color tinting, creating atmospheric  */
/* depth near the hero section bottom. Hidden when drop ends.              */

function ArenaCO2Fog({ teamColor, isActive }: { teamColor: string; isActive: boolean }) {
  if (!isActive) return null;

  const layers = [
    { animation: 'arena-fog-drift-1 14s ease-in-out infinite', bottom: '-2%', height: '28%', opacity: 0.06 },
    { animation: 'arena-fog-drift-2 18s ease-in-out infinite', bottom: '-4%', height: '22%', opacity: 0.04 },
    { animation: 'arena-fog-drift-3 11s ease-in-out infinite', bottom: '0%', height: '18%', opacity: 0.05 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {layers.map((layer, i) => (
        <div
          key={i}
          className="absolute left-[-15%] right-[-15%]"
          style={{
            bottom: layer.bottom,
            height: layer.height,
            background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${teamColor}${Math.round(layer.opacity * 255).toString(16).padStart(2, '0')} 0%, rgba(255,255,255,${layer.opacity * 0.6}) 30%, transparent 70%)`,
            filter: 'blur(20px)',
            animation: layer.animation,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Arena Laser Show — criss-crossing team-color laser beams in hero ── */

function ArenaLaserShow({ teamColor, isActive }: { teamColor: string; isActive: boolean }) {
  if (!isActive) return null;

  const beams = [
    { animation: 'arena-laser-sweep-1 7s cubic-bezier(0.4,0,0.6,1) infinite', top: '15%', delay: '0s' },
    { animation: 'arena-laser-sweep-2 9s cubic-bezier(0.4,0,0.6,1) infinite', top: '55%', delay: '2.5s' },
    { animation: 'arena-laser-sweep-3 8s cubic-bezier(0.4,0,0.6,1) infinite', top: '35%', delay: '4s' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[8] overflow-hidden">
      {beams.map((beam, i) => (
        <div
          key={i}
          className="absolute left-0 h-[1.5px]"
          style={{
            top: beam.top,
            width: '200%',
            background: `linear-gradient(90deg, transparent 0%, ${teamColor}08 15%, ${teamColor}30 45%, white 50%, ${teamColor}30 55%, ${teamColor}08 85%, transparent 100%)`,
            boxShadow: `0 0 6px ${teamColor}25, 0 0 12px ${teamColor}12`,
            animation: beam.animation,
            animationDelay: beam.delay,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Arena Gate Scan — ticket scan entrance overlay ────────────── */

function ArenaGateScan({ teamColor, seatLabel }: { teamColor: string; seatLabel: string }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setActive(false), 2100);
    return () => clearTimeout(t);
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0E14]"
      style={{ animation: 'arena-gate-exit 0.4s ease-in 1.7s forwards' }}
    >
      {/* Barcode pattern — thin vertical lines simulating ticket barcode */}
      <div
        className="absolute inset-x-[15%] top-[38%] bottom-[38%] flex items-center justify-center gap-[3px] opacity-0"
        style={{ animation: 'arena-gate-bars 1.2s ease-out 0.1s forwards' }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="h-full rounded-[0.5px]"
            style={{
              width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '1px' : '2px',
              backgroundColor: `rgba(255,255,255,${0.04 + (i % 4) * 0.015})`,
            }}
          />
        ))}
      </div>

      {/* Scan line — sweeps top to bottom */}
      <div
        className="absolute left-0 right-0 h-[3px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${teamColor}80 25%, ${teamColor} 50%, ${teamColor}80 75%, transparent 95%)`,
          boxShadow: `0 0 16px ${teamColor}60, 0 0 40px ${teamColor}30`,
          animation: 'arena-gate-scan 0.8s ease-in-out forwards',
        }}
      />

      {/* Flash on scan complete */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: teamColor,
          animation: 'arena-gate-flash 0.5s ease-out 0.75s forwards',
        }}
      />

      {/* ACCESS GRANTED text */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 opacity-0"
        style={{ animation: 'arena-gate-text 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards' }}
      >
        {/* Checkmark circle */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-2"
          style={{ borderColor: teamColor }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 10.5L8.5 14L15 7"
              stroke={teamColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          className="text-xl font-bold uppercase"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            color: teamColor,
            textShadow: `0 0 20px ${teamColor}50, 0 0 40px ${teamColor}25`,
            letterSpacing: '0.25em',
          }}
        >
          Access Granted
        </span>
        <span
          className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/25"
        >
          {seatLabel}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Arena Shot Clock — 24-second basketball shot clock for purchase decisions.
// Every NBA possession has 24 seconds. When the user enters the tier
// selection zone, the shot clock starts ticking. If it expires, a brief
// "SHOT CLOCK VIOLATION" flash appears before resetting. Pure arena
// pressure — decide now, the clock is running.
// ---------------------------------------------------------------------------

function useShotClock(isActive: boolean, isEnded: boolean) {
  const [seconds, setSeconds] = useState(24);
  const [violation, setViolation] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive || isEnded) {
      setSeconds(24);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Violation! Flash then reset
          setViolation(true);
          setTimeout(() => {
            setViolation(false);
            setSeconds(24);
          }, 1800);
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, isEnded, violation]);

  return { seconds, violation };
}

function ArenaShotClock({
  seconds,
  violation,
  teamColor,
  isVisible,
}: {
  seconds: number;
  violation: boolean;
  teamColor: string;
  isVisible: boolean;
}) {
  if (!isVisible) return null;

  const isLow = seconds <= 5 && seconds > 0;
  // LED color: red on violation, amber when low, bright red-orange default (like real shot clock)
  const ledColor = violation
    ? '#FF1A1A'
    : isLow
      ? '#FF3300'
      : '#FF2200';
  const displayVal = violation ? '00' : String(seconds).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1.5 mb-2">
      {/* Shot clock housing — dark panel like backboard-mounted unit */}
      <div
        className="relative flex flex-col items-center rounded-lg border transition-all duration-300"
        style={{
          borderColor: violation
            ? 'rgba(255,26,26,0.5)'
            : 'rgba(255,255,255,0.06)',
          backgroundColor: '#0a0a0a',
          boxShadow: violation
            ? `0 0 24px rgba(255,26,26,0.3), inset 0 0 12px rgba(255,26,26,0.05)`
            : isLow
              ? `0 0 16px rgba(255,51,0,0.15)`
              : `0 0 8px rgba(0,0,0,0.5)`,
          padding: '6px 14px 5px',
        }}
      >
        {/* Ghost segments — unlit LED segments visible behind digits */}
        <div className="relative">
          <span
            className="font-mono text-[28px] font-black tabular-nums select-none"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'rgba(255,34,0,0.06)',
              letterSpacing: '0.08em',
            }}
            aria-hidden
          >
            88
          </span>
          {/* Lit digits — actual value */}
          <span
            className="absolute inset-0 font-mono text-[28px] font-black tabular-nums select-none transition-all duration-150"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: ledColor,
              letterSpacing: '0.08em',
              textShadow: `0 0 6px ${ledColor}80, 0 0 16px ${ledColor}50, 0 0 32px ${ledColor}25`,
              transform: isLow && !violation ? `scale(${1 + (seconds % 2 === 0 ? 0.03 : 0)})` : undefined,
            }}
          >
            {displayVal}
          </span>
        </div>
        {/* Label */}
        <span
          className="text-[6px] font-bold uppercase tracking-[0.3em] -mt-0.5"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: violation ? '#FF1A1A' : 'rgba(255,255,255,0.18)',
            textShadow: violation ? `0 0 8px rgba(255,26,26,0.4)` : 'none',
          }}
        >
          {violation ? 'VIOLATION' : 'SHOT CLOCK'}
        </span>
      </div>
    </div>
  );
}

/* ─── Collection Milestone Flash — jumbotron attendance celebration ─ */
// NBA arenas celebrate attendance milestones on the jumbotron — "TONIGHT'S
// 20,000TH FAN!" This fires when liveClaimed crosses round-number thresholds,
// showing a brief jumbotron-style banner. Frequent small milestones (every 25)
// keep the page feeling alive; larger milestones (100, 500) get bigger banners.

function useMilestoneFlash(claimed: number, startClaimed: number) {
  const [flash, setFlash] = useState<{ value: number; tier: 'small' | 'medium' | 'large' } | null>(null);
  const lastMilestone = useRef(startClaimed);

  useEffect(() => {
    if (claimed <= startClaimed) return;
    // Check milestones at every 25th edition
    const prev25 = Math.floor(lastMilestone.current / 25);
    const curr25 = Math.floor(claimed / 25);
    if (curr25 > prev25) {
      const milestoneVal = curr25 * 25;
      const tier = milestoneVal % 500 === 0 ? 'large' : milestoneVal % 100 === 0 ? 'medium' : 'small';
      setFlash({ value: milestoneVal, tier });
      lastMilestone.current = claimed;
      const t = setTimeout(() => setFlash(null), tier === 'large' ? 2800 : tier === 'medium' ? 2200 : 1600);
      return () => clearTimeout(t);
    }
    lastMilestone.current = claimed;
  }, [claimed, startClaimed]);

  return flash;
}

function MilestoneFlash({
  flash,
  teamColor,
}: {
  flash: { value: number; tier: 'small' | 'medium' | 'large' } | null;
  teamColor: string;
}) {
  if (!flash) return null;

  const isLarge = flash.tier === 'large';
  const isMedium = flash.tier === 'medium';

  return (
    <div
      className="fixed left-0 right-0 z-[54] flex items-center justify-center pointer-events-none"
      style={{
        top: isLarge ? '35%' : isMedium ? '18%' : '14%',
        animation: `arena-milestone-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      }}
    >
      <div
        className="flex flex-col items-center gap-1 rounded-xl px-6 py-3"
        style={{
          background: isLarge
            ? `linear-gradient(135deg, ${teamColor}E6, ${teamColor}99)`
            : isMedium
              ? `linear-gradient(135deg, ${teamColor}CC, ${teamColor}66)`
              : `${teamColor}55`,
          backdropFilter: 'blur(12px)',
          boxShadow: isLarge
            ? `0 0 40px ${teamColor}60, 0 0 80px ${teamColor}30, inset 0 1px 0 rgba(255,255,255,0.2)`
            : isMedium
              ? `0 0 24px ${teamColor}40, 0 0 48px ${teamColor}20`
              : `0 0 12px ${teamColor}30`,
          border: `1px solid ${isLarge ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {isLarge && (
          <span
            className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/80"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            🏀 Milestone
          </span>
        )}
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tabular-nums text-white ${
              isLarge ? 'text-3xl' : isMedium ? 'text-xl' : 'text-base'
            }`}
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              textShadow: isLarge
                ? '0 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.2)'
                : '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            {flash.value.toLocaleString()}
          </span>
          <span
            className={`font-bold uppercase tracking-wider text-white/90 ${
              isLarge ? 'text-sm' : isMedium ? 'text-xs' : 'text-[10px]'
            }`}
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Collected
          </span>
        </div>
        {isLarge && (
          <span className="text-[9px] text-white/60 tracking-wide">
            Another milestone reached tonight
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Crowd Reaction Bar — Whatnot/TikTok-style emoji reactions ──── */
/* Live commerce platforms (Whatnot, TikTok Shop, Twitch) show a     */
/* stream of emoji reactions from viewers — 🔥💰😱🏀 floating up     */
/* from the bottom of the video. This is the purchase-page equivalent */
/* creating "other people are excited" social proof near the CTA.     */

const REACTION_EMOJIS_OPEN = ['🔥', '💰', '🏀', '👀', '💪', '🙌', '⭐'];
const REACTION_EMOJIS_CLOSING = ['🔥', '😱', '⚡', '💰', '🏃', '⏰', '🚨'];
const REACTION_EMOJIS_CRITICAL = ['🚨', '😱', '🔥', '⚡', '💸', '😤', '🏆'];

function CrowdReactionBar({ teamColor, isCritical, isClosing }: { teamColor: string; isCritical: boolean; isClosing: boolean }) {
  const [reactions, setReactions] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const pool = isCritical ? REACTION_EMOJIS_CRITICAL : isClosing ? REACTION_EMOJIS_CLOSING : REACTION_EMOJIS_OPEN;
    // Faster reactions during urgency phases
    const minInterval = isCritical ? 300 : isClosing ? 600 : 900;
    const maxInterval = isCritical ? 800 : isClosing ? 1400 : 2200;

    let timer: ReturnType<typeof setTimeout>;
    const spawn = () => {
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      const x = 8 + Math.random() * 84; // 8-92% horizontal position
      const delay = Math.random() * 0.3;
      const id = ++idRef.current;
      setReactions(prev => {
        // Keep max 12 visible at a time
        const next = prev.length > 11 ? prev.slice(-11) : prev;
        return [...next, { id, emoji, x, delay }];
      });
      // Remove after animation completes
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== id));
      }, 2200);
      timer = setTimeout(spawn, minInterval + Math.random() * (maxInterval - minInterval));
    };
    timer = setTimeout(spawn, 200);
    return () => clearTimeout(timer);
  }, [isCritical, isClosing]);

  return (
    <div className="relative z-[1] mx-4 mt-1 mb-0 overflow-hidden" style={{ height: '32px' }}>
      {/* Faint label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-[7px] font-bold uppercase tracking-[0.4em] text-white/[0.06]"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Live Reactions
        </span>
      </div>
      {/* Floating emoji reactions */}
      {reactions.map(r => (
        <span
          key={r.id}
          className="absolute bottom-0 text-sm pointer-events-none"
          style={{
            left: `${r.x}%`,
            animation: `arena-reaction-float 2s ease-out ${r.delay}s both`,
            filter: `drop-shadow(0 0 4px ${teamColor}40)`,
          }}
        >
          {r.emoji}
        </span>
      ))}
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
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const tierBidders = useTierBidders(moment?.rarityTiers.length ?? 4);

  /* ── Live feed state ────────────────────────────────────────── */
  const [feedEvents, setFeedEvents] = useState<PurchaseEvent[]>([]);
  const editionCounter = useRef(moment?.editionsClaimed ?? 0);

  /* ── Purchase streak (combo multiplier on rapid buys) ──────── */
  const { streak, visible: streakVisible } = usePurchaseStreak(feedEvents);

  /* ── Scoring run (momentum banner on rapid purchase sequences) ── */
  const { run: scoringRun, visible: scoringRunVisible } = useScoringRun(feedEvents);

  /* ── Animated metrics ───────────────────────────────────────── */
  const [liveVelocity, setLiveVelocity] = useState(14);
  const [viewers, setViewers] = useState(847);
  const [liveClaimed, setLiveClaimed] = useState(moment?.editionsClaimed ?? 0);
  const milestoneFlash = useMilestoneFlash(liveClaimed, moment?.editionsClaimed ?? 0);
  const [recentBuyers, setRecentBuyers] = useState(23);
  const [shaking, setShaking] = useState(false);
  const [purchaseStage, setPurchaseStage] = useState(0); // 0=reserving, 1=processing, 2=secured
  const [activeBuyers, setActiveBuyers] = useState(Math.floor(Math.random() * 20) + 12);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

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

  /* ── Purchase stage progression (3 stages in 1.5s) ─────────── */
  useEffect(() => {
    if (proto.state !== 'purchasing') {
      setPurchaseStage(0);
      return;
    }
    const t1 = setTimeout(() => setPurchaseStage(1), 500);
    const t2 = setTimeout(() => setPurchaseStage(2), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [proto.state]);

  /* ── Active buyers jitter ─────────────────────────────────── */
  useEffect(() => {
    if (!moment) return;
    const id = setInterval(() => {
      setActiveBuyers((v) => Math.max(5, v + Math.floor(Math.random() * 5) - 2));
    }, 3500);
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

  /* ── Jumbotron noise prompt — "MAKE SOME NOISE" on velocity spike ── */
  const noisePromptVisible = useJumbotronNoise(liveVelocity, countdown.isEnded);

  /* ── Fast break banner — velocity surge jumbotron announcement ── */
  const { visible: fastBreakVisible, peakVelocity: fastBreakVelocity } = useVelocitySurge(liveVelocity, countdown.isEnded);

  /* ── Jumbotron instant replay entrance — fires once on mount ── */
  const [replayActive, setReplayActive] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setReplayActive(false), 2200);
    return () => clearTimeout(t);
  }, []);

  /* ── Arena buzzer — fires once when drop transitions to ended ── */
  const buzzerActive = useArenaBuzzer(countdown.isEnded);

  /* ── Arena timeout — jumbotron overlay on phase transitions ── */
  const { active: timeoutActive, label: timeoutLabel } = useArenaTimeout(countdown.totalSeconds);

  /* ── Horn shockwave — concentric rings when entering CRITICAL phase ── */
  const hornActive = useHornShockwave(countdown.totalSeconds, countdown.isEnded);

  /* ── Sticky CTA — show when main button scrolls out of view ── */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Shot clock — 24s basketball decision timer on tier section ── */
  const tierSectionRef = useRef<HTMLDivElement>(null);
  const [tierVisible, setTierVisible] = useState(false);
  useEffect(() => {
    const el = tierSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setTierVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const shotClock = useShotClock(
    tierVisible && !countdown.isEnded && proto.state === 'browsing',
    countdown.isEnded,
  );

  /* ── Timeout Called — jumbotron timeout overlay after browsing too long ── */
  const [timeoutCalled, setTimeoutCalled] = useState(false);
  const timeoutFiredRef = useRef(false);
  useEffect(() => {
    if (!tierVisible || countdown.isEnded || proto.state !== 'browsing' || timeoutFiredRef.current) return;
    const timer = setTimeout(() => {
      timeoutFiredRef.current = true;
      setTimeoutCalled(true);
      setTimeout(() => setTimeoutCalled(false), 2400);
    }, 15000); // 15s of viewing tiers without buying
    return () => clearTimeout(timer);
  }, [tierVisible, countdown.isEnded, proto.state]);

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
      {/* ─── Arena Gate Scan — ticket scan entrance overlay ─── */}
      <ArenaGateScan
        teamColor={moment.teamColors.primary}
        seatLabel={`SEC ${(moment.id.charCodeAt(0) % 20) + 101} · ROW ${String.fromCharCode(65 + (moment.id.charCodeAt(1) % 8))} · SEAT ${(moment.id.charCodeAt(2) % 24) + 1}`}
      />

      {/* ─── Crowd Reactions — floating emoji burst on purchases ─── */}
      {!countdown.isEnded && <CrowdReactions events={feedEvents} />}

      {/* ─── Arena LED flash — team-color edge pulse on each purchase ─── */}
      {!countdown.isEnded && <ArenaLedFlash events={feedEvents} teamColor={moment.teamColors.primary} />}

      {/* ─── Ribbon board pulse — 360° traveling color wave on purchases ─── */}
      {!countdown.isEnded && <ArenaRibbonPulse events={feedEvents} teamColor={moment.teamColors.primary} />}

      {/* ─── Camera flash — brief white burst simulating crowd cameras ─── */}
      {!countdown.isEnded && <ArenaCameraFlash events={feedEvents} />}

      {/* ─── Flame jets — pyrotechnic fire columns from edges on purchases ─── */}
      {!countdown.isEnded && <ArenaFlameJets events={feedEvents} teamColor={moment.teamColors.primary} />}

      {/* ─── Purchase streak badge — combo multiplier on rapid buys ─── */}
      {!countdown.isEnded && <StreakBadge streak={streak} visible={streakVisible} teamColor={moment.teamColors.primary} />}

      {/* ─── Scoring run banner — basketball momentum announcement ─── */}
      {!countdown.isEnded && <ScoringRunBanner run={scoringRun} visible={scoringRunVisible} teamColor={moment.teamColors.primary} />}

      {/* ─── Animated background gradient pulse ─── */}
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${moment.teamColors.primary}, transparent 60%), radial-gradient(ellipse at 80% 70%, ${moment.teamColors.secondary}, transparent 50%)`,
          opacity: countdown.isEnded ? 0.03 : 0.07,
          animation: countdown.isEnded ? undefined : 'bgPulse 4s ease-in-out infinite',
        }}
      />

      {/* ─── Arena crowd wave — horizontal light band sweeps across page ─── */}
      {!countdown.isEnded && (
        <div
          className="pointer-events-none fixed inset-0 z-[6] arena-crowd-wave"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${moment.teamColors.primary}06 45%, ${moment.teamColors.primary}10 50%, ${moment.teamColors.primary}06 55%, transparent 100%)`,
          }}
        />
      )}

      {/* ─── Critical vignette — red edge glow when time is almost up ─── */}
      {isCritical && !countdown.isEnded && (
        <div
          className="pointer-events-none fixed inset-0 z-[35] arena-critical-vignette"
          style={{
            boxShadow: 'inset 0 0 120px rgba(239,68,68,0.25), inset 0 0 60px rgba(239,68,68,0.15)',
          }}
        />
      )}

      {/* ─── Arena Buzzer — red LED flash + FINAL when drop ends ─── */}
      <BuzzerOverlay active={buzzerActive} teamColor={moment.teamColors.primary} />

      {/* ─── Arena Timeout — jumbotron overlay on phase transitions ─── */}
      <TimeoutOverlay active={timeoutActive} label={timeoutLabel} teamColor={moment.teamColors.primary} />

      {/* ─── Browsing Timeout — "TIMEOUT" flash after 15s viewing tiers without buying ─── */}
      {timeoutCalled && (
        <div className="pointer-events-none fixed inset-0 z-[39] flex items-center justify-center">
          {/* Full-screen team-color flash */}
          <div
            className="absolute inset-0 arena-timeout-flash"
            style={{ backgroundColor: moment.teamColors.primary }}
          />
          {/* Dark backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${moment.teamColors.primary}15 0%, rgba(11,14,20,0.85) 70%)`,
            }}
          />
          {/* Jumbotron graphic */}
          <div className="relative flex flex-col items-center gap-3 arena-timeout-overlay">
            {/* Whistle icon */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: `${moment.teamColors.primary}25`, border: `1px solid ${moment.teamColors.primary}40` }}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="12" r="4.5" stroke={moment.teamColors.primary} strokeWidth="1.5" />
                <path d="M11 8.5L17 4" stroke={moment.teamColors.primary} strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="12" r="1.5" fill={moment.teamColors.primary} opacity="0.6" />
              </svg>
            </div>
            {/* TIMEOUT text */}
            <span
              className="text-4xl uppercase tracking-[0.35em] sm:text-5xl"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                color: '#F0F2F5',
                textShadow: `0 0 30px ${moment.teamColors.primary}80, 0 0 60px ${moment.teamColors.primary}40, 0 2px 4px rgba(0,0,0,0.5)`,
              }}
            >
              TIMEOUT
            </span>
            {/* Subtext */}
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 400,
                color: `${moment.teamColors.primary}CC`,
              }}
            >
              Make your selection
            </span>
            {/* Team-color accent lines */}
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-10" style={{ backgroundColor: `${moment.teamColors.primary}60` }} />
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 8px ${moment.teamColors.primary}80` }} />
              <div className="h-[1px] w-10" style={{ backgroundColor: `${moment.teamColors.primary}60` }} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Jumbotron Noise Prompt — "MAKE SOME NOISE" on velocity spike ─── */}
      <JumbotronNoisePrompt visible={noisePromptVisible} teamColor={moment.teamColors.primary} />

      {/* ─── Horn Shockwave — concentric rings on CRITICAL phase entry ─── */}
      <HornShockwave active={hornActive} teamColor={moment.teamColors.primary} />

      {/* ─── Fast Break Banner — velocity surge jumbotron announcement ─── */}
      <FastBreakBanner visible={fastBreakVisible} velocity={fastBreakVelocity} teamColor={moment.teamColors.primary} />

      {/* ─── Collection Milestone Flash — jumbotron attendance celebration ─── */}
      {!countdown.isEnded && proto.state !== 'confirmed' && (
        <MilestoneFlash flash={milestoneFlash} teamColor={moment.teamColors.primary} />
      )}

      {/* ─── Fixed Header Bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0B0E14]/90 px-4 py-3 backdrop-blur-md">
        {/* LIVE / Phase badge */}
        <div className="flex items-center gap-2">
          {countdown.isEnded ? (
            <div className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white/30" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Ended</span>
            </div>
          ) : isCritical ? (
            <div className="relative flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 animate-urgency-fast">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Final seconds</span>
            </div>
          ) : isClosing ? (
            <div className="relative flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Closing soon</span>
            </div>
          ) : (
            <div className="relative flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Live now</span>
            </div>
          )}
        </div>

        {/* Logo */}
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
          Top Shot This
        </span>

        {/* Viewers + Crowd Noise EQ */}
        <div className="flex items-center gap-2.5 text-xs text-white/50">
          <CrowdNoiseEQ teamColor={moment.teamColors.primary} isActive={!countdown.isEnded} />
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="tabular-nums">{countdown.isEnded ? '—' : `${viewers.toLocaleString()} watching`}</span>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-12" />

      {/* ─── Moment Hero Section (40vh) ─── */}
      <section className="relative flex h-[40vh] min-h-[260px] flex-col justify-end overflow-hidden">
        {/* Action image — jumbotron replay layer */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000${replayActive ? ' arena-replay-hero' : ''}`}
          style={{
            backgroundImage: `url(${moment.actionImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            opacity: countdown.isEnded ? 0.04 : 0.08,
            filter: countdown.isEnded ? 'grayscale(0.8)' : 'grayscale(0.3) contrast(1.1)',
          }}
        />
        {/* Gradient "thumbnail" */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000${replayActive ? ' arena-replay-hero' : ''}`}
          style={{
            backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
            backgroundSize: 'cover, cover',
            backgroundPosition: 'center top, center',
            filter: countdown.isEnded ? 'grayscale(0.7) brightness(0.5)' : undefined,
          }}
        />
        {/* Jumbotron instant replay — VHS tracking line on entrance */}
        {replayActive && (
          <>
            <div
              className="pointer-events-none absolute left-0 right-0 z-[8] h-[4px] arena-replay-tracking"
              style={{
                background: `linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.6) 20%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.6) 80%, transparent 95%)`,
                boxShadow: '0 0 12px rgba(255,255,255,0.3), 0 0 24px rgba(255,255,255,0.1)',
              }}
            />
            <div
              className="pointer-events-none absolute top-4 right-3 z-[9] flex items-center gap-2 rounded px-3 py-1.5 arena-replay-badge"
              style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                border: `1px solid ${moment.teamColors.primary}50`,
              }}
            >
              <span
                className="h-[6px] w-[6px] rounded-full"
                style={{ backgroundColor: moment.teamColors.primary }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: moment.teamColors.primary,
                }}
              >
                Instant Replay
              </span>
            </div>
          </>
        )}
        {/* Arena spotlight sweep — cone of light panning across hero like intro light rig */}
        {!countdown.isEnded && (
          <div
            className="absolute top-0 bottom-0 z-[7] pointer-events-none"
            style={{
              width: '40%',
              background: `radial-gradient(ellipse 50% 100% at 50% 0%, ${moment.teamColors.primary}12 0%, ${moment.teamColors.primary}06 40%, transparent 70%)`,
              animation: 'arena-spotlight-sweep 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        )}
        {/* Arena laser show — criss-crossing team-color beams like NBA arena light rig */}
        <ArenaLaserShow teamColor={moment.teamColors.primary} isActive={!countdown.isEnded} />

        {/* Arena CO2 fog — low-lying atmospheric haze like NBA player intro fog machines */}
        <ArenaCO2Fog teamColor={moment.teamColors.primary} isActive={!countdown.isEnded} />

        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

        {/* Player info — jumbotron style */}
        <div className="relative z-10 px-4 pb-4">
          {/* Scoreboard-style ticker badges */}
          <div className="flex items-center gap-1.5">
            <span
              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${moment.teamColors.primary}30`,
                color: moment.teamColors.primary,
                borderLeft: `2px solid ${moment.teamColors.primary}`,
              }}
            >
              🔥 Moment of the Night
            </span>
            <span
              className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderLeft: `2px solid ${moment.teamColors.secondary}80`,
              }}
            >
              {moment.team} vs {moment.opponent}
            </span>
            <span
              className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/50 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              {moment.playType}
            </span>
          </div>
          {/* Player name — jumbotron LED scoreboard glow */}
          <div className="relative mt-2 inline-block">
            <h1
              className="text-4xl uppercase leading-[0.9] tracking-tight text-white sm:text-5xl"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                textShadow: countdown.isEnded
                  ? '0 2px 20px rgba(0,0,0,0.5)'
                  : `0 0 8px ${moment.teamColors.primary}90, 0 0 24px ${moment.teamColors.primary}50, 0 0 48px ${moment.teamColors.primary}25, 0 2px 20px rgba(0,0,0,0.5)`,
              }}
            >
              {moment.player}
            </h1>
            {/* LED board refresh scan line — single bright line sweeping through */}
            {!countdown.isEnded && (
              <div
                className="pointer-events-none absolute left-0 right-0 h-[2px] z-[1] arena-led-scan"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}60 30%, white 50%, ${moment.teamColors.primary}60 70%, transparent 100%)`,
                  boxShadow: `0 0 8px ${moment.teamColors.primary}40, 0 0 16px ${moment.teamColors.primary}20`,
                }}
              />
            )}
          </div>
          {/* Jumbotron stat counter — numbers roll up on page load */}
          <div className="mt-1.5">
            <JumbotronStatLine statLine={moment.statLine} teamColor={moment.teamColors.primary} />
          </div>
          {/* Context line — enhanced emotional weight */}
          <p className="mt-2 text-sm leading-relaxed text-white/50 tracking-wide">
            {moment.context}
          </p>
          {/* Punchy hype line from historical note */}
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/30 tracking-wide">
            {moment.historicalNote.split('.')[0]}.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-white/35">
            <span className="inline-block h-1 w-1 rounded-full bg-[#00E5A0] animate-pulse" />
            Trending #1 on Top Shot This
          </p>
          {/* Arena section badge — ticket stub grounding, you're in the building */}
          {!countdown.isEnded && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/15 px-1.5 py-0.5 rounded border border-white/[0.06] bg-white/[0.02]"
              >
                SEC {(moment.id.charCodeAt(0) % 20) + 101} · ROW {String.fromCharCode(65 + (moment.id.charCodeAt(1) % 8))} · SEAT {(moment.id.charCodeAt(2) % 24) + 1}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Team-color hero bottom rule — jumbotron segment divider */}
      <div className="px-4">
        <div
          className="h-[1px]"
          style={{
            background: `linear-gradient(90deg, ${moment.teamColors.primary}50, ${moment.teamColors.secondary ?? moment.teamColors.primary}30, transparent)`,
          }}
        />
      </div>

      {/* ─── Live Activity Feed / Post-Game Box Score ─── */}
      {countdown.isEnded ? (
        <div className="mx-4 mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          {/* Header bar — scoreboard style */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: `1px solid ${moment.teamColors.primary}15` }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ fontFamily: 'var(--font-oswald), sans-serif', color: moment.teamColors.primary }}
            >
              Post-Game Box Score
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/20">
              FINAL
            </span>
          </div>
          {/* Stats grid — 2×2 jumbotron numbers */}
          <div className="grid grid-cols-2 gap-[1px] bg-white/[0.03]">
            {[
              { label: 'Collected', value: liveClaimed.toLocaleString(), sub: `of ${moment.editionSize.toLocaleString()}` },
              { label: 'Peak Velocity', value: `${Math.max(...velocityHistory)}`, sub: 'per minute' },
              { label: 'Editions Left', value: `${Math.max(0, moment.editionSize - liveClaimed).toLocaleString()}`, sub: liveClaimed >= moment.editionSize ? 'SOLD OUT' : 'remaining' },
              { label: 'Buyers', value: `${feedEvents.length}+`, sub: 'collectors' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center py-3 bg-[#0B0E14]">
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/25">{stat.label}</span>
                <span
                  className="mt-1 text-2xl font-bold tabular-nums text-white"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {stat.value}
                </span>
                <span
                  className="mt-0.5 text-[9px] uppercase tracking-wider"
                  style={{ color: stat.sub === 'SOLD OUT' ? '#EF4444' : 'rgba(255,255,255,0.25)' }}
                >
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>
          {/* Bottom accent */}
          <div
            className="h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${moment.teamColors.primary}40, ${moment.teamColors.secondary ?? moment.teamColors.primary}20, transparent)`,
            }}
          />
        </div>
      ) : (
        <LiveFeed events={feedEvents} teamColor={moment.teamColors.primary} />
      )}

      {/* ─── Buyer Heat Map — geographic purchase visualization ─── */}
      <BuyerHeatMap events={feedEvents} teamColor={moment.teamColors.primary} isEnded={countdown.isEnded} />

      {/* ─── Crowd Energy Meter — jumbotron noise gauge ─── */}
      <CrowdEnergyMeter velocity={liveVelocity} teamColor={moment.teamColors.primary} isEnded={countdown.isEnded} />

      {/* ─── Stats Bar ─── */}
      <StatsBar
        claimed={liveClaimed}
        total={moment.editionSize}
        minutes={countdown.minutes}
        seconds={countdown.seconds}
        totalSeconds={countdown.totalSeconds}
        isClosing={isClosing}
        isCritical={isCritical}
        isEnded={countdown.isEnded}
        velocity={liveVelocity}
        velocityHistory={velocityHistory}
        teamColor={moment.teamColors.primary}
      />

      {/* ─── Possession Arrow — scorer's table LED indicator ─── */}
      {!countdown.isEnded && (
        <div className="flex items-center justify-center gap-2 py-1.5">
          <div className="h-[1px] w-6" style={{ backgroundColor: `${moment.teamColors.primary}20` }} />
          <div className="flex items-center gap-1.5">
            {/* LED arrow — glowing downward triangle */}
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className={isCritical ? 'animate-urgency-fast' : ''}
            >
              <path
                d="M1 1L6 7L11 1"
                stroke={isCritical ? '#EF4444' : isClosing ? '#F59E0B' : moment.teamColors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: `drop-shadow(0 0 4px ${isCritical ? 'rgba(239,68,68,0.6)' : isClosing ? 'rgba(245,158,11,0.5)' : `${moment.teamColors.primary}60`})`,
                }}
              />
            </svg>
            <span
              className="text-[7px] font-bold uppercase tracking-[0.3em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: isCritical ? '#EF4444' : isClosing ? '#F59E0B' : `${moment.teamColors.primary}60`,
                textShadow: isCritical
                  ? '0 0 6px rgba(239,68,68,0.4)'
                  : isClosing
                    ? '0 0 6px rgba(245,158,11,0.3)'
                    : 'none',
              }}
            >
              Your Possession
            </span>
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              className={isCritical ? 'animate-urgency-fast' : ''}
            >
              <path
                d="M1 1L6 7L11 1"
                stroke={isCritical ? '#EF4444' : isClosing ? '#F59E0B' : moment.teamColors.primary}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: `drop-shadow(0 0 4px ${isCritical ? 'rgba(239,68,68,0.6)' : isClosing ? 'rgba(245,158,11,0.5)' : `${moment.teamColors.primary}60`})`,
                }}
              />
            </svg>
          </div>
          <div className="h-[1px] w-6" style={{ backgroundColor: `${moment.teamColors.primary}20` }} />
        </div>
      )}

      {/* ─── Panic Banner / Final Drop Stats ─── */}
      {countdown.isEnded ? (
        <div className="mx-4 mt-2 mb-3 flex items-center justify-center gap-4 rounded-lg py-2.5 px-4 border border-white/[0.06] bg-white/[0.03]">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >Drop Stats</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[10px] tabular-nums text-white/35">
            {liveClaimed.toLocaleString()} collected
          </span>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[10px] tabular-nums text-white/35">
            Peak {Math.max(...velocityHistory)}/min
          </span>
        </div>
      ) : (
        <PanicBanner
          claimed={liveClaimed}
          total={moment.editionSize}
          isCritical={isCritical}
          isClosing={isClosing}
        />
      )}

      {/* ─── Arena Court Lines — basketball half-court behind transaction area ─── */}
      <div className="relative">
        <CourtLines teamColor={moment.teamColors.primary} isEnded={countdown.isEnded} />

      {/* ─── Crowd Chant Ticker — jumbotron fan chant text ─── */}
      {!countdown.isEnded && (
        <div className="mt-3 relative z-[1] overflow-hidden" style={{ height: '18px' }}>
          <div
            className="flex whitespace-nowrap"
            style={{
              animation: 'arena-chant-scroll 12s linear infinite',
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-6 px-6 text-[10px] font-bold uppercase tracking-[0.35em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: moment.teamColors.primary,
                  opacity: 0.15,
                  textShadow: `0 0 8px ${moment.teamColors.primary}30`,
                }}
              >
                <span>LET&apos;S GO {moment.team}</span>
                <span className="text-[6px]">👏</span>
                <span>LET&apos;S GO {moment.team}</span>
                <span className="text-[6px]">👏 👏</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Rarity Tiers — live auction selector ─── */}
      <div ref={tierSectionRef} className={`${countdown.isEnded ? 'mt-3' : 'mt-1'} relative z-[1]`}>
        <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Select Tier
        </p>
        <RarityCards
          tiers={moment.rarityTiers}
          selectedIdx={selectedTierIdx}
          onSelect={setSelectedTierIdx}
          bidderCounts={tierBidders}
          isEnded={countdown.isEnded}
        />
      </div>

      {/* ─── Shot Clock — 24s purchase decision timer ─── */}
      <ArenaShotClock
        seconds={shotClock.seconds}
        violation={shotClock.violation}
        teamColor={moment.teamColors.primary}
        isVisible={tierVisible && !countdown.isEnded && proto.state === 'browsing'}
      />

      {/* ─── Crowd Reaction Bar — live emoji reactions floating up from viewers ─── */}
      {!countdown.isEnded && proto.state === 'browsing' && (
        <CrowdReactionBar teamColor={moment.teamColors.primary} isCritical={isCritical} isClosing={isClosing} />
      )}

      {/* ─── CTA Section ─── */}
      <div className="px-4 pt-1">
        {/* Active buyers badge — live commerce energy */}
        {!countdown.isEnded && proto.state !== 'purchasing' && (
          <div className="mb-2 flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A0] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E5A0]" />
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-white/50">
              {activeBuyers} buying this tier now
            </span>
          </div>
        )}

        <button
          ref={ctaRef}
          onClick={countdown.isEnded ? undefined : proto.purchase}
          disabled={proto.state === 'purchasing' || countdown.isEnded}
          className={`relative w-full overflow-hidden rounded-xl py-4 text-base font-bold transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed ${
            countdown.isEnded
              ? 'bg-white/[0.06] text-white/30 cursor-not-allowed'
              : proto.state === 'purchasing'
                ? 'bg-[#00E5A0]/80 text-black cursor-wait'
                : isCritical
                  ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : isClosing
                    ? 'bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                    : 'bg-[#00E5A0] text-black shadow-[0_0_30px_rgba(0,229,160,0.3)]'
          } ${isCritical && !countdown.isEnded && proto.state !== 'purchasing' ? 'animate-urgency-fast' : ''}`}
          style={shaking && proto.state === 'browsing' && !countdown.isEnded ? { animation: 'buttonShake 0.3s ease-in-out' } : undefined}
        >
          {/* Multi-stage progress bar inside button during purchase */}
          {proto.state === 'purchasing' && (
            <div
              className="absolute inset-y-0 left-0 bg-[#00E5A0] transition-all duration-500 ease-out"
              style={{
                width: purchaseStage === 0 ? '33%' : purchaseStage === 1 ? '75%' : '100%',
                opacity: 0.3,
              }}
            />
          )}

          <span className="relative z-10">
            {countdown.isEnded ? (
              'DROP CLOSED'
            ) : proto.state === 'purchasing' ? (
              <span className="flex items-center justify-center gap-2">
                {purchaseStage === 2 && (
                  /* Checkmark burst on SECURED! */
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M6 10.5 L9 13.5 L14 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="arena-checkmark-draw"
                    />
                  </svg>
                )}
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {purchaseStage === 0
                    ? 'RESERVING EDITION...'
                    : purchaseStage === 1
                      ? 'PROCESSING PAYMENT...'
                      : 'SECURED!'}
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {/* Lock — instant secure purchase */}
                <svg className="h-4 w-4 opacity-50" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                </svg>
                {isCritical
                  ? `LAST CHANCE — $${moment.rarityTiers[selectedTierIdx].price}`
                  : isClosing
                    ? `GOING FAST — $${moment.rarityTiers[selectedTierIdx].price}`
                    : `OWN THIS MOMENT — $${moment.rarityTiers[selectedTierIdx].price}`}
              </span>
            )}
          </span>
        </button>

        {/* Crowd energy meter — velocity-driven power gauge beneath CTA */}
        {!countdown.isEnded && proto.state !== 'purchasing' && (
          <div className="mt-2.5 mx-auto w-full max-w-[280px]">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[8px] font-bold uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: liveVelocity >= 18 ? '#EF4444' : liveVelocity >= 12 ? '#F59E0B' : 'rgba(255,255,255,0.25)',
                }}
              >
                Crowd Energy
              </span>
              <span
                className="text-[8px] font-mono tabular-nums"
                style={{
                  color: liveVelocity >= 18 ? '#EF4444' : liveVelocity >= 12 ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                }}
              >
                {liveVelocity >= 18 ? 'MAX' : liveVelocity >= 12 ? 'HIGH' : 'RISING'}
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  liveVelocity >= 18 ? 'arena-energy-pulse' : ''
                }`}
                style={{
                  width: `${Math.min(100, (liveVelocity / 22) * 100)}%`,
                  background: liveVelocity >= 18
                    ? 'linear-gradient(90deg, #EF4444, #F59E0B, #EF4444)'
                    : liveVelocity >= 12
                      ? `linear-gradient(90deg, #00E5A0, #F59E0B)`
                      : '#00E5A0',
                  boxShadow: liveVelocity >= 18
                    ? '0 0 8px rgba(239,68,68,0.5), 0 0 16px rgba(239,68,68,0.2)'
                    : liveVelocity >= 12
                      ? '0 0 6px rgba(245,158,11,0.3)'
                      : '0 0 4px rgba(0,229,160,0.2)',
                }}
              />
            </div>
          </div>
        )}

        {/* Stored payment indicator + social proof */}
        <div className="mt-2 flex flex-col items-center gap-0.5">
          {!countdown.isEnded && proto.state !== 'purchasing' && (
            <p className="text-[10px] text-white/[0.15] tracking-wide">
              Instant checkout · Visa ··4242
            </p>
          )}
          <p className="text-center text-xs text-white/40">
            {countdown.isEnded
              ? `${liveClaimed.toLocaleString()} editions collected during this drop`
              : <>&#128293; {recentBuyers} people bought in the last minute</>
            }
          </p>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-20" />
      </div>{/* Close court lines wrapper */}

      {/* ─── Sticky Bottom CTA — always-present buy pressure ─── */}
      {showStickyCTA && !countdown.isEnded && proto.state !== 'confirmed' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0B0E14]/95 backdrop-blur-md"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Mini info: tier + price */}
            <div className="flex flex-col min-w-0">
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: TIER_COLOR[moment.rarityTiers[selectedTierIdx].tier] ?? '#6B7A99' }}
              >
                {moment.rarityTiers[selectedTierIdx].tier}
              </span>
              <span className="text-lg font-bold text-white tabular-nums leading-tight">
                ${moment.rarityTiers[selectedTierIdx].price}
              </span>
            </div>

            {/* Active buyers / purchase status indicator */}
            {proto.state === 'purchasing' ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A0] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E5A0]" />
                </span>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider text-[#00E5A0]"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {purchaseStage === 0 ? 'Reserving...' : purchaseStage === 1 ? 'Processing...' : 'Secured!'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A0] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E5A0]" />
                </span>
                <span className="text-[10px] tabular-nums text-white/40">{activeBuyers} buying</span>
              </div>
            )}

            {/* Buy button — shows progress during purchase */}
            <button
              onClick={proto.state !== 'purchasing' ? proto.purchase : undefined}
              disabled={proto.state === 'purchasing'}
              className={`relative ml-auto flex-shrink-0 overflow-hidden rounded-lg px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.97] ${
                proto.state === 'purchasing'
                  ? 'bg-[#00E5A0]/80 text-black cursor-wait'
                  : isCritical
                    ? 'bg-red-500 text-white animate-urgency-fast'
                    : isClosing
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#00E5A0] text-black'
              }`}
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {/* Progress bar overlay during purchase */}
              {proto.state === 'purchasing' && (
                <div
                  className="absolute inset-y-0 left-0 bg-[#00E5A0] transition-all duration-500 ease-out"
                  style={{
                    width: purchaseStage === 0 ? '33%' : purchaseStage === 1 ? '75%' : '100%',
                    opacity: 0.3,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {proto.state === 'purchasing' && purchaseStage === 2 && (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M6 10.5 L9 13.5 L14 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="arena-checkmark-draw"
                    />
                  </svg>
                )}
                {proto.state !== 'purchasing' && (
                  <svg className="h-3.5 w-3.5 opacity-50" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                  </svg>
                )}
                {proto.state === 'purchasing'
                  ? (purchaseStage === 0 ? 'RESERVING...' : purchaseStage === 1 ? 'PROCESSING...' : 'SECURED!')
                  : isCritical ? 'LAST CHANCE' : isClosing ? 'BUY NOW' : 'OWN IT'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Keyframes in globals.css: fadeSlideIn, bounceIn, buttonShake, bgPulse */}
    </div>
  );
}
