'use client';

import { use, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getMoment, SALE_DURATION_MS, type Moment, type RarityTier } from '@/lib/mock-data';
import { useCountdown } from '@/lib/use-countdown';
import { usePrototypeState } from '@/lib/use-prototype-state';

/* ─── Play-by-Play Moment Ticker — jumbotron narration of the play ── */
/* NBA arenas run a play-by-play ticker on the jumbotron during replays.  */
/* This scrolls the actual moment breakdown step-by-step, creating       */
/* narrative emotion even for cold arrivals who didn't see the play.      */

const PLAY_BY_PLAY: Record<string, { time: string; steps: string[] }> = {
  bam: {
    time: '3Q 2:14',
    steps: [
      'ADEBAYO receives at the elbow',
      'Spins baseline past White',
      'Rises over TWO defenders',
      'ONE-HANDED SLAM',
      'AND ONE!',
      'TD Garden SILENCED',
      '30 PTS — franchise playoff record',
    ],
  },
  jokic: {
    time: '4Q 0:42',
    steps: [
      'JOKIĆ catches at the triple-threat',
      'Pump fake freezes Murray',
      'Step-back from 28 feet',
      'NOTHING BUT NET',
      'Dagger THREE',
      'Ball Arena ERUPTS',
      '41 PTS — 15th triple-double this postseason',
    ],
  },
  sga: {
    time: '4Q 1:08',
    steps: [
      'SGA brings it up the floor',
      'Crosses over at the arc',
      'Blows past the screen',
      'Floater over Gobert',
      'BUCKET — and the foul!',
      'Paycom Center ON ITS FEET',
      '38 PTS — OKC franchise record',
    ],
  },
};

function PlayByPlayTicker({ momentId, teamColor, isActive }: {
  momentId: string;
  teamColor: string;
  isActive: boolean;
}) {
  const data = PLAY_BY_PLAY[momentId] ?? PLAY_BY_PLAY.bam;
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % data.steps.length);
    }, 2800);
    return () => clearInterval(id);
  }, [isActive, data.steps.length]);

  if (!isActive) return null;

  return (
    <div className="mt-2 flex items-center gap-2 overflow-hidden">
      {/* Play clock badge */}
      <span
        className="shrink-0 text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: `${teamColor}15`,
          color: `${teamColor}90`,
          border: `1px solid ${teamColor}20`,
        }}
      >
        {data.time}
      </span>
      {/* Scrolling step text */}
      <div className="relative flex-1 h-[18px] overflow-hidden">
        <p
          key={stepIdx}
          className="absolute inset-0 flex items-center text-[11px] uppercase tracking-[0.08em] whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 500,
            color: 'rgba(240,242,245,0.55)',
            animation: 'arena-pbp-step 2.8s ease-in-out forwards',
          }}
        >
          <span
            className="inline-block h-[3px] w-[3px] rounded-full mr-2 shrink-0"
            style={{ backgroundColor: teamColor, boxShadow: `0 0 4px ${teamColor}60` }}
          />
          {data.steps[stepIdx]}
          {stepIdx < data.steps.length - 1 && (
            <span className="ml-2 text-white/20">→</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ─── Crowd Haptics — aggressive arena vibration patterns ────── */
/* Arena haptics are loud, buzzy, and crowd-energy-driven.        */
/* Distinct from Supreme's restrained institutional pulses.       */
/* These feel like bass hits, stomps, and crowd roars on mobile.  */

function arenaVibe(pattern: number | number[]): void {
  try { navigator?.vibrate?.(pattern); } catch { /* no-op */ }
}

const CROWD_HAPTIC = {
  /** CTA slam — aggressive bass hit on buy button press */
  ctaSlam: () => arenaVibe([20, 10, 30]),
  /** Tier switch — quick snap like flipping a stadium card */
  tierSwitch: () => arenaVibe(15),
  /** Purchase stage — escalating rumble per stage */
  purchaseStage: (stage: number) =>
    arenaVibe(stage === 0 ? [15, 20, 15] : stage === 1 ? [20, 15, 25, 15, 20] : [30, 20, 40, 20, 50]),
  /** Celebration — crowd roar: long escalating buzz burst */
  celebration: () => arenaVibe([25, 15, 35, 15, 50, 20, 70, 20, 90]),
  /** Phase shift CLOSING — rumble warning */
  closing: () => arenaVibe([20, 30, 20, 30, 20]),
  /** Phase shift CRITICAL — aggressive alarm buzz */
  critical: () => arenaVibe([30, 15, 30, 15, 30, 15, 50]),
  /** Horn blast — single heavy hit for CRITICAL entry */
  hornBlast: () => arenaVibe([50, 30, 80]),
  /** Buzzer — game-over buzzer pattern */
  buzzer: () => arenaVibe([60, 40, 100]),
  /** Countdown tick — each second in final 10 */
  countdownTick: (n: number) => arenaVibe(n <= 3 ? [25, 10, 25] : 15),
  /** Streak combo — rapid fire matching combo energy */
  streakHit: (count: number) => arenaVibe(count >= 5 ? [20, 10, 20, 10, 40] : count >= 3 ? [15, 10, 25] : 12),
  /** Defense stomp — DE-FENSE crowd stomp pattern */
  defenseStomp: () => arenaVibe([30, 60, 30, 60, 30]),
  /** Fan cam — spotlight buzz */
  fanCam: () => arenaVibe([15, 40, 15, 40, 30]),
  /** Feed purchase — short buzz when someone else buys */
  feedPulse: () => arenaVibe(8),
} as const;

/* ─── Game Scores — jumbotron scoreboard data per moment ─────── */
/* The scoreboard is the most-watched element in any NBA arena.   */
/* Showing the final score in the hero creates emotional context: */
/* the team WON, and this moment was part of that victory.        */

const GAME_SCORES: Record<string, {
  home: string; away: string; hScore: number; aScore: number;
}> = {
  bam:   { home: 'MIA', away: 'BOS', hScore: 108, aScore: 101 },
  jokic: { home: 'DEN', away: 'LAL', hScore: 122, aScore: 109 },
  sga:   { home: 'OKC', away: 'PHX', hScore: 118, aScore: 112 },
};

function JumbotronScoreboard({ momentId, teamColor }: {
  momentId: string; teamColor: string;
}) {
  const game = GAME_SCORES[momentId] ?? GAME_SCORES.bam;
  const isHomeWinner = game.hScore > game.aScore;

  return (
    <div
      className="inline-flex items-center gap-0 rounded overflow-hidden"
      style={{
        border: `1px solid ${teamColor}25`,
        backgroundColor: 'rgba(11,14,20,0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Home team */}
      <div
        className="flex items-center gap-1.5 px-2 py-1"
        style={{
          backgroundColor: isHomeWinner ? `${teamColor}15` : 'transparent',
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: isHomeWinner ? teamColor : 'rgba(255,255,255,0.35)',
          }}
        >
          {game.home}
        </span>
        <span
          className="text-[14px] font-bold tabular-nums leading-none"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            color: isHomeWinner ? '#F0F2F5' : 'rgba(255,255,255,0.4)',
            textShadow: isHomeWinner ? `0 0 6px ${teamColor}40` : 'none',
          }}
        >
          {game.hScore}
        </span>
      </div>

      {/* Divider */}
      <div
        className="w-[1px] self-stretch"
        style={{ backgroundColor: `${teamColor}20` }}
      />

      {/* Away team */}
      <div
        className="flex items-center gap-1.5 px-2 py-1"
        style={{
          backgroundColor: !isHomeWinner ? `${teamColor}15` : 'transparent',
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: !isHomeWinner ? teamColor : 'rgba(255,255,255,0.35)',
          }}
        >
          {game.away}
        </span>
        <span
          className="text-[14px] font-bold tabular-nums leading-none"
          style={{
            fontFamily: 'var(--font-mono), monospace',
            color: !isHomeWinner ? '#F0F2F5' : 'rgba(255,255,255,0.4)',
            textShadow: !isHomeWinner ? `0 0 6px ${teamColor}40` : 'none',
          }}
        >
          {game.aScore}
        </span>
      </div>

      {/* FINAL badge */}
      <div
        className="px-1.5 py-1 self-stretch flex items-center"
        style={{
          backgroundColor: `${teamColor}12`,
          borderLeft: `1px solid ${teamColor}20`,
        }}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.15em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: `${teamColor}70`,
          }}
        >
          Final
        </span>
      </div>
    </div>
  );
}

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

// ---------------------------------------------------------------------------
// PA Announcer Introduction — dramatic arena voice intro on page load
// "LADIES AND GENTLEMEN... YOUR MOMENT OF THE NIGHT... BAM ADEBAYO!"
// ---------------------------------------------------------------------------

const PA_INTROS: Record<string, { lines: string[]; playerCall: string }> = {
  bam: {
    lines: ['Ladies and gentlemen...', 'Your moment of the night...'],
    playerCall: 'BAM ADEBAYO!',
  },
  jokic: {
    lines: ['Ladies and gentlemen...', 'Your moment of the night...'],
    playerCall: 'NIKOLA JOKI\u0106!',
  },
  sga: {
    lines: ['Ladies and gentlemen...', 'Your moment of the night...'],
    playerCall: 'SHAI GILGEOUS-ALEXANDER!',
  },
};

function PAAnnouncerIntro({ momentId, teamColor, playerName }: {
  momentId: string;
  teamColor: string;
  playerName: string;
}) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=line1, 2=line2, 3=playerCall, 4=fadeOut, 5=done
  const intro = PA_INTROS[momentId] ?? PA_INTROS.bam;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);   // "Ladies and gentlemen..."
    const t2 = setTimeout(() => setPhase(2), 2800);   // "Your moment of the night..."
    const t3 = setTimeout(() => setPhase(3), 4400);   // "BAM ADEBAYO!"
    const t4 = setTimeout(() => setPhase(4), 6200);   // begin fade
    const t5 = setTimeout(() => setPhase(5), 7000);   // unmount
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  if (phase === 0 || phase === 5) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[42] flex flex-col items-center justify-center"
      style={{
        opacity: phase === 4 ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      {/* Dark arena backdrop — like house lights dimming for intro */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${teamColor}10 0%, rgba(11,14,20,0.85) 100%)`,
          opacity: phase === 4 ? 0 : 0.9,
          transition: 'opacity 0.8s ease-out',
        }}
      />

      {/* Spotlight cone — single spot on the intro text */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[70%]"
        style={{
          background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${teamColor}18 0%, transparent 70%)`,
          opacity: phase >= 3 ? 1 : 0.4,
          transition: 'opacity 0.6s ease-out',
        }}
      />

      <div className="relative flex flex-col items-center gap-4 px-6">
        {/* Line 1: "Ladies and gentlemen..." */}
        {phase >= 1 && (
          <p
            className="text-[13px] uppercase tracking-[0.4em] text-white/40"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 400,
              animation: 'arena-pa-line-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: phase >= 3 ? 0.2 : undefined,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            {intro.lines[0]}
          </p>
        )}

        {/* Line 2: "Your moment of the night..." */}
        {phase >= 2 && (
          <p
            className="text-[15px] uppercase tracking-[0.3em] text-white/50"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 500,
              animation: 'arena-pa-line-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: phase >= 3 ? 0.3 : undefined,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            {intro.lines[1]}
          </p>
        )}

        {/* Player name — massive, team-color, the climax */}
        {phase >= 3 && (
          <div className="flex flex-col items-center gap-2">
            {/* Accent line — expands before name */}
            <div className="flex items-center gap-3">
              <div
                className="h-[2px] w-10"
                style={{
                  backgroundColor: `${teamColor}60`,
                  animation: 'arena-pa-line-expand 0.4s ease-out forwards',
                }}
              />
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: teamColor,
                  boxShadow: `0 0 12px ${teamColor}80, 0 0 30px ${teamColor}40`,
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
              <div
                className="h-[2px] w-10"
                style={{
                  backgroundColor: `${teamColor}60`,
                  animation: 'arena-pa-line-expand 0.4s ease-out forwards',
                }}
              />
            </div>
            {/* The name — slams in with scale */}
            <h2
              className="text-[clamp(2.5rem,10vw,4.5rem)] uppercase leading-[0.9] tracking-tight text-center"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                color: '#F0F2F5',
                textShadow: `0 0 40px ${teamColor}60, 0 0 80px ${teamColor}30, 0 2px 4px rgba(0,0,0,0.5)`,
                animation: 'arena-pa-name-slam 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              {intro.playerCall}
            </h2>
            {/* Team badge */}
            <span
              className="text-[10px] uppercase tracking-[0.35em] mt-1"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: `${teamColor}80`,
                animation: 'arena-pa-line-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
              }}
            >
              {momentId === 'bam' ? 'Miami Heat' : momentId === 'jokic' ? 'Denver Nuggets' : 'Oklahoma City Thunder'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfettiCannon({ colors, teamColor, tierName = 'Open' }: { colors: string[]; teamColor: string; tierName?: string }) {
  const intensity = TIER_INTENSITY[tierName] ?? TIER_INTENSITY.Open;
  // Cannon positions scale with tier — more cannons = wider coverage
  const allCannons = [
    { x: 5, angle: 65 },   // bottom-left, fires up-right
    { x: 95, angle: 115 },  // bottom-right, fires up-left
    { x: 20, angle: 75 },   // mid-left, fires up-right
    { x: 80, angle: 105 },  // mid-right, fires up-left
    { x: 12, angle: 70 },   // extra inner-left
    { x: 88, angle: 110 },  // extra inner-right
    { x: 50, angle: 85 },   // center
    { x: 50, angle: 95 },   // center alt
  ];
  const cannons = allCannons.slice(0, intensity.cannonCount);

  const pieces = cannons.flatMap((cannon, ci) =>
    Array.from({ length: intensity.confettiPerCannon }, (_, pi) => {
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
  const falling = Array.from({ length: intensity.fallingCount }, (_, i) => {
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

function Pyrotechnics({ teamColor, secondaryColor, tierName = 'Open' }: { teamColor: string; secondaryColor: string; tierName?: string }) {
  const intensity = TIER_INTENSITY[tierName] ?? TIER_INTENSITY.Open;
  /* Extra pyro bursts for premium tiers — added at random positions */
  const extraCount = Math.round((intensity.pyroMultiplier - 1) * PYRO_BURSTS.length);
  const extraBursts = Array.from({ length: extraCount }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 5 + Math.random() * 25,
    delay: 2.0 + i * 0.4,
    sparks: 12 + Math.floor(Math.random() * 8),
    size: 30 + Math.floor(Math.random() * 20),
  }));
  const allBursts = [...PYRO_BURSTS, ...extraBursts];

  return (
    <div className="pointer-events-none fixed inset-0 z-[49] overflow-hidden">
      {allBursts.map((burst, bi) => (
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

/* ─── Floating Claim Toasts — Whatnot-style purchase notifications ── */
/* On live commerce platforms (Whatnot, TikTok Shop), every purchase   */
/* triggers a floating notification visible regardless of scroll       */
/* position. This creates persistent FOMO: even when the user is at   */
/* the tier selector or CTA, they see other people buying in real     */
/* time. Max 2 stacked, slide in from left, auto-dismiss after 2.5s. */

interface ClaimToast {
  id: string;
  name: string;
  city: string;
  edition: number;
  exiting: boolean;
}

function FloatingClaimToasts({
  events,
  teamColor,
  isActive,
}: {
  events: PurchaseEvent[];
  teamColor: string;
  isActive: boolean;
}) {
  const [toasts, setToasts] = useState<ClaimToast[]>([]);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (!isActive || events.length === 0 || events.length === prevLenRef.current) return;
    prevLenRef.current = events.length;
    const latest = events[events.length - 1];
    const toast: ClaimToast = {
      id: latest.id,
      name: latest.name,
      city: latest.city,
      edition: latest.edition,
      exiting: false,
    };
    setToasts((prev) => [...prev.slice(-1), toast]); // max 2

    // Start exit animation after 2s
    const exitTimer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === toast.id ? { ...t, exiting: true } : t)),
      );
    }, 2000);
    // Remove after exit animation completes (0.4s)
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 2400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [events.length, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-14 left-3 z-[28] flex flex-col gap-1.5">
      {toasts.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{
            backgroundColor: 'rgba(11,14,20,0.88)',
            border: `1px solid ${teamColor}30`,
            boxShadow: `0 0 12px ${teamColor}15, 0 4px 12px rgba(0,0,0,0.4)`,
            backdropFilter: 'blur(8px)',
            animation: t.exiting
              ? 'arena-claim-toast-out 0.4s ease-in forwards'
              : 'arena-claim-toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Pulsing dot — live indicator */}
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ backgroundColor: teamColor }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: teamColor }}
            />
          </span>
          <span className="text-[11px] text-white/70 font-medium">{t.name}</span>
          <span className="text-[9px] text-white/30">{t.city}</span>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: '#00E5A0', fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            #{t.edition.toLocaleString()}
          </span>
        </div>
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
      setStreak((s) => { CROWD_HAPTIC.streakHit(s + 1); return s + 1; });
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

/* ─── Purchase Velocity Sparkline — live momentum chart at CTA ─────── */
/* Like a stock ticker's mini chart: shows the last 30 seconds of       */
/* purchase activity as 10 bars. Visible momentum creates FOMO at the   */
/* exact decision point. Sportsbook terminals show real-time bet volume  */
/* as sparklines — this is the purchase equivalent. Distinctly Arena:    */
/* live data visualization that pulses with crowd energy.                */

function usePurchaseSparkline(eventCount: number) {
  const timestamps = useRef<number[]>([]);
  const [bars, setBars] = useState<number[]>(Array(10).fill(0));
  const peakRef = useRef(0);

  useEffect(() => {
    if (eventCount === 0) return;
    timestamps.current.push(Date.now());

    // Rebuild bars from timestamps within last 30s
    const now = Date.now();
    const cutoff = now - 30000;
    timestamps.current = timestamps.current.filter((t) => t >= cutoff);

    const newBars = Array(10).fill(0) as number[];
    for (const t of timestamps.current) {
      const age = now - t;
      const bucket = Math.min(9, Math.floor(age / 3000));
      newBars[9 - bucket] += 1; // most recent on the right
    }
    const peak = Math.max(...newBars, 1);
    if (peak > peakRef.current) peakRef.current = peak;
    setBars(newBars);
  }, [eventCount]);

  // Periodic refresh so bars decay even without new events
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 30000;
      timestamps.current = timestamps.current.filter((t) => t >= cutoff);
      const newBars = Array(10).fill(0) as number[];
      for (const t of timestamps.current) {
        const age = now - t;
        const bucket = Math.min(9, Math.floor(age / 3000));
        newBars[9 - bucket] += 1;
      }
      setBars(newBars);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return { bars, total: timestamps.current.length };
}

function PurchaseSparkline({
  bars,
  total,
  teamColor,
  isCritical,
  isClosing,
}: {
  bars: number[];
  total: number;
  teamColor: string;
  isCritical: boolean;
  isClosing: boolean;
}) {
  const peak = Math.max(...bars, 1);
  const accentColor = isCritical ? '#EF4444' : isClosing ? '#F59E0B' : teamColor;
  const isSurging = bars[9] >= 2 || bars[8] >= 2; // recent bars are hot

  return (
    <div className="flex items-center gap-2.5 mb-2">
      {/* Sparkline bars */}
      <div className="flex items-end gap-[2px] h-[18px]">
        {bars.map((val, i) => {
          const height = peak > 0 ? Math.max(2, (val / peak) * 18) : 2;
          const isRecent = i >= 8;
          const barColor = val === 0
            ? 'rgba(255,255,255,0.06)'
            : isRecent && isSurging
              ? accentColor
              : `${teamColor}${val > 0 ? '80' : '30'}`;

          return (
            <div
              key={i}
              className="w-[4px] rounded-t-sm transition-all duration-500 ease-out"
              style={{
                height: `${height}px`,
                backgroundColor: barColor,
                boxShadow: isRecent && val >= 2 ? `0 0 6px ${accentColor}50` : 'none',
                animation: isRecent && val >= 2 && isSurging
                  ? 'arena-sparkline-pulse 1.2s ease-in-out infinite'
                  : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Label — momentum status */}
      <div className="flex items-center gap-1.5">
        {isSurging && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 4px ${accentColor}80`,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        )}
        <span
          className="text-[8px] font-bold uppercase tracking-[0.2em] tabular-nums"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: isSurging ? accentColor : 'rgba(255,255,255,0.2)',
          }}
        >
          {isSurging ? `${total} IN 30s — SURGING` : `${total} IN 30s`}
        </span>
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

/* ─── Crowd Consensus Meter — jumbotron live poll of tier popularity ──── */
/* NBA arenas run live polls on the jumbotron: "Who's your MVP tonight?"   */
/* "Best dunk of the season?" Fans watch the bars move in real time.       */
/* This shows which tier the crowd is gravitating toward — social proof    */
/* at the decision point. The leading tier's bar pulses with team-color    */
/* energy. Distinctly Arena: Supreme would never poll the room (the        */
/* auctioneer decides), Broadcast would show an analyst's pick. Arena      */
/* lets the crowd vote with their wallets.                                 */

function useCrowdConsensus(tiers: RarityTier[], feedEvents: PurchaseEvent[]) {
  // Simulate tier purchase distribution — weighted toward lower tiers
  // but shifts dynamically based on feed event count
  const [distribution, setDistribution] = useState<number[]>([]);

  useEffect(() => {
    if (tiers.length === 0) return;
    // Base weights: Open heavy, rarer tiers lighter
    const baseWeights = tiers.map((_, i) =>
      i === 0 ? 48 : i === 1 ? 28 : i === 2 ? 16 : 8,
    );
    // Add jitter based on feed events
    const jitter = feedEvents.length % 7;
    const weights = baseWeights.map((w, i) => {
      const shift = ((jitter + i) % 3) - 1; // -1, 0, or 1
      return Math.max(5, w + shift * 3);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    setDistribution(weights.map((w) => Math.round((w / total) * 100)));
  }, [tiers, feedEvents.length]);

  return distribution;
}

function CrowdConsensusMeter({
  tiers,
  distribution,
  selectedIdx,
  teamColor,
  isVisible,
}: {
  tiers: RarityTier[];
  distribution: number[];
  selectedIdx: number;
  teamColor: string;
  isVisible: boolean;
}) {
  if (!isVisible || distribution.length === 0 || tiers.length === 0) return null;

  const maxPct = Math.max(...distribution);
  const leadingIdx = distribution.indexOf(maxPct);

  return (
    <div className="mx-4 mt-2 mb-1 relative z-[1]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.25em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: `${teamColor}60`,
          }}
        >
          📊 Crowd Pick
        </span>
        <div className="h-[1px] flex-1" style={{ backgroundColor: `${teamColor}10` }} />
        <span className="text-[7px] font-mono uppercase tracking-wider text-white/15">
          Live Poll
        </span>
      </div>

      {/* Stacked horizontal bar */}
      <div
        className="relative h-[22px] w-full overflow-hidden rounded-md"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="absolute inset-0 flex">
          {tiers.map((tier, i) => {
            const pct = distribution[i] ?? 0;
            const color = TIER_COLOR[tier.tier] ?? '#6B7A99';
            const isLeading = i === leadingIdx;
            const isSelected = i === selectedIdx;
            return (
              <div
                key={tier.tier}
                className="relative h-full flex items-center justify-center overflow-hidden transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  backgroundColor: `${color}${isLeading ? '30' : '18'}`,
                  borderRight:
                    i < tiers.length - 1
                      ? `1px solid rgba(11,14,20,0.6)`
                      : undefined,
                  animation: isLeading
                    ? 'arena-consensus-pulse 2.5s ease-in-out infinite'
                    : undefined,
                }}
              >
                {/* Selected tier indicator — brighter left border */}
                {isSelected && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px]"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 6px ${color}80`,
                    }}
                  />
                )}
                {/* Tier label + percentage */}
                {pct >= 15 && (
                  <div className="flex items-center gap-1 px-1">
                    <span
                      className="text-[7px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: `${color}${isLeading ? 'DD' : '90'}`,
                        textShadow: isLeading ? `0 0 4px ${color}40` : 'none',
                      }}
                    >
                      {tier.tier}
                    </span>
                    <span
                      className="text-[9px] font-bold tabular-nums"
                      style={{
                        fontFamily: 'var(--font-mono), monospace',
                        color: isLeading ? '#F0F2F5' : 'rgba(240,242,245,0.5)',
                        textShadow: isLeading ? `0 0 4px ${color}30` : 'none',
                      }}
                    >
                      {pct}%
                    </span>
                    {isLeading && (
                      <span
                        className="text-[6px] font-bold uppercase tracking-[0.1em] px-1 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: `${color}25`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      >
                        HOT
                      </span>
                    )}
                  </div>
                )}
                {/* Narrow tier — just percentage */}
                {pct > 0 && pct < 15 && (
                  <span
                    className="text-[7px] font-mono tabular-nums"
                    style={{ color: 'rgba(240,242,245,0.3)' }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom label — "X fans chose [leading tier]" */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[8px] text-white/20">
          Most fans choosing{' '}
          <span
            style={{ color: TIER_COLOR[tiers[leadingIdx]?.tier] ?? '#6B7A99' }}
          >
            {tiers[leadingIdx]?.tier}
          </span>
        </span>
        {tiers[selectedIdx] && leadingIdx !== selectedIdx && (
          <span className="text-[7px] text-white/15 italic">
            You picked {tiers[selectedIdx].tier}
          </span>
        )}
      </div>
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

/* ─── MVP Leaderboard — jumbotron top-buyer spotlight ─────────── */
/* Every NBA arena shows a "Fan of the Game" or MVP cam on the     */
/* jumbotron. Live commerce platforms (Whatnot, TikTok Shop) show  */
/* "Top Buyer" leaderboards. This combines both: the 3 fastest     */
/* collectors get their name on the jumbotron leaderboard.         */

function useMvpLeaderboard(events: PurchaseEvent[]) {
  // Track per-buyer purchase counts from the feed
  const [leaders, setLeaders] = useState<{ name: string; city: string; count: number; rank: number }[]>([]);

  useEffect(() => {
    if (events.length === 0) return;
    const counts = new Map<string, { city: string; count: number }>();
    for (const ev of events) {
      const existing = counts.get(ev.name);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(ev.name, { city: ev.city, count: 1 });
      }
    }
    const sorted = Array.from(counts.entries())
      .map(([name, data]) => ({ name, city: data.city, count: data.count, rank: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    sorted.forEach((entry, i) => { entry.rank = i + 1; });
    setLeaders(sorted);
  }, [events]);

  return leaders;
}

function MvpLeaderboard({ events, teamColor, isEnded }: { events: PurchaseEvent[]; teamColor: string; isEnded: boolean }) {
  const leaders = useMvpLeaderboard(events);

  if (isEnded || leaders.length < 2) return null;

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold, silver, bronze
  const RANK_LABELS = ['MVP', '2ND', '3RD'];

  return (
    <div className="mx-4 my-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.25em]"
          style={{ fontFamily: 'var(--font-oswald), sans-serif', color: `${teamColor}60` }}
        >
          🏆 Top Collectors
        </span>
        <div className="h-[1px] flex-1" style={{ backgroundColor: `${teamColor}10` }} />
        <span className="text-[7px] font-mono uppercase tracking-wider text-white/15">
          Live
        </span>
      </div>

      {/* Leaderboard rows */}
      <div className="flex gap-1.5">
        {leaders.map((leader, i) => (
          <div
            key={leader.name}
            className="flex-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-all duration-400"
            style={{
              backgroundColor: i === 0 ? `rgba(255,215,0,0.06)` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)'}`,
              boxShadow: i === 0 ? `0 0 8px rgba(255,215,0,0.08)` : 'none',
            }}
          >
            {/* Rank badge */}
            <span
              className="text-[8px] font-bold shrink-0"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: RANK_COLORS[i] ?? '#CD7F32',
                textShadow: i === 0 ? '0 0 6px rgba(255,215,0,0.3)' : 'none',
              }}
            >
              {RANK_LABELS[i]}
            </span>
            {/* Name + count */}
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-semibold text-white/60 truncate">
                {leader.name}
              </span>
              <span className="text-[7px] font-mono tabular-nums text-white/25">
                {leader.count}× collected
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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

/* Arena seating section labels — map rarity to arena seating proximity */
const TIER_SECTION: Record<string, string> = {
  Open: 'UPPER DECK',
  Rare: 'CLUB LEVEL',
  Legendary: 'COURTSIDE',
  Ultimate: 'FLOOR SEAT',
};

/* ─── Tier Intensity Scale — celebration effects escalate by rarity ─── */
/* Open = baseline arena celebration. Ultimate = maximum spectacle.       */
const TIER_INTENSITY: Record<string, {
  confettiPerCannon: number;
  cannonCount: number;
  fallingCount: number;
  pyroMultiplier: number;
  flashOpacity: number;
  flashDuration: number;
  shakeDuration: number;
  eqBarScale: number;
  pulseRings: number;
  suspenseMs: number;
  label: string;
}> = {
  Open:      { confettiPerCannon: 16, cannonCount: 4, fallingCount: 20, pyroMultiplier: 1,   flashOpacity: 0.35, flashDuration: 400, shakeDuration: 500, eqBarScale: 1,    pulseRings: 1, suspenseMs: 0,   label: 'GENERAL ADMISSION' },
  Rare:      { confettiPerCannon: 22, cannonCount: 5, fallingCount: 30, pyroMultiplier: 1.4, flashOpacity: 0.42, flashDuration: 500, shakeDuration: 600, eqBarScale: 1.15, pulseRings: 2, suspenseMs: 200, label: 'RARE COLLECTION' },
  Legendary: { confettiPerCannon: 28, cannonCount: 6, fallingCount: 40, pyroMultiplier: 1.8, flashOpacity: 0.50, flashDuration: 600, shakeDuration: 700, eqBarScale: 1.3,  pulseRings: 3, suspenseMs: 500, label: 'LEGENDARY PULL' },
  Ultimate:  { confettiPerCannon: 36, cannonCount: 8, fallingCount: 55, pyroMultiplier: 2.2, flashOpacity: 0.60, flashDuration: 700, shakeDuration: 900, eqBarScale: 1.5,  pulseRings: 4, suspenseMs: 800, label: 'ULTIMATE — 1 OF 5' },
};

/* ─── Live Tier Remaining — stock ticks down like Whatnot/TikTok Shop ── */
/* On live commerce platforms, the available quantity visibly decrements    */
/* in real time when someone buys. The number does a brief scale-pulse     */
/* and the color shifts toward red as stock drops. This connects the       */
/* social proof feed directly to the scarcity signal at the tier cards.    */

function useLiveTierRemaining(
  tiers: RarityTier[],
  feedEvents: PurchaseEvent[],
  isEnded: boolean,
) {
  // Initialize from static data
  const [remaining, setRemaining] = useState<number[]>(() =>
    tiers.map((t) => t.remaining),
  );
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const prevLen = useRef(0);

  useEffect(() => {
    if (isEnded || feedEvents.length === 0 || feedEvents.length === prevLen.current) return;
    prevLen.current = feedEvents.length;

    // ~60% chance to decrement a random non-Open tier (Open has huge supply)
    // ~40% chance to decrement Open (most sales go to the cheapest tier)
    setRemaining((prev) => {
      const next = [...prev];
      const roll = Math.random();
      let targetIdx: number;
      if (roll < 0.40 && next.length > 0) {
        targetIdx = 0; // Open tier
      } else {
        // Pick a random premium tier (1+)
        const premiumIndices = next.map((_, i) => i).filter((i) => i > 0 && next[i] > 0);
        if (premiumIndices.length > 0) {
          targetIdx = premiumIndices[Math.floor(Math.random() * premiumIndices.length)];
        } else {
          targetIdx = 0;
        }
      }
      if (next[targetIdx] > 0) {
        next[targetIdx] = next[targetIdx] - 1;
        setFlashIdx(targetIdx);
      }
      return next;
    });

    // Clear flash after animation
    const t = setTimeout(() => setFlashIdx(null), 400);
    return () => clearTimeout(t);
  }, [feedEvents.length, isEnded]); // eslint-disable-line react-hooks/exhaustive-deps

  return { remaining, flashIdx };
}

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

/* ─── Live Odds Board — sportsbook-style line movement per tier ── */
/* In every NBA arena, the sportsbook is the companion activity.    */
/* Treating rarity tiers as betting lines with shifting odds        */
/* gamifies the tier selection and creates urgency through moving   */
/* numbers. "The line is moving" = someone knows something = act.   */
/* Distinctly Arena: Supreme would never gamify (auction houses     */
/* don't show odds), Broadcast would present it as data. Arena      */
/* makes it a bet.                                                  */

interface OddsLine {
  line: number;       // current odds line (e.g., -150, +240)
  prevLine: number;   // previous line for movement arrow
  trend: 'up' | 'down' | 'stable';
  heat: number;       // 0-1, how "hot" this line is
  label: string;      // e.g., "HEAVY ACTION"
}

const ODDS_BASE: Record<string, number> = {
  Open: -150,
  Rare: 180,
  Legendary: 350,
  Ultimate: 800,
} as const;

const ODDS_HEAT_LABELS = [
  { threshold: 0.8, label: 'HEAVY ACTION', color: '#EF4444' },
  { threshold: 0.6, label: 'HEATING UP', color: '#FF6B35' },
  { threshold: 0.35, label: 'ACTIVE', color: '#F59E0B' },
  { threshold: 0, label: 'STEADY', color: '#6B7A99' },
];

function useLiveOdds(
  tiers: RarityTier[],
  remaining: number[],
  velocity: number,
  isEnded: boolean,
): OddsLine[] {
  const [lines, setLines] = useState<OddsLine[]>(() =>
    tiers.map((t) => {
      const base = ODDS_BASE[t.tier] ?? 200;
      return { line: base, prevLine: base, trend: 'stable' as const, heat: 0.2, label: 'STEADY' };
    }),
  );

  useEffect(() => {
    if (isEnded || tiers.length === 0) return;

    const id = setInterval(() => {
      setLines((prev) =>
        prev.map((cur, i) => {
          const tier = tiers[i];
          if (!tier) return cur;

          const totalForTier = tier.size;
          const pctRemaining = remaining[i] != null ? remaining[i] / Math.max(1, totalForTier) : 0.5;

          // Lines drift based on scarcity + velocity
          const scarcityPush = (1 - pctRemaining) * 8; // lower remaining → bigger push
          const velPush = (velocity / 25) * 4;
          const drift = Math.floor((scarcityPush + velPush) * (Math.random() - 0.35));

          let nextLine = cur.line;
          if (cur.line < 0) {
            // Favorite: more negative = stronger favorite
            nextLine = Math.min(-100, Math.max(-500, cur.line - drift));
          } else {
            // Underdog: lower positive = more likely
            nextLine = Math.max(100, Math.min(2000, cur.line - drift));
          }

          // Determine movement
          const moved = nextLine - cur.line;
          const trend: 'up' | 'down' | 'stable' =
            Math.abs(moved) < 3 ? 'stable' : moved < 0 ? (cur.line < 0 ? 'up' : 'down') : (cur.line < 0 ? 'down' : 'up');

          // Calculate heat (0-1) from remaining + velocity
          const heat = Math.min(1, (1 - pctRemaining) * 0.6 + (velocity / 30) * 0.4);
          const heatLabel = ODDS_HEAT_LABELS.find((h) => heat >= h.threshold) ?? ODDS_HEAT_LABELS[3];

          return {
            line: nextLine,
            prevLine: cur.line,
            trend,
            heat,
            label: heatLabel.label,
          };
        }),
      );
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(id);
  }, [tiers, remaining, velocity, isEnded]);

  return lines;
}

function formatOddsLine(line: number): string {
  return line < 0 ? `${line}` : `+${line}`;
}

function LiveOddsBoard({
  tiers,
  odds,
  teamColor,
  isEnded,
}: {
  tiers: RarityTier[];
  odds: OddsLine[];
  teamColor: string;
  isEnded: boolean;
}) {
  if (isEnded || tiers.length === 0) return null;

  const [updatedAgo, setUpdatedAgo] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setUpdatedAgo((v) => (v >= 8 ? 0 : v + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // Reset counter when odds change
  const lineSum = odds.reduce((a, o) => a + o.line, 0);
  useEffect(() => { setUpdatedAgo(0); }, [lineSum]);

  return (
    <div className="mx-4 mt-3 mb-1 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header — sportsbook ticker style */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: `1px solid ${teamColor}15` }}
      >
        <div className="flex items-center gap-2">
          {/* Odds icon — dice/chart */}
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill={teamColor} opacity={0.6}>
            <path d="M2 2h4v4H2V2Zm0 6h4v4H2V8Zm6-6h4v4H8V2Zm4.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM3 3.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Zm1 7a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Zm5-7a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
          </svg>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor }}
          >
            Live Odds
          </span>
          {/* Pulsing live dot */}
          <span
            className="h-[5px] w-[5px] rounded-full animate-pulse"
            style={{ backgroundColor: '#EF4444', boxShadow: '0 0 4px #EF444460' }}
          />
        </div>
        <span className="text-[8px] font-mono uppercase tracking-wider text-white/20">
          Updated {updatedAgo}s ago
        </span>
      </div>

      {/* Odds rows */}
      <div className="divide-y divide-white/[0.04]">
        {tiers.map((tier, i) => {
          const o = odds[i];
          if (!o) return null;
          const heatStyle = ODDS_HEAT_LABELS.find((h) => o.heat >= h.threshold) ?? ODDS_HEAT_LABELS[3];
          const trendArrow = o.trend === 'up' ? '▲' : o.trend === 'down' ? '▼' : '──';
          const trendColor = o.trend === 'up' ? '#00E5A0' : o.trend === 'down' ? '#EF4444' : '#3D4B66';

          return (
            <div
              key={tier.tier}
              className="flex items-center justify-between px-3 py-2 transition-all duration-500"
              style={{
                backgroundColor: o.heat > 0.6 ? `${heatStyle.color}08` : 'transparent',
              }}
            >
              {/* Tier name + heat badge */}
              <div className="flex items-center gap-2 min-w-[80px]">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: TIER_COLOR[tier.tier] ?? '#F0F2F5',
                  }}
                >
                  {tier.tier}
                </span>
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: heatStyle.color,
                    backgroundColor: `${heatStyle.color}15`,
                    border: `1px solid ${heatStyle.color}25`,
                  }}
                >
                  {o.label}
                </span>
              </div>

              {/* Odds line + movement */}
              <div className="flex items-center gap-2">
                {/* Previous line (dimmed) */}
                {o.trend !== 'stable' && (
                  <span className="text-[8px] font-mono tabular-nums text-white/15 line-through">
                    {formatOddsLine(o.prevLine)}
                  </span>
                )}
                {/* Current line */}
                <span
                  className="text-[13px] font-bold tabular-nums transition-all duration-500"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: o.heat > 0.6 ? heatStyle.color : '#F0F2F5',
                    textShadow: o.heat > 0.7 ? `0 0 8px ${heatStyle.color}40` : 'none',
                  }}
                >
                  {formatOddsLine(o.line)}
                </span>
                {/* Trend arrow */}
                <span
                  className="text-[9px] font-bold transition-colors duration-300"
                  style={{ color: trendColor }}
                >
                  {trendArrow}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — sportsbook disclaimer */}
      <div
        className="flex items-center justify-center px-3 py-1.5"
        style={{ borderTop: `1px solid ${teamColor}10` }}
      >
        <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/12">
          Lines shift with demand · Not financial advice
        </span>
      </div>
    </div>
  );
}

function RarityCards({
  tiers,
  selectedIdx,
  onSelect,
  bidderCounts,
  isEnded,
  liveRemaining,
  flashIdx,
  revealed,
}: {
  tiers: RarityTier[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  bidderCounts: number[];
  isEnded: boolean;
  liveRemaining?: number[];
  flashIdx?: number | null;
  revealed?: boolean;
}) {
  /* Find the tier with the most bidders for the POPULAR badge */
  const maxBidders = Math.max(...bidderCounts);
  const popularIdx = bidderCounts.indexOf(maxBidders);

  /* Gate scanner — horizontal light sweep on tier selection */
  const prevSelectedRef = useRef(selectedIdx);
  const [scanIdx, setScanIdx] = useState<number | null>(null);
  const [scanKey, setScanKey] = useState(0);
  useEffect(() => {
    if (prevSelectedRef.current !== selectedIdx) {
      setScanIdx(selectedIdx);
      setScanKey((k) => k + 1);
      prevSelectedRef.current = selectedIdx;
    }
  }, [selectedIdx]);

  /* "CLAIMED!" label — briefly appears when flashIdx fires on a tier */
  const [claimedIdx, setClaimedIdx] = useState<number | null>(null);
  const [claimedKey, setClaimedKey] = useState(0);
  useEffect(() => {
    if (flashIdx != null) {
      setClaimedIdx(flashIdx);
      setClaimedKey((k) => k + 1);
      const t = setTimeout(() => setClaimedIdx(null), 650);
      return () => clearTimeout(t);
    }
  }, [flashIdx]);

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-4" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
      {tiers.map((tier, idx) => {
        const color = TIER_COLOR[tier.tier] ?? '#6B7A99';
        const isSelected = idx === selectedIdx;
        const live = liveRemaining?.[idx] ?? tier.remaining;
        const isLow = tier.tier !== 'Open' && live <= 5;
        const isUrgent = tier.tier !== 'Open' && live <= 10;
        const isFlashing = flashIdx === idx;
        const isClaimed = claimedIdx === idx;
        const bidders = bidderCounts[idx] ?? 0;
        const isPopular = idx === popularIdx && !isEnded && maxBidders >= 5;
        const sectionLabel = TIER_SECTION[tier.tier] ?? '';
        const showScan = scanIdx === idx;

        return (
          <button
            key={tier.tier}
            onClick={() => onSelect(idx)}
            className={`group relative flex shrink-0 flex-col items-center rounded-xl border px-4 py-3 transition-all duration-200 active:scale-[0.97] min-w-[80px] overflow-hidden ${
              isLow && isSelected ? 'arena-tier-urgent' : isSelected && !isEnded ? 'arena-tier-selected-glow' : ''
            }`}
            style={{
              borderColor: isSelected ? color : isFlashing ? `${color}60` : 'rgba(255,255,255,0.06)',
              backgroundColor: isSelected ? `${color}12` : 'rgba(255,255,255,0.03)',
              boxShadow: isSelected
                ? `0 0 20px ${color}20, inset 0 0 12px ${color}08`
                : isFlashing
                  ? `0 0 16px ${color}25`
                  : 'none',
              /* Player intro stagger — cards slide up one-by-one like player introductions */
              ...(revealed !== undefined ? {
                animation: revealed
                  ? `arena-tier-intro 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s both`
                  : 'none',
                opacity: revealed ? undefined : 0,
                transform: revealed ? undefined : 'translateY(20px)',
              } : {}),
            }}
          >
            {/* Claimed pulse ring — expanding border ring when someone buys this tier */}
            {isClaimed && !isEnded && (
              <div
                key={`claimed-ring-${claimedKey}`}
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  border: `2px solid ${color}`,
                  animation: 'arena-tier-claimed-ring 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              />
            )}

            {/* Claimed flash overlay — brief tier-color wash */}
            {isFlashing && !isEnded && (
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  backgroundColor: color,
                  animation: 'arena-tier-claimed-flash 0.4s ease-out forwards',
                }}
              />
            )}

            {/* "CLAIMED!" micro-label — pops above card on purchase */}
            {isClaimed && !isEnded && (
              <div
                key={`claimed-label-${claimedKey}`}
                className="pointer-events-none absolute -top-4 left-1/2 z-10 whitespace-nowrap"
                style={{
                  transform: 'translateX(-50%)',
                  animation: 'arena-tier-claimed-label 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color,
                    textShadow: `0 0 6px ${color}60`,
                  }}
                >
                  Claimed!
                </span>
              </div>
            )}

            {/* Gate scanner sweep — horizontal light on tier selection */}
            {showScan && (
              <div
                key={`scan-${scanKey}`}
                className="pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-xl"
              >
                <div
                  className="absolute top-0 bottom-0 w-[40%]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color}30, ${color}50, ${color}30, transparent)`,
                    animation: 'arena-gate-scan 0.35s ease-out forwards',
                  }}
                />
              </div>
            )}

            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl transition-opacity duration-200"
              style={{
                backgroundColor: color,
                opacity: isSelected ? 1 : 0,
              }}
            />

            {/* POPULAR badge — dynamic, follows highest bidder count */}
            {isPopular && (
              <div
                className="absolute -top-2.5 right-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 arena-popular-badge"
                style={{
                  backgroundColor: `${color}25`,
                  border: `1px solid ${color}50`,
                  boxShadow: `0 0 8px ${color}20`,
                }}
              >
                <span className="text-[7px]">🔥</span>
                <span
                  className="text-[7px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif', color }}
                >
                  Popular
                </span>
              </div>
            )}

            {/* Arena seating section label */}
            <span
              className="text-[7px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200 mb-0.5"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: isSelected ? `${color}80` : 'rgba(255,255,255,0.15)',
              }}
            >
              {sectionLabel}
            </span>

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
                transform: isFlashing ? 'scale(1.18)' : 'scale(1)',
                transition: isFlashing
                  ? 'transform 80ms cubic-bezier(0.16, 1, 0.3, 1), color 150ms'
                  : 'transform 250ms ease-out, color 200ms',
                textShadow: isFlashing && isLow
                  ? '0 0 6px rgba(239,68,68,0.5)'
                  : isFlashing
                    ? '0 0 4px rgba(245,158,11,0.4)'
                    : 'none',
              }}
            >
              {tier.tier === 'Open' ? `${live.toLocaleString()} left` :
               isLow ? `${live} LEFT!` :
               `${live} of ${tier.size}`}
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

/* ─── Replay Countdown — jumbotron 3-2-1 before instant replay ───── */
/* NBA arenas build anticipation before replays: the jumbotron flashes */
/* "3... 2... 1... REPLAY!" with each number slamming in. This creates */
/* the same anticipation before revealing the collected moment's replay. */

function ReplayCountdown({
  teamColor,
  onComplete,
}: {
  teamColor: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0); // 0=hidden, 1=3, 2=2, 3=1, 4=REPLAY!, 5=done

  useEffect(() => {
    const delays = [200, 800, 1400, 2000, 2800];
    const timers = delays.map((d, i) =>
      setTimeout(() => {
        setStep(i + 1);
        if (i < 4) CROWD_HAPTIC.countdownTick(3 - i);
      }, d)
    );
    const done = setTimeout(() => onComplete(), 2800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  if (step === 0 || step === 5) return null;

  const isNumber = step >= 1 && step <= 3;
  const display = isNumber ? String(4 - step) : 'REPLAY!';

  return (
    <div
      className="flex items-center justify-center w-full max-w-[300px] h-[60px] relative overflow-hidden rounded-xl mb-3"
      style={{
        backgroundColor: 'rgba(11,14,20,0.95)',
        border: `1px solid ${teamColor}30`,
      }}
    >
      {/* Team-color flash on each slam */}
      <div
        key={step}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: teamColor,
          animation: 'arena-countdown-slam-flash 0.35s ease-out forwards',
        }}
      />
      {/* Scanline overlay for jumbotron LED feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        }}
      />
      {/* Number/text slam */}
      <span
        key={`text-${step}`}
        className="relative z-10"
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          fontWeight: 800,
          fontSize: isNumber ? '42px' : '28px',
          letterSpacing: isNumber ? '-0.02em' : '0.12em',
          textTransform: 'uppercase',
          color: isNumber ? 'white' : teamColor,
          textShadow: isNumber
            ? `0 0 30px ${teamColor}60, 0 0 60px ${teamColor}30`
            : `0 0 20px ${teamColor}80, 0 0 40px ${teamColor}40`,
          animation: 'arena-countdown-slam 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {display}
      </span>
    </div>
  );
}

/* ─── Replay Timestamp — live counting timer for jumbotron replay ── */
/* Arena jumbotrons show a running timecode on replays. This counts    */
/* from 0:00 up to the duration, updating every ~100ms for smooth     */
/* real-time feel. Starts after startDelay ms.                         */

function ReplayTimestamp({ durationSec, startDelay }: { durationSec: number; startDelay: number }) {
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (elapsed >= durationSec) return;
    const interval = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 0.1, durationSec));
    }, 100);
    return () => clearInterval(interval);
  }, [started, elapsed >= durationSec, durationSec]); // eslint-disable-line react-hooks/exhaustive-deps

  const secs = Math.floor(elapsed);
  const display = `0:${secs.toString().padStart(2, '0')}`;

  return (
    <span className="text-[8px] font-mono tabular-nums text-white/40">
      {display}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Victory Horn — interactive post-win ritual button on the W screen
// Inspired by Spurs victory drum, Rockets liftoff button. Every NBA arena has
// a post-win ritual. This gives the user something to physically DO.
// Each slam: haptic horn blast, visual pulse ring, hit counter climbs.
// After 5 hits: massive crowd roar crescendo + screen shake + confetti burst.
// ---------------------------------------------------------------------------

function VictoryHorn({ teamColor, secondaryColor, show }: {
  teamColor: string;
  secondaryColor: string;
  show: boolean;
}) {
  const [hits, setHits] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [roarTriggered, setRoarTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSlam = () => {
    const next = hits + 1;
    setHits(next);
    setPulseKey(prev => prev + 1);

    // Haptic: escalating horn blasts
    if (next >= 5 && !roarTriggered) {
      // Crowd roar crescendo on 5th hit
      CROWD_HAPTIC.celebration();
      setRoarTriggered(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    } else {
      CROWD_HAPTIC.hornBlast();
    }
  };

  // Crowd energy label based on hits
  const energyLabel = hits === 0 ? 'TAP TO CELEBRATE'
    : hits < 3 ? 'LOUDER!'
    : hits < 5 ? 'KEEP GOING!'
    : roarTriggered ? '🔊 CROWD GOES WILD!' : 'LOUDER!';

  // Glow intensity scales with hits
  const glowIntensity = Math.min(1, hits * 0.2);

  return (
    <div
      ref={containerRef}
      className="mt-6 flex flex-col items-center transition-all duration-600 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show
          ? shaking ? 'translateY(0) scale(1.02)' : 'translateY(0) scale(1)'
          : 'translateY(16px) scale(0.92)',
        transitionDelay: '0.35s',
        animation: shaking ? 'arena-rumble 0.6s ease-out' : undefined,
      }}
    >
      {/* Section label */}
      <span
        className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 mb-3"
        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
      >
        Victory Horn
      </span>

      {/* Horn button — big, interactive, tappable */}
      <div className="relative">
        {/* Pulse rings — expand outward on each hit */}
        {pulseKey > 0 && (
          <div
            key={`ring-${pulseKey}`}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="absolute rounded-full"
              style={{
                width: '80px',
                height: '80px',
                border: `2px solid ${teamColor}`,
                animation: 'arena-horn-ring 0.8s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
                opacity: 0,
              }}
            />
            {hits >= 3 && (
              <div
                className="absolute rounded-full"
                style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${secondaryColor ?? teamColor}`,
                  animation: 'arena-horn-ring 0.8s cubic-bezier(0.2, 0.6, 0.3, 1) 0.1s forwards',
                  opacity: 0,
                }}
              />
            )}
          </div>
        )}

        {/* The horn button itself */}
        <button
          onClick={handleSlam}
          className="relative flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
          style={{
            width: '80px',
            height: '80px',
            background: `radial-gradient(circle at 40% 35%, ${teamColor}40, ${teamColor}18 60%, rgba(11,14,20,0.9) 100%)`,
            border: `2px solid ${teamColor}${Math.round(30 + glowIntensity * 40).toString(16)}`,
            boxShadow: `0 0 ${12 + glowIntensity * 30}px ${teamColor}${Math.round(15 + glowIntensity * 35).toString(16)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
            animation: roarTriggered ? 'arena-horn-glow-max 1.5s ease-in-out infinite' : undefined,
          }}
        >
          {/* Horn SVG icon */}
          <svg
            className="h-8 w-8"
            viewBox="0 0 32 32"
            fill="none"
            style={{
              color: teamColor,
              filter: `drop-shadow(0 0 ${4 + glowIntensity * 8}px ${teamColor}60)`,
              transform: `scale(${1 + glowIntensity * 0.15})`,
              transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
            }}
          >
            {/* Megaphone / air horn shape */}
            <path
              d="M8 13v6h3l7 5V8l-7 5H8z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M8 13v6h3l7 5V8l-7 5H8z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            {/* Sound waves — more visible with more hits */}
            <path
              d="M22 11.5c1.5 1.2 2.5 3 2.5 4.5s-1 3.3-2.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity={Math.min(0.8, 0.3 + hits * 0.1)}
            />
            <path
              d="M25 9c2 1.8 3.5 4.3 3.5 7s-1.5 5.2-3.5 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity={Math.min(0.6, hits * 0.12)}
            />
          </svg>
        </button>

        {/* Hit counter badge — appears after first slam */}
        {hits > 0 && (
          <div
            key={`count-${hits}`}
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: roarTriggered ? '#00E5A0' : teamColor,
              boxShadow: `0 0 8px ${roarTriggered ? 'rgba(0,229,160,0.5)' : teamColor + '60'}`,
              animation: 'arena-stat-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}
          >
            <span
              className="text-[10px] font-bold tabular-nums text-black"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {hits}
            </span>
          </div>
        )}
      </div>

      {/* Energy label — escalates with hits */}
      <span
        key={`label-${roarTriggered ? 'wild' : hits < 3 ? 'low' : 'high'}`}
        className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          color: roarTriggered ? '#00E5A0'
            : hits >= 3 ? teamColor
            : 'rgba(255,255,255,0.3)',
          textShadow: roarTriggered ? '0 0 12px rgba(0,229,160,0.4)'
            : hits >= 3 ? `0 0 8px ${teamColor}40`
            : 'none',
          animation: hits > 0 && !roarTriggered ? 'arena-stat-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' : undefined,
          transition: 'color 0.2s ease-out',
        }}
      >
        {energyLabel}
      </span>

      {/* Decibel bar — visual crowd noise level rising with hits */}
      <div className="mt-2 flex items-end gap-[2px] h-3" style={{ width: '60px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const filled = i < Math.min(8, hits + (roarTriggered ? 8 : 0));
          const barColor = i >= 6 ? '#EF4444' : i >= 4 ? '#F59E0B' : '#00E5A0';
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-200"
              style={{
                height: filled ? `${40 + i * 8}%` : '15%',
                backgroundColor: filled ? barColor : 'rgba(255,255,255,0.06)',
                boxShadow: filled ? `0 0 4px ${barColor}40` : 'none',
                transitionDelay: `${i * 0.03}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Celebration Shimmer — continuous falling sparkle particles ───── */
/* NBA arenas have continuous confetti/streamer rain during post-game    */
/* celebrations. This CSS-only particle field makes the W screen feel   */
/* alive and celebration-worthy for screenshots.                        */

function CelebrationShimmer({ teamColor }: { teamColor: string }) {
  // 18 particles with varied sizes, speeds, and horizontal positions
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    left: `${(i * 5.7 + 2.3) % 100}%`,
    size: 2 + (i % 4) * 1.5,
    duration: 3.5 + (i % 5) * 1.2,
    delay: (i * 0.47) % 4.5,
    // Alternate between team-color, teal, and white particles
    color: i % 3 === 0 ? teamColor : i % 3 === 1 ? '#00E5A0' : 'rgba(255,255,255,0.8)',
    opacity: 0.15 + (i % 4) * 0.08,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 z-[41] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: p.size > 3 ? `0 0 ${p.size * 2}px ${p.color}40` : undefined,
            animation: `arena-shimmer-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Tonight's Attendance — jumbotron PA system announcement ──────── */
/* Every NBA arena announces the attendance figure during the 4th       */
/* ─── Crowd Cam Grid — jumbotron 3×3 camera feed mosaic on W screen ─── */
/* NBA arenas display a crowd cam grid on the jumbotron between plays:    */
/* 9 camera feeds showing different sections of fans. The center feed is  */
/* always the spotlight — "that's YOU on the big screen!" The surrounding  */
/* 8 feeds show other fans (here: other recent buyers). Camera viewfinder */
/* brackets frame each cell. The grid pulses with team color.             */

const CROWD_CAM_LABELS = [
  'SEC 101', 'SEC 204', 'SEC 108',
  'SEC 315', 'YOUR CAM', 'SEC 112',
  'SEC 220', 'SEC 306', 'SEC 118',
];

function CrowdCamGrid({
  editionNumber,
  feedEvents,
  teamColor,
  secondaryColor,
  show,
}: {
  editionNumber: number;
  feedEvents: PurchaseEvent[];
  teamColor: string;
  secondaryColor: string;
  show: boolean;
}) {
  // Build 8 surrounding cells from recent feed events (or placeholder buyers)
  const surroundingBuyers = Array.from({ length: 8 }, (_, i) => {
    const ev = feedEvents[feedEvents.length - 1 - i];
    return ev
      ? { name: ev.name, city: ev.city, edition: ev.edition }
      : { name: BUYER_NAMES[i % BUYER_NAMES.length], city: CITIES[i % CITIES.length], edition: Math.floor(Math.random() * 5000) + 1 };
  });

  // Interleave: positions 0-3 are before center, 4-7 are after
  const cells = [
    ...surroundingBuyers.slice(0, 4),
    null, // center = YOU
    ...surroundingBuyers.slice(4),
  ];

  return (
    <div
      className="mt-5 w-full max-w-[280px] transition-all duration-600 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
        transitionDelay: '0.32s',
      }}
    >
      {/* CROWD CAM badge */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-[1px] flex-1" style={{ backgroundColor: `${teamColor}20` }} />
        <div className="flex items-center gap-1.5">
          {/* Camera icon */}
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill={teamColor} opacity={0.6}>
            <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4Zm4 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
          </svg>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: `${teamColor}90`,
              textShadow: `0 0 8px ${teamColor}30`,
            }}
          >
            Crowd Cam
          </span>
          {/* Live dot */}
          <span className="relative flex h-[5px] w-[5px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-[5px] w-[5px] rounded-full bg-red-500" />
          </span>
        </div>
        <div className="h-[1px] flex-1" style={{ backgroundColor: `${teamColor}20` }} />
      </div>

      {/* 3×3 Grid */}
      <div
        className="grid grid-cols-3 gap-[2px] rounded-xl overflow-hidden"
        style={{
          border: `1px solid ${teamColor}25`,
          backgroundColor: `${teamColor}08`,
        }}
      >
        {cells.map((cell, idx) => {
          const isCenter = idx === 4;
          const label = CROWD_CAM_LABELS[idx];
          return (
            <div
              key={idx}
              className="relative flex flex-col items-center justify-center py-3 px-1"
              style={{
                backgroundColor: isCenter ? `${teamColor}15` : 'rgba(11,14,20,0.95)',
                animation: isCenter ? undefined : `arena-crowd-cam-cell ${1.5 + (idx % 3) * 0.3}s ease-in-out ${0.4 + idx * 0.08}s both`,
                boxShadow: isCenter ? `inset 0 0 20px ${teamColor}15` : undefined,
              }}
            >
              {/* Camera viewfinder corners */}
              <div className="absolute top-[3px] left-[3px] w-[6px] h-[6px] pointer-events-none border-t border-l" style={{ borderColor: isCenter ? `${teamColor}80` : 'rgba(255,255,255,0.08)' }} />
              <div className="absolute top-[3px] right-[3px] w-[6px] h-[6px] pointer-events-none border-t border-r" style={{ borderColor: isCenter ? `${teamColor}80` : 'rgba(255,255,255,0.08)' }} />
              <div className="absolute bottom-[3px] left-[3px] w-[6px] h-[6px] pointer-events-none border-b border-l" style={{ borderColor: isCenter ? `${teamColor}80` : 'rgba(255,255,255,0.08)' }} />
              <div className="absolute bottom-[3px] right-[3px] w-[6px] h-[6px] pointer-events-none border-b border-r" style={{ borderColor: isCenter ? `${teamColor}80` : 'rgba(255,255,255,0.08)' }} />

              {/* Section label — top */}
              <span
                className="text-[6px] font-mono uppercase tracking-[0.15em] mb-1"
                style={{ color: isCenter ? `${teamColor}CC` : 'rgba(255,255,255,0.15)' }}
              >
                {label}
              </span>

              {isCenter ? (
                <>
                  {/* YOU — highlighted center cell */}
                  <span
                    className="text-[14px] font-bold uppercase tracking-wider"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: '#00E5A0',
                      textShadow: '0 0 10px rgba(0,229,160,0.4)',
                    }}
                  >
                    YOU
                  </span>
                  <span
                    className="text-[10px] font-bold tabular-nums mt-0.5"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      color: `${teamColor}`,
                      textShadow: `0 0 6px ${teamColor}40`,
                    }}
                  >
                    #{editionNumber.toLocaleString()}
                  </span>
                </>
              ) : cell ? (
                <>
                  {/* Other buyer */}
                  <span
                    className="text-[9px] font-semibold text-white/50 truncate max-w-full"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {cell.name}
                  </span>
                  <span className="text-[7px] text-white/20 mt-0.5">
                    {cell.city}
                  </span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Bottom label */}
      <div className="flex items-center justify-center mt-1.5">
        <span
          className="text-[7px] uppercase tracking-[0.2em] text-white/15"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Live arena cameras · {feedEvents.length}+ fans
        </span>
      </div>
    </div>
  );
}

/* quarter: "Tonight's attendance: 19,847. Thank you for coming."       */
/* This is the collector equivalent on the W screen.                    */

function AttendanceAnnouncement({ total, claimed, teamColor, show }: {
  total: number;
  claimed: number;
  teamColor: string;
  show: boolean;
}) {
  const attendance = Math.round(claimed * 8.7 + 2400);
  const [counter, setCounter] = useState(0);
  const targetRef = useRef(attendance);
  targetRef.current = attendance;

  useEffect(() => {
    if (!show) return;
    const start = Date.now();
    const dur = 1200;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / dur);
      // easeOutExpo
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setCounter(Math.round(ease * targetRef.current));
      if (t < 1) requestAnimationFrame(tick);
    };
    const delay = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(delay);
  }, [show]);

  return (
    <div
      className="mt-5 w-full max-w-[280px] transition-all duration-600 ease-out"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
        transitionDelay: '0.32s',
      }}
    >
      <div
        className="relative overflow-hidden rounded-lg text-center py-3 px-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: `1px solid ${teamColor}15`,
        }}
      >
        {/* PA icon — megaphone/speaker */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <div className="h-[1px] w-5" style={{ backgroundColor: `${teamColor}25` }} />
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill={teamColor} style={{ opacity: 0.4 }}>
            <path d="M11 3.5V1.1a.5.5 0 00-.82-.39L6.56 4H3.5A1.5 1.5 0 002 5.5v3A1.5 1.5 0 003.5 10h3.06l3.62 3.29A.5.5 0 0011 12.9V10.5a3.5 3.5 0 000-7z" />
          </svg>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/20"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Tonight&apos;s Attendance
          </span>
          <div className="h-[1px] w-5" style={{ backgroundColor: `${teamColor}25` }} />
        </div>
        {/* Attendance number — large jumbotron counter */}
        <div
          style={{
            animation: show ? 'arena-attendance-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both' : undefined,
          }}
        >
          <span
            className="text-2xl font-bold tabular-nums tracking-tight"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: teamColor,
              textShadow: `0 0 16px ${teamColor}30`,
              opacity: 0.7,
            }}
          >
            {counter.toLocaleString()}
          </span>
        </div>
        {/* Thank you line — classic PA sign-off */}
        <p
          className="mt-1 text-[8px] uppercase tracking-[0.2em] text-white/15"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Thank you for being here tonight
        </p>
      </div>
    </div>
  );
}

function CelebrationScreen({
  editionNumber,
  total,
  moment,
  feedEvents,
  onReset,
  tierName = 'Open',
}: {
  editionNumber: number;
  total: number;
  moment: Moment;
  feedEvents: PurchaseEvent[];
  onReset: () => void;
  tierName?: string;
}) {
  const intensity = TIER_INTENSITY[tierName] ?? TIER_INTENSITY.Open;
  const tierColor = TIER_COLOR[tierName] ?? '#00E5A0';
  const acquireTime = (1.5 + Math.random() * 3).toFixed(1);
  const percentile = Math.max(1, Math.round((1 - editionNumber / total) * 100));
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  const [flash, setFlash] = useState(true);
  const [shake, setShake] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReplay, setShowReplay] = useState(false);
  const [replayCountdownActive, setReplayCountdownActive] = useState(false);
  const [showRarityBadge, setShowRarityBadge] = useState(false);
  const handleReplayCountdownDone = useRef(() => setShowReplay(true)).current;

  // PA announcement typing — starts after headline bounce-in settles
  const paText = `NOW COLLECTING... ${moment.player.toUpperCase()} · ${moment.playType.toUpperCase()}`;
  const pa = usePATypewriter(paText, 800, 40);

  useEffect(() => {
    CROWD_HAPTIC.celebration();
    const t0 = setTimeout(() => setShake(false), intensity.shakeDuration);
    const t1 = setTimeout(() => setFlash(false), intensity.flashDuration);
    const t2 = setTimeout(() => setShowDetails(true), 700);
    const t3 = setTimeout(() => setShowShare(true), 1400);
    // Rarity badge slams in after the initial flash settles
    const tBadge = setTimeout(() => setShowRarityBadge(true), intensity.flashDuration + 200);
    // Start replay countdown after details are visible
    const t4 = setTimeout(() => setReplayCountdownActive(true), 900);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(tBadge); };
  }, [intensity.shakeDuration, intensity.flashDuration]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0B0E14]"
      style={{
        animation: shake ? 'arena-rumble 0.5s ease-out' : undefined,
      }}
    >
      {/* Entry flash — team color, intensity scales with tier rarity */}
      <div
        className="absolute inset-0 z-[60] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: tierName === 'Open' ? moment.teamColors.primary : tierColor,
          opacity: flash ? intensity.flashOpacity : 0,
        }}
      />

      <ConfettiCannon
        colors={[
          tierColor, '#00E5A0', '#3B82F6', '#F59E0B', '#A855F7', '#EF4444',
          moment.teamColors.primary, moment.teamColors.secondary,
        ]}
        teamColor={moment.teamColors.primary}
        tierName={tierName}
      />

      {/* Celebration Shimmer — continuous falling sparkle particles */}
      <CelebrationShimmer teamColor={moment.teamColors.primary} />

      {/* Pyrotechnic starbursts — arena rafter mortar effects */}
      <Pyrotechnics teamColor={moment.teamColors.primary} secondaryColor={moment.teamColors.secondary} tierName={tierName} />

      {/* Team-color ambient glow — tier-scaled */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 45%, ${tierName === 'Open' ? moment.teamColors.primary : tierColor}${tierName === 'Ultimate' ? '35' : tierName === 'Legendary' ? '30' : '25'} 0%, transparent 65%)`,
        }}
      />

      {/* ─── Rarity Reveal Badge — tier badge slams in with overshoot ─── */}
      {/* Higher tiers get bigger badges with more dramatic entrance.       */}
      {/* The badge sits at the top of the celebration screen as a          */}
      {/* jumbotron-style announcement of what tier was collected.           */}
      {showRarityBadge && tierName !== 'Open' && (
        <div
          className="absolute z-[55] pointer-events-none flex flex-col items-center"
          style={{
            top: tierName === 'Ultimate' ? '6%' : '7%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'arena-rarity-badge-slam 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Glow ring behind badge */}
          <div
            className="absolute rounded-full"
            style={{
              width: tierName === 'Ultimate' ? '140px' : tierName === 'Legendary' ? '110px' : '80px',
              height: tierName === 'Ultimate' ? '140px' : tierName === 'Legendary' ? '110px' : '80px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${tierColor}30 0%, transparent 70%)`,
              animation: 'arena-rarity-glow-pulse 2s ease-in-out infinite',
            }}
          />
          {/* Badge container */}
          <div
            className="relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-sm"
            style={{
              backgroundColor: `${tierColor}15`,
              border: `1.5px solid ${tierColor}50`,
              boxShadow: `0 0 ${tierName === 'Ultimate' ? '30' : tierName === 'Legendary' ? '20' : '12'}px ${tierColor}30, inset 0 0 12px ${tierColor}08`,
            }}
          >
            {/* Tier icon — diamond for Ultimate, star for Legendary, dot for Rare */}
            <span
              className="text-[10px]"
              style={{ color: tierColor, filter: `drop-shadow(0 0 4px ${tierColor})` }}
            >
              {tierName === 'Ultimate' ? '◆' : tierName === 'Legendary' ? '★' : '●'}
            </span>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: tierColor,
                textShadow: `0 0 8px ${tierColor}60`,
              }}
            >
              {intensity.label}
            </span>
            {tierName === 'Ultimate' && (
              <span
                className="text-[7px] uppercase tracking-[0.3em] mt-0.5"
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  color: `${tierColor}80`,
                  animation: 'arena-rarity-shimmer 3s linear infinite',
                  backgroundImage: `linear-gradient(90deg, ${tierColor}80, ${tierColor}, ${tierColor}80)`,
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                GRAIL STATUS
              </span>
            )}
          </div>
        </div>
      )}

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

        {/* Shockwave impact rings — concentric blasts from headline center */}
        {/* NBA jumbotrons fire expanding ring graphics on slam dunks.      */}
        {/* 3 staggered rings create a sonic-boom cascade behind the text.  */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[41]">
          {[0, 0.15, 0.32].map((delay, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: '100px',
                height: '100px',
                border: `3px solid ${moment.teamColors.primary}`,
                animation: `arena-shockwave-ring 1s cubic-bezier(0.2, 0.6, 0.3, 1) ${delay}s forwards`,
                opacity: 0,
                boxShadow: `0 0 24px ${moment.teamColors.primary}35, inset 0 0 12px ${moment.teamColors.primary}15`,
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

        {/* Jumbotron Replay Countdown — 3-2-1-REPLAY! before the highlight */}
        {/* NBA arenas build anticipation before replays with a dramatic      */}
        {/* countdown on the jumbotron. Numbers slam in, crowd gets hyped.    */}
        {replayCountdownActive && !showReplay && (
          <div
            className="mt-5 transition-all duration-300 ease-out"
            style={{
              opacity: showDetails ? 1 : 0,
              transform: showDetails ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <ReplayCountdown
              teamColor={moment.teamColors.primary}
              onComplete={handleReplayCountdownDone}
            />
          </div>
        )}

        {/* Jumbotron Highlight Replay — the actual moment on the big screen */}
        {/* Every arena replays the highlight on the jumbotron during the     */}
        {/* post-game celebration. This shows what you collected, not just     */}
        {/* your stats — the basketball moment itself.                        */}
        <div
          className="mt-5 w-full max-w-[300px] transition-all duration-600 ease-out"
          style={{
            opacity: showReplay ? 1 : 0,
            transform: showReplay ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.94)',
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              border: `1px solid ${moment.teamColors.primary}30`,
              boxShadow: `0 0 40px ${moment.teamColors.primary}10, inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* 16:9 action image — jumbotron replay viewport */}
            <div
              className="relative w-full overflow-hidden"
              style={{ paddingTop: '56.25%' /* 16:9 */ }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${moment.actionImageUrl})`,
                  backgroundPosition: 'center 30%',
                  filter: 'contrast(1.1) saturate(1.15)',
                }}
              />
              {/* Scanline overlay for jumbotron LED feel */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                }}
              />
              {/* Bottom vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to top, ${moment.teamColors.primary}30 0%, transparent 40%, transparent 80%, rgba(11,14,20,0.3) 100%)`,
                }}
              />
              {/* INSTANT REPLAY badge — top-left with breathing play indicator */}
              <div
                className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded px-2 py-1"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.85)',
                  boxShadow: '0 0 10px rgba(239,68,68,0.3)',
                }}
              >
                {/* Play triangle icon — pulses to suggest active playback */}
                <svg
                  className="h-2.5 w-2.5"
                  viewBox="0 0 10 10"
                  fill="white"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))',
                  }}
                >
                  <polygon points="1,0 10,5 1,10" />
                </svg>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.2em] text-white"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Instant Replay
                </span>
              </div>
              {/* Replay count badge — top-right */}
              <div
                className="absolute top-2.5 right-2.5 rounded px-1.5 py-0.5"
                style={{
                  backgroundColor: 'rgba(11,14,20,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span
                  className="text-[8px] font-mono font-bold tabular-nums text-white/60"
                >
                  ×{Math.min(12, 3 + Math.floor(editionNumber % 10))}
                </span>
              </div>
              {/* Player name + play type — bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 pt-6">
                <span
                  className="block text-lg uppercase leading-none tracking-tight text-white"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontWeight: 700,
                    textShadow: '0 1px 6px rgba(0,0,0,0.7)',
                  }}
                >
                  {moment.player}
                </span>
                <span
                  className="mt-0.5 block text-[10px] uppercase tracking-[0.15em]"
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  }}
                >
                  {moment.playType} · {moment.team} vs {moment.opponent}
                </span>
              </div>
              {/* Jumbotron replay progress scrubber — video playback bar */}
              <div className="absolute bottom-0 left-0 right-0 z-[2]">
                {/* Timestamp + duration — bottom corners */}
                <div
                  className="flex items-center justify-between px-2.5 pb-[5px]"
                  style={{ animation: 'arena-replay-timestamp 12s ease-out 0.5s both' }}
                >
                  <ReplayTimestamp durationSec={12} startDelay={500} />
                  <span
                    className="text-[8px] font-mono tabular-nums text-white/30"
                  >
                    0:12
                  </span>
                </div>
                {/* Progress bar track — with glow surges at key replay moments */}
                <div className="h-[3px] w-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-r-full"
                    style={{
                      backgroundColor: moment.teamColors.primary,
                      color: moment.teamColors.primary,
                      boxShadow: `0 0 6px ${moment.teamColors.primary}60`,
                      animation: 'arena-replay-progress 12s linear 0.5s both, arena-replay-glow 12s ease-in-out 0.5s both',
                    }}
                  />
                </div>
              </div>
            </div>
            {/* Stat line bar — key play stats in jumbotron ticker style */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{
                backgroundColor: 'rgba(11,14,20,0.95)',
                borderTop: `1px solid ${moment.teamColors.primary}15`,
              }}
            >
              {moment.statLine.split(' / ').map((stat, idx) => {
                const parts = stat.trim().split(' ');
                const value = parts[0];
                const label = parts.slice(1).join(' ');
                return (
                  <div
                    key={stat}
                    className="flex items-center gap-1.5"
                    style={{
                      animation: showDetails ? `arena-stat-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) ${0.3 + idx * 0.1}s both` : undefined,
                    }}
                  >
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: moment.teamColors.primary,
                      }}
                    >
                      {value}
                    </span>
                    <span
                      className="text-[8px] uppercase tracking-wider text-white/30"
                      style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

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

        {/* Collector of the Game — post-game jumbotron MVP award card */}
        {/* Every NBA arena announces the "Player of the Game" on the      */}
        {/* jumbotron after the final buzzer — a spotlight moment with the  */}
        {/* player's stats and a trophy graphic. This is the collector     */}
        {/* equivalent: you're the MVP of this drop.                       */}
        <div
          className="mt-5 w-full max-w-[280px] transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
            transitionDelay: '0.22s',
          }}
        >
          <div
            className="relative overflow-hidden rounded-xl border"
            style={{
              borderColor: `${moment.teamColors.primary}30`,
              background: `linear-gradient(170deg, ${moment.teamColors.primary}14 0%, rgba(11,14,20,0.95) 40%, rgba(11,14,20,0.98) 100%)`,
            }}
          >
            {/* Top accent — team-color gradient bar */}
            <div
              className="h-[3px]"
              style={{
                background: `linear-gradient(90deg, ${moment.teamColors.primary}, ${moment.teamColors.secondary ?? moment.teamColors.primary}, ${moment.teamColors.primary})`,
              }}
            />

            {/* Award header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                {/* Trophy icon — simplified jumbotron MVP trophy */}
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{ color: moment.teamColors.primary }}
                >
                  <path
                    d="M6 3h8v1h3a1 1 0 011 1v2a3 3 0 01-3 3h-.29A5 5 0 0111 13.92V16h2a1 1 0 011 1v1H6v-1a1 1 0 011-1h2v-2.08A5 5 0 015.29 10H5a3 3 0 01-3-3V5a1 1 0 011-1h3V3z"
                    fill="currentColor"
                    opacity="0.8"
                  />
                  <path
                    d="M6 3h8v1h3a1 1 0 011 1v2a3 3 0 01-3 3h-.29A5 5 0 0111 13.92V16h2a1 1 0 011 1v1H6v-1a1 1 0 011-1h2v-2.08A5 5 0 015.29 10H5a3 3 0 01-3-3V5a1 1 0 011-1h3V3z"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: moment.teamColors.primary,
                    textShadow: `0 0 12px ${moment.teamColors.primary}40`,
                  }}
                >
                  Collector of the Game
                </span>
              </div>
              <span
                className="text-[7px] font-mono uppercase tracking-wider"
                style={{ color: '#00E5A0', opacity: 0.5 }}
              >
                MVP
              </span>
            </div>

            {/* Player + moment context */}
            <div className="px-4 pb-2">
              <span
                className="text-[22px] uppercase leading-none tracking-tight text-white"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 700,
                  textShadow: `0 0 16px ${moment.teamColors.primary}30`,
                }}
              >
                {moment.player}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-white/25">
                  {moment.playType}
                </span>
                <span className="text-white/10">·</span>
                <span className="text-[9px] uppercase tracking-wider text-white/25">
                  {moment.team} vs {moment.opponent}
                </span>
              </div>
            </div>

            {/* Stats row — jumbotron-style stat line */}
            <div
              className="mx-4 mb-3 grid grid-cols-3 gap-[1px] overflow-hidden rounded-lg"
              style={{ backgroundColor: `${moment.teamColors.primary}10` }}
            >
              {[
                { label: 'EDITION', value: `#${editionNumber.toLocaleString()}` },
                { label: 'SPEED', value: `${acquireTime}s` },
                { label: 'RANK', value: `Top ${percentile}%` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center bg-[#0B0E14] py-2.5"
                >
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/20"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className="mt-0.5 text-[16px] font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: '#00E5A0',
                      textShadow: '0 0 8px rgba(0,229,160,0.25)',
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom accent — "Presented by" like real jumbotron award sponsors */}
            <div
              className="flex items-center justify-center py-2"
              style={{
                borderTop: `1px solid ${moment.teamColors.primary}12`,
                background: `linear-gradient(90deg, transparent, ${moment.teamColors.primary}06, transparent)`,
              }}
            >
              <span
                className="text-[7px] uppercase tracking-[0.3em] text-white/12"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Presented by Top Shot This
              </span>
            </div>
          </div>
        </div>

        {/* Digital Ticket Stub — arena keepsake for screenshots */}
        <div
          className="mt-5 w-full max-w-[280px] transition-all duration-600 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
            transitionDelay: '0.28s',
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

        {/* Tonight's Attendance — jumbotron PA system announcement */}
        {/* "Tonight's attendance: 19,847. Thank you for being here tonight." */}
        <AttendanceAnnouncement
          total={total}
          claimed={feedEvents.length}
          teamColor={moment.teamColors.primary}
          show={showDetails}
        />

        {/* Jumbotron Crowd Cam Grid — 3×3 grid of "camera feeds" showing you + other buyers */}
        {/* NBA arenas display crowd cam grids on the jumbotron — 9 camera feeds showing    */}
        {/* different sections of fans reacting. The center feed is always the spotlight.    */}
        {/* This puts the buyer in center-cam surrounded by other recent collectors,         */}
        {/* creating "you're part of the crowd" social proof and screenshot-worthy content.  */}
        <CrowdCamGrid
          editionNumber={editionNumber}
          feedEvents={feedEvents}
          teamColor={moment.teamColors.primary}
          secondaryColor={moment.teamColors.secondary}
          show={showDetails}
        />

        {/* Victory Horn — interactive post-win ritual like Spurs drum / Rockets liftoff */}
        {/* In every NBA arena, the post-win moment has a ritual: a drum bang, a horn     */}
        {/* blast, a button press. This gives the user something to DO on the W screen    */}
        {/* — slam the horn to celebrate. Each hit triggers haptic + visual feedback.     */}
        <VictoryHorn
          teamColor={moment.teamColors.primary}
          secondaryColor={moment.teamColors.secondary}
          show={showDetails}
        />

        {/* Share section */}
        <div
          className="mt-7 flex flex-col items-center transition-all duration-500 ease-out"
          style={{
            opacity: showShare ? 1 : 0,
            transform: showShare ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* Primary share CTA */}
          <button
            className="rounded-full bg-[#00E5A0] px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-95"
            onClick={() => CROWD_HAPTIC.ctaSlam()}
          >
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
                onClick={() => CROWD_HAPTIC.fanCam()}
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
      CROWD_HAPTIC.buzzer();
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
      if (cur === 'CLOSING') CROWD_HAPTIC.closing();
      if (cur === 'CRITICAL') CROWD_HAPTIC.critical();
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
      CROWD_HAPTIC.hornBlast();
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

/* ─── Arena Crowd Countdown — final 10s jumbotron number sequence ── */
/* In NBA arenas, the crowd counts down the final seconds of a close  */
/* game: "10... 9... 8..." with each number blazing on the jumbotron. */
/* This fires when totalSeconds ≤ 10, showing a massive number that   */
/* pulses per second with increasing scale/glow as it approaches 0.   */

function useCrowdCountdown(totalSeconds: number, isEnded: boolean) {
  const [displayNum, setDisplayNum] = useState<number | null>(null);
  const prevSeconds = useRef(totalSeconds);
  const activeRef = useRef(false);

  useEffect(() => {
    if (isEnded) {
      setDisplayNum(null);
      activeRef.current = false;
      return;
    }
    // Enter countdown zone at ≤10s
    if (totalSeconds <= 10 && totalSeconds > 0) {
      activeRef.current = true;
      // Only update on actual second change
      if (totalSeconds !== prevSeconds.current) {
        setDisplayNum(totalSeconds);
        CROWD_HAPTIC.countdownTick(totalSeconds);
      } else if (!activeRef.current || displayNum === null) {
        setDisplayNum(totalSeconds);
      }
    } else {
      setDisplayNum(null);
      activeRef.current = false;
    }
    prevSeconds.current = totalSeconds;
  }, [totalSeconds, isEnded, displayNum]);

  return displayNum;
}

function CrowdCountdown({ num, teamColor }: { num: number; teamColor: string }) {
  // Key by num to remount on each tick → restart animation
  const intensity = 1 - num / 10; // 0 at 10, 1 at 1
  const fontSize = 80 + intensity * 60; // 80px at 10 → 140px at 1
  const glowSpread = 30 + intensity * 50;
  const glowAlpha = 0.3 + intensity * 0.5;
  const bgAlpha = 0.4 + intensity * 0.35;
  const isUrgent = num <= 3;

  return (
    <div
      key={num}
      className="pointer-events-none fixed inset-0 z-[44] flex items-center justify-center"
    >
      {/* Dark backdrop — intensifies as countdown progresses */}
      <div
        className="absolute inset-0 arena-crowd-countdown-bg"
        style={{
          backgroundColor: `rgba(11,14,20,${bgAlpha})`,
        }}
      />
      {/* Radial pulse ring — expands outward from the number */}
      <div
        className="absolute arena-crowd-countdown-ring"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: `2px solid ${isUrgent ? '#EF4444' : teamColor}`,
          boxShadow: `0 0 ${glowSpread}px ${isUrgent ? 'rgba(239,68,68,0.3)' : `${teamColor}40`}`,
        }}
      />
      {/* The number */}
      <span
        className="relative arena-crowd-countdown-num"
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          fontWeight: 800,
          fontSize: `${fontSize}px`,
          lineHeight: 1,
          color: isUrgent ? '#EF4444' : '#F0F2F5',
          textShadow: `0 0 ${glowSpread}px ${isUrgent ? `rgba(239,68,68,${glowAlpha})` : `${teamColor}${Math.round(glowAlpha * 255).toString(16).padStart(2, '0')}`}, 0 0 ${glowSpread * 2}px ${isUrgent ? `rgba(239,68,68,${glowAlpha * 0.4})` : `${teamColor}30`}`,
          letterSpacing: '-0.02em',
        }}
      >
        {num}
      </span>
      {/* "CROWD COUNTDOWN" label — small jumbotron badge */}
      <div
        className="absolute arena-crowd-countdown-label"
        style={{ bottom: 'calc(50% - 70px)' }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: isUrgent ? 'rgba(239,68,68,0.6)' : `${teamColor}99`,
          }}
        >
          {isUrgent ? 'GOING GOING GONE' : 'CROWD COUNTDOWN'}
        </span>
      </div>
    </div>
  );
}

/* ─── Purchase Ceremony — jumbotron 3-2-1-YOURS! crowd countdown ── */
/* When the user hits buy, the arena erupts into a coordinated chant. */
/* 3 beats matched to the 3 purchase stages: the crowd counts you in */
/* like counting down a buzzer-beater. EQ bars build from rumble to  */
/* eruption. Each number slams in jumbotron-style.                   */

function PurchaseCeremony({
  stage,
  teamColor,
  tierName = 'Open',
}: {
  stage: number; // 0=reserving(3!), 1=processing(2!..1!), 2=secured(YOURS!)
  teamColor: string;
  tierName?: string;
}) {
  const intensity = TIER_INTENSITY[tierName] ?? TIER_INTENSITY.Open;
  const tierColor = TIER_COLOR[tierName] ?? '#00E5A0';
  /* Track sub-beats within stage 1: show "2" then "1" */
  const [subBeat, setSubBeat] = useState(0);
  useEffect(() => {
    if (stage === 1) {
      setSubBeat(0);
      const t = setTimeout(() => setSubBeat(1), 300);
      return () => clearTimeout(t);
    }
    setSubBeat(0);
  }, [stage]);

  /* Haptic tick per beat */
  useEffect(() => {
    CROWD_HAPTIC.countdownTick(stage === 0 ? 3 : stage === 1 ? (subBeat === 0 ? 2 : 1) : 0);
  }, [stage, subBeat]);

  const displayText =
    stage === 0 ? '3' : stage === 1 ? (subBeat === 0 ? '2' : '1') : 'YOURS!';
  const isFinale = stage === 2;
  const beatKey = stage === 1 ? `1-${subBeat}` : `${stage}`;

  /* EQ bar heights escalate: stage 0 = low rumble, 1 = building, 2 = eruption */
  /* Premium tiers get taller bars via intensity.eqBarScale */
  const barCount = 12;
  const s = intensity.eqBarScale;
  const barHeights = Array.from({ length: barCount }, (_, i) => {
    const base =
      stage === 0 ? 15 + Math.sin(i * 0.8) * 10
        : stage === 1 ? 30 + Math.sin(i * 1.2 + subBeat * 2) * 20
          : 60 + Math.sin(i * 0.6) * 30;
    return Math.min(120, Math.max(8, (base + (isFinale ? Math.random() * 20 : 0)) * s));
  });

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[46] flex flex-col items-center justify-center"
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: isFinale ? `rgba(11,14,20,0.85)` : `rgba(11,14,20,0.7)`,
          transition: 'background-color 0.3s ease',
        }}
      />

      {/* EQ bars — crowd energy crescendo behind the number */}
      <div className="absolute flex items-end justify-center gap-[3px]" style={{ bottom: 'calc(50% - 60px)' }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="rounded-t-sm transition-all duration-300 ease-out"
            style={{
              width: '4px',
              height: `${h}px`,
              backgroundColor: isFinale
                ? i % 2 === 0 ? teamColor : '#00E5A0'
                : `${teamColor}${Math.round((0.3 + (h / 100) * 0.5) * 255).toString(16).padStart(2, '0')}`,
              boxShadow: isFinale ? `0 0 6px ${teamColor}60` : 'none',
              animation: isFinale ? `arena-ceremony-bar 0.4s ease-out ${i * 0.03}s both` : 'none',
            }}
          />
        ))}
      </div>

      {/* The countdown number / YOURS! text */}
      <span
        key={beatKey}
        className="relative arena-ceremony-slam"
        style={{
          fontFamily: 'var(--font-oswald), sans-serif',
          fontWeight: 800,
          fontSize: isFinale ? '52px' : '100px',
          lineHeight: 1,
          color: isFinale ? '#00E5A0' : '#F0F2F5',
          textShadow: isFinale
            ? `0 0 40px rgba(0,229,160,0.6), 0 0 80px rgba(0,229,160,0.3)`
            : `0 0 30px ${teamColor}50, 0 0 60px ${teamColor}25`,
          letterSpacing: isFinale ? '0.08em' : '-0.02em',
        }}
      >
        {displayText}
      </span>

      {/* Pulse rings on each beat — premium tiers get multiple staggered rings */}
      {Array.from({ length: intensity.pulseRings }).map((_, ri) => (
        <div
          key={`ring-${beatKey}-${ri}`}
          className="absolute arena-ceremony-ring"
          style={{
            width: `${160 + ri * 40}px`,
            height: `${160 + ri * 40}px`,
            borderRadius: '50%',
            border: `2px solid ${isFinale ? (ri % 2 === 0 ? '#00E5A0' : tierColor) : teamColor}`,
            animationDelay: `${ri * 0.08}s`,
            opacity: 1 - ri * 0.15,
          }}
        />
      ))}

      {/* Label */}
      <div
        className="absolute"
        style={{ top: 'calc(50% + 60px)' }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: isFinale ? 'rgba(0,229,160,0.7)' : `${teamColor}80`,
          }}
        >
          {isFinale ? 'THE CROWD GOES WILD' : 'THE ARENA COUNTS YOU IN'}
        </span>
      </div>

      {/* Team-color flash on finale */}
      {isFinale && (
        <div
          className="absolute inset-0 arena-ceremony-flash"
          style={{
            backgroundColor: teamColor,
            opacity: 0,
          }}
        />
      )}
    </div>
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

/* ─── Arena LED Ribbon — continuous scrolling ticker like jumbotron ring ── */
/* Every NBA arena has an LED ribbon strip that circles above the seating,  */
/* continuously scrolling player stats, scores, and promos. This thin       */
/* ticker sits between the header and hero, scrolling moment data in a      */
/* dot-matrix-inspired style with team-color accents. Persistent atmosphere */
/* — always running, always live. Makes the page feel like the inside of    */
/* an arena before you even reach the hero image.                           */

function ArenaLEDRibbon({ moment, isActive }: { moment: Moment; isActive: boolean }) {
  if (!isActive) return null;

  const items = [
    `★ ${moment.player.toUpperCase()} — ${moment.playType.toUpperCase()}`,
    moment.statLine.toUpperCase(),
    `${moment.team} vs ${moment.opponent}  •  ${moment.context}`,
    `${moment.editionsClaimed.toLocaleString()} EDITIONS CLAIMED`,
    `LIVE DROP  •  TOP SHOT THIS`,
    `${moment.team.toUpperCase()} ARENA  •  ${moment.player.toUpperCase()} MOMENT OF THE NIGHT`,
  ];
  const ribbonText = items.join('     ◆     ');

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: '22px',
        backgroundColor: 'rgba(11,14,20,0.95)',
        borderTop: `1px solid ${moment.teamColors.primary}15`,
        borderBottom: `1px solid ${moment.teamColors.primary}15`,
      }}
    >
      {/* Subtle LED dot-matrix texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
        }}
      />
      {/* Scrolling content — duplicated for seamless loop */}
      <div
        className="flex items-center h-full whitespace-nowrap"
        style={{ animation: 'arena-led-ribbon 25s linear infinite' }}
      >
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] pl-4"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: moment.teamColors.primary,
              opacity: 0.7,
              textShadow: `0 0 8px ${moment.teamColors.primary}30`,
              filter: 'brightness(1.1)',
            }}
          >
            {ribbonText}
          </span>
        ))}
      </div>
      {/* Fade edges — arena LED ribbons have soft falloff at screen edges */}
      <div
        className="absolute inset-y-0 left-0 w-8 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(11,14,20,0.95), transparent)' }}
      />
      <div
        className="absolute inset-y-0 right-0 w-8 pointer-events-none"
        style={{ background: 'linear-gradient(to left, rgba(11,14,20,0.95), transparent)' }}
      />
    </div>
  );
}

/* ─── Jumbotron LED Frame — animated pixel border around hero ─────────── */
/* Every NBA arena jumbotron has a visible LED bezel — a thin border of     */
/* running pixel lights that frames the screen. This creates that effect    */
/* around the hero section using animated SVG dots traveling clockwise.     */
/* Phase-aware: team-color in OPEN, amber in CLOSING, red in CRITICAL.     */
/* The frame makes the hero literally look like a jumbotron screen.         */

function JumbotronLEDFrame({
  teamColor,
  isClosing,
  isCritical,
  isActive,
}: {
  teamColor: string;
  isClosing: boolean;
  isCritical: boolean;
  isActive: boolean;
}) {
  if (!isActive) return null;

  const frameColor = isCritical ? '#EF4444' : isClosing ? '#F59E0B' : teamColor;
  const dotCount = 24; // dots traveling around the perimeter
  const speed = isCritical ? 4 : isClosing ? 6 : 8; // seconds per full loop

  return (
    <div className="pointer-events-none absolute inset-0 z-[6] overflow-hidden">
      {/* Corner accents — bright LED clusters at each corner */}
      {[
        { top: 0, left: 0 },
        { top: 0, right: 0 },
        { bottom: 0, left: 0 },
        { bottom: 0, right: 0 },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            ...pos as React.CSSProperties,
            width: '6px',
            height: '6px',
            backgroundColor: frameColor,
            boxShadow: `0 0 6px ${frameColor}80, 0 0 12px ${frameColor}40`,
            opacity: isCritical ? 0.9 : 0.5,
          }}
        />
      ))}

      {/* Top edge — running dots left to right */}
      <div className="absolute top-0 left-0 right-0 h-[2px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${frameColor}00 0px, ${frameColor}60 4px, ${frameColor}00 8px)`,
            backgroundSize: `${100 / (dotCount / 4)}% 100%`,
            animation: `arena-led-frame-h ${speed}s linear infinite`,
          }}
        />
        {/* Scanline texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 1px, ${frameColor}15 1px, ${frameColor}15 2px)`,
            backgroundSize: '2px 100%',
          }}
        />
      </div>

      {/* Bottom edge — running dots right to left */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${frameColor}00 0px, ${frameColor}60 4px, ${frameColor}00 8px)`,
            backgroundSize: `${100 / (dotCount / 4)}% 100%`,
            animation: `arena-led-frame-h ${speed}s linear infinite reverse`,
          }}
        />
      </div>

      {/* Left edge — running dots top to bottom */}
      <div className="absolute top-0 bottom-0 left-0 w-[2px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, ${frameColor}00 0px, ${frameColor}60 4px, ${frameColor}00 8px)`,
            backgroundSize: `100% ${100 / (dotCount / 4)}%`,
            animation: `arena-led-frame-v ${speed}s linear infinite`,
          }}
        />
      </div>

      {/* Right edge — running dots bottom to top */}
      <div className="absolute top-0 bottom-0 right-0 w-[2px]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, ${frameColor}00 0px, ${frameColor}60 4px, ${frameColor}00 8px)`,
            backgroundSize: `100% ${100 / (dotCount / 4)}%`,
            animation: `arena-led-frame-v ${speed}s linear infinite reverse`,
          }}
        />
      </div>

      {/* Outer glow — subtle halo on the hero edges */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 15px ${frameColor}08, inset 0 0 3px ${frameColor}12`,
        }}
      />
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

/* ─── Replay Center Review — NBA-style challenge overlay during purchase ── */
/* When you click buy, the jumbotron shows "PLAY UNDER REVIEW" like an NBA     */
/* instant replay challenge. Then "CALL CONFIRMED" flashes before the W screen */
/* appears. Turns the 1.5s purchase processing into an arena moment.           */

function ReplayReviewOverlay({ active, stage, teamColor }: {
  active: boolean; stage: number; teamColor: string;
}) {
  const [phase, setPhase] = useState<'hidden' | 'review' | 'confirmed' | 'done'>('hidden');

  useEffect(() => {
    if (!active) { setPhase('hidden'); return; }
    // Show "UNDER REVIEW" immediately on purchase
    setPhase('review');
    // At stage 2 (secured), show "CALL CONFIRMED"
    const t1 = setTimeout(() => setPhase('confirmed'), 1000);
    const t2 = setTimeout(() => setPhase('done'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  if (phase === 'hidden' || phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
      style={{
        backgroundColor: phase === 'review' ? 'rgba(11,14,20,0.55)' : 'rgba(11,14,20,0.35)',
        transition: 'background-color 0.4s ease',
      }}
    >
      {/* Replay center frame — like the NBA replay center control room */}
      <div
        className="relative flex flex-col items-center gap-3 px-10 py-8"
        style={{
          animation: phase === 'review'
            ? 'arena-timeout-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : 'none',
        }}
      >
        {/* Scanning line — sweeps horizontally like video analysis */}
        {phase === 'review' && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ opacity: 0.08 }}
          >
            <div
              className="absolute top-0 left-0 w-full h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${teamColor}, transparent)`,
                animation: 'arena-crowd-wave 2s linear infinite',
              }}
            />
          </div>
        )}

        {/* Replay icon — play/pause symbol */}
        <div className="flex items-center gap-2 mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.5 }}>
            <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" stroke={teamColor} strokeWidth="1.5" />
            <path d="M10 8l6 4-6 4V8z" fill={teamColor} fillOpacity="0.6" />
          </svg>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.35em]"
            style={{
              color: phase === 'confirmed' ? '#00E5A0' : teamColor,
              fontFamily: 'var(--font-oswald), sans-serif',
              transition: 'color 0.3s ease',
            }}
          >
            {phase === 'confirmed' ? 'Replay Center' : 'Replay Center'}
          </span>
        </div>

        {/* Main text — dramatic jumbotron treatment */}
        <h2
          className="text-[clamp(1.6rem,6vw,2.8rem)] font-bold uppercase tracking-[0.12em] leading-none text-center"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: phase === 'confirmed' ? '#00E5A0' : 'rgba(255,255,255,0.9)',
            textShadow: phase === 'confirmed'
              ? '0 0 30px rgba(0,229,160,0.4), 0 0 60px rgba(0,229,160,0.15)'
              : `0 0 30px ${teamColor}4D, 0 0 60px ${teamColor}1A`,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: phase === 'confirmed' ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {phase === 'confirmed' ? 'CALL CONFIRMED' : 'PLAY UNDER REVIEW'}
        </h2>

        {/* Team-color accent lines — expand from center */}
        <div className="flex items-center gap-4 mt-1">
          <div
            className="h-[1px]"
            style={{
              width: '48px',
              backgroundColor: phase === 'confirmed' ? '#00E5A0' : teamColor,
              opacity: 0.4,
              transition: 'background-color 0.3s ease',
            }}
          />
          <div
            className="h-[6px] w-[6px] rounded-full"
            style={{
              backgroundColor: phase === 'confirmed' ? '#00E5A0' : teamColor,
              boxShadow: phase === 'confirmed'
                ? '0 0 8px rgba(0,229,160,0.5)'
                : `0 0 8px ${teamColor}66`,
              transition: 'all 0.3s ease',
            }}
          />
          <div
            className="h-[1px]"
            style={{
              width: '48px',
              backgroundColor: phase === 'confirmed' ? '#00E5A0' : teamColor,
              opacity: 0.4,
              transition: 'background-color 0.3s ease',
            }}
          />
        </div>

        {/* Subtitle — reviewing / confirmed */}
        <span
          className="text-[10px] uppercase tracking-[0.2em] mt-1"
          style={{
            color: phase === 'confirmed' ? 'rgba(0,229,160,0.6)' : 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-oswald), sans-serif',
            transition: 'color 0.3s ease',
          }}
        >
          {phase === 'confirmed' ? 'Edition Secured' : 'Verifying Transaction'}
        </span>
      </div>
    </div>
  );
}

/* ─── Defense Stomp — jumbotron "DE-FENSE" graphic on low stock ──── */
/* Every NBA arena shows the "DE-FENSE" stomp graphic on the jumbotron      */
/* during close games. Here it triggers when ≥80% of editions are claimed   */
/* — "defend your spot, buy before they're gone." One-shot per session.     */

function useDefenseStomp(claimedPct: number, isEnded: boolean) {
  const [visible, setVisible] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || isEnded) return;
    if (claimedPct >= 0.80) {
      firedRef.current = true;
      setVisible(true);
      CROWD_HAPTIC.defenseStomp();
      const t = setTimeout(() => setVisible(false), 2800);
      return () => clearTimeout(t);
    }
  }, [claimedPct, isEnded]);

  return visible;
}

function DefenseStompOverlay({ visible, teamColor }: { visible: boolean; teamColor: string }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[37] flex items-center justify-center pointer-events-none"
      style={{ animation: 'arena-timeout-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      {/* Stomp shockwave ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          border: `2px solid ${teamColor}30`,
          animation: 'arena-horn-ring 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      />
      <div className="flex flex-col items-center gap-2">
        {/* Stomp feet icons */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl" style={{ opacity: 0.7, animation: 'arena-timeout-in 0.3s ease 0.1s both' }}>👟</span>
          <span className="text-2xl" style={{ opacity: 0.7, animation: 'arena-timeout-in 0.3s ease 0.25s both' }}>👟</span>
        </div>
        {/* DE-FENSE text — stomping letterpress style */}
        <h2
          className="text-[clamp(2rem,8vw,3.5rem)] font-bold uppercase tracking-[0.25em] leading-none"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: teamColor,
            textShadow: `0 0 30px ${teamColor}60, 0 0 60px ${teamColor}25, 0 4px 20px rgba(0,0,0,0.5)`,
            animation: 'arena-timeout-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
          }}
        >
          DE-FENSE
        </h2>
        {/* Subtext — contextual message */}
        <span
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: `${teamColor}80`,
            animation: 'arena-timeout-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both',
          }}
        >
          Editions running low — claim yours
        </span>
        {/* Team-color accent lines */}
        <div className="flex items-center gap-3 mt-1" style={{ animation: 'arena-timeout-in 0.4s ease 0.5s both' }}>
          <div className="h-[1px] w-10" style={{ backgroundColor: `${teamColor}30` }} />
          <div className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: teamColor, opacity: 0.4 }} />
          <div className="h-[1px] w-10" style={{ backgroundColor: `${teamColor}30` }} />
        </div>
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

/* ─── Fan Reaction Cam — tappable jumbotron reaction buttons ─────────── */
/* At every NBA arena, the jumbotron shows fan reactions — Kiss Cam,       */
/* Dance Cam, Flex Cam. The crowd gets excited when the camera finds them. */
/* Modern arenas also use AR emoji filters where fans' expressions trigger */
/* on-screen reactions. This translates that into tappable reaction        */
/* buttons: tap one, see YOUR reaction briefly displayed in a jumbotron    */
/* frame with your "section" number. Each tap fires haptic + brief         */
/* display. Creates active participation, not passive viewing.             */
/* Distinctly Arena: Supreme would never have fan reactions (institutional */
/* silence), Broadcast would show emoji as data (VU-meter style). Arena   */
/* puts the camera on YOU.                                                 */

const FAN_REACTIONS = [
  { emoji: '🔥', label: 'FIRE' },
  { emoji: '💪', label: 'FLEX' },
  { emoji: '😤', label: 'HYPED' },
  { emoji: '🤯', label: 'WILD' },
  { emoji: '👏', label: 'MVP' },
] as const;

function FanReactionCam({ teamColor, isActive }: { teamColor: string; isActive: boolean }) {
  const [activeReaction, setActiveReaction] = useState<{ emoji: string; label: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sectionNum = useMemo(() => Math.floor(Math.random() * 300) + 101, []);

  const handleTap = useCallback((reaction: { emoji: string; label: string }) => {
    CROWD_HAPTIC.fanCam();
    setActiveReaction(reaction);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveReaction(null), 2200);
  }, []);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  if (!isActive) return null;

  return (
    <div className="mx-4 mt-2 mb-1 relative z-[1]">
      {/* Jumbotron display — shows your reaction briefly */}
      {activeReaction && (
        <div
          key={activeReaction.label}
          className="mb-2 relative overflow-hidden rounded-lg"
          style={{
            backgroundColor: `${teamColor}10`,
            border: `1px solid ${teamColor}30`,
            animation: 'arena-reaction-cam-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
          }}
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
            }}
          />
          {/* Top accent bar */}
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${teamColor}, ${teamColor}40)` }} />
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              {/* Camera viewfinder icon */}
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" style={{ color: teamColor, opacity: 0.6 }}>
                <rect x="0.5" y="2.5" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="0.7" />
                <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="0.7" />
                <circle cx="6" cy="6" r="0.6" fill="currentColor" />
              </svg>
              <div className="flex flex-col">
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.3em]"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor }}
                >
                  Fan Cam
                </span>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/25">
                  SEC {sectionNum} · ROW {Math.floor(Math.random() * 20) + 1}
                </span>
              </div>
            </div>
            <span className="text-[28px]" style={{ filter: `drop-shadow(0 0 8px ${teamColor}40)` }}>
              {activeReaction.emoji}
            </span>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.15em]"
              style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor }}
            >
              {activeReaction.label}
            </span>
          </div>
        </div>
      )}
      {/* Tappable reaction buttons */}
      <div className="flex items-center justify-center gap-2">
        <span
          className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/10 mr-1"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          React
        </span>
        {FAN_REACTIONS.map((r) => (
          <button
            key={r.label}
            onClick={() => handleTap(r)}
            className="flex items-center gap-1 rounded-full px-2 py-1 transition-all active:scale-90"
            style={{
              backgroundColor: activeReaction?.label === r.label ? `${teamColor}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeReaction?.label === r.label ? `${teamColor}40` : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span className="text-[12px]">{r.emoji}</span>
            <span className="text-[7px] font-bold uppercase tracking-wider text-white/30">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Crowd Wave — stadium wave triggered by velocity spikes ─────────── */
/* In every NBA arena, the crowd wave is the ultimate expression of         */
/* collective energy — thousands of fans standing in sequence, creating a   */
/* ripple that circles the entire stadium. This triggers when purchase      */
/* velocity is high (≥15/min), rendering a row of vertical bars that       */
/* animate left-to-right with staggered timing, simulating the wave.       */
/* Distinctly Arena: Supreme would never show crowd behavior (auctions      */
/* are quiet), Broadcast would show a graphic overlay (not participation). */
/* Arena puts you IN the crowd, doing the wave.                            */

function useCrowdWave(velocity: number, isEnded: boolean) {
  const [active, setActive] = useState(false);
  const cooldownRef = useRef(false);
  useEffect(() => {
    if (isEnded || velocity < 15 || cooldownRef.current) return;
    // Trigger wave
    setActive(true);
    cooldownRef.current = true;
    // Wave lasts 2.5s, cooldown 8s before next wave can trigger
    const tEnd = setTimeout(() => setActive(false), 2500);
    const tCool = setTimeout(() => { cooldownRef.current = false; }, 8000);
    return () => { clearTimeout(tEnd); clearTimeout(tCool); };
  }, [velocity, isEnded]);
  return active;
}

function CrowdWave({ active, teamColor }: { active: boolean; teamColor: string }) {
  if (!active) return null;
  const barCount = 20;
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[38] pointer-events-none flex items-end justify-center gap-[2px] px-2"
      style={{ height: '40px' }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{
            backgroundColor: teamColor,
            height: '4px',
            opacity: 0,
            animation: `arena-crowd-wave 2.2s ease-in-out ${i * 0.09}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Jumbotron Trivia — "DID YOU KNOW?" player facts on the big screen ── */
/* Every NBA arena shows trivia facts on the jumbotron during free throws,     */
/* timeouts, and dead balls. "DID YOU KNOW? LeBron has 40,000 career points." */
/* This adds engagement context during the browsing/decision phase, framing    */
/* the moment as historically significant right when the user is deciding.     */

const JUMBOTRON_TRIVIA: Record<string, string[]> = {
  bam:   [
    'Bam Adebayo is the only player in Heat history to record 30+ PTS and 8+ REB in a playoff game at TD Garden.',
    'Adebayo has been named to 3 NBA All-Defensive teams — more than any active Heat player.',
    'This was the loudest recorded crowd reaction at TD Garden this postseason, per arena sensors.',
  ],
  jokic: [
    'Nikola Jokić joins Wilt Chamberlain and Oscar Robertson as the only players with 4 straight playoff triple-doubles.',
    'Jokić has the highest career playoff PER of any center in NBA history.',
    'That no-look pass was his 847th career assist — the most by any European-born center.',
  ],
  sga:   [
    'Shai Gilgeous-Alexander is the youngest Thunder player to score 40+ in a playoff game since Kevin Durant.',
    'SGA has scored 30+ in 7 consecutive playoff games — the longest active streak in the NBA.',
    'His mid-range shooting percentage this postseason (58%) is the highest since Michael Jordan in 1998.',
  ],
};

function JumbotronTrivia({ momentId, teamColor, isVisible }: {
  momentId: string; teamColor: string; isVisible: boolean;
}) {
  const [show, setShow] = useState(false);
  const [factIdx, setFactIdx] = useState(0);
  const firedRef = useRef(false);
  const facts = JUMBOTRON_TRIVIA[momentId] ?? JUMBOTRON_TRIVIA.bam;

  useEffect(() => {
    if (!isVisible || firedRef.current) return;
    // Show trivia after 6s of browsing the tier section
    const timer = setTimeout(() => {
      firedRef.current = true;
      setFactIdx(Math.floor(Math.random() * facts.length));
      setShow(true);
      // Auto-dismiss after 4.5s
      setTimeout(() => setShow(false), 4500);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isVisible, facts.length]);

  if (!show) return null;

  return (
    <div
      className="mx-4 mb-2 relative overflow-hidden rounded-lg"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        border: `1px solid ${teamColor}30`,
        animation: 'arena-trivia-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Team-color top accent bar — jumbotron screen edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${teamColor} 50%, transparent 95%)`,
        }}
      />
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Trivia icon — question mark in team-color circle */}
        <div
          className="flex-shrink-0 w-[26px] h-[26px] rounded-full flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: `${teamColor}20`,
            border: `1px solid ${teamColor}40`,
          }}
        >
          <span
            className="text-[13px] font-bold"
            style={{ color: teamColor, fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            ?
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {/* "DID YOU KNOW?" label — jumbotron graphic style */}
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{
              color: teamColor,
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            Did You Know?
          </span>
          <p className="mt-1 text-[11px] leading-[1.5] text-white/60">
            {facts[factIdx]}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Jumbotron Player Stat Card — arena intro-style big stat display ────── */
/* NBA arenas display player stat cards on the jumbotron during intros and   */
/* highlights. Large LED-style numbers, team-color accents, light sweep,     */
/* and scanline texture. Placed between hero and feed to bridge emotional    */
/* context into the transaction area — cold arrivals see big numbers first.  */

const PLAYER_STAT_HIGHLIGHTS: Record<string, { stats: { value: number; label: string; highlight?: string }[]; line: string }> = {
  bam: {
    stats: [
      { value: 30, label: 'PTS', highlight: 'FRANCHISE RECORD' },
      { value: 8, label: 'REB' },
      { value: 4, label: 'AST' },
    ],
    line: '12-17 FG · 5-6 FT · 1 BLK',
  },
  jokic: {
    stats: [
      { value: 35, label: 'PTS' },
      { value: 15, label: 'REB', highlight: 'TRIPLE-DOUBLE' },
      { value: 12, label: 'AST' },
    ],
    line: '14-22 FG · 6-7 FT · 2 STL',
  },
  sga: {
    stats: [
      { value: 38, label: 'PTS', highlight: 'OKC RECORD' },
      { value: 6, label: 'REB' },
      { value: 8, label: 'AST' },
    ],
    line: '13-21 FG · 11-12 FT · 2 STL',
  },
};

function JumbotronPlayerStatCard({ momentId, player, teamColor, secondaryColor, isActive }: {
  momentId: string;
  player: string;
  teamColor: string;
  secondaryColor: string;
  isActive: boolean;
}) {
  const data = PLAYER_STAT_HIGHLIGHTS[momentId] ?? PLAYER_STAT_HIGHLIGHTS.bam;

  if (!isActive) return null;

  return (
    <div
      className="mx-4 mt-3 relative overflow-hidden rounded-lg"
      style={{
        backgroundColor: 'rgba(0,0,0,0.75)',
        border: `1px solid ${teamColor}25`,
        clipPath: 'polygon(0 0, 100% 6px, 100% 100%, 0 100%)',
      }}
    >
      {/* Scanline texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Light sweep entry animation */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)`,
          animation: 'arena-stat-card-sweep 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards',
          opacity: 0,
        }}
      />
      {/* Team-color top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-[4]"
        style={{
          background: `linear-gradient(90deg, ${teamColor}, ${secondaryColor ?? teamColor})`,
        }}
      />
      {/* Team-color diagonal sweep background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${teamColor}10 0%, transparent 40%, ${secondaryColor ?? teamColor}08 100%)`,
        }}
      />

      {/* Header — player name + TONIGHT label */}
      <div className="relative z-[5] flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          {/* Team-color vertical stripe */}
          <div
            className="h-[20px] w-[3px] rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {player}
          </span>
        </div>
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em]"
          style={{
            color: teamColor,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Tonight&apos;s Line
        </span>
      </div>

      {/* Stat blocks — 3 columns */}
      <div className="relative z-[5] grid grid-cols-3 gap-[1px] px-3 pb-2 pt-1">
        {data.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-2 relative">
            {/* Stat number — large LED-style */}
            <StatCardNumber target={stat.value} teamColor={teamColor} isHighlight={!!stat.highlight} />
            {/* Label */}
            <span
              className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: stat.highlight ? teamColor : 'rgba(255,255,255,0.35)',
              }}
            >
              {stat.label}
            </span>
            {/* Highlight badge */}
            {stat.highlight && (
              <span
                className="mt-1 text-[6px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-sm"
                style={{
                  backgroundColor: `${teamColor}18`,
                  color: teamColor,
                  border: `1px solid ${teamColor}30`,
                  animation: 'arena-stat-highlight-pulse 2.5s ease-in-out infinite',
                }}
              >
                {stat.highlight}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Secondary stat line — shooting splits */}
      <div
        className="relative z-[5] flex items-center justify-center gap-1 px-4 pb-3 pt-0"
      >
        <span
          className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20"
        >
          {data.line}
        </span>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${teamColor}30 50%, transparent 95%)`,
        }}
      />
    </div>
  );
}

function StatCardNumber({ target, teamColor, isHighlight }: { target: number; teamColor: string; isHighlight: boolean }) {
  const displayValue = useCountUp(target, 1600);

  return (
    <span
      className="text-3xl font-bold tabular-nums leading-none"
      style={{
        fontFamily: 'var(--font-oswald), sans-serif',
        fontWeight: 700,
        color: isHighlight ? '#F0F2F5' : 'rgba(240,242,245,0.75)',
        textShadow: isHighlight
          ? `0 0 20px ${teamColor}60, 0 0 40px ${teamColor}30`
          : `0 0 8px rgba(255,255,255,0.08)`,
      }}
    >
      {displayValue}
    </span>
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

  /* ── Live tier remaining — stock ticks down on each feed purchase ── */
  const { remaining: liveTierRemaining, flashIdx: tierFlashIdx } = useLiveTierRemaining(
    moment?.rarityTiers ?? [],
    feedEvents,
    countdown.isEnded,
  );

  /* ── Purchase streak (combo multiplier on rapid buys) ──────── */
  const { streak, visible: streakVisible } = usePurchaseStreak(feedEvents);

  /* ── Scoring run (momentum banner on rapid purchase sequences) ── */
  const { run: scoringRun, visible: scoringRunVisible } = useScoringRun(feedEvents);

  /* ── Purchase velocity sparkline — live momentum chart at CTA ── */
  const { bars: sparklineBars, total: sparklineTotal } = usePurchaseSparkline(feedEvents.length);

  /* ── Crowd consensus — jumbotron live poll of tier popularity ── */
  const crowdConsensus = useCrowdConsensus(moment?.rarityTiers ?? [], feedEvents);

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

  /* ── Arena Blackout Blast — transition between purchase and W screen ── */
  /* NBA arenas drop house lights to black before jumbotron celebrations. */
  /* This intercepts the purchasing→confirmed transition with a blackout, */
  /* horn pulse, and team-color flash before revealing CelebrationScreen. */
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [blackoutPhase, setBlackoutPhase] = useState<'dark' | 'pulse' | 'flash' | 'done'>('dark');
  const prevProtoState = useRef(proto.state);
  useEffect(() => {
    if (prevProtoState.current === 'purchasing' && proto.state === 'confirmed') {
      setBlackoutActive(true);
      setBlackoutPhase('dark');
      // Phase sequence: dark(0ms) → pulse(250ms) → flash(500ms) → done(900ms)
      const t1 = setTimeout(() => setBlackoutPhase('pulse'), 250);
      const t2 = setTimeout(() => setBlackoutPhase('flash'), 500);
      const t3 = setTimeout(() => { setBlackoutPhase('done'); setBlackoutActive(false); }, 900);
      prevProtoState.current = proto.state;
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    prevProtoState.current = proto.state;
  }, [proto.state]);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  /* ── Crowd Noise Tap Zone — fan participation mechanic ──────── */
  /* At NBA arenas, the jumbotron shows "MAKE SOME NOISE" and fans   */
  /* tap/stomp/clap to fill a decibel meter. This tappable zone     */
  /* lets users participate in the same mechanic on the page.        */
  const [crowdNoiseLevel, setCrowdNoiseLevel] = useState(0);
  const crowdNoiseDecayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const crowdNoiseRoarRef = useRef(false);

  // Decay noise level over time
  useEffect(() => {
    crowdNoiseDecayRef.current = setInterval(() => {
      setCrowdNoiseLevel((prev) => Math.max(0, prev - 0.8));
    }, 200);
    return () => { if (crowdNoiseDecayRef.current) clearInterval(crowdNoiseDecayRef.current); };
  }, []);

  const handleNoiseTap = useCallback(() => {
    setCrowdNoiseLevel((prev) => {
      const next = Math.min(10, prev + 1.5);
      if (next >= 9.5 && !crowdNoiseRoarRef.current) {
        crowdNoiseRoarRef.current = true;
        CROWD_HAPTIC.celebration();
        setTimeout(() => { crowdNoiseRoarRef.current = false; }, 3000);
      }
      return next;
    });
    CROWD_HAPTIC.hornBlast();
  }, []);

  /* ── CTA slam burst — dramatic ring on purchase press ──────── */
  const [ctaSlamKey, setCtaSlamKey] = useState(0);

  /* ── CTA crowd pulse — sonar ring on each feed purchase ──────── */
  const [ctaPulseKey, setCtaPulseKey] = useState(0);
  const ctaPulsePrevLen = useRef(0);

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
      CROWD_HAPTIC.feedPulse();
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

  /* ── CTA crowd pulse — trigger sonar ring on each new feed event ── */
  useEffect(() => {
    if (feedEvents.length > ctaPulsePrevLen.current && ctaPulsePrevLen.current > 0) {
      setCtaPulseKey((k) => k + 1);
    }
    ctaPulsePrevLen.current = feedEvents.length;
  }, [feedEvents.length]);

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
    CROWD_HAPTIC.purchaseStage(0);
    const t1 = setTimeout(() => { setPurchaseStage(1); CROWD_HAPTIC.purchaseStage(1); }, 500);
    const t2 = setTimeout(() => { setPurchaseStage(2); CROWD_HAPTIC.purchaseStage(2); }, 1100);
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

  /* ── Crowd countdown — final 10s jumbotron numbers ── */
  const crowdCountdownNum = useCrowdCountdown(countdown.totalSeconds, countdown.isEnded);

  /* ── Crowd wave — stadium wave sweeps across on velocity spike ── */
  const crowdWaveActive = useCrowdWave(liveVelocity, countdown.isEnded);

  /* ── Live odds — sportsbook-style line movement per tier ── */
  const liveOdds = useLiveOdds(
    moment?.rarityTiers ?? [],
    liveTierRemaining,
    liveVelocity,
    countdown.isEnded,
  );

  /* ── Defense stomp — "DE-FENSE" jumbotron graphic at 80% claimed ── */
  const defenseStompVisible = useDefenseStomp(
    moment ? liveClaimed / moment.editionSize : 0,
    countdown.isEnded,
  );

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
  /* ── Tier card entrance — one-shot "player intro" stagger when first visible ── */
  const [tierRevealed, setTierRevealed] = useState(false);
  useEffect(() => {
    if (tierVisible && !tierRevealed) setTierRevealed(true);
  }, [tierVisible, tierRevealed]);

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

  /* ── Fan Cam Spotlight — jumbotron puts the viewer on the big screen ── */
  const [fanCamActive, setFanCamActive] = useState(false);
  const fanCamFiredRef = useRef(false);
  useEffect(() => {
    if (!tierVisible || countdown.isEnded || proto.state !== 'browsing' || fanCamFiredRef.current) return;
    // Fire after 8s of tier browsing — before the 15s timeout
    const timer = setTimeout(() => {
      fanCamFiredRef.current = true;
      setFanCamActive(true);
      CROWD_HAPTIC.fanCam();
      setTimeout(() => setFanCamActive(false), 3000);
    }, 8000);
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

  /* ── Confirmed state → celebration (with blackout transition) ── */
  if (proto.state === 'confirmed' && proto.editionNumber) {
    if (blackoutActive) {
      // Arena Blackout Blast: house lights drop → horn pulse → team flash → reveal
      const tc = moment.teamColors.primary;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14]">
          {/* Dark void — house lights are OFF */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#000',
              opacity: blackoutPhase === 'flash' ? 0 : 1,
              transition: 'opacity 0.3s ease-out',
            }}
          />
          {/* Horn pulse ring — expanding circle during 'pulse' phase */}
          {(blackoutPhase === 'pulse' || blackoutPhase === 'flash') && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '60px',
                height: '60px',
                border: `2px solid ${tc}`,
                boxShadow: `0 0 30px ${tc}60, 0 0 60px ${tc}30`,
                animation: 'arena-blackout-pulse 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            />
          )}
          {/* Team-color flash — the spotlight hits */}
          {blackoutPhase === 'flash' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${tc}40, transparent 70%)`,
                animation: 'arena-blackout-flash 0.4s ease-out forwards',
              }}
            />
          )}
        </div>
      );
    }
    return (
      <CelebrationScreen
        editionNumber={proto.editionNumber}
        total={moment.editionSize}
        moment={moment}
        feedEvents={feedEvents}
        onReset={proto.reset}
        tierName={moment.rarityTiers[selectedTierIdx]?.tier ?? 'Open'}
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

      {/* ─── PA Announcer Introduction — dramatic player intro on page load ─── */}
      {proto.state === 'browsing' && !countdown.isEnded && (
        <PAAnnouncerIntro
          momentId={moment.id}
          teamColor={moment.teamColors.primary}
          playerName={moment.player}
        />
      )}

      {/* ─── Crowd Reactions — floating emoji burst on purchases ─── */}
      {!countdown.isEnded && <CrowdReactions events={feedEvents} />}

      {/* ─── Floating Claim Toasts — "JUST CLAIMED" notifications at any scroll ─── */}
      <FloatingClaimToasts
        events={feedEvents}
        teamColor={moment.teamColors.primary}
        isActive={!countdown.isEnded && proto.state === 'browsing'}
      />

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

      {/* ─── Arena Crowd Countdown — final 10s jumbotron number blast ─── */}
      {crowdCountdownNum !== null && proto.state !== 'purchasing' && proto.state !== 'confirmed' && (
        <CrowdCountdown num={crowdCountdownNum} teamColor={moment.teamColors.primary} />
      )}

      {/* ─── Purchase Ceremony — 3-2-1-YOURS! crowd countdown on buy ─── */}
      {proto.state === 'purchasing' && (
        <PurchaseCeremony stage={purchaseStage} teamColor={moment.teamColors.primary} tierName={moment.rarityTiers[selectedTierIdx]?.tier ?? 'Open'} />
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

      {/* ─── Fan Cam Spotlight — jumbotron puts the viewer on the big screen ─── */}
      {fanCamActive && (
        <div className="pointer-events-none fixed inset-0 z-[38] flex items-center justify-center">
          {/* Subtle dark backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 70% 60% at center, transparent 0%, rgba(11,14,20,0.7) 100%)`,
            }}
          />
          {/* Jumbotron frame — thick border like the arena big screen */}
          <div
            className="relative flex flex-col items-center gap-3 px-10 py-6"
            style={{
              animation: 'arena-timeout-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {/* Corner bracket frames — jumbotron viewfinder */}
            <div className="absolute top-0 left-0 w-8 h-8">
              <div className="absolute top-0 left-0 w-full h-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
              <div className="absolute top-0 left-0 h-full w-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
            </div>
            <div className="absolute top-0 right-0 w-8 h-8">
              <div className="absolute top-0 right-0 w-full h-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
              <div className="absolute top-0 right-0 h-full w-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
            </div>
            <div className="absolute bottom-0 left-0 w-8 h-8">
              <div className="absolute bottom-0 left-0 w-full h-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
              <div className="absolute bottom-0 left-0 h-full w-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8">
              <div className="absolute bottom-0 right-0 w-full h-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
              <div className="absolute bottom-0 right-0 h-full w-[3px] rounded-full" style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 10px ${moment.teamColors.primary}80` }} />
            </div>

            {/* FAN CAM badge */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-sm"
              style={{
                backgroundColor: `${moment.teamColors.primary}20`,
                border: `1px solid ${moment.teamColors.primary}50`,
              }}
            >
              {/* Camera icon */}
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill={moment.teamColors.primary}>
                <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4Zm4 4a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
              </svg>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: moment.teamColors.primary,
                  textShadow: `0 0 6px ${moment.teamColors.primary}60`,
                }}
              >
                Fan Cam
              </span>
              {/* Live dot */}
              <div
                className="h-[5px] w-[5px] rounded-full animate-pulse"
                style={{
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 4px #EF444460',
                }}
              />
            </div>

            {/* YOU'RE ON THE BOARD! */}
            <span
              className="text-3xl uppercase tracking-[0.2em] sm:text-4xl"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                color: '#F0F2F5',
                textShadow: `0 0 24px ${moment.teamColors.primary}80, 0 0 48px ${moment.teamColors.primary}40, 0 2px 4px rgba(0,0,0,0.5)`,
              }}
            >
              YOU&apos;RE UP!
            </span>

            {/* Subtext */}
            <span
              className="text-[10px] uppercase tracking-[0.25em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 400,
                color: `${moment.teamColors.primary}BB`,
              }}
            >
              The arena is watching — claim your moment
            </span>

            {/* Accent lines */}
            <div className="flex items-center gap-3 mt-1">
              <div className="h-[1px] w-8" style={{ backgroundColor: `${moment.teamColors.primary}50` }} />
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: moment.teamColors.primary, boxShadow: `0 0 8px ${moment.teamColors.primary}80` }}
              />
              <div className="h-[1px] w-8" style={{ backgroundColor: `${moment.teamColors.primary}50` }} />
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

      {/* ─── Replay Center Review — "PLAY UNDER REVIEW" during purchase ─── */}
      <ReplayReviewOverlay
        active={proto.state === 'purchasing'}
        stage={purchaseStage}
        teamColor={moment.teamColors.primary}
      />

      {/* ─── Defense Stomp — "DE-FENSE" jumbotron graphic on low stock ─── */}
      <DefenseStompOverlay visible={defenseStompVisible} teamColor={moment.teamColors.primary} />

      {/* ─── Crowd Wave — stadium wave ripple on velocity spike ─── */}
      <CrowdWave active={crowdWaveActive} teamColor={moment.teamColors.primary} />

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

        {/* Scorer's Table Game Clock — NBA-style countdown in header */}
        {/* Maps drop time to basketball quarters for arena metaphor.  */}
        {/* The game clock is the most watched element in any arena.   */}
        {countdown.isEnded ? (
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Final
          </span>
        ) : (
          <div className="flex flex-col items-center gap-0">
            {/* Period label */}
            <span
              className="text-[7px] font-bold uppercase tracking-[0.25em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: isCritical ? '#EF4444' : isClosing ? '#F59E0B' : `${moment.teamColors.primary}90`,
              }}
            >
              {(() => {
                const pct = countdown.totalSeconds / ((SALE_DURATION_MS[momentId] ?? 720000) / 1000);
                if (pct > 0.75) return '1st Qtr';
                if (pct > 0.5) return '2nd Qtr';
                if (pct > 0.25) return '3rd Qtr';
                return '4th Qtr';
              })()}
            </span>
            {/* Digital clock — LED scorer's table style */}
            <span
              className="text-[15px] font-bold tabular-nums leading-none"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                color: isCritical ? '#EF4444' : isClosing ? '#F59E0B' : '#F0F2F5',
                textShadow: isCritical
                  ? '0 0 8px rgba(239,68,68,0.5)'
                  : isClosing
                    ? '0 0 8px rgba(245,158,11,0.4)'
                    : `0 0 6px ${moment.teamColors.primary}40`,
                letterSpacing: '0.05em',
              }}
            >
              {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        )}

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

      {/* ─── Arena LED Ribbon — scrolling jumbotron ring ticker ─── */}
      <ArenaLEDRibbon moment={moment} isActive={!countdown.isEnded} />

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

        {/* Jumbotron LED frame — animated pixel border making hero look like a jumbotron screen */}
        <JumbotronLEDFrame
          teamColor={moment.teamColors.primary}
          isClosing={isClosing}
          isCritical={isCritical}
          isActive={!countdown.isEnded}
        />

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
          {/* Jumbotron Mini Scoreboard — game result in LED style */}
          <div className="mt-1.5">
            <JumbotronScoreboard momentId={moment.id} teamColor={moment.teamColors.primary} />
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
          {/* Play-by-Play Ticker — jumbotron narration scrolling through the moment */}
          <PlayByPlayTicker
            momentId={moment.id}
            teamColor={moment.teamColors.primary}
            isActive={!countdown.isEnded}
          />
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

          {/* ── JUMBOTRON CLAIM BADGE — above-fold price + scroll-to-buy shortcut ── */}
          {/* Research insight #5: Above the Fold Is Everything. The hero had no    */}
          {/* price visible — users must scroll past feed/tiers to see cost.        */}
          {/* This Whatnot-style flashing price badge surfaces the $5 entry         */}
          {/* point and scrolls to the tier selector on tap. Arena energy: bold,    */}
          {/* pulsing, live commerce urgency. Distinct from Broadcast's subtle      */}
          {/* pill — Arena screams it.                                              */}
          {!countdown.isEnded && proto.state === 'browsing' && (
            <button
              onClick={() => tierSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2 cursor-pointer transition-all duration-300 active:scale-[0.96] group"
              style={{
                backgroundColor: 'rgba(0,229,160,0.12)',
                border: '1px solid rgba(0,229,160,0.35)',
                boxShadow: '0 0 16px rgba(0,229,160,0.15), 0 0 40px rgba(0,229,160,0.05)',
                animation: isCritical
                  ? 'arena-claim-badge-pulse 1s ease-in-out infinite'
                  : isClosing
                    ? 'arena-claim-badge-pulse 1.8s ease-in-out infinite'
                    : 'none',
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: isCritical ? '#EF4444' : isClosing ? '#F59E0B' : '#00E5A0',
                }}
              >
                {isCritical ? 'LAST CHANCE' : isClosing ? 'GOING FAST' : 'CLAIM NOW'}
              </span>
              <span className="text-[14px] font-bold tabular-nums text-white"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                ${moment.rarityTiers[selectedTierIdx].price}
              </span>
              <svg
                className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-all group-hover:translate-y-0.5"
                viewBox="0 0 12 12" fill="none"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
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

      {/* ─── Jumbotron Player Stat Card — arena intro-style big stats ─── */}
      <JumbotronPlayerStatCard
        momentId={momentId}
        player={moment.player}
        teamColor={moment.teamColors.primary}
        secondaryColor={moment.teamColors.secondary}
        isActive={!countdown.isEnded}
      />

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

      {/* ─── MVP Leaderboard — jumbotron top-buyer spotlight ─── */}
      <MvpLeaderboard events={feedEvents} teamColor={moment.teamColors.primary} isEnded={countdown.isEnded} />

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

      {/* ─── Jumbotron Trivia — "DID YOU KNOW?" during browsing ─── */}
      {!countdown.isEnded && proto.state === 'browsing' && (
        <JumbotronTrivia
          momentId={moment.id}
          teamColor={moment.teamColors.primary}
          isVisible={tierVisible}
        />
      )}

      {/* ─── Live Odds Board — sportsbook line movement per tier ─── */}
      <LiveOddsBoard
        tiers={moment.rarityTiers}
        odds={liveOdds}
        teamColor={moment.teamColors.primary}
        isEnded={countdown.isEnded}
      />

      {/* ─── POWER RANKING — "#1 Trending Drop" jumbotron badge ─── */}
      {/* At NBA arenas the jumbotron constantly shows standings, rankings,   */}
      {/* and leaderboards. This badge creates social proof + FOMO at the     */}
      {/* decision point: you're looking at the #1 drop right now.            */}
      {!countdown.isEnded && (
        <div className="mx-4 mt-2 mb-1 flex items-center justify-center gap-2.5">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{
              backgroundColor: 'rgba(0,229,160,0.06)',
              border: '1px solid rgba(0,229,160,0.12)',
            }}
          >
            {/* Rank number — large bold */}
            <span
              className="text-[18px] font-bold tabular-nums"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: '#00E5A0',
                textShadow: '0 0 10px rgba(0,229,160,0.3)',
              }}
            >
              #1
            </span>
            {/* Label stack */}
            <div className="flex flex-col">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Trending Drop
              </span>
              <span className="text-[7px] font-mono uppercase tracking-[0.15em] text-white/20">
                {moment.player} &middot; {feedEvents.length > 0 ? `${feedEvents.length} claims` : 'Live now'}
              </span>
            </div>
            {/* Fire icon — trending indicator */}
            <svg className="h-3.5 w-3.5 ml-1 shrink-0" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1C7 1 4.5 4 4.5 7C4.5 8.38 5.12 9.62 6 10.5C5.5 9.5 5.5 8 7 6.5C8.5 8 8.5 9.5 8 10.5C8.88 9.62 9.5 8.38 9.5 7C9.5 4 7 1 7 1Z"
                fill="#00E5A0"
                fillOpacity="0.5"
              />
              <path
                d="M7 5.5C7 5.5 5.75 7.25 5.75 8.5C5.75 9.19 6.31 9.75 7 9.75C7.69 9.75 8.25 9.19 8.25 8.5C8.25 7.25 7 5.5 7 5.5Z"
                fill="#00E5A0"
                fillOpacity="0.8"
              />
            </svg>
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
          onSelect={(idx: number) => { setSelectedTierIdx(idx); CROWD_HAPTIC.tierSwitch(); }}
          bidderCounts={tierBidders}
          isEnded={countdown.isEnded}
          liveRemaining={liveTierRemaining}
          flashIdx={tierFlashIdx}
          revealed={tierRevealed}
        />
      </div>

      {/* ─── Shot Clock — 24s purchase decision timer ─── */}
      <ArenaShotClock
        seconds={shotClock.seconds}
        violation={shotClock.violation}
        teamColor={moment.teamColors.primary}
        isVisible={tierVisible && !countdown.isEnded && proto.state === 'browsing'}
      />

      {/* ─── Crowd Consensus Meter — jumbotron live poll of tier popularity ─── */}
      <CrowdConsensusMeter
        tiers={moment.rarityTiers}
        distribution={crowdConsensus}
        selectedIdx={selectedTierIdx}
        teamColor={moment.teamColors.primary}
        isVisible={!countdown.isEnded && proto.state === 'browsing'}
      />

      {/* ─── Crowd Reaction Bar — live emoji reactions floating up from viewers ─── */}
      {!countdown.isEnded && proto.state === 'browsing' && (
        <CrowdReactionBar teamColor={moment.teamColors.primary} isCritical={isCritical} isClosing={isClosing} />
      )}

      {/* ─── Fan Reaction Cam — tappable jumbotron reaction buttons ─── */}
      {/* NBA arenas show Fan Cam / Kiss Cam / Flex Cam — the jumbotron     */}
      {/* puts the camera on you and shows your reaction. Tap a reaction    */}
      {/* to see it displayed in a jumbotron frame with your section/row.   */}
      <FanReactionCam
        teamColor={moment.teamColors.primary}
        isActive={!countdown.isEnded && proto.state === 'browsing'}
      />

      {/* ─── STEAL DEAL — Whatnot-style live commerce deal alert ─── */}
      {/* On Whatnot/TikTok Shop, hosts constantly frame the deal:             */}
      {/* "This card is $20 on eBay but you're getting it for $5!"            */}
      {/* The price comparison creates instant value perception at the         */}
      {/* exact decision point. Arena makes it loud and live.                  */}
      {!countdown.isEnded && proto.state === 'browsing' && (
        <div className="mx-4 mt-2 mb-1 relative z-[1]">
          <div
            className="relative overflow-hidden rounded-lg px-3.5 py-2.5"
            style={{
              backgroundColor: 'rgba(0,229,160,0.06)',
              border: '1px solid rgba(0,229,160,0.15)',
              boxShadow: '0 0 12px rgba(0,229,160,0.06)',
            }}
          >
            {/* Flash stripe accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, #00E5A0, ${moment.teamColors.primary}, #00E5A0)`,
                opacity: 0.5,
              }}
            />
            <div className="flex items-center justify-between gap-3">
              {/* Left: deal label + savings badge */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="shrink-0 text-[8px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    backgroundColor: '#00E5A020',
                    color: '#00E5A0',
                    border: '1px solid #00E5A030',
                  }}
                >
                  Deal
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-white/25 line-through tabular-nums">
                      ${Math.round(moment.rarityTiers[selectedTierIdx].price * 3.2)}
                    </span>
                    <span className="text-[7px] text-white/15">mkt</span>
                    <span className="text-white/10">→</span>
                    <span
                      className="text-[12px] font-bold tabular-nums"
                      style={{ fontFamily: 'var(--font-oswald), sans-serif', color: '#00E5A0' }}
                    >
                      ${moment.rarityTiers[selectedTierIdx].price}
                    </span>
                  </div>
                </div>
              </div>
              {/* Right: savings percentage */}
              <span
                className="shrink-0 text-[14px] font-bold tabular-nums"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: '#00E5A0',
                  textShadow: '0 0 8px rgba(0,229,160,0.3)',
                }}
              >
                {Math.round(((moment.rarityTiers[selectedTierIdx].price * 3.2 - moment.rarityTiers[selectedTierIdx].price) / (moment.rarityTiers[selectedTierIdx].price * 3.2)) * 100)}% OFF
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─── SEAT UPGRADE — arena upsell nudge for lower tiers ─── */}
      {/* At NBA arenas, staff walk sections offering seat upgrades:          */}
      {/* "Move up to courtside for just $40 more!" This jumbotron-style     */}
      {/* prompt fires when Open or Rare is selected, showing the next tier  */}
      {/* up with the price delta. Tapping "UPGRADE" switches the tier.      */}
      {/* Targets Conversion: nudges users toward higher-value tiers.        */}
      {!countdown.isEnded && proto.state === 'browsing' && selectedTierIdx < moment.rarityTiers.length - 1 && selectedTierIdx <= 1 && (
        <div className="mx-4 mt-2 mb-1 relative z-[1]">
          <button
            onClick={() => {
              setSelectedTierIdx(selectedTierIdx + 1);
              CROWD_HAPTIC.tierSwitch();
            }}
            className="w-full relative overflow-hidden rounded-lg px-3.5 py-2.5 text-left cursor-pointer transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: `${moment.teamColors.primary}0F`,
              border: `1px solid ${moment.teamColors.primary}25`,
              boxShadow: `0 0 16px ${moment.teamColors.primary}0A`,
            }}
          >
            {/* Top accent — team-color sweep */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${moment.teamColors.primary}60, ${moment.teamColors.primary}20, transparent)`,
              }}
            />
            {/* Scanline texture for LED jumbotron feel */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
              }}
            />
            <div className="relative flex items-center justify-between gap-3">
              {/* Left: upgrade message */}
              <div className="flex items-center gap-2 min-w-0">
                {/* Up arrow icon */}
                <div
                  className="shrink-0 flex items-center justify-center h-5 w-5 rounded"
                  style={{
                    backgroundColor: `${moment.teamColors.primary}20`,
                  }}
                >
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path d="M6 9V3M6 3L3.5 5.5M6 3L8.5 5.5" stroke={moment.teamColors.primary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/30"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    Upgrade Your Seat
                  </span>
                  <span
                    className="text-[11px] font-semibold tracking-wide text-white/70 truncate"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {moment.rarityTiers[selectedTierIdx + 1].tier} Edition
                  </span>
                </div>
              </div>
              {/* Right: price delta + upgrade badge */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] font-mono tabular-nums text-white/40"
                >
                  +${moment.rarityTiers[selectedTierIdx + 1].price - moment.rarityTiers[selectedTierIdx].price}
                </span>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded-sm"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    backgroundColor: `${moment.teamColors.primary}25`,
                    color: moment.teamColors.primary,
                    border: `1px solid ${moment.teamColors.primary}35`,
                  }}
                >
                  Upgrade
                </span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ─── CROWD NOISE TAP ZONE — "MAKE SOME NOISE" fan participation ─── */}
      {/* The jumbotron "MAKE SOME NOISE" meter is the #1 fan participation  */}
      {/* mechanic at every NBA arena. Fans tap/stomp to fill a decibel     */}
      {/* meter. At max level (≥9.5), triggers a celebration haptic burst.  */}
      {/* Noise decays over time, so fans must keep tapping to maintain it. */}
      {!countdown.isEnded && proto.state === 'browsing' && (
        <div className="mx-4 mt-2 mb-1 relative z-[1]">
          <button
            onClick={handleNoiseTap}
            className="w-full relative overflow-hidden rounded-lg px-3.5 py-3 cursor-pointer transition-transform active:scale-[0.96]"
            style={{
              backgroundColor: crowdNoiseLevel >= 9.5
                ? `${moment.teamColors.primary}20`
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${crowdNoiseLevel >= 9.5 ? `${moment.teamColors.primary}40` : 'rgba(255,255,255,0.06)'}`,
              transition: 'background-color 0.3s, border-color 0.3s',
            }}
          >
            {/* Scanline texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)',
              }}
            />
            {/* Roar flash overlay */}
            {crowdNoiseRoarRef.current && crowdNoiseLevel >= 9.5 && (
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  backgroundColor: `${moment.teamColors.primary}15`,
                  animation: 'arena-cta-pulse-ring 0.8s ease-out forwards',
                }}
              />
            )}
            <div className="relative flex items-center justify-between gap-3">
              {/* Left: label + icon */}
              <div className="flex items-center gap-2.5">
                <div
                  className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full"
                  style={{
                    backgroundColor: crowdNoiseLevel >= 9.5
                      ? `${moment.teamColors.primary}30`
                      : 'rgba(255,255,255,0.06)',
                    transition: 'background-color 0.3s',
                  }}
                >
                  {/* Megaphone icon */}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 7h2l4-3v8l-4-3H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                      fill={crowdNoiseLevel >= 5 ? moment.teamColors.primary : 'rgba(255,255,255,0.3)'}
                      style={{ transition: 'fill 0.3s' }}
                    />
                    <path
                      d="M12 5.5c.8.8 1.2 1.8 1.2 2.5s-.4 1.7-1.2 2.5"
                      stroke={crowdNoiseLevel >= 7.5 ? moment.teamColors.primary : 'rgba(255,255,255,0.15)'}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.3s' }}
                    />
                    <path
                      d="M10.5 6.8c.4.4.7.9.7 1.2s-.3.8-.7 1.2"
                      stroke={crowdNoiseLevel >= 3 ? `${moment.teamColors.primary}80` : 'rgba(255,255,255,0.1)'}
                      strokeWidth="1"
                      strokeLinecap="round"
                      style={{ transition: 'stroke 0.3s' }}
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.3em]"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: crowdNoiseLevel >= 9.5 ? moment.teamColors.primary : 'rgba(255,255,255,0.35)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {crowdNoiseLevel >= 9.5 ? 'CROWD GOES WILD!' : crowdNoiseLevel >= 5 ? 'LOUDER!' : 'MAKE SOME NOISE'}
                  </span>
                  <span className="text-[6.5px] font-mono uppercase tracking-[0.15em] text-white/15">
                    Tap to fill the meter
                  </span>
                </div>
              </div>
              {/* Right: decibel meter (8 bars) */}
              <div className="flex items-end gap-[2px] h-5">
                {Array.from({ length: 8 }, (_, i) => {
                  const threshold = (i + 1) * 1.25;
                  const active = crowdNoiseLevel >= threshold;
                  const isHot = i >= 6;
                  return (
                    <div
                      key={i}
                      className="rounded-[1px] transition-all duration-150"
                      style={{
                        width: '3px',
                        height: `${8 + i * 1.5}px`,
                        backgroundColor: active
                          ? isHot
                            ? moment.teamColors.primary
                            : `${moment.teamColors.primary}80`
                          : 'rgba(255,255,255,0.06)',
                        boxShadow: active && isHot
                          ? `0 0 6px ${moment.teamColors.primary}40`
                          : 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ─── CTA Section ─── */}
      <div className="px-4 pt-1">
        {/* Active buyers badge — live commerce energy */}
        {!countdown.isEnded && proto.state !== 'purchasing' && (
          <div className="mb-2 flex flex-col items-center gap-1">
            {/* Last buyer flash — shows who just claimed, keyed to pulse */}
            {feedEvents.length > 0 && ctaPulseKey > 0 && (
              <div
                key={`buyer-${ctaPulseKey}`}
                className="flex items-center gap-1 text-[10px] tabular-nums"
                style={{
                  animation: 'arena-cta-buyer-flash 2s ease-out forwards',
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                <span style={{ color: moment.teamColors.primary }}>
                  {feedEvents[feedEvents.length - 1].name}
                </span>
                <span className="text-white/30">just claimed</span>
                <span className="font-mono text-white/50">
                  #{feedEvents[feedEvents.length - 1].edition.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00E5A0] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00E5A0]" />
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-white/50">
                {activeBuyers} buying this tier now
              </span>
            </div>
          </div>
        )}

        {/* Purchase Velocity Sparkline — live momentum chart above CTA */}
        {!countdown.isEnded && proto.state !== 'purchasing' && feedEvents.length >= 2 && (
          <div className="flex justify-center">
            <PurchaseSparkline
              bars={sparklineBars}
              total={sparklineTotal}
              teamColor={moment.teamColors.primary}
              isCritical={isCritical}
              isClosing={isClosing}
            />
          </div>
        )}

        {/* ── Supply Scoreboard — triple urgency stack: scarcity at CTA ── */}
        {/* Research insight #2: Triple Urgency Stack. Arena had time + competition  */}
        {/* urgency at the CTA but supply scarcity was buried in tier cards. This    */}
        {/* jumbotron-style scoreboard shows CLAIMED vs REMAINING like a game score, */}
        {/* completing the triple stack right at the decision point. Each simulated  */}
        {/* purchase ticks CLAIMED up and REMAINING down with a flash animation.    */}
        {!countdown.isEnded && proto.state !== 'purchasing' && (
          (() => {
            const tier = moment.rarityTiers[selectedTierIdx];
            const remaining = liveTierRemaining[selectedTierIdx] ?? tier.remaining;
            const total = tier.remaining + (tier.remaining - remaining) + remaining; // approximate total from initial
            const claimed = (tier.remaining - remaining) + (moment.editionsClaimed - tier.remaining); // net claimed
            const displayClaimed = Math.max(0, tier.remaining - remaining + Math.floor(moment.editionsClaimed * 0.6));
            const displayRemaining = remaining;
            const pct = Math.min(100, Math.round(((tier.remaining - remaining) / Math.max(1, tier.remaining)) * 100));
            const isHot = pct >= 70;
            const isAlmostGone = pct >= 90;
            return (
              <div
                className="mb-2 rounded-lg px-3 py-2 transition-all duration-500"
                style={{
                  backgroundColor: isAlmostGone ? 'rgba(239,68,68,0.08)' : isHot ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isAlmostGone ? 'rgba(239,68,68,0.2)' : isHot ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {/* Scoreboard header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: isAlmostGone ? '#EF4444' : isHot ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {isAlmostGone ? '⚠ ALMOST GONE' : isHot ? 'SELLING FAST' : 'EDITION SUPPLY'}
                  </span>
                  <span
                    className="text-[8px] font-mono tabular-nums"
                    style={{ color: isAlmostGone ? '#EF4444' : isHot ? '#F59E0B' : 'rgba(255,255,255,0.2)' }}
                  >
                    {pct}% CLAIMED
                  </span>
                </div>
                {/* Score display: CLAIMED vs REMAINING like a scoreboard */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span
                      className="text-[18px] font-bold tabular-nums leading-none transition-all duration-300"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: moment.teamColors.primary,
                        textShadow: tierFlashIdx === selectedTierIdx ? `0 0 12px ${moment.teamColors.primary}80` : 'none',
                      }}
                    >
                      {displayClaimed.toLocaleString()}
                    </span>
                    <span className="text-[7px] uppercase tracking-[0.15em] text-white/25 mt-0.5" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                      Claimed
                    </span>
                  </div>
                  {/* VS divider — scoreboard style */}
                  <div className="flex flex-col items-center">
                    <span
                      className="text-[10px] font-bold"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: 'rgba(255,255,255,0.15)',
                      }}
                    >
                      vs
                    </span>
                  </div>
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span
                      className={`text-[18px] font-bold tabular-nums leading-none transition-all duration-300 ${tierFlashIdx === selectedTierIdx ? 'scale-95' : ''}`}
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: isAlmostGone ? '#EF4444' : isHot ? '#F59E0B' : 'rgba(240,242,245,0.6)',
                        textShadow: tierFlashIdx === selectedTierIdx
                          ? `0 0 10px ${isAlmostGone ? 'rgba(239,68,68,0.5)' : isHot ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.15)'}`
                          : 'none',
                      }}
                    >
                      {displayRemaining.toLocaleString()}
                    </span>
                    <span className="text-[7px] uppercase tracking-[0.15em] text-white/25 mt-0.5" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                      Left
                    </span>
                  </div>
                </div>
                {/* Supply depletion bar */}
                <div className="mt-1.5 h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isAlmostGone ? '#EF4444' : isHot ? '#F59E0B' : moment.teamColors.primary,
                      boxShadow: isAlmostGone
                        ? '0 0 8px rgba(239,68,68,0.4)'
                        : isHot
                          ? '0 0 6px rgba(245,158,11,0.3)'
                          : `0 0 4px ${moment.teamColors.primary}40`,
                      animation: isAlmostGone ? 'arena-supply-pulse 1.2s ease-in-out infinite' : undefined,
                    }}
                  />
                </div>
              </div>
            );
          })()
        )}

        {/* CTA Crowd Pulse Ring — sonar ring on each feed purchase */}
        <div className="relative">
          {!countdown.isEnded && proto.state === 'browsing' && (
            <div
              key={ctaPulseKey}
              className="pointer-events-none absolute inset-0 z-0 rounded-xl"
              style={{
                border: `2px solid ${isCritical ? '#EF4444' : isClosing ? '#F59E0B' : '#00E5A0'}`,
                animation: ctaPulseKey > 0 ? 'arena-cta-pulse-ring 0.8s ease-out forwards' : 'none',
                opacity: 0,
              }}
            />
          )}

        {/* CTA Slam Burst — team-color ring explosion on purchase press */}
        {ctaSlamKey > 0 && (
          <div
            key={`slam-${ctaSlamKey}`}
            className="pointer-events-none absolute inset-[-8px] z-0 rounded-2xl"
            style={{
              border: `3px solid ${moment.teamColors.primary}`,
              animation: 'arena-cta-slam-burst 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              opacity: 0,
            }}
          />
        )}

        <button
          ref={ctaRef}
          onClick={countdown.isEnded ? undefined : () => { CROWD_HAPTIC.ctaSlam(); setCtaSlamKey((k) => k + 1); proto.purchase(); }}
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
          {/* LED scanline texture — jumbotron pixel grid on button surface */}
          {/* NBA jumbotron displays have visible LED pixel grids. This subtle  */}
          {/* scanline overlay makes the CTA feel like it's rendered on a       */}
          {/* jumbotron display rather than a flat button. Deeply Arena.        */}
          {!countdown.isEnded && proto.state !== 'purchasing' && (
            <div
              className="absolute inset-0 pointer-events-none z-[1] rounded-xl"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
              }}
            />
          )}

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
              <span className="flex flex-col items-center gap-1">
                <span className="flex items-center justify-center gap-2">
                  {/* Lock — instant secure purchase */}
                  <svg className="h-4 w-4 opacity-50" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                  </svg>
                  {isCritical
                    ? <>LAST CHANCE — ${moment.rarityTiers[selectedTierIdx].price} <span className="inline-flex items-center ml-1 font-mono tabular-nums text-[13px] opacity-80 border-l border-white/20 pl-2">{countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}</span></>
                    : isClosing
                      ? `GOING FAST — $${moment.rarityTiers[selectedTierIdx].price}`
                      : `OWN THIS MOMENT — $${moment.rarityTiers[selectedTierIdx].price}`}
                </span>
                {/* Active buyers — live social proof inside the CTA */}
                {/* At Whatnot/TikTok Shop, the "X people buying" count is       */}
                {/* right on the purchase button. Deepest possible social proof.  */}
                <span
                  className="text-[9px] font-mono tabular-nums tracking-wide"
                  style={{
                    opacity: isCritical ? 0.7 : 0.45,
                  }}
                >
                  {activeBuyers} buying right now
                </span>
              </span>
            )}
          </span>
        </button>
        </div>

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
              onClick={proto.state !== 'purchasing' ? () => { CROWD_HAPTIC.ctaSlam(); proto.purchase(); } : undefined}
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
                  : isCritical ? <>{`LAST CHANCE `}<span className="font-mono tabular-nums text-[11px] opacity-80">{countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}</span></> : isClosing ? 'BUY NOW' : 'OWN IT'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Keyframes in globals.css: fadeSlideIn, bounceIn, buttonShake, bgPulse */}
    </div>
  );
}
