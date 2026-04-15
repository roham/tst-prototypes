'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getMoment, SALE_DURATION_MS, MOMENTS } from '@/lib/mock-data';
import type { Moment } from '@/lib/mock-data';
import { useCountdown } from '@/lib/use-countdown';
import { usePrototypeState } from '@/lib/use-prototype-state';

// ---------------------------------------------------------------------------
// Haptic feedback — real Vibration API for tactile auction experience on mobile
// Patterns mirror physical auction cues: gavel taps, paddle raises, phase shifts
// ---------------------------------------------------------------------------

function haptic(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* silent — no vibration support */ }
  }
}

const HAPTIC = {
  /** CTA tap — short gavel tap */
  tap: () => haptic(10),
  /** Tier selection — paddle flip, barely perceptible */
  tierSelect: () => haptic(6),
  /** Purchase stage advance — each step ticks harder */
  purchaseStep: (stage: number) => haptic(stage === 0 ? 12 : stage === 1 ? 18 : [15, 40, 25]),
  /** Purchase confirmed "Yours." — gavel strike double-tap */
  gavelStrike: () => haptic([15, 50, 25]),
  /** Phase transition — saleroom tension shift */
  phaseShift: (to: 'CLOSING' | 'CRITICAL') => haptic(to === 'CRITICAL' ? [20, 30, 20] : 15),
  /** Lot extended — competition pulse */
  lotExtended: () => haptic([8, 30, 8]),
} as const;

// ---------------------------------------------------------------------------
// Phase derivation from countdown
// ---------------------------------------------------------------------------

type DropPhase = 'OPEN' | 'CLOSING' | 'CRITICAL' | 'ENDED';

function derivePhase(secondsLeft: number): DropPhase {
  if (secondsLeft <= 0) return 'ENDED';
  if (secondsLeft <= 120) return 'CRITICAL';
  if (secondsLeft <= 600) return 'CLOSING';
  return 'OPEN';
}

function timerColor(phase: DropPhase): string {
  switch (phase) {
    case 'OPEN':
      return '#FFFFFF';
    case 'CLOSING':
      return '#F59E0B';
    case 'CRITICAL':
      return '#EF4444';
    case 'ENDED':
      return '#EF444480';
  }
}

function formatTimer(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Magnetic button — CTA subtly gravitates toward cursor, premium pull feel
// ---------------------------------------------------------------------------

function useMagneticButton(maxPull: number = 6) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lightPos, setLightPos] = useState({ x: 50, y: 50 });
  const rafRef = useRef(0);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // Pull is proportional to distance from center, capped at maxPull
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.max(rect.width, rect.height);
      const strength = Math.min(dist / maxDist, 1);
      const pullX = (dx / maxDist) * maxPull * strength;
      const pullY = (dy / maxDist) * maxPull * strength;
      setOffset({ x: pullX, y: pullY });
      // Light position as percentage across button surface
      const lx = ((e.clientX - rect.left) / rect.width) * 100;
      const ly = ((e.clientY - rect.top) / rect.height) * 100;
      setLightPos({ x: Math.max(0, Math.min(100, lx)), y: Math.max(0, Math.min(100, ly)) });
    });
  }, [maxPull]);

  const onMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setOffset({ x: 0, y: 0 });
    setLightPos({ x: 50, y: 50 });
  }, []);

  return { ref, offset, lightPos, onMouseMove, onMouseLeave };
}

// ---------------------------------------------------------------------------
// Price scramble reveal — digits cycle through randoms before locking
// ---------------------------------------------------------------------------

function usePriceScramble(price: number) {
  const [display, setDisplay] = useState(`$${price}`);
  const [isScrambling, setIsScrambling] = useState(false);
  const prevPrice = useRef(price);
  const frameRef = useRef(0);

  useEffect(() => {
    // Skip initial mount — only scramble on tier change
    if (prevPrice.current === price && !isScrambling) {
      prevPrice.current = price;
      return;
    }
    prevPrice.current = price;

    const finalStr = `$${price}`;
    const digits = finalStr.split('');
    const duration = 500; // ms
    const startTime = performance.now();
    setIsScrambling(true);

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Characters settle left-to-right with easeOutExpo
      const settled = digits.map((char, i) => {
        if (char === '$' || char === ',' || char === '.') return char;
        const charProgress = (progress - (i / digits.length) * 0.4) / 0.6;
        if (charProgress >= 1) return char;
        return String(Math.floor(Math.random() * 10));
      }).join('');

      setDisplay(settled);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(finalStr);
        setIsScrambling(false);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [price]);

  // Initial scramble on mount
  useEffect(() => {
    const finalStr = `$${price}`;
    const digits = finalStr.split('');
    const duration = 600;
    const startTime = performance.now();
    setIsScrambling(true);

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const settled = digits.map((char, i) => {
        if (char === '$' || char === ',' || char === '.') return char;
        const charProgress = (progress - (i / digits.length) * 0.4) / 0.6;
        if (charProgress >= 1) return char;
        return String(Math.floor(Math.random() * 10));
      }).join('');
      setDisplay(settled);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(finalStr);
        setIsScrambling(false);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { display, isScrambling };
}

// ---------------------------------------------------------------------------
// Social proof — fake but plausible jitter
// ---------------------------------------------------------------------------

function useSocialProof(base: number) {
  const [watching, setWatching] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setWatching((prev) => Math.max(1, prev + Math.floor(Math.random() * 7) - 3));
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return watching;
}

// ---------------------------------------------------------------------------
// Live claim simulation — editions tick down, names appear
// ---------------------------------------------------------------------------

const CLAIM_NAMES = [
  'Mike R.', 'Sarah K.', 'JayHoops', 'DunkCity', 'Alex M.',
  'NBAFan99', 'Chris B.', 'TopShot_OG', 'BallDontLie', 'Maya W.',
  'HoopsJunkie', 'TripleDbl', 'FastBreak', 'CourtVision', 'Dime_Drop',
];

interface BidEntry {
  id: number;
  name: string;
  edition: number;
  time: string;
}

function useClaimTicker(baseClaimed: number, editionSize: number) {
  const [claimed, setClaimed] = useState(baseClaimed);
  const [lastClaimer, setLastClaimer] = useState<string | null>(null);
  const [claimFlash, setClaimFlash] = useState(false);
  const [bidLog, setBidLog] = useState<BidEntry[]>([]);
  const bidIdRef = useRef(0);

  useEffect(() => {
    // Random interval between 2-6s to simulate real claiming
    let timeout: NodeJS.Timeout;
    const tick = () => {
      const delay = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setClaimed((prev) => {
          const next = Math.min(prev + 1, editionSize);
          const name = CLAIM_NAMES[Math.floor(Math.random() * CLAIM_NAMES.length)];
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          bidIdRef.current += 1;
          setBidLog((log) => [
            { id: bidIdRef.current, name, edition: next, time: timeStr },
            ...log,
          ].slice(0, 5)); // keep last 5 entries
          setLastClaimer(name);
          setClaimFlash(true);
          setTimeout(() => setClaimFlash(false), 600);
          setTimeout(() => setLastClaimer(null), 2800);
          return next;
        });
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timeout);
  }, [editionSize]);

  return { claimed, lastClaimer, claimFlash, bidLog };
}

// ---------------------------------------------------------------------------
// Per-tier interested parties — Sotheby's ⊻ registered interest per lot tier
// ---------------------------------------------------------------------------

function useTierInterest(tierCount: number) {
  const [interests, setInterests] = useState<number[]>(() =>
    Array.from({ length: tierCount }, (_, i) =>
      // Higher tiers attract fewer but more committed bidders
      i === 0 ? 18 + Math.floor(Math.random() * 12)  // Open: 18-29
        : i === 1 ? 8 + Math.floor(Math.random() * 7)  // Rare: 8-14
        : i === 2 ? 3 + Math.floor(Math.random() * 4)  // Legendary: 3-6
        : 1 + Math.floor(Math.random() * 2)              // Ultimate: 1-2
    )
  );
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  useEffect(() => {
    // Simulate fluctuating interest every 4-8s
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const delay = 4000 + Math.random() * 4000;
      timer = setTimeout(() => {
        setInterests(prev => {
          const next = [...prev];
          // Pick a random tier to adjust
          const idx = Math.floor(Math.random() * tierCount);
          const delta = Math.random() > 0.3 ? 1 : -1; // bias toward increase
          next[idx] = Math.max(1, next[idx] + delta);
          setFlashIdx(idx);
          setTimeout(() => setFlashIdx(null), 600);
          return next;
        });
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, [tierCount]);

  return { interests, flashIdx };
}

// ---------------------------------------------------------------------------
// Radial burst — clean expanding ring of light (replaces confetti)
// ---------------------------------------------------------------------------

function RadialBurst({ teamColor }: { teamColor: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
      {/* Primary ring — team color */}
      <div
        className="absolute rounded-full supreme-burst-ring"
        style={{
          border: `2px solid ${teamColor}`,
          boxShadow: `0 0 40px ${teamColor}40, inset 0 0 40px ${teamColor}20`,
        }}
      />
      {/* Secondary ring — teal, slightly delayed */}
      <div
        className="absolute rounded-full supreme-burst-ring-delayed"
        style={{
          border: '1px solid rgba(0,229,160,0.3)',
          boxShadow: '0 0 30px rgba(0,229,160,0.15)',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Share buttons for the W screen
// ---------------------------------------------------------------------------

function ShareButtons({ teamColor }: { teamColor: string }) {
  const buttons = [
    { label: 'X', icon: '𝕏' },
    { label: 'Instagram', icon: '◎' },
    { label: 'Copy Link', icon: '⎘' },
  ];
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {buttons.map(({ label, icon }) => (
        <button
          key={label}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-semibold tracking-wide uppercase
                     border border-white/[0.08] text-white/70 hover:text-white hover:border-white/20 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = `${teamColor}15`;
            (e.currentTarget as HTMLElement).style.borderColor = `${teamColor}40`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
          onClick={(e) => e.preventDefault()}
        >
          <span className="text-[13px]">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phone Bidders — Sotheby's staff relaying remote bids, subtle social proof
// ---------------------------------------------------------------------------

const PHONE_LINES = [
  { label: 'NEW YORK', top: '22%', delay: 2.5 },
  { label: 'LONDON', top: '38%', delay: 5.8 },
  { label: 'HONG KONG', top: '54%', delay: 9.2 },
] as const;

function PhoneBidders({ teamColor }: { teamColor: string }) {
  const [activeLine, setActiveLine] = useState<number | null>(null);

  useEffect(() => {
    // Randomly pulse a phone line every 3-7 seconds
    let timer: ReturnType<typeof setTimeout>;
    const pulse = () => {
      const idx = Math.floor(Math.random() * PHONE_LINES.length);
      setActiveLine(idx);
      const holdDuration = 800 + Math.random() * 400;
      setTimeout(() => setActiveLine(null), holdDuration);
      timer = setTimeout(pulse, 3000 + Math.random() * 4000);
    };
    timer = setTimeout(pulse, PHONE_LINES[0].delay * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute top-0 right-3 bottom-0 z-[11] pointer-events-none flex flex-col justify-start pt-16 gap-6">
      {PHONE_LINES.map((line, i) => {
        const isActive = activeLine === i;
        return (
          <div
            key={line.label}
            className="flex items-center gap-1.5 transition-opacity duration-500"
            style={{ opacity: isActive ? 0.45 : 0.12 }}
          >
            {/* Phone icon — minimal handset */}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path
                d="M1.5 0.5C1.5 0.5 2.5 0.5 3 1.5C3.5 2.5 2 3.5 2 3.5C2 3.5 3 5.5 4.5 6C6 6.5 6 5.5 6 5.5C7 5 7.5 6 7.5 6C7.5 6 7.5 7.5 6 7.5C4.5 7.5 1 5.5 0.5 3C0 0.5 1.5 0.5 1.5 0.5Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[7px] font-mono uppercase tracking-[0.3em]"
              style={{ color: isActive ? teamColor : 'currentColor' }}
            >
              {line.label}
            </span>
            {/* Bid active indicator — tiny dot */}
            <div
              className="h-[3px] w-[3px] rounded-full transition-all duration-300"
              style={{
                backgroundColor: isActive ? teamColor : 'transparent',
                boxShadow: isActive ? `0 0 4px ${teamColor}60` : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Holographic Auth Sticker — PSA/Beckett grading hologram on hero
// ---------------------------------------------------------------------------

function HolographicSticker({ teamColor }: { teamColor: string }) {
  return (
    <div
      className="absolute bottom-10 right-5 z-[13] pointer-events-none"
      style={{ width: 44, height: 44, opacity: 0.3 }}
    >
      {/* Outer rotating text ring */}
      <svg
        className="absolute inset-0 w-full h-full supreme-holo-ring"
        viewBox="0 0 44 44"
      >
        <defs>
          <path
            id="holo-text-path"
            d="M 22,22 m -17,0 a 17,17 0 1,1 34,0 a 17,17 0 1,1 -34,0"
            fill="none"
          />
        </defs>
        <circle cx="22" cy="22" r="20" stroke={teamColor} strokeWidth="0.5" fill="none" opacity="0.4" />
        <circle cx="22" cy="22" r="14.5" stroke={teamColor} strokeWidth="0.3" fill="none" opacity="0.2" />
        <text
          fontSize="4.2"
          fill={teamColor}
          opacity="0.6"
          letterSpacing="1.5"
          fontFamily="var(--font-oswald), sans-serif"
          fontWeight="500"
        >
          <textPath href="#holo-text-path">
            TST · VERIFIED · AUTHENTIC · GRADED ·
          </textPath>
        </text>
      </svg>
      {/* Center holographic shimmer disc */}
      <div
        className="absolute rounded-full supreme-holo-center"
        style={{
          top: 10,
          left: 10,
          width: 24,
          height: 24,
          backgroundImage: `conic-gradient(from 0deg, ${teamColor}30, rgba(255,255,255,0.15), ${teamColor}20, rgba(255,255,255,0.1), ${teamColor}30)`,
        }}
      />
      {/* Center check mark */}
      <svg className="absolute" style={{ top: 14, left: 14, width: 16, height: 16 }} viewBox="0 0 16 16" fill="none">
        <path
          d="M4 8.5 L7 11.5 L12 5"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Gallery Spotlight Cone — directed track light on the lot from above
// The most recognizable visual in any auction house saleroom: a single
// focused spotlight illuminating the object under the hammer. A warm cone
// shape from above with slow breathing — you are looking at art in a gallery.
// ---------------------------------------------------------------------------

function GallerySpotlight({ teamColor, phase }: { teamColor: string; phase: DropPhase }) {
  if (phase === 'ENDED') return null;

  // Warm white during OPEN, amber-tinted during CLOSING, gone during CRITICAL (handled by saleroom spotlight)
  const coneColor = phase === 'CLOSING'
    ? 'rgba(245, 180, 80, 0.045)'
    : 'rgba(255, 248, 235, 0.035)';
  const flareColor = phase === 'CLOSING'
    ? `${teamColor}06`
    : 'rgba(255, 248, 235, 0.02)';

  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
      {/* Primary cone — narrow track light from top center */}
      <div
        className="absolute supreme-spotlight-breathe"
        style={{
          top: '-5%',
          left: '25%',
          width: '50%',
          height: '85%',
          clipPath: 'polygon(42% 0%, 58% 0%, 80% 100%, 20% 100%)',
          background: `linear-gradient(to bottom, ${coneColor} 0%, transparent 85%)`,
          transition: 'background 2s ease',
        }}
      />
      {/* Secondary wider haze — ambient fill light spill */}
      <div
        className="absolute"
        style={{
          top: '0%',
          left: '15%',
          width: '70%',
          height: '70%',
          clipPath: 'polygon(35% 0%, 65% 0%, 90% 100%, 10% 100%)',
          background: `linear-gradient(to bottom, ${flareColor} 0%, transparent 70%)`,
          transition: 'background 2s ease',
        }}
      />
      {/* Light source flare — tiny bright point at cone origin */}
      <div
        className="absolute left-1/2 -translate-x-1/2 supreme-spotlight-breathe"
        style={{
          top: '-2px',
          width: '40px',
          height: '6px',
          borderRadius: '50%',
          background: phase === 'CLOSING'
            ? 'radial-gradient(ellipse, rgba(245,180,80,0.12) 0%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(255,248,235,0.08) 0%, transparent 70%)',
          transition: 'background 2s ease',
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ambient Particles — luminous dust motes drifting in a museum spotlight
// ---------------------------------------------------------------------------

function AmbientParticles({ teamColor }: { teamColor: string }) {
  const particles = useMemo(() => [
    { left: '15%', bottom: '35%', size: 2, duration: '7s', delay: '0s' },
    { left: '72%', bottom: '25%', size: 1.5, duration: '9s', delay: '2.5s' },
    { left: '40%', bottom: '45%', size: 2.5, duration: '8s', delay: '4s' },
    { left: '85%', bottom: '55%', size: 1.5, duration: '10s', delay: '1s' },
    { left: '28%', bottom: '20%', size: 2, duration: '8.5s', delay: '5.5s' },
  ], []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[6] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: teamColor,
            boxShadow: `0 0 ${p.size * 3}px ${teamColor}60`,
            animation: `supreme-particle-drift ${p.duration} ease-in-out ${p.delay} infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Authentication Seal — draws around edition number after counter locks
// ---------------------------------------------------------------------------

function AuthenticationSeal({ teamColor, show }: { teamColor: string; show: boolean }) {
  if (!show) return null;
  // Circle: r=48, circumference = 2 * PI * 48 ≈ 301.6 (matches CSS)
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none supreme-seal-container" style={{ color: teamColor }}>
      <svg width="108" height="108" viewBox="0 0 108 108" fill="none" className="absolute">
        <circle
          cx="54" cy="54" r="48"
          stroke={teamColor}
          strokeWidth="1"
          opacity="0.3"
          className="supreme-seal-circle"
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
        {/* Tick marks at cardinal points — notarization detail */}
        {[0, 90, 180, 270].map((deg) => (
          <line
            key={deg}
            x1="54" y1="2" x2="54" y2="6"
            stroke={teamColor}
            strokeWidth="0.75"
            opacity="0.2"
            style={{ transformOrigin: 'center', transform: `rotate(${deg}deg)` }}
          />
        ))}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provenance Step — staggered authentication line (auction house energy)
// ---------------------------------------------------------------------------

function ProvenanceStep({ label, delay, teamColor, started }: {
  label: string; delay: number; teamColor: string; started: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [started, delay]);

  return (
    <div
      className="flex items-center gap-2 transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-8px)',
      }}
    >
      {/* Checkmark dot */}
      <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke={teamColor} strokeWidth="0.75" opacity="0.3" />
        <path
          d="M3.5 6 L5.5 8 L8.5 4.5"
          stroke={teamColor}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmed / "W" Screen
// ---------------------------------------------------------------------------

// Edition number reveal — rapid count-up then lock (slot machine energy)
function EditionRevealCounter({ target, teamColor, started }: {
  target: number; teamColor: string; started: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const [locked, setLocked] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!started) return;
    const duration = 800; // ms to count up
    const startTime = performance.now();
    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      // easeOutExpo — fast start, decelerating to lock
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * target));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setLocked(true);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, target]);

  return (
    <span
      className="text-[32px] font-mono font-bold tabular-nums tracking-tight transition-all duration-200"
      style={{
        color: teamColor,
        textShadow: locked ? `0 0 20px ${teamColor}40` : 'none',
        transform: locked ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      #{(started ? display : 0).toLocaleString()}
    </span>
  );
}

function WScreen({
  moment,
  editionNumber,
  purchaseTime,
  tierName,
  tierPrice,
  onReset,
}: {
  moment: Moment;
  editionNumber: number;
  purchaseTime: number | null;
  tierName: string;
  tierPrice: number;
  onReset: () => void;
}) {
  const [show, setShow] = useState(false);
  const [flash, setFlash] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showSeal, setShowSeal] = useState(false);
  const [showShare, setShowShare] = useState(false);
  useEffect(() => {
    // Staggered reveal: flash → W → details → seal → share hint
    requestAnimationFrame(() => setShow(true));
    const t1 = setTimeout(() => setFlash(false), 400);
    const t2 = setTimeout(() => setShowDetails(true), 700);
    const t3 = setTimeout(() => setShowSeal(true), 1400); // seal before share — authority first
    const t4 = setTimeout(() => setShowShare(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Format purchase date for screenshot permanence
  const dateStr = useMemo(() => {
    const d = purchaseTime ? new Date(purchaseTime) : new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }, [purchaseTime]);

  // Lot number for card back (matches hero lot number formula)
  const lotNumber = (moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14] overflow-hidden">
      {/* Entry flash — team color */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: moment.teamColors.primary,
          opacity: flash ? 0.25 : 0,
        }}
      />

      {/* Card back — team-color pattern visible during flip's first half */}
      <div
        className="fixed inset-0 z-[15] pointer-events-none flex flex-col items-center justify-center supreme-card-back"
        style={{ backgroundColor: '#0B0E14' }}
      >
        {/* Diamond crosshatch pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${moment.teamColors.primary}06 0px, ${moment.teamColors.primary}06 1px, transparent 1px, transparent 24px), repeating-linear-gradient(-45deg, ${moment.teamColors.primary}06 0px, ${moment.teamColors.primary}06 1px, transparent 1px, transparent 24px)`,
          }}
        />
        {/* Center monogram */}
        <div className="relative flex flex-col items-center gap-3">
          <div
            className="text-[72px] leading-none tracking-tighter"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              color: `${moment.teamColors.primary}15`,
            }}
          >
            TST
          </div>
          <div
            className="text-[9px] uppercase tracking-[0.5em]"
            style={{ color: `${moment.teamColors.primary}12` }}
          >
            LOT {lotNumber}
          </div>
        </div>
        {/* Thin border inset — card edge */}
        <div
          className="absolute inset-6 border rounded-sm pointer-events-none"
          style={{ borderColor: `${moment.teamColors.primary}08` }}
        />
      </div>

      {/* Radial burst — clean expanding rings */}
      <RadialBurst teamColor={moment.teamColors.primary} />

      {/* 3D card-flip wrapper — flips from back to front */}
      <div className="absolute inset-0 supreme-card-flip" style={{ transformOrigin: 'center center' }}>

      {/* Action image — ghosted backdrop, more visible than before */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center transition-opacity duration-1500"
        style={{
          backgroundImage: `url(${moment.actionImageUrl})`,
          backgroundPosition: 'center 30%',
          opacity: show ? 0.1 : 0,
          filter: 'grayscale(0.4) contrast(1.1)',
        }}
      />

      {/* Dark vignette over backdrop */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #0B0E14 80%)',
        }}
      />

      {/* Team-color radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 40%, ${moment.teamColors.primary}20 0%, transparent 70%)`,
        }}
      />

      {/* Teal accent glow at center */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(0,229,160,0.08) 0%, transparent 45%)',
        }}
      />

      {/* Content — vertically centered, story-ready layout (9:16) */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm transition-all duration-700 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(30px)',
        }}
      >
        {/* Giant W — stark, confident */}
        <div
          className="text-[180px] leading-none tracking-tighter supreme-w-glow"
          style={{
            color: '#00E5A0',
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            textShadow: `0 0 60px rgba(0,229,160,0.5), 0 0 120px ${moment.teamColors.primary}40`,
          }}
        >
          W
        </div>

        {/* Ink-stroke "YOURS." — SVG text draws in via stroke-dashoffset,
             then fill floods in like ink soaking into parchment.
             The auctioneer's pen inscribes the final word on the sale record. */}
        <svg
          className="-mt-2"
          viewBox="0 0 160 22"
          width="160"
          height="22"
          aria-label="YOURS."
        >
          <text
            x="80"
            y="17"
            textAnchor="middle"
            fontFamily="var(--font-oswald), sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="0.5em"
            className="supreme-ink-stroke"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="0.6"
          >
            YOURS.
          </text>
        </svg>

        {/* Staggered details */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {/* Thin team-color divider */}
          <div
            className="mx-auto mt-7 mb-6 h-[1px] w-10"
            style={{ backgroundColor: `${moment.teamColors.primary}60` }}
          />

          {/* Player name — big, bold */}
          <h2
            className="text-5xl uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 700 }}
          >
            {moment.player}
          </h2>
          <p className="mt-1.5 text-sm text-white/30">{moment.playType}</p>

          {/* Edition serial — luxury serial number treatment with counter reveal + auth seal */}
          <div className="mt-6 flex flex-col items-center relative">
            {tierName !== 'Open' && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2"
                style={{ color: moment.teamColors.primary }}
              >
                {tierName} Edition
              </span>
            )}
            {/* Edition number with authentication seal ring */}
            <div className="relative flex items-center justify-center" style={{ width: 108, height: 108 }}>
              <AuthenticationSeal teamColor={moment.teamColors.primary} show={showSeal} />
              <div className="flex items-baseline gap-2">
                <EditionRevealCounter
                  target={editionNumber}
                  teamColor={moment.teamColors.primary}
                  started={showDetails}
                />
                <span className="text-[11px] font-mono text-white/15 tabular-nums">
                  / {moment.editionSize.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Matchup + date stamp — screenshot permanence */}
          <div className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/20">
            <span>{moment.team} vs {moment.opponent}</span>
            <span className="text-white/10">·</span>
            <span className="font-mono tabular-nums">{dateStr}</span>
          </div>

          {/* Provenance chain — auction house verification steps */}
          <div className="mt-5 flex flex-col items-center gap-1.5">
            {[
              { label: 'Identity verified', delay: 800 },
              { label: 'Payment authenticated', delay: 1000 },
              { label: 'Edition reserved', delay: 1200 },
              { label: 'Ownership recorded', delay: 1400 },
            ].map((step) => (
              <ProvenanceStep
                key={step.label}
                label={step.label}
                delay={step.delay}
                teamColor={moment.teamColors.primary}
                started={showDetails}
              />
            ))}
          </div>

          {/* Sale Record placard — auction house results card */}
          <div
            className="mt-6 w-full max-w-[240px] mx-auto transition-all duration-600 ease-out"
            style={{
              opacity: showSeal ? 1 : 0,
              transform: showSeal ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <div
              className="border rounded-sm px-4 py-3"
              style={{ borderColor: `${moment.teamColors.primary}15` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/20"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Sale Record
                </span>
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: `${moment.teamColors.primary}50` }}
                >
                  Lot {lotNumber}
                </span>
              </div>
              <div
                className="h-[1px] mb-2"
                style={{ backgroundColor: `${moment.teamColors.primary}10` }}
              />
              {/* Sale Record fields — staggered reveal like an auction clerk filling in the ledger */}
              {[
                { label: 'Hammer Price', value: `$${tierPrice.toFixed(2)}`, bold: true, large: true },
                { label: 'Currency Equiv.', value: `£${(tierPrice * 0.79).toFixed(2)} / €${(tierPrice * 0.92).toFixed(2)} / HK$${(tierPrice * 7.8).toFixed(2)}`, bold: false, large: false },
                { label: 'Pre-Sale Estimate', value: `$${Math.round(tierPrice * 1.8).toFixed(2)}–$${Math.round(tierPrice * 3.2).toFixed(2)}`, bold: false, large: false },
                { label: 'Acquired', value: dateStr, bold: false, large: false },
                { label: 'Status', value: 'Sold', bold: true, large: false, teal: true },
              ].map((field, idx) => (
                <div
                  key={field.label}
                  className="flex items-center justify-between"
                  style={{
                    marginTop: idx === 0 ? 0 : idx === 1 ? 2 : 4,
                    animation: showSeal ? `supreme-field-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + idx * 0.12}s both` : undefined,
                  }}
                >
                  <span className={`text-[${field.large ? '8' : '7'}px] uppercase tracking-[0.2em] text-white/${field.large ? '15' : '10'}`}>
                    {field.label}
                  </span>
                  <span
                    className={`text-[${field.large ? '11' : '8'}px] font-mono tabular-nums ${field.bold ? 'font-bold' : ''}`}
                    style={{ color: field.teal ? '#00E5A0' : `rgba(255,255,255,${field.large ? 0.4 : field.bold ? 0.4 : 0.15})` }}
                  >
                    {field.value}
                  </span>
                </div>
              ))}
              {/* Buyer's Premium — the surcharge every auction house adds */}
              <div
                className="h-[1px] mt-2 mb-1.5"
                style={{
                  backgroundColor: `${moment.teamColors.primary}08`,
                  animation: showSeal ? 'supreme-field-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both' : undefined,
                }}
              />
              <div
                className="flex items-center justify-between"
                style={{ animation: showSeal ? 'supreme-field-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.72s both' : undefined }}
              >
                <span className="text-[7px] uppercase tracking-[0.2em] text-white/10">
                  Buyer&apos;s Premium
                </span>
                <span className="text-[7px] font-mono tabular-nums text-white/15">
                  Waived
                </span>
              </div>
              <div
                className="flex items-center justify-between mt-0.5"
                style={{ animation: showSeal ? 'supreme-field-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.82s both' : undefined }}
              >
                <span className="text-[7px] uppercase tracking-[0.2em] text-white/10">
                  Total
                </span>
                <span
                  className="text-[9px] font-mono tabular-nums font-bold"
                  style={{ color: `${moment.teamColors.primary}45` }}
                >
                  ${tierPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Provenance — chain of custody like Christie's lot pages */}
        {/* At Sotheby's and Christie's, every lot page shows provenance:    */}
        {/* the documented chain of ownership that establishes legitimacy    */}
        {/* and adds value. This is the digital equivalent — 3 entries      */}
        {/* showing the moment's journey from creation to your collection.  */}
        <div
          className="mt-5 w-full max-w-[200px] mx-auto transition-all duration-700 ease-out"
          style={{
            opacity: showSeal ? 1 : 0,
            transform: showSeal ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          <span
            className="block text-[7px] font-bold uppercase tracking-[0.35em] text-white/15 mb-2"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Provenance
          </span>
          <div className="relative pl-3">
            {/* Vertical provenance line */}
            <div
              className="absolute left-[3px] top-1 bottom-1 w-[0.5px]"
              style={{ backgroundColor: `${moment.teamColors.primary}15` }}
            />
            {[
              {
                date: moment.context.split(',').pop()?.trim().split(' ').pop() || '2024',
                label: 'Minted',
                detail: 'NBA Top Shot',
              },
              {
                date: dateStr.split(' ').pop() || '2026',
                label: 'Evening Sale',
                detail: `Lot ${lotNumber} · Primary Market`,
              },
              {
                date: dateStr,
                label: 'Acquired',
                detail: 'Private Collection',
                active: true,
              },
            ].map((entry, idx) => (
              <div
                key={entry.label}
                className="relative flex items-start gap-2.5 pb-2 last:pb-0"
                style={{
                  animation: showSeal ? `supreme-field-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.9 + idx * 0.15}s both` : undefined,
                }}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-[-3px] top-[3px] w-[7px] h-[7px] rounded-full border"
                  style={{
                    borderColor: entry.active ? '#00E5A0' : `${moment.teamColors.primary}25`,
                    backgroundColor: entry.active ? '#00E5A030' : 'transparent',
                    boxShadow: entry.active ? '0 0 6px rgba(0,229,160,0.3)' : 'none',
                  }}
                />
                <div className="flex flex-col ml-2">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.12em]"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: entry.active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {entry.label}
                  </span>
                  <span className="text-[7px] text-white/12 font-mono">{entry.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inkwell signature — collector signs the acquisition ledger */}
          <div
            className="mt-4 w-full max-w-[200px] mx-auto flex flex-col items-center transition-all duration-700 ease-out"
            style={{
              opacity: showSeal ? 1 : 0,
              transform: showSeal ? 'translateY(0)' : 'translateY(6px)',
            }}
          >
            <span className="text-[7px] font-mono uppercase tracking-[0.35em] text-white/12 mb-1.5">
              Collector&apos;s Signature
            </span>
            {/* Calligraphic ink stroke — draws itself like signing a document */}
            <svg
              width="140"
              height="24"
              viewBox="0 0 140 24"
              fill="none"
              className="overflow-visible"
            >
              <path
                d="M8 18 C20 6, 32 4, 42 12 C52 20, 58 8, 68 10 C78 12, 82 6, 92 8 C102 10, 108 4, 118 14 C122 18, 128 12, 132 14"
                stroke={moment.teamColors.primary}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={showSeal ? 'supreme-signature-stroke' : ''}
                style={{ opacity: 0 }}
              />
            </svg>
            {/* Thin rule below signature — ledger line */}
            <div
              className="w-full h-[0.5px] mt-0.5"
              style={{ backgroundColor: `${moment.teamColors.primary}10` }}
            />
          </div>

        {/* Wax seal — embossed authentication stamp, auction house finality */}
        <div
          className="mt-5 flex justify-center transition-all duration-700 ease-out"
          style={{
            opacity: showSeal ? 1 : 0,
            transform: showSeal ? 'scale(1)' : 'scale(0.85)',
          }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: 56, height: 56 }}
          >
            {/* Outer emboss ring — inset shadow creates raised wax feel */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${moment.teamColors.primary}12 0%, ${moment.teamColors.primary}06 60%, transparent 75%)`,
                boxShadow: `inset 0 1px 3px ${moment.teamColors.primary}20, inset 0 -1px 2px rgba(0,0,0,0.3), 0 0 12px ${moment.teamColors.primary}08`,
              }}
            />
            {/* Inner border ring */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 4,
                border: `0.75px solid ${moment.teamColors.primary}18`,
              }}
            />
            {/* SVG rotating text ring — "TST · AUTHENTICATED · CERTIFIED ·" */}
            <svg
              className="absolute inset-0 w-full h-full supreme-holo-ring"
              viewBox="0 0 56 56"
              style={{ animationDuration: '30s' }}
            >
              <defs>
                <path
                  id="wax-seal-path"
                  d="M 28,28 m -21,0 a 21,21 0 1,1 42,0 a 21,21 0 1,1 -42,0"
                  fill="none"
                />
              </defs>
              <text
                fontSize="4"
                fill={moment.teamColors.primary}
                opacity="0.2"
                letterSpacing="2.2"
                fontFamily="var(--font-oswald), sans-serif"
                fontWeight="500"
              >
                <textPath href="#wax-seal-path">
                  TST · AUTHENTICATED · CERTIFIED ·
                </textPath>
              </text>
            </svg>
            {/* Center monogram */}
            <div
              className="relative text-[11px] font-bold tracking-[0.15em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: `${moment.teamColors.primary}25`,
                textShadow: `0 1px 0 rgba(0,0,0,0.2), 0 -1px 0 ${moment.teamColors.primary}08`,
              }}
            >
              TST
            </div>
          </div>
        </div>

        {/* Share section — appears last */}
        <div
          className="mt-5 transition-all duration-600 ease-out"
          style={{
            opacity: showShare ? 1 : 0,
            transform: showShare ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <ShareButtons teamColor={moment.teamColors.primary} />

          {/* Screenshot hint */}
          <p className="mt-4 text-[10px] text-white/12 uppercase tracking-[0.2em]">
            Screenshot to share your W
          </p>
        </div>

        {/* Dev reset — tiny, bottom */}
        <button
          onClick={onReset}
          className="mt-6 text-[10px] text-white/10 hover:text-white/25 transition-colors"
        >
          reset prototype
        </button>
      </div>
      </div>{/* End card-flip wrapper */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SupremePage() {
  const params = useParams<{ momentId: string }>();
  const momentId = params.momentId;

  const moment = useMemo(() => getMoment(momentId), [momentId]);

  const countdown = useCountdown(SALE_DURATION_MS[momentId] ?? 12 * 60 * 1000);
  const { state: viewPhase, editionNumber, purchaseTime, purchase, reset } = usePrototypeState(momentId);

  const watching = useSocialProof(moment ? 30 + moment.editionsClaimed % 40 : 30);
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [purchaseStage, setPurchaseStage] = useState(0); // 0=reserving, 1=ledger open, 2=recording, 3=sold
  const magnetic = useMagneticButton(6);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroRevealed, setHeroRevealed] = useState(false);

  // Hero color reveal — starts desaturated, gains color over 2s
  useEffect(() => {
    const t = setTimeout(() => setHeroRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Derive drop phase from countdown
  const dropPhase = derivePhase(countdown.totalSeconds);
  const timerDisplay = formatTimer(countdown.totalSeconds);

  // Phase transition pulse — the void breathes when phase shifts
  const [transitionFlash, setTransitionFlash] = useState<'amber' | 'red' | null>(null);
  const prevPhaseRef = useRef(dropPhase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = dropPhase;
    if (prev === 'OPEN' && dropPhase === 'CLOSING') {
      setTransitionFlash('amber');
      HAPTIC.phaseShift('CLOSING');
      const t = setTimeout(() => setTransitionFlash(null), 600);
      return () => clearTimeout(t);
    }
    if (prev === 'CLOSING' && dropPhase === 'CRITICAL') {
      setTransitionFlash('red');
      HAPTIC.phaseShift('CRITICAL');
      const t = setTimeout(() => setTransitionFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [dropPhase]);

  // Per-tier interested parties — Sotheby's ⊻ indicator
  const { interests: tierInterests, flashIdx: interestFlashIdx } = useTierInterest(moment?.rarityTiers.length ?? 4);

  // Live claim ticker
  const { claimed, lastClaimer, claimFlash, bidLog } = useClaimTicker(
    moment?.editionsClaimed ?? 0,
    moment?.editionSize ?? 5000,
  );

  // Purchase stage progression (4 stages in 2.8s) with haptic feedback
  // Extended ceremony: 0=ruling ledger, 1=lot inscription, 2=paddle recording, 3=sold
  useEffect(() => {
    if (viewPhase !== 'purchasing') {
      setPurchaseStage(0);
      return;
    }
    HAPTIC.purchaseStep(0);
    const t1 = setTimeout(() => { setPurchaseStage(1); HAPTIC.purchaseStep(0); }, 600);
    const t2 = setTimeout(() => { setPurchaseStage(2); HAPTIC.purchaseStep(1); }, 1500);
    const t3 = setTimeout(() => { setPurchaseStage(3); HAPTIC.gavelStrike(); }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [viewPhase]);

  // Paddle raise — bidder paddle animates when purchase starts
  const [paddleRaised, setPaddleRaised] = useState(false);
  const paddleKeyRef = useRef(0);
  useEffect(() => {
    if (viewPhase === 'purchasing') {
      paddleKeyRef.current += 1;
      setPaddleRaised(true);
      const t = setTimeout(() => setPaddleRaised(false), 900);
      return () => clearTimeout(t);
    }
  }, [viewPhase]);

  // Gavel strike — radial shockwave when purchase confirms at "Yours." stage
  const [gavelStrike, setGavelStrike] = useState(false);
  const gavelStrikeKeyRef = useRef(0);
  useEffect(() => {
    if (viewPhase === 'purchasing' && purchaseStage === 3) {
      gavelStrikeKeyRef.current += 1;
      setGavelStrike(true);
      const t = setTimeout(() => setGavelStrike(false), 700);
      return () => clearTimeout(t);
    }
  }, [viewPhase, purchaseStage]);

  // Condition Report drawer — specialist assessment resolves purchase doubt
  const [conditionReportOpen, setConditionReportOpen] = useState(false);

  // Register Interest — at Christie's/Sotheby's online, the "Register Interest"
  // action is the strongest pre-bid commitment signal. Once registered, you've
  // self-identified as an active participant — not a browser. The foot-in-the-door
  // effect means you're far more likely to follow through with a bid.
  const [interestRegistered, setInterestRegistered] = useState(false);

  // CTA sonar invite — single ring pulse on page load, draws eye to button
  const [sonarFired, setSonarFired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSonarFired(true), 1200); // after entrance animations
    return () => clearTimeout(t);
  }, []);

  // Paddle registration — at Sotheby's/Christie's, bidders register and receive
  // a numbered paddle before the auction starts. This brief notice on page load
  // transforms the visitor from spectator → registered bidder psychologically.
  const [paddleNotice, setPaddleNotice] = useState(false);
  const paddleNumber = useMemo(
    () => moment ? ((moment.id.charCodeAt(1) * 23 + moment.id.charCodeAt(0) * 7) % 900 + 100) : 247,
    [moment],
  );
  useEffect(() => {
    // Show paddle notice after hero reveals, hide after 4s
    const show = setTimeout(() => setPaddleNotice(true), 1800);
    const hide = setTimeout(() => setPaddleNotice(false), 5800);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  // Critical timer heartbeat — subtle per-second pulse on timer digits
  const [timerTick, setTimerTick] = useState(false);
  const prevSecondsRef = useRef(countdown.totalSeconds);
  useEffect(() => {
    if (dropPhase === 'CRITICAL' && countdown.totalSeconds > 0 && countdown.totalSeconds !== prevSecondsRef.current) {
      setTimerTick(true);
      const t = setTimeout(() => setTimerTick(false), 180);
      prevSecondsRef.current = countdown.totalSeconds;
      return () => clearTimeout(t);
    }
    prevSecondsRef.current = countdown.totalSeconds;
  }, [countdown.totalSeconds, dropPhase]);

  // Auction gavel countdown — "FAIR WARNING" at ≤20s, "GOING ONCE..." at ≤10s, "GOING TWICE..." at ≤5s
  const [gavelPhase, setGavelPhase] = useState<0 | 1 | 2 | 3>(0); // 0=none, 1=fair warning, 2=going once, 3=going twice
  const gavelKeyRef = useRef(0);
  useEffect(() => {
    if (dropPhase !== 'CRITICAL' || viewPhase === 'purchasing') {
      setGavelPhase(0);
      return;
    }
    if (countdown.totalSeconds <= 5 && countdown.totalSeconds > 0) {
      if (gavelPhase !== 3) {
        gavelKeyRef.current += 1;
        setGavelPhase(3);
        haptic([20, 40, 20, 40, 25]); // double-tap — going twice
      }
    } else if (countdown.totalSeconds <= 10 && countdown.totalSeconds > 5) {
      if (gavelPhase !== 2) {
        gavelKeyRef.current += 1;
        setGavelPhase(2);
        haptic([15, 30, 18]); // single strike — going once
      }
    } else if (countdown.totalSeconds <= 20 && countdown.totalSeconds > 10) {
      if (gavelPhase !== 1) {
        gavelKeyRef.current += 1;
        setGavelPhase(1);
        haptic(12); // gentle tap — fair warning
      }
    }
  }, [countdown.totalSeconds, dropPhase, viewPhase, gavelPhase]);

  // Lot closed ceremony — when the auction ends (CRITICAL→ENDED), the saleroom
  // has its closing moment: horizontal gavel-fall line, "LOT CLOSED" text, room
  // flash. The gavel curtain (cycle 216) fires on purchase confirmation; this fires
  // when the lot expires without the user buying. Every auction has a closing ceremony.
  const [lotClosedCeremony, setLotClosedCeremony] = useState(false);
  const prevPhaseForClosingRef = useRef(dropPhase);
  useEffect(() => {
    const prev = prevPhaseForClosingRef.current;
    prevPhaseForClosingRef.current = dropPhase;
    if (prev === 'CRITICAL' && dropPhase === 'ENDED' && viewPhase !== 'purchasing' && viewPhase !== 'confirmed' && viewPhase !== 'sharing') {
      setLotClosedCeremony(true);
      HAPTIC.gavelStrike();
      const t = setTimeout(() => setLotClosedCeremony(false), 1800);
      return () => clearTimeout(t);
    }
  }, [dropPhase, viewPhase]);

  // Anti-snipe lot extension — at Sotheby's/Christie's online, when a bid
  // arrives in the final seconds the lot timer resets. The banner "Lot Extended"
  // appears, telling everyone that competition forced extra time. This is the
  // single most powerful conversion signal in live auctions: "others are bidding
  // RIGHT NOW." We show the notice during CRITICAL phase when a claim fires.
  const [lotExtended, setLotExtended] = useState(false);
  const lotExtendedKeyRef = useRef(0);
  const prevLastClaimerRef = useRef<string | null>(null);
  useEffect(() => {
    // Only fire when a NEW claim arrives during CRITICAL phase
    if (
      lastClaimer &&
      lastClaimer !== prevLastClaimerRef.current &&
      dropPhase === 'CRITICAL' &&
      viewPhase !== 'purchasing' &&
      countdown.totalSeconds > 0
    ) {
      lotExtendedKeyRef.current += 1;
      setLotExtended(true);
      HAPTIC.lotExtended();
      const t = setTimeout(() => setLotExtended(false), 3500);
      prevLastClaimerRef.current = lastClaimer;
      return () => clearTimeout(t);
    }
    prevLastClaimerRef.current = lastClaimer;
  }, [lastClaimer, dropPhase, viewPhase, countdown.totalSeconds]);

  // Tier switch breathe — brief content shift acknowledges tier change
  // Also tracks direction for catalogue page-turn animation
  const [tierBreathe, setTierBreathe] = useState(false);
  const [tierDirection, setTierDirection] = useState<'left' | 'right'>('right');
  const [tierTurnKey, setTierTurnKey] = useState(0);
  const prevTierIdx = useRef(selectedTierIdx);
  useEffect(() => {
    if (prevTierIdx.current !== selectedTierIdx) {
      setTierDirection(selectedTierIdx > prevTierIdx.current ? 'right' : 'left');
      setTierTurnKey((k) => k + 1);
      prevTierIdx.current = selectedTierIdx;
      setTierBreathe(true);
      const t = setTimeout(() => setTierBreathe(false), 350);
      return () => clearTimeout(t);
    }
  }, [selectedTierIdx]);

  // Reserve met celebration — pulse when threshold first crossed
  const reserveThreshold = useMemo(
    () => Math.floor((moment?.editionSize ?? 5000) * 0.2),
    [moment?.editionSize],
  );
  const reserveMet = claimed >= reserveThreshold;
  const prevReserveMet = useRef(reserveMet);
  const [reserveCelebration, setReserveCelebration] = useState(false);
  useEffect(() => {
    if (!prevReserveMet.current && reserveMet) {
      setReserveCelebration(true);
      HAPTIC.gavelStrike();
      const t = setTimeout(() => setReserveCelebration(false), 1200);
      return () => clearTimeout(t);
    }
    prevReserveMet.current = reserveMet;
  }, [reserveMet]);

  // Saleroom Temperature — the auctioneer's one-word read of the room's energy.
  // At Christie's/Sotheby's, the atmosphere in the saleroom shifts from quiet
  // viewing to heated competition. This indicator distills that energy into a
  // single institutional word, placed near the CTA as a subtle conversion signal.
  const saleroomTemperature = useMemo(() => {
    const pctClaimed = claimed / (moment?.editionSize ?? 5000);
    const inCritical = dropPhase === 'CRITICAL';
    const inClosing = dropPhase === 'CLOSING';
    const recentBids = bidLog.length;

    if (dropPhase === 'ENDED') return null;
    if (inCritical && pctClaimed > 0.3)
      return { word: 'Heated', color: '#EF4444', opacity: 0.3 };
    if (inCritical || (inClosing && pctClaimed > 0.4) || recentBids >= 4)
      return { word: 'Competitive', color: '#F59E0B', opacity: 0.25 };
    if (inClosing || pctClaimed > 0.2 || recentBids >= 2)
      return { word: 'Active', color: '#00E5A0', opacity: 0.2 };
    return { word: 'Quiet', color: '#6B7A99', opacity: 0.15 };
  }, [claimed, moment?.editionSize, dropPhase, bidLog.length]);

  // Saleroom spotlight — during CRITICAL, gallery lighting narrows to a tight
  // auction spotlight on the lot. As seconds drain, the cone tightens and edges
  // darken, mimicking the saleroom moment when house lights dim and a single spot
  // focuses on the object under the hammer. Intensity 0→1 over CRITICAL (120→0s).
  const spotlightIntensity = useMemo(() => {
    if (dropPhase !== 'CRITICAL' || countdown.totalSeconds <= 0) return 0;
    // 1.0 at 0 seconds, 0.0 at 120 seconds
    return Math.max(0, Math.min(1, 1 - countdown.totalSeconds / 120));
  }, [dropPhase, countdown.totalSeconds]);

  // Sticky CTA — show when main button overflows on small screens
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Parallax scroll — hero moves at 0.4x speed for Apple-like depth
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  if (!moment) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0B0E14] text-white/40 text-sm">
        Moment not found.
      </div>
    );
  }

  const selectedTier = moment.rarityTiers[selectedTierIdx];
  const { display: scrambledPrice, isScrambling: priceScrambling } = usePriceScramble(selectedTier.price);
  const progressPct = ((claimed / moment.editionSize) * 100).toFixed(1);
  const remaining = moment.editionSize - claimed;

  // Time progress (0 = full time, 1 = ended)
  const totalDuration = SALE_DURATION_MS[momentId] ?? 12 * 60 * 1000;
  const timeProgressPct = Math.max(0, Math.min(100, ((totalDuration / 1000 - countdown.totalSeconds) / (totalDuration / 1000)) * 100));

  // Tier ambient shift — page aura reacts to tier selection
  // Open = teal (default), Rare = team-color, Legendary = team+gold, Ultimate = gold
  const tierAccentColor = useMemo(() => {
    const tier = selectedTier.tier;
    if (tier === 'Rare') return moment.teamColors.primary;
    if (tier === 'Legendary') return '#D4A017'; // warm gold
    if (tier === 'Ultimate') return '#FEC524'; // pure gold
    return '#00E5A0'; // teal default for Open
  }, [selectedTier.tier, moment.teamColors.primary]);

  // Gavel-fall curtain — the decisive moment between "Sold" and the W screen.
  // At Christie's, the gavel strikes the sound block with a single crack. The room
  // holds its breath. Then the applause. This transition IS that breath.
  const [gavelCurtain, setGavelCurtain] = useState(false);
  const gavelCurtainPrev = useRef(viewPhase);
  useEffect(() => {
    const prev = gavelCurtainPrev.current;
    gavelCurtainPrev.current = viewPhase;
    if (prev === 'purchasing' && viewPhase === 'confirmed') {
      setGavelCurtain(true);
      HAPTIC.gavelStrike();
      const t = setTimeout(() => setGavelCurtain(false), 850);
      return () => clearTimeout(t);
    }
    if (viewPhase === 'confirmed' || viewPhase === 'sharing') {
      // Direct load into confirmed state — no curtain
      setGavelCurtain(false);
    }
  }, [viewPhase]);

  // ---- CONFIRMED state ----
  if (viewPhase === 'confirmed' || viewPhase === 'sharing') {
    if (gavelCurtain) {
      // Gavel-fall curtain: horizontal strike line + room flash + fade
      return (
        <div className="fixed inset-0 z-50 bg-[#0B0E14] flex items-center justify-center overflow-hidden">
          {/* Horizontal gavel-strike line — sweeps from center outward */}
          <div
            className="absolute w-full h-[1px] supreme-gavel-curtain-line"
            style={{
              backgroundColor: moment.teamColors.primary,
              boxShadow: `0 0 12px ${moment.teamColors.primary}60, 0 0 30px ${moment.teamColors.primary}30`,
            }}
          />
          {/* Team-color room flash — the crack reverberates through the saleroom */}
          <div
            className="absolute inset-0 supreme-gavel-curtain-flash"
            style={{ backgroundColor: moment.teamColors.primary }}
          />
          {/* "SOLD" echo — lingers from the lot clerk as the room reacts */}
          <span
            className="absolute text-[11px] uppercase tracking-[0.4em] supreme-gavel-curtain-sold"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 600,
              color: `${moment.teamColors.primary}60`,
            }}
          >
            Sold
          </span>
        </div>
      );
    }
    return (
      <WScreen
        moment={moment}
        editionNumber={editionNumber ?? moment.editionsClaimed + 1}
        purchaseTime={purchaseTime}
        tierName={selectedTier.tier}
        tierPrice={selectedTier.price}
        onReset={reset}
      />
    );
  }

  // ---- Button config by phase ----
  const isPurchasing = viewPhase === 'purchasing';
  const isEnded = dropPhase === 'ENDED';

  let buttonBg = '#00E5A0';
  // CTA upgrades from "OWN THIS MOMENT" to "PLACE BID" after interest registration
  // — the language shift mirrors the auction journey: browsing → committed bidder
  let buttonText = interestRegistered
    ? `PLACE BID — ${scrambledPrice}`
    : `OWN THIS MOMENT — ${scrambledPrice}`;
  let buttonTextColor = '#0B0E14';
  let buttonAnimation = '';

  if (isPurchasing) {
    buttonBg = '#00E5A0';
    buttonText = purchaseStage === 0 ? `Paddle ${paddleNumber} — Reserving...` : purchaseStage === 1 ? 'Opening Ledger...' : purchaseStage === 2 ? 'Recording Sale...' : 'Yours.';
    buttonTextColor = '#0B0E14';
  } else if (isEnded) {
    buttonBg = '#1C2333';
    buttonText = 'DROP ENDED';
    buttonTextColor = '#6B7A99';
  } else if (dropPhase === 'CRITICAL') {
    buttonBg = '#EF4444';
    // Auctioneer's cadence escalation — button text mirrors the gavel phases
    buttonText = gavelPhase === 3 ? `GOING TWICE — ${scrambledPrice}`
      : gavelPhase === 2 ? `GOING ONCE — ${scrambledPrice}`
      : gavelPhase === 1 ? `FAIR WARNING — ${scrambledPrice}`
      : `LAST CHANCE — ${scrambledPrice}`;
    buttonTextColor = '#FFFFFF';
    buttonAnimation = gavelPhase === 3 ? 'supreme-heartbeat-fast' : gavelPhase >= 1 ? 'supreme-heartbeat' : 'animate-urgency-fast';
  } else if (dropPhase === 'CLOSING') {
    buttonText = `CLOSING SOON — ${scrambledPrice}`;
    buttonAnimation = 'animate-urgency';
  }

  // Glow intensity increases with urgency; tier accent tints glow during OPEN
  const glowOpacity =
    dropPhase === 'CRITICAL' ? 0.5 : dropPhase === 'CLOSING' ? 0.3 : 0.2;
  const glowColor =
    dropPhase === 'CRITICAL' ? '#EF4444' :
    dropPhase === 'CLOSING' ? '#00E5A0' :
    tierAccentColor;

  // Background shifts toward team color in urgency phases
  const bgColor =
    dropPhase === 'CRITICAL'
      ? `color-mix(in srgb, #0B0E14 92%, ${moment.teamColors.primary})`
      : dropPhase === 'CLOSING'
        ? `color-mix(in srgb, #0B0E14 96%, ${moment.teamColors.primary})`
        : '#0B0E14';

  // Hero desaturation for ENDED / purchasing states
  const heroFilter =
    isEnded ? 'grayscale(0.7) brightness(0.6)' :
    isPurchasing ? 'brightness(0.7) blur(2px)' :
    dropPhase === 'CRITICAL' ? 'saturate(1.1) contrast(1.05)' :
    'none';

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden select-none transition-colors duration-1000 supreme-noise-texture"
      style={{ backgroundColor: bgColor }}
    >
      {/* ============================================================= */}
      {/* AMBIENT BREATHING VIGNETTE — slow team-color edge pulse */}
      {/* ============================================================= */}
      {!isEnded && dropPhase !== 'CRITICAL' && (
        <div
          className="fixed inset-0 z-[5] pointer-events-none supreme-breathe-vignette"
          style={{
            boxShadow: `inset 0 0 120px ${tierAccentColor}08, inset 0 0 60px ${tierAccentColor}05`,
            transition: 'box-shadow 1.2s ease',
          }}
        />
      )}

      {/* ============================================================= */}
      {/* PADDLE REGISTRATION — institutional arrival notice             */}
      {/* At Christie's, you receive your paddle before the auction.     */}
      {/* This brief notice registers the visitor as a bidder.           */}
      {/* ============================================================= */}
      {paddleNotice && viewPhase === 'browsing' && (
        <div
          className="fixed bottom-8 left-0 right-0 z-[35] pointer-events-none flex justify-center supreme-paddle-notice"
        >
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-sm"
            style={{
              backgroundColor: 'rgba(11,14,20,0.8)',
              border: `0.5px solid ${moment.teamColors.primary}18`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/20"
            >
              Paddle
            </span>
            <span
              className="text-[14px] font-bold tabular-nums"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: `${moment.teamColors.primary}60`,
              }}
            >
              {paddleNumber}
            </span>
            <span
              className="text-[8px] uppercase tracking-[0.25em] text-white/15"
              style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
            >
              Registered for Evening Sale
            </span>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* PHASE TRANSITION PULSE — void breathes on phase shift */}
      {/* ============================================================= */}
      {transitionFlash && (
        <div
          className="fixed inset-0 z-[36] pointer-events-none supreme-phase-pulse"
          style={{
            backgroundColor: transitionFlash === 'red' ? '#EF4444' : '#F59E0B',
          }}
        />
      )}

      {/* ============================================================= */}
      {/* LOT CLOSED CEREMONY — the hammer falls, the lot ends           */}
      {/* At Christie's/Sotheby's, when the gavel falls for the last     */}
      {/* time, the saleroom exhales. The lot is done. Lights begin to   */}
      {/* dim for the next lot. This 1.8s overlay marks that moment:     */}
      {/* a horizontal line (the hammer striking), "LOT CLOSED" text     */}
      {/* (the clerk's announcement), and a brief team-color flash.      */}
      {/* ============================================================= */}
      {lotClosedCeremony && (
        <div className="fixed inset-0 z-[43] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Room flash — the saleroom reacts to the final gavel strike */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: moment.teamColors.primary,
              animation: 'supreme-lot-closed-flash 1.8s ease-out forwards',
            }}
          />
          {/* Dark scrim — the house lights begin to dim */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#0B0E14',
              animation: 'supreme-lot-closed-flash 1.8s ease-out forwards',
              animationDelay: '0.3s',
              opacity: 0,
            }}
          />
          {/* Horizontal gavel-fall line — the crack of the hammer on the sound block */}
          <div
            className="absolute w-full h-[1px]"
            style={{
              backgroundColor: moment.teamColors.primary,
              boxShadow: `0 0 16px ${moment.teamColors.primary}50, 0 0 40px ${moment.teamColors.primary}25`,
              transformOrigin: 'center',
              animation: 'supreme-lot-closed-line 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          />
          {/* "LOT CLOSED" — the clerk's formal announcement */}
          <span
            className="absolute uppercase select-none"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              color: `${moment.teamColors.primary}`,
              animation: 'supreme-lot-closed-text 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
            }}
          >
            Lot Closed
          </span>
          {/* Lot number — institutional specificity */}
          <span
            className="absolute uppercase select-none font-mono tabular-nums"
            style={{
              fontSize: '8px',
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.15)',
              marginTop: '36px',
              animation: 'supreme-lot-closed-sub 1.8s ease-out forwards',
            }}
          >
            Lot {((moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000)} · {moment.player}
          </span>
        </div>
      )}

      {/* ============================================================= */}
      {/* LOT CLERK LEDGER — SVG inscription ceremony during purchase    */}
      {/* The clerk opens the ledger, rules a line, inscribes the lot,   */}
      {/* records the paddle, then stamps SOLD with a flourish.          */}
      {/* Each stage draws itself via stroke-dashoffset — the pen moves. */}
      {/* ============================================================= */}
      {isPurchasing && (
        <div
          className="fixed inset-0 z-[44] pointer-events-none flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(11,14,20,0.88) 0%, rgba(11,14,20,0.94) 100%)',
          }}
        >
          {/* SVG Ledger — the entire ceremony is one SVG canvas */}
          <svg
            viewBox="0 0 280 200"
            width="280"
            height="200"
            className="overflow-visible"
            aria-label="Lot clerk recording sale"
          >
            {/* Stage 0+: Top ruled line draws from center outward */}
            <line
              x1="60" y1="50" x2="220" y2="50"
              stroke={`${moment.teamColors.primary}`}
              strokeOpacity={0.35}
              strokeWidth="0.5"
              className="supreme-ledger-rule"
              style={{ animationDelay: '0s' }}
            />

            {/* Stage 1+: Lot number inscription — characters appear sequentially */}
            {purchaseStage >= 1 && (
              <g className="supreme-ledger-inscribe">
                <text
                  x="140" y="72"
                  textAnchor="middle"
                  fill="white"
                  fillOpacity={0.2}
                  fontSize="7"
                  fontFamily="var(--font-mono), monospace"
                  letterSpacing="0.35em"
                  className="uppercase"
                >
                  {`LOT ${((moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000)}`
                    .split('').map((ch, i) => (
                    <tspan key={i} className="supreme-ledger-char" style={{ animationDelay: `${i * 0.04}s` }}>
                      {ch}
                    </tspan>
                  ))}
                </text>

                {/* Mid ruled line — separates lot from paddle */}
                <line
                  x1="100" y1="82" x2="180" y2="82"
                  stroke={`${moment.teamColors.primary}`}
                  strokeOpacity={0.2}
                  strokeWidth="0.3"
                  className="supreme-ledger-rule"
                  style={{ animationDelay: '0.3s' }}
                />
              </g>
            )}

            {/* Stage 2+: Paddle recording — clerk writes the bidder assignment */}
            {purchaseStage >= 2 && (
              <g className="supreme-ledger-inscribe">
                <text
                  x="140" y="98"
                  textAnchor="middle"
                  fill="white"
                  fillOpacity={0.3}
                  fontSize="7"
                  fontFamily="var(--font-mono), monospace"
                  letterSpacing="0.3em"
                  className="uppercase"
                >
                  {`PADDLE ${paddleNumber}`.split('').map((ch, i) => (
                    <tspan key={i} className="supreme-ledger-char" style={{ animationDelay: `${i * 0.04}s` }}>
                      {ch}
                    </tspan>
                  ))}
                </text>
                <text
                  x="140" y="112"
                  textAnchor="middle"
                  fill="white"
                  fillOpacity={0.15}
                  fontSize="6"
                  fontFamily="var(--font-mono), monospace"
                  letterSpacing="0.25em"
                  className="uppercase supreme-ledger-fade-in"
                  style={{ animationDelay: '0.4s' }}
                >
                  Ownership Recorded
                </text>
              </g>
            )}

            {/* Stage 3: SOLD stamp + flourish checkmark + hammer price */}
            {purchaseStage >= 3 && (
              <g>
                {/* Bottom ruled line — final ledger close */}
                <line
                  x1="70" y1="125" x2="210" y2="125"
                  stroke={`${moment.teamColors.primary}`}
                  strokeOpacity={0.3}
                  strokeWidth="0.5"
                  className="supreme-ledger-rule"
                  style={{ animationDelay: '0s' }}
                />

                {/* SOLD — large, team-color, with glow */}
                <text
                  x="140" y="152"
                  textAnchor="middle"
                  fontSize="18"
                  fontFamily="var(--font-oswald), sans-serif"
                  fontWeight="700"
                  letterSpacing="0.3em"
                  className="uppercase supreme-ledger-sold"
                >
                  <tspan fill={moment.teamColors.primary}>SOLD</tspan>
                </text>

                {/* Flourish checkmark — SVG path draws itself */}
                <path
                  d="M118,148 L130,158 L162,136"
                  fill="none"
                  stroke={moment.teamColors.primary}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={0.5}
                  className="supreme-ledger-flourish"
                />

                {/* Hammer price */}
                <text
                  x="140" y="168"
                  textAnchor="middle"
                  fill="white"
                  fillOpacity={0.2}
                  fontSize="6"
                  fontFamily="var(--font-mono), monospace"
                  letterSpacing="0.25em"
                  className="uppercase supreme-ledger-fade-in"
                  style={{ animationDelay: '0.3s' }}
                >
                  {`Hammer Price · $${selectedTier.price}`}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* ============================================================= */}
      {/* CRITICAL VIGNETTE — red-tinted edge glow */}
      {/* ============================================================= */}
      {dropPhase === 'CRITICAL' && (
        <div
          className="fixed inset-0 z-40 pointer-events-none supreme-critical-vignette"
          style={{
            boxShadow: 'inset 0 0 80px rgba(239,68,68,0.15), inset 0 0 200px rgba(239,68,68,0.06)',
          }}
        />
      )}

      {/* ============================================================= */}
      {/* SALEROOM SPOTLIGHT — gallery lights narrow to a single spot    */}
      {/* on the lot as the gavel approaches. Edges darken, center cone  */}
      {/* tightens. The saleroom holds its breath.                       */}
      {/* ============================================================= */}
      {dropPhase === 'CRITICAL' && spotlightIntensity > 0 && viewPhase !== 'purchasing' && (
        <div
          className="fixed inset-0 z-[39] pointer-events-none supreme-spotlight-breathe"
          style={{
            // Radial gradient spotlight: cone shrinks from 70% → 35% as intensity rises
            // Edge darkness increases from 0.15 → 0.55 opacity
            background: `radial-gradient(ellipse ${70 - spotlightIntensity * 35}% ${55 - spotlightIntensity * 25}% at 50% 35%, transparent 0%, rgba(0,0,0,${(0.15 + spotlightIntensity * 0.4).toFixed(2)}) 100%)`,
            transition: 'background 1s ease',
          }}
        />
      )}

      {/* ============================================================= */}
      {/* AUCTION GAVEL — "GOING ONCE..." / "GOING TWICE..." final 10s */}
      {/* ============================================================= */}
      {gavelPhase > 0 && viewPhase !== 'purchasing' && (
        <div
          key={gavelKeyRef.current}
          className={`fixed inset-0 z-[42] pointer-events-none flex items-center justify-center ${
            gavelPhase === 1 ? 'supreme-fair-warning' : 'supreme-gavel-text'
          }`}
        >
          <span
            className={`uppercase select-none ${
              gavelPhase === 1 ? 'text-[22px] sm:text-[26px] tracking-[0.4em]' : 'text-[28px] sm:text-[34px] tracking-[0.3em]'
            }`}
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: gavelPhase === 1 ? 500 : 700,
              color: gavelPhase === 3 ? '#EF4444' : gavelPhase === 1 ? `${moment.teamColors.primary}` : 'rgba(255,255,255,0.35)',
              textShadow: gavelPhase === 3
                ? `0 0 30px rgba(239,68,68,0.4), 0 0 60px rgba(239,68,68,0.15)`
                : gavelPhase === 1
                  ? `0 0 40px ${moment.teamColors.primary}15`
                  : `0 0 30px ${moment.teamColors.primary}20`,
            }}
          >
            {gavelPhase === 1 ? 'FAIR WARNING' : gavelPhase === 2 ? 'GOING ONCE...' : 'GOING TWICE...'}
          </span>
        </div>
      )}

      {/* ============================================================= */}
      {/* URGENCY BAR — full-width time depletion line */}
      {/* ============================================================= */}
      {!isEnded && (
        <div className="absolute top-0 left-0 right-0 z-30 h-[2px] bg-white/[0.04]">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              dropPhase === 'CRITICAL' ? 'supreme-urgency-bar-critical' : ''
            }`}
            style={{
              width: `${100 - timeProgressPct}%`,
              backgroundColor:
                dropPhase === 'CRITICAL'
                  ? '#EF4444'
                  : dropPhase === 'CLOSING'
                    ? '#F59E0B'
                    : '#00E5A0',
              boxShadow:
                dropPhase === 'CRITICAL'
                  ? '0 0 8px #EF4444, 0 0 20px #EF444460'
                  : dropPhase === 'CLOSING'
                    ? '0 0 6px #F59E0B80'
                    : 'none',
            }}
          />
        </div>
      )}

      {/* ============================================================= */}
      {/* HERO — fills top 52% */}
      {/* ============================================================= */}
      <div
        className="relative w-full flex-none overflow-hidden"
        style={{ height: '52dvh' }}
      >
        {/* Parallax wrapper — hero moves at 0.4x scroll speed, heartbeat pulse creates alive tension */}
        <div
          className={`absolute inset-0 will-change-transform ${
            !isEnded && !isPurchasing
              ? dropPhase === 'CRITICAL' ? 'supreme-heartbeat-fast' : 'supreme-heartbeat'
              : ''
          }`}
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        >
        {/* Action image — cinematic depth layer behind player */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${moment.actionImageUrl})`,
            backgroundPosition: 'center 30%',
            opacity: isEnded ? 0.02 : 0.05,
            filter: 'grayscale(0.5) contrast(1.2)',
          }}
        />

        {/* Gradient background — subtle Ken Burns zoom for cinematic depth */}
        {/* Color reveal: starts desaturated, transitions to full color over 2s */}
        <div
          className={`absolute inset-0 bg-cover bg-center ${
            !isEnded && !isPurchasing ? 'supreme-ken-burns' : ''
          }`}
          style={{
            backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
            backgroundSize: 'cover, cover',
            backgroundPosition: 'center top, center',
            filter: isEnded ? heroFilter :
              isPurchasing ? heroFilter :
              heroRevealed ? 'none' :
              'grayscale(1) brightness(0.8)',
            transition: 'filter 2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Team color ambient glow — dual-layer for richness, fades in with color reveal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 25%, ${moment.teamColors.primary}30 0%, transparent 65%), radial-gradient(ellipse 60% 30% at 50% 80%, ${moment.teamColors.primary}12 0%, transparent 50%)`,
            opacity: heroRevealed ? 1 : 0,
            transition: 'opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Dark overlay for text legibility — deeper gradient with team-color warmth */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, #0B0E14 0%, rgba(11,14,20,0.6) 35%, rgba(11,14,20,0.2) 60%, transparent 80%)`,
          }}
        />
        {/* Diagonal light sweep — premium card catching light */}
        {!isEnded && !isPurchasing && (
          <div
            className="absolute inset-0 pointer-events-none z-[5] overflow-hidden"
          >
            <div
              className="absolute inset-y-0 w-[60%] supreme-light-sweep"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}08 35%, rgba(255,255,255,0.06) 50%, ${moment.teamColors.primary}08 65%, transparent 100%)`,
              }}
            />
          </div>
        )}

        {/* Hero bottom edge shadow — creates depth at content transition */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, #0B0E14, transparent)',
          }}
        />
        </div>{/* End parallax wrapper */}

        {/* Edge light trace — luminous point traveling along hero bottom edge, tints with tier */}
        {!isEnded && !isPurchasing && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] z-[11] pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 w-12 h-[1px] supreme-edge-trace"
              style={{
                background: `radial-gradient(ellipse at center, ${tierAccentColor}90 0%, ${tierAccentColor}40 30%, transparent 70%)`,
                boxShadow: `0 0 8px ${tierAccentColor}50, 0 0 20px ${tierAccentColor}25`,
                transition: 'background 1s ease, box-shadow 1s ease',
              }}
            />
          </div>
        )}

        {/* Gallery spotlight cone — directed track light from above */}
        {!isPurchasing && (
          <GallerySpotlight teamColor={moment.teamColors.primary} phase={dropPhase} />
        )}

        {/* Ambient particles — luminous dust motes in museum spotlight */}
        {!isEnded && !isPurchasing && (
          <AmbientParticles teamColor={moment.teamColors.primary} />
        )}

        {/* Vitrine glass edge — thin inner border like a museum display case */}
        <div
          className="absolute inset-3 z-[12] pointer-events-none rounded-sm"
          style={{
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: isEnded ? 'none' : `inset 0 0 20px rgba(255,255,255,0.01), 0 0 1px rgba(255,255,255,0.06)`,
          }}
        >
          {/* Vitrine power-on — conic light traces the glass edge once on page load */}
          {!isEnded && (
            <div
              className="absolute inset-[-1px] rounded-sm overflow-hidden supreme-vitrine-power-on"
              style={{ opacity: 0, pointerEvents: 'none' }}
            >
              <div
                className="absolute inset-0 supreme-vitrine-conic-spin"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0%, transparent 85%, ${moment.teamColors.primary}40 92%, rgba(255,255,255,0.25) 96%, ${moment.teamColors.primary}40 98%, transparent 100%)`,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: '1px',
                }}
              />
            </div>
          )}
        </div>

        {/* Exhibition mount — dark passe-partout inner border, museum framing convention */}
        {/* At Sotheby's/Christie's, lot photographs are mounted with generous mat borders */}
        {/* Weighted bottom per museum convention (prevents optical sinking). Subtle bevel */}
        {/* shadow creates depth separation between vitrine glass and the image. */}
        <div
          className="absolute z-[10] pointer-events-none transition-opacity duration-1000"
          style={{
            inset: '10px 10px 14px 10px', // weighted bottom per museum framing convention
            border: `0.5px solid rgba(255,255,255,0.03)`,
            boxShadow: `inset 0 0.5px 0 rgba(255,255,255,0.04), inset 0 -0.5px 0 rgba(0,0,0,0.2), inset 0 0 8px rgba(0,0,0,0.15), 0 0 1px ${moment.teamColors.primary}08`,
            opacity: isEnded ? 0.4 : 0.7,
          }}
        >
          {/* Inner accent rule — team-color hairline at mat edge, like a gilt fillet */}
          <div
            className="absolute inset-[3px] pointer-events-none"
            style={{
              border: `0.5px solid ${moment.teamColors.primary}08`,
            }}
          />
        </div>

        {/* Evening Sale catalogue header — institutional authority */}
        {/* Every Christie's/Sotheby's catalogue page has a formal header: */}
        {/* house name, sale title, date, location. Subliminal institutional gravitas. */}
        <div
          className="absolute top-5 left-1/2 -translate-x-1/2 z-[12] pointer-events-none flex flex-col items-center gap-0.5 supreme-lot-enter"
          style={{ opacity: isEnded ? 0.06 : 0.1 }}
        >
          <span
            className="text-[6px] font-bold uppercase tracking-[0.5em] text-white/40"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            TST
          </span>
          <span
            className="text-[7px] uppercase tracking-[0.35em] text-white/25 font-mono"
          >
            Evening Sale
          </span>
          <span
            className="text-[6px] uppercase tracking-[0.25em] text-white/15 font-mono"
          >
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()} · NEW YORK
          </span>
        </div>

        {/* Auction catalog lot number + PSA condition grade — top-right */}
        <div
          className="absolute top-4 right-4 z-[12] pointer-events-none supreme-lot-enter flex flex-col items-end gap-1.5"
          style={{ opacity: isEnded ? 0.12 : 0.2 }}
        >
          <span
            className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40"
          >
            LOT {((moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000)}
          </span>
          {/* PSA-style condition grade — every authenticated collectible has a grade */}
          <div
            className="flex items-center gap-1.5 rounded-sm px-1.5 py-0.5"
            style={{
              border: '0.5px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
            }}
          >
            <span
              className="text-[6px] font-mono uppercase tracking-[0.3em] text-white/25"
            >
              GEM MINT
            </span>
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: `${moment.teamColors.primary}50`,
                textShadow: `0 0 6px ${moment.teamColors.primary}15`,
              }}
            >
              10
            </span>
          </div>
        </div>

        {/* Bidder paddle number — top-left, your registered auction identity */}
        {/* Raises on purchase like raising your paddle at auction */}
        {!isEnded && (
          <div
            key={paddleKeyRef.current}
            className={`absolute top-4 left-4 z-[12] pointer-events-none supreme-lot-enter flex items-center gap-1.5${paddleRaised ? ' supreme-paddle-raise' : ''}`}
            style={{ opacity: paddleRaised ? undefined : 0.2 }}
          >
            {/* Paddle icon — minimal rectangle with handle */}
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" className="text-white/40">
              <rect x="1" y="0.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="0.8" />
              <line x1="5" y1="8.5" x2="5" y2="13" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
              PADDLE {((moment.id.charCodeAt(1) * 23 + moment.id.charCodeAt(0) * 7) % 900 + 100)}
            </span>
          </div>
        )}

        {/* Holographic authentication sticker — PSA/Beckett grading hologram */}
        {!isEnded && !isPurchasing && (
          <HolographicSticker teamColor={moment.teamColors.primary} />
        )}

        {/* Phone bidders — Sotheby's staff relaying bids from remote buyers */}
        {!isEnded && !isPurchasing && (
          <PhoneBidders teamColor={moment.teamColors.primary} />
        )}

        {/* Lot provenance wall label — museum gallery plaque on left edge */}
        {/* Every gallery piece has a small label beside it: title, medium, date, provenance */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 z-[11] pointer-events-none supreme-provenance-label"
          style={{
            writingMode: 'vertical-lr',
            transform: 'translateY(-50%) rotate(180deg)',
          }}
        >
          <div className="flex items-center gap-3" style={{ opacity: isEnded ? 0.06 : 0.1 }}>
            <span className="text-[6px] font-mono uppercase tracking-[0.35em] text-white/30">
              {moment.team}
            </span>
            <span className="text-[5px] text-white/10">·</span>
            <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/20">
              {moment.playType}
            </span>
            <span className="text-[5px] text-white/10">·</span>
            <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/15">
              {new Date().getFullYear()}
            </span>
            <span className="text-[5px] text-white/10">·</span>
            <span
              className="text-[6px] font-mono uppercase tracking-[0.25em]"
              style={{ color: `${moment.teamColors.primary}20` }}
            >
              Digital
            </span>
          </div>
        </div>

        {/* SOLD watermark — auction house finality on ended drops */}
        {isEnded && (
          <div className="absolute inset-0 z-[9] pointer-events-none flex items-center justify-center overflow-hidden supreme-sold-stamp">
            <span
              className="text-[120px] sm:text-[160px] uppercase tracking-[0.15em] select-none"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.03)',
                transform: 'rotate(-15deg) translateY(-10%)',
                textShadow: `0 0 60px ${moment.teamColors.primary}06`,
              }}
            >
              SOLD
            </span>
          </div>
        )}

        {/* Player name + stat line — bottom-left */}
        <div className="absolute bottom-6 left-5 right-5 z-10 supreme-hero-enter">
          {/* Play type + matchup — grounded context */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {moment.playType}
            </p>
            <span className="text-white/10">·</span>
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/25">
              {moment.team} vs {moment.opponent}
            </p>
          </div>
          <h1
            className={`text-[52px] sm:text-[64px] uppercase leading-[0.88] ${
              !isEnded && !isPurchasing ? 'supreme-name-shimmer' : 'text-white'
            }`}
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              textShadow: `0 2px 30px rgba(0,0,0,0.7), 0 0 40px ${moment.teamColors.primary}18, 0 1px 0 rgba(255,255,255,0.04)`,
              ...(!isEnded && !isPurchasing ? {
                backgroundImage: `linear-gradient(120deg, #F0F2F5 0%, #F0F2F5 38%, ${moment.teamColors.primary} 44%, #FFFFFF 50%, #F0F2F5 56%, #F0F2F5 100%)`,
              } : {}),
            }}
          >
            {moment.player}
          </h1>
          {/* Stat line — key emotional context */}
          <p
            className="mt-2 text-base text-white/60 tracking-wide"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
          >
            {moment.statLine}
          </p>
          {/* Thin team-color accent under stat line */}
          <div
            className="mt-3 h-[1px] w-12"
            style={{ backgroundColor: `${moment.teamColors.primary}40` }}
          />

          {/* Lot estimate whisper — above-fold price anchor in institutional register */}
          {/* At Christie's/Sotheby's, the estimate appears alongside the lot image.   */}
          {/* On mobile (no sidebar), we place it below the stat line where the eye     */}
          {/* naturally lands after reading the player name. The $5 starting bid is     */}
          {/* the most important conversion signal on the page — 67-82% of visitors    */}
          {/* bounce without scrolling, so the price MUST be above the fold.            */}
          {!isEnded && !isPurchasing && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[8px] font-mono uppercase tracking-[0.35em]"
                style={{ color: 'rgba(255,255,255,0.12)' }}
              >
                Est.
              </span>
              <span
                className="text-[10px] font-mono tabular-nums"
                style={{ color: `${moment.teamColors.primary}30` }}
              >
                ${selectedTier.price}–${Math.round(selectedTier.price * 3.2)}
              </span>
              <span
                className="text-[7px] font-mono uppercase tracking-[0.2em]"
                style={{ color: 'rgba(255,255,255,0.08)' }}
              >
                ·
              </span>
              <button
                className="text-[7px] font-mono uppercase tracking-[0.2em] transition-colors duration-300 hover:opacity-60"
                style={{ color: `${moment.teamColors.primary}25` }}
                onClick={(e) => {
                  e.preventDefault();
                  // Scroll to CTA button
                  ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                Place Bid ↓
              </button>
            </div>
          )}
          {/* ENDED: lot result in hero — auction house convention */}
          {isEnded && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[8px] font-mono uppercase tracking-[0.35em]"
                style={{ color: 'rgba(255,255,255,0.08)' }}
              >
                Sold
              </span>
              <span
                className="text-[9px] font-mono tabular-nums"
                style={{ color: 'rgba(255,255,255,0.12)' }}
              >
                ${selectedTier.price}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* LOT STATUS TRAIL — institutional authentication breadcrumb     */}
      {/* At Christie's/Sotheby's, each lot's catalogue page shows its   */}
      {/* provenance and verification journey: authenticated, catalogued,*/}
      {/* on view, live bidding. This trail validates the lot's          */}
      {/* institutional authority between the hero image and description.*/}
      {/* ============================================================= */}
      <div className="flex items-center justify-center gap-2 px-5 py-3 supreme-context-enter">
        {(() => {
          const steps = isEnded
            ? [
                { label: 'Authenticated', done: true },
                { label: 'Catalogued', done: true },
                { label: 'Sold', done: true },
                { label: 'Archived', done: true },
              ]
            : [
                { label: 'Authenticated', done: true },
                { label: 'Catalogued', done: true },
                { label: 'On View', done: true },
                { label: dropPhase === 'CRITICAL' ? 'Final Call' : 'Live Bidding', done: false },
              ];
          return steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              {i > 0 && (
                <div
                  className="h-[0.5px] w-3"
                  style={{ backgroundColor: step.done ? `${moment.teamColors.primary}15` : 'rgba(255,255,255,0.04)' }}
                />
              )}
              <div className="flex items-center gap-1">
                <div
                  className={`h-[3px] w-[3px] rounded-full ${!step.done && !isEnded ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: step.done
                      ? `${moment.teamColors.primary}${isEnded ? '20' : '30'}`
                      : dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : 'rgba(0,229,160,0.35)',
                    boxShadow: !step.done && !isEnded
                      ? dropPhase === 'CRITICAL'
                        ? '0 0 4px rgba(239,68,68,0.3)'
                        : '0 0 4px rgba(0,229,160,0.2)'
                      : 'none',
                  }}
                />
                <span
                  className="text-[7px] font-mono uppercase tracking-[0.2em]"
                  style={{
                    color: step.done
                      ? `rgba(255,255,255,${isEnded ? '0.08' : '0.12'})`
                      : dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(0,229,160,0.25)',
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* ============================================================= */}
      {/* CATALOGUE FOLIO — page number, sale title, date margins        */}
      {/* Every Christie's/Sotheby's catalogue page has folio markers:   */}
      {/* page number on one side, sale title and date on the other.     */}
      {/* These ambient institutional details make the page feel like a  */}
      {/* physical auction catalogue. Pure visual polish.                */}
      {/* ============================================================= */}
      <div className="flex items-center justify-between px-5 py-2 supreme-context-enter">
        <span
          className="text-[6px] font-mono uppercase tracking-[0.4em]"
          style={{ color: 'rgba(255,255,255,0.06)' }}
        >
          Evening Sale &middot; {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <span
          className="text-[6px] font-mono tabular-nums tracking-[0.3em]"
          style={{ color: 'rgba(255,255,255,0.06)' }}
        >
          p. {((moment.id.charCodeAt(0) * 7 + moment.id.charCodeAt(1) * 3) % 90 + 10)}
        </span>
      </div>

      {/* ============================================================= */}
      {/* CONTEXT — one emotional sentence, given room to breathe */}
      {/* ============================================================= */}
      <div className="px-5 pt-1 pb-2 supreme-context-enter relative">
        {/* Catalogue spine shadow — vertical gradient simulating the center   */}
        {/* crease of an open auction catalogue. Physical catalogues always    */}
        {/* have a subtle shadow running down the spine where pages meet the   */}
        {/* binding. This barely-visible gradient adds tactile print-quality   */}
        {/* depth to the content area. Positioned at left edge (gutter side). */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[2px] pointer-events-none z-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 80%, transparent 100%)`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 left-[2px] w-[6px] pointer-events-none z-0"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.08), transparent)`,
          }}
        />
        <div
          className="h-[1px] w-8 mb-3"
          style={{ backgroundColor: `${moment.teamColors.primary}50` }}
        />
        <p className="text-sm leading-relaxed text-white/40 tracking-wide">
          {moment.context}
        </p>
        {/* historicalNote first sentence — emotional gravity */}
        <p className="mt-2 text-[12px] leading-relaxed text-white/20 italic">
          {moment.historicalNote.split('.')[0]}.
        </p>

        {/* Catalogue description — formal Christie's/Sotheby's lot entry */}
        <p className="mt-4 text-[8px] uppercase tracking-[0.25em] leading-[1.8] text-white/12 font-mono">
          Lot {((moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000)}.{' '}
          Digital Collectible. {moment.player}, <span className="italic normal-case tracking-normal">{moment.playType}</span>,{' '}
          {new Date().getFullYear()}. Edition of {moment.editionSize.toLocaleString()}. Minted on Flow.
        </p>

        {/* Catalogue watermark crest — institutional monogram behind text */}
        {/* Every Christie's/Sotheby's printed catalogue has a faint house    */}
        {/* crest watermarked behind the lot description. This SVG monogram   */}
        {/* at 3% opacity creates the same subliminal institutional gravitas  */}
        {/* — visible only to those who look closely, like real watermarks.   */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none z-0" style={{ opacity: 0.03 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {/* Outer ring — institutional border */}
            <circle cx="40" cy="40" r="38" stroke={moment.teamColors.primary} strokeWidth="0.5" />
            <circle cx="40" cy="40" r="35" stroke={moment.teamColors.primary} strokeWidth="0.3" />
            {/* TST monogram — interlocking letters */}
            <text
              x="40" y="46"
              textAnchor="middle"
              fill={moment.teamColors.primary}
              fontSize="18"
              fontFamily="var(--font-oswald), sans-serif"
              fontWeight="700"
              letterSpacing="0.15em"
            >
              TST
            </text>
            {/* Year — bottom of seal */}
            <text
              x="40" y="58"
              textAnchor="middle"
              fill={moment.teamColors.primary}
              fontSize="6"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.3em"
            >
              {new Date().getFullYear()}
            </text>
            {/* Top arc text — "EVENING SALE" */}
            <path id="supreme-seal-arc-top" d="M 12 40 A 28 28 0 0 1 68 40" fill="none" />
            <text fontSize="4" fill={moment.teamColors.primary} letterSpacing="0.4em" fontFamily="var(--font-mono), monospace">
              <textPath href="#supreme-seal-arc-top" startOffset="50%" textAnchor="middle">
                EVENING SALE
              </textPath>
            </text>
            {/* Bottom arc text — "NEW YORK" */}
            <path id="supreme-seal-arc-bottom" d="M 12 40 A 28 28 0 0 0 68 40" fill="none" />
            <text fontSize="4" fill={moment.teamColors.primary} letterSpacing="0.3em" fontFamily="var(--font-mono), monospace">
              <textPath href="#supreme-seal-arc-bottom" startOffset="50%" textAnchor="middle">
                NEW YORK
              </textPath>
            </text>
          </svg>
        </div>

        {/* Specialist's Note — auction house expert assessment, institutional voice */}
        <div className="mt-3 pl-2.5 relative z-[1]" style={{ borderLeft: `0.5px solid ${moment.teamColors.primary}15` }}>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] block mb-1"
            style={{ color: `${moment.teamColors.primary}30`, fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Specialist&apos;s Note
          </span>
          <p className="text-[10px] leading-[1.6] text-white/18 italic" style={{ fontFamily: 'Georgia, serif' }}>
            {moment.id === 'bam'
              ? 'A defining performance in the modern playoff era. The lot represents an inflection point in Adebayo\u2019s career trajectory \u2014 we recommend this to serious collectors.'
              : moment.id === 'jokic'
              ? 'Generational court vision captured at its apex. Joki\u0107 operates in a class of his own \u2014 this lot carries museum-grade significance.'
              : 'The rarest combination of scoring volume and efficiency we\u2019ve catalogued this season. Gilgeous-Alexander\u2019s trajectory suggests lasting historical value.'}
          </p>
        </div>

        {/* Catalogue Essay — the emotional heart of every Christie's/Sotheby's  */}
        {/* lot page. For important lots, the house commissions a 2-3 paragraph  */}
        {/* essay placing the work in historical context with evocative prose.    */}
        {/* This is the #1 emotion driver in auction catalogues — the reader     */}
        {/* should feel the weight of what they're about to acquire.             */}
        {/* Gilt divider — Catalogue Essay */}
        <div className="mt-5 pt-4 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}08 15%, rgba(255,255,255,0.06) 40%, ${moment.teamColors.primary}10 50%, rgba(255,255,255,0.06) 60%, ${moment.teamColors.primary}08 85%, transparent 100%)`,
            }}
          />
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] block mb-3"
            style={{ color: `${moment.teamColors.primary}30`, fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Catalogue Essay
          </span>
          <div className="space-y-3" style={{ fontFamily: 'Georgia, serif' }}>
            {moment.id === 'bam' ? (
              <>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.14] italic">
                  There are performances that alter the trajectory of a franchise, and then there are those that alter
                  the way we understand a player entirely. Bam Adebayo&apos;s thirty-point eruption at TD Garden belongs
                  to the latter category. On a court where dynasties have been built and broken, Adebayo did not merely
                  score — he imposed his will with the kind of force that leaves a silence in its wake, the silence
                  of seventeen thousand witnesses realizing they are watching something new.
                </p>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.12] italic">
                  The dunk that punctuated the evening — a one-handed detonation over two outstretched defenders —
                  has already entered the visual canon of the 2025 playoffs. But it is the cumulative weight of the
                  performance that gives this lot its significance: twelve of seventeen from the field, a franchise
                  record surpassing Dwyane Wade, and the unmistakable announcement that Miami&apos;s future has arrived
                  in the present tense. We note that lots of comparable historical inflection — LeBron&apos;s 2016 Block,
                  Kawhi&apos;s 2019 Bounce — have appreciated considerably in secondary markets.
                </p>
                <p className="text-[8px] leading-[1.6] text-white/[0.09] mt-1" style={{ fontStyle: 'normal' }}>
                  — Catherine Ainsworth, Head of Evening Sales
                </p>
              </>
            ) : moment.id === 'jokic' ? (
              <>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.14] italic">
                  The triple-double, in its modern inflation, has become almost commonplace. And then there is what
                  Nikola Joki&#x107; does with it — not a statistical accumulation but a complete orchestration of basketball,
                  conducted with the unhurried precision of someone who sees the game several seconds ahead of
                  everyone else on the floor. His fourth consecutive playoff triple-double places him alongside
                  Wilt Chamberlain and Oscar Robertson, names that belong not to any era but to the sport itself.
                </p>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.12] italic">
                  What distinguishes this particular performance is the no-look pass at the forty-seven-second mark —
                  a play that, upon review, reveals Joki&#x107; had processed three defensive rotations before the ball
                  left his hand. Thirty-five points, fifteen rebounds, twelve assists: the numbers are extraordinary,
                  but they describe only the surface of something deeper. The present lot captures a player at the
                  absolute zenith of a generational gift. Collectors of the canonical should take note.
                </p>
                <p className="text-[8px] leading-[1.6] text-white/[0.09] mt-1" style={{ fontStyle: 'normal' }}>
                  — Alexei Kovalev, Senior Curator of Athletic Works
                </p>
              </>
            ) : (
              <>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.14] italic">
                  Forty-two points is a number. What Shai Gilgeous-Alexander did to the Phoenix Suns is something
                  else entirely — a dismantling so methodical and so beautiful that it redefined what Oklahoma City
                  basketball can look like in the modern era. His career playoff high arrived not with the chaos
                  of a young player discovering his ceiling, but with the controlled devastation of one who has
                  always known exactly where the ceiling is and simply chose this evening to go through it.
                </p>
                <p className="text-[9.5px] leading-[1.75] text-white/[0.12] italic">
                  The franchise record he set carries a particular resonance in Oklahoma City, a market that has
                  watched transcendent talent depart before. Gilgeous-Alexander&apos;s forty-two-point masterwork
                  is not merely a personal milestone — it is a declaration of permanence, of a superstar choosing
                  to build his legacy here. The six rebounds and five assists remind us this was not a volume
                  shooter&apos;s performance but a complete one. We present this lot with the highest confidence
                  in its lasting historical significance.
                </p>
                <p className="text-[8px] leading-[1.6] text-white/[0.09] mt-1" style={{ fontStyle: 'normal' }}>
                  — James Thornton, Department Head, Contemporary Sport
                </p>
              </>
            )}
          </div>
        </div>

        {/* Condition Report — formal auction-house lot condition assessment */}
        {/* Every Christie's/Sotheby's lot has a condition report available on    */}
        {/* request. For digital assets, this covers minting verification,        */}
        {/* blockchain provenance, and media integrity — the digital equivalent   */}
        {/* of "no visible restoration, original canvas, provenance unbroken."    */}
        {/* Gilt divider — metallic gradient like gilt book-page edges */}
        <div className="mt-4 pt-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}08 15%, rgba(255,255,255,0.06) 40%, ${moment.teamColors.primary}10 50%, rgba(255,255,255,0.06) 60%, ${moment.teamColors.primary}08 85%, transparent 100%)`,
            }}
          />
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] block mb-2"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Condition Report
          </span>
          <div className="space-y-1.5">
            {[
              { label: 'Mint Status', value: 'Verified · Block #' + ((moment.id.charCodeAt(0) * 1337 + 8420000) % 99000000 + 10000000).toLocaleString(), status: 'pass' as const },
              { label: 'Media Integrity', value: 'SHA-256 verified · No degradation', status: 'pass' as const },
              { label: 'Chain of Title', value: 'Primary sale · No prior owners', status: 'pass' as const },
              { label: 'Smart Contract', value: 'Flow · Audited · Immutable', status: 'pass' as const },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/10">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-mono text-white/15">
                    {item.value}
                  </span>
                  {/* Verification checkmark — green for pass */}
                  <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4.5" stroke="rgba(0,229,160,0.25)" strokeWidth="0.5" />
                    <path d="M3 5.2 L4.5 6.5 L7 3.5" stroke="rgba(0,229,160,0.4)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          {/* Grade assessment */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/10">
              Overall
            </span>
            <span
              className="text-[8px] font-bold uppercase tracking-[0.3em]"
              style={{ color: `${moment.teamColors.primary}30`, fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Gem Mint
            </span>
            <span className="text-[7px] font-mono text-white/8">·</span>
            <span className="text-[7px] font-mono text-white/12">
              No condition issues
            </span>
          </div>
        </div>

        {/* ★ Highlight of the Evening Sale — Christie's star lot designation */}
        {/* At Christie's and Sotheby's, the most important lots in an auction  */}
        {/* receive a star (★) designation in the catalogue. This is the single */}
        {/* strongest institutional signal of value — it means the house's own  */}
        {/* specialists have singled out this lot as exceptional. The ★ appears */}
        {/* in the printed catalogue and on digital lot pages.                  */}
        {/* Gilt divider — premium metallic gradient at star lot designation */}
        <div className="mt-5 pt-4 flex flex-col items-center gap-1 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}06 20%, rgba(255,255,255,0.05) 35%, ${moment.teamColors.primary}12 50%, rgba(255,255,255,0.05) 65%, ${moment.teamColors.primary}06 80%, transparent 100%)`,
            }}
          />
          <span
            className="text-[10px] tracking-[0.1em]"
            style={{ color: `${moment.teamColors.primary}35` }}
          >
            ★
          </span>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.4em]"
            style={{ color: `${moment.teamColors.primary}25`, fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Highlight of the Evening Sale
          </span>
          <span className="text-[7px] font-mono text-white/10 mt-0.5">
            Selected by the Department of Digital Art
          </span>
        </div>

        {/* Exhibition History — standard auction catalogue section */}
        {/* Every Christie's/Sotheby's lot page lists where the work has been */}
        {/* exhibited. For an NBA moment, exhibitions are broadcast appearances */}
        {/* and digital showcases — places where this play was "on view."      */}
        {/* Gilt divider — Exhibition History */}
        <div className="mt-4 pt-3 relative">
          <div
            className="absolute top-0 left-0 right-0 h-[0.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}08 15%, rgba(255,255,255,0.06) 40%, ${moment.teamColors.primary}10 50%, rgba(255,255,255,0.06) 60%, ${moment.teamColors.primary}08 85%, transparent 100%)`,
            }}
          />
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] block mb-2"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Exhibition History
          </span>
          <div className="space-y-1">
            {(moment.id === 'bam'
              ? [
                  { venue: 'ESPN SportsCenter', detail: 'Top 10 Plays, No. 1', year: '2025' },
                  { venue: 'NBA App', detail: 'Playoff Highlights, Featured', year: '2025' },
                  { venue: 'TNT Inside the NBA', detail: 'Shaqtin\u2019 a Fool (Honorable Mention)', year: '2025' },
                ]
              : moment.id === 'jokic'
              ? [
                  { venue: 'ESPN SportsCenter', detail: 'Top 10 Plays, No. 3', year: '2025' },
                  { venue: 'NBA League Pass', detail: 'Moment of the Night', year: '2025' },
                  { venue: 'The Athletic', detail: 'Play of the Week, Western Conf.', year: '2025' },
                ]
              : [
                  { venue: 'ESPN SportsCenter', detail: 'Top 10 Plays, No. 2', year: '2025' },
                  { venue: 'NBA App', detail: 'Rising Stars Showcase', year: '2025' },
                  { venue: 'Bleacher Report', detail: 'Highlight Reel, Featured', year: '2025' },
                ]
            ).map((ex) => (
              <div key={ex.venue} className="flex items-baseline justify-between">
                <span className="text-[7px] font-mono text-white/15 italic">
                  {ex.venue}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[7px] font-mono text-white/10">
                    {ex.detail}
                  </span>
                  <span className="text-[6px] font-mono text-white/8">
                    {ex.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Literature — standard auction catalogue section */}
        {/* Christie's/Sotheby's list published references to the work.  */}
        {/* For NBA moments: articles, features, statistical databases.  */}
        <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] block mb-2"
            style={{ color: 'rgba(255,255,255,0.12)', fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Literature
          </span>
          <div className="space-y-1">
            {(moment.id === 'bam'
              ? [
                  'Basketball Reference, Game Log, verified',
                  'NBA.com, Official Box Score, archived',
                  'Miami Herald, \u201CAdebayo\u2019s defining moment,\u201D p. A1',
                ]
              : moment.id === 'jokic'
              ? [
                  'Basketball Reference, Game Log, verified',
                  'NBA.com, Official Box Score, archived',
                  'Denver Post, \u201CJoki\u0107 does it again,\u201D Sports p. 1',
                ]
              : [
                  'Basketball Reference, Game Log, verified',
                  'NBA.com, Official Box Score, archived',
                  'The Oklahoman, \u201CSGA\u2019s takeover,\u201D Sports p. 1',
                ]
            ).map((ref, i) => (
              <p key={i} className="text-[7px] font-mono text-white/12 italic leading-[1.5]">
                {ref}
              </p>
            ))}
          </div>
        </div>

        {/* Bottom folio — catalogue page number repeated at footer (institutional convention) */}
        <div className="flex items-center justify-between mt-5 pt-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
          <span
            className="text-[6px] font-mono uppercase tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.05)' }}
          >
            TST Collection &middot; Lot {((moment.id.charCodeAt(0) * 37 + moment.id.charCodeAt(1) * 13) % 9000 + 1000)}
          </span>
          <span
            className="text-[6px] font-mono tabular-nums tracking-[0.3em]"
            style={{ color: 'rgba(255,255,255,0.05)' }}
          >
            {((moment.id.charCodeAt(0) * 7 + moment.id.charCodeAt(1) * 3) % 90 + 10)}
          </span>
        </div>
      </div>

      {/* ============================================================= */}
      {/* RESERVE STATUS — auction house reserve price indicator */}
      {/* ============================================================= */}
      {(() => {
        return (
          <div
            className="flex items-center justify-center gap-2 px-5 py-2 supreme-info-enter"
            style={{
              transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), filter 0.5s ease-out',
              transform: reserveCelebration ? 'scale(1.18)' : 'scale(1)',
            }}
          >
            {/* Status dot — red→green transition + celebration glow burst */}
            <div
              className="h-[5px] w-[5px] rounded-full transition-all duration-700 ease-out"
              style={{
                backgroundColor: reserveMet ? '#00E5A0' : '#EF4444',
                boxShadow: reserveCelebration
                  ? '0 0 12px rgba(0,229,160,0.9), 0 0 24px rgba(0,229,160,0.5), 0 0 40px rgba(0,229,160,0.2)'
                  : reserveMet
                    ? '0 0 6px rgba(0,229,160,0.5), 0 0 12px rgba(0,229,160,0.2)'
                    : '0 0 4px rgba(239,68,68,0.3)',
                transform: reserveCelebration ? 'scale(2.5)' : 'scale(1)',
                transition: 'all 0.7s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
            <span
              className="text-[8px] font-mono uppercase tracking-[0.35em] transition-colors duration-700"
              style={{
                color: reserveCelebration
                  ? 'rgba(0,229,160,0.8)'
                  : reserveMet
                    ? 'rgba(0,229,160,0.4)'
                    : 'rgba(239,68,68,0.35)',
                textShadow: reserveCelebration
                  ? '0 0 8px rgba(0,229,160,0.4)'
                  : 'none',
              }}
            >
              {reserveMet ? 'Reserve met' : 'Reserve not met'}
            </span>
            {/* Progress toward reserve — thin line only when not yet met */}
            {!reserveMet && !isEnded && (
              <>
                <span className="text-[7px] font-mono text-white/8">·</span>
                <span className="text-[8px] font-mono tabular-nums text-white/12">
                  {claimed}/{reserveThreshold}
                </span>
              </>
            )}
          </div>
        );
      })()}

      {/* ============================================================= */}
      {/* VIEWING ROOM — Christie's-style "X people viewing this lot" */}
      {/* At Christie's online, each lot shows how many people are    */}
      {/* currently viewing. Supreme's social proof: quiet, factual,  */}
      {/* institutional. Not panic-inducing — informational.          */}
      {/* ============================================================= */}
      {!isEnded && (
        <div className="flex items-center justify-center gap-2 px-5 py-1 supreme-info-enter">
          <div
            className="h-[3px] w-[3px] rounded-full"
            style={{
              backgroundColor: moment.teamColors.primary,
              opacity: 0.3,
              boxShadow: `0 0 4px ${moment.teamColors.primary}30`,
            }}
          />
          <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/10">
            Viewing Room
          </span>
          <span className="text-[7px] font-mono text-white/8">·</span>
          <span className="text-[8px] font-mono tabular-nums text-white/15">
            {watching}
          </span>
          <span className="text-[7px] font-mono uppercase tracking-[0.15em] text-white/8">
            registered bidders
          </span>
        </div>
      )}

      {/* ============================================================= */}
      {/* SALEROOM BID WHISPER — auctioneer acknowledges live bids      */}
      {/* At Christie's/Sotheby's, the auctioneer announces each bid:  */}
      {/* "Bid received from the telephone" or "New bid from the       */}
      {/* floor." This whisper briefly appears when a simulated claim   */}
      {/* fires, creating social proof in Supreme's institutional      */}
      {/* voice — quiet, formal, not panic-inducing.                   */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && lastClaimer && bidLog.length > 0 && (
        <div
          className="flex items-center justify-center px-5 py-1 supreme-bid-whisper-enter"
          style={{ animation: 'supreme-bid-whisper 2.8s ease-out forwards' }}
        >
          <p
            className="text-[9px] text-center tracking-[0.08em]"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: `${moment.teamColors.primary}18`,
            }}
          >
            Bid received — <span className="not-italic font-mono text-[8px] tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.12)' }}>
              {lastClaimer}
            </span>
            <span className="text-white/6 mx-1">·</span>
            <span className="not-italic font-mono text-[8px] tabular-nums" style={{ color: `${moment.teamColors.primary}15` }}>
              Edition #{bidLog[0].edition.toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {/* ============================================================= */}
      {/* LOT EXTENDED — anti-snipe banner from Sotheby's/Christie's    */}
      {/* online auctions. When a bid arrives in the final seconds, the */}
      {/* lot timer extends. The "Lot Extended" notice tells every      */}
      {/* bidder: competition is real, someone just bid, act now or     */}
      {/* lose. This is the most powerful conversion signal in live     */}
      {/* auctions — the extension proves others are actively bidding.  */}
      {/* ============================================================= */}
      {lotExtended && dropPhase === 'CRITICAL' && !isPurchasing && (
        <div
          key={lotExtendedKeyRef.current}
          className="flex items-center justify-center gap-2 px-5 py-2"
          style={{ animation: 'supreme-lot-extended 3.5s ease-out forwards' }}
        >
          {/* Extension indicator line — team-color hairline extends from center */}
          <div
            className="h-[0.5px] w-6"
            style={{
              backgroundColor: `${moment.teamColors.primary}20`,
              animation: 'supreme-clerk-line-extend 0.4s ease-out forwards',
            }}
          />
          <div className="flex flex-col items-center gap-0.5">
            <span
              className="text-[7px] font-bold uppercase tracking-[0.4em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: 'rgba(239,68,68,0.35)',
              }}
            >
              Lot Extended
            </span>
            <p
              className="text-[9px] tracking-[0.08em] text-center"
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.12)',
              }}
            >
              New bid received — timer reset
            </p>
          </div>
          <div
            className="h-[0.5px] w-6"
            style={{
              backgroundColor: `${moment.teamColors.primary}20`,
              animation: 'supreme-clerk-line-extend 0.4s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* ============================================================= */}
      {/* GALLERY CLOSING NOTICE — institutional announcement when       */}
      {/* auction enters final phases. At Christie's/Sotheby's, the     */}
      {/* auctioneer announces "We are approaching the close of this    */}
      {/* lot." This text appears in Supreme's subliminal register —    */}
      {/* Georgia serif italic, barely visible, but psychologically     */}
      {/* priming the bidder that time is running out.                  */}
      {/* ============================================================= */}
      {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && !isPurchasing && (
        <div className="flex items-center justify-center px-5 py-1.5">
          <p
            className="text-[9px] text-center tracking-[0.1em]"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: dropPhase === 'CRITICAL'
                ? 'rgba(239,68,68,0.18)'
                : 'rgba(255,255,255,0.1)',
            }}
          >
            {dropPhase === 'CRITICAL'
              ? 'The auctioneer is about to bring down the gavel.'
              : 'We are approaching the close of this lot.'}
          </p>
        </div>
      )}

      {/* ============================================================= */}
      {/* INFO STRIP — timer + edition counter */}
      {/* ============================================================= */}
      <div className="flex items-center justify-between px-5 py-3.5 supreme-info-enter border-t border-white/[0.04]">
        {/* Timer */}
        <div className="flex flex-col">
          {/* Phase label — subtle state indicator */}
          <span
            className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-1 transition-colors duration-500"
            style={{
              color: isEnded ? '#6B7A9960' :
                dropPhase === 'CRITICAL' ? '#EF444490' :
                dropPhase === 'CLOSING' ? '#F59E0B80' :
                '#00E5A050',
            }}
          >
            {isEnded ? 'Drop closed' :
             dropPhase === 'CRITICAL' ? 'Final seconds' :
             dropPhase === 'CLOSING' ? 'Closing soon' :
             'Live now'}
          </span>
          <div className="flex items-baseline gap-2">
            {/* Auctioneer's gavel — taps on each second in CRITICAL phase */}
            {dropPhase === 'CRITICAL' && !isEnded && (
              <svg
                key={countdown.totalSeconds}
                className="self-center"
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{
                  opacity: 0.3,
                  transformOrigin: '10px 3px',
                  animation: timerTick ? 'supreme-gavel-tap 180ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                }}
              >
                {/* Gavel head */}
                <rect x="5" y="1" width="7" height="3.5" rx="0.8" fill="#EF4444" opacity="0.7" />
                {/* Handle */}
                <line x1="8.5" y1="4.5" x2="3" y2="12" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
              </svg>
            )}
            <div
              className={`font-mono font-bold tabular-nums transition-all duration-500 ${
                isEnded ? 'text-lg' :
                dropPhase === 'CRITICAL' ? 'text-[32px]' :
                'text-[28px]'
              }`}
              style={{
                color: timerColor(dropPhase),
                ...(dropPhase === 'CRITICAL' && !isEnded ? {
                  transform: timerTick ? 'scale(1.03)' : 'scale(1)',
                  textShadow: timerTick
                    ? '0 0 8px rgba(239,68,68,0.6), 0 0 20px rgba(239,68,68,0.3)'
                    : '0 0 4px rgba(239,68,68,0.2)',
                  transition: timerTick
                    ? 'transform 60ms cubic-bezier(0.16, 1, 0.3, 1), text-shadow 60ms ease-out, font-size 0.5s, color 0.5s'
                    : 'transform 120ms ease-out, text-shadow 200ms ease-out, font-size 0.5s, color 0.5s',
                } : {}),
              }}
            >
              {isEnded ? (
                <span className="font-semibold">Ended</span>
              ) : (
                timerDisplay
              )}
            </div>
            {!isEnded && (
              <span className="text-[10px] uppercase tracking-wider text-white/20">
                left
              </span>
            )}
          </div>
        </div>

        {/* Edition counter — live */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span
              className="text-[9px] uppercase tracking-wider font-semibold transition-colors duration-300"
              style={{
                color: remaining < 500
                  ? '#EF444490'
                  : remaining < 1500
                    ? '#F59E0B90'
                    : '#00E5A060',
              }}
            >
              {remaining < 500 ? 'Almost gone' : remaining < 1500 ? 'Going fast' : 'Open'}
            </span>
            <p
              className="text-sm font-mono tabular-nums text-white/70 transition-all duration-300"
              style={{
                textShadow: claimFlash ? '0 0 8px rgba(0,229,160,0.5)' : 'none',
              }}
            >
              <span className="text-white font-semibold">
                {claimed.toLocaleString()}
              </span>
              <span className="text-white/20"> / </span>
              <span>{moment.editionSize.toLocaleString()}</span>
            </p>
          </div>
          {/* Thin progress bar */}
          <div className="mt-1.5 w-32 h-[2px] rounded-full bg-white/[0.06] overflow-hidden ml-auto">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                backgroundColor:
                  remaining < 500 ? '#EF4444' : remaining < 1500 ? '#F59E0B' : '#00E5A0',
              }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* RARITY TIERS — minimal horizontal selector with ⊻ interests   */}
      {/* ============================================================= */}
      <div className="px-5 mt-3 supreme-info-enter">
        {/* Interested Parties header — Sotheby's convention */}
        {!isEnded && (
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span
              className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/10"
            >
              ⊻ Interested Parties
            </span>
          </div>
        )}
        <div className="relative flex items-center justify-center gap-1">
          {moment.rarityTiers.map((tier, idx) => {
            const isSelected = idx === selectedTierIdx;
            const isLow = tier.remaining <= 5;
            const interest = tierInterests[idx] ?? 0;
            const isInterestFlash = interestFlashIdx === idx;
            return (
              <button
                key={tier.tier}
                onClick={() => { setSelectedTierIdx(idx); HAPTIC.tierSelect(); }}
                className="relative px-3 py-2 text-center transition-all duration-300 active:scale-[0.97]"
                style={{
                  flex: '1 1 0%',
                  backgroundColor: isSelected ? `${tierAccentColor}06` : 'transparent',
                  border: isSelected ? `0.5px solid ${tierAccentColor}18` : '0.5px solid transparent',
                  borderRadius: '2px',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected
                    ? `inset 0 1px 0 ${tierAccentColor}08, 0 0 12px ${tierAccentColor}06`
                    : 'none',
                }}
              >
                {/* Radial press glow on selected tier */}
                {isSelected && (
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${tierAccentColor}08, transparent 70%)`,
                      borderRadius: '2px',
                    }}
                  />
                )}
                {/* Lot number — catalogue convention */}
                {isSelected && !isEnded && (
                  <span
                    className="block text-[5px] font-mono uppercase tracking-[0.5em] mb-0.5"
                    style={{
                      color: `${tierAccentColor}25`,
                      animation: 'supreme-lot-number-in 0.3s ease-out forwards',
                    }}
                  >
                    Lot {idx + 1}
                  </span>
                )}
                <span
                  className={`block text-[10px] uppercase tracking-[0.15em] font-semibold transition-colors duration-200 ${
                    isSelected ? 'text-white/80' : 'text-white/25'
                  }`}
                >
                  {tier.tier}
                </span>
                <span
                  className={`block text-sm font-bold tabular-nums transition-colors duration-200 ${
                    isSelected ? 'text-white' : 'text-white/30'
                  }`}
                >
                  ${tier.price}
                </span>
                {tier.tier !== 'Open' && (
                  <span
                    className={`block text-[9px] tabular-nums transition-colors duration-200 ${
                      isLow ? 'text-[#EF4444]/60' : isSelected ? 'text-white/25' : 'text-white/15'
                    }`}
                  >
                    {tier.remaining} left
                  </span>
                )}
                {/* Interested parties count — Sotheby's ⊻ per-tier interest */}
                {!isEnded && (
                  <span
                    className="block text-[7px] font-mono tabular-nums mt-0.5 tracking-wide transition-all duration-300"
                    style={{
                      color: isSelected
                        ? `${tierAccentColor}${isInterestFlash ? '50' : '30'}`
                        : `rgba(255,255,255,${isInterestFlash ? '0.18' : '0.08'})`,
                      transform: isInterestFlash ? 'scale(1.08)' : 'scale(1)',
                      textShadow: isInterestFlash && isSelected
                        ? `0 0 6px ${tierAccentColor}20`
                        : 'none',
                    }}
                  >
                    {interest} {interest === 1 ? 'interest' : 'interests'}
                  </span>
                )}
                {/* Pre-sale estimate — Christie's "Est. $X–$Y" beneath price */}
                {isSelected && (
                  <span className="block text-[7px] font-mono text-white/12 mt-0.5 tracking-wide">
                    Est. ${Math.round(tier.price * 1.8)}–${Math.round(tier.price * 3.2)}
                  </span>
                )}
              </button>
            );
          })}
          {/* Sliding underline — single indicator that glides between tiers */}
          {(() => {
            const tierCount = moment.rarityTiers.length;
            const cellWidth = 100 / tierCount;
            const padding = 12; // matches px-3 on buttons
            return (
              <div
                className="absolute bottom-0 h-[1px] pointer-events-none"
                style={{
                  left: `calc(${selectedTierIdx * cellWidth}% + ${padding}px)`,
                  width: `calc(${cellWidth}% - ${padding * 2}px)`,
                  transition: 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), background-color 0.3s ease',
                  backgroundColor: tierAccentColor,
                  opacity: 0.6,
                  boxShadow: `0 0 4px ${tierAccentColor}30`,
                }}
              />
            );
          })()}
        </div>
      </div>

      {/* ============================================================= */}
      {/* CATALOGUE PAGE TURN — tier detail content slides on switch     */}
      {/* At Christie's, flipping through the catalogue is physical:     */}
      {/* pages slide past as you move between lots. Tier switching      */}
      {/* animates content horizontally, matching the tier hierarchy.    */}
      {/* ============================================================= */}
      <div
        key={`tier-detail-${tierTurnKey}`}
        style={{
          animation: tierTurnKey > 0
            ? `supreme-page-turn-${tierDirection} 0.4s cubic-bezier(0.16, 1, 0.3, 1) both`
            : undefined,
        }}
      >

      {/* ============================================================= */}
      {/* PREMIER LOT DESIGNATION — institutional prestige for premium   */}
      {/* tiers. At Sotheby's/Christie's, premier lots are marked with  */}
      {/* ◆ and receive enhanced catalogue treatment: dedicated imagery, */}
      {/* specialist essays, featured placement. This designation makes  */}
      {/* premium tiers feel institutionally elevated — converting the   */}
      {/* tier selector from a price menu into a prestige ladder.        */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && selectedTier.tier !== 'Open' && (
        <div
          key={`premier-${selectedTier.tier}`}
          className="flex flex-col items-center gap-1 px-5 mt-2 supreme-premier-lot-enter"
        >
          {/* Designation hairlines + diamond marker */}
          <div className="flex items-center gap-2">
            <div
              className="h-[0.5px] w-8 transition-all duration-500"
              style={{ backgroundColor: `${tierAccentColor}25` }}
            />
            <span
              className="text-[7px] transition-colors duration-500"
              style={{ color: `${tierAccentColor}40` }}
            >
              ◆
            </span>
            <div
              className="h-[0.5px] w-8 transition-all duration-500"
              style={{ backgroundColor: `${tierAccentColor}25` }}
            />
          </div>
          {/* Designation text — escalates with tier */}
          <span
            className="text-[7px] font-bold uppercase tracking-[0.45em] transition-colors duration-500"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: `${tierAccentColor}35`,
            }}
          >
            {selectedTier.tier === 'Ultimate' ? 'Signature Lot' :
             selectedTier.tier === 'Legendary' ? 'Premier Lot' :
             'Estate Lot'}
          </span>
          {/* Specialist recommendation — institutional upsell voice */}
          <p
            className="text-[8px] text-center tracking-[0.06em] max-w-[220px] transition-colors duration-500"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.1)',
            }}
          >
            {selectedTier.tier === 'Ultimate'
              ? 'The specialist strongly recommends this lot to distinguished collectors.'
              : selectedTier.tier === 'Legendary'
                ? 'Recommended by our specialist for serious collectors.'
                : 'Selected for the curated evening programme.'}
          </p>
        </div>
      )}

      {/* ============================================================= */}
      {/* AUCTION ESTIMATE — projected secondary value, collector prestige */}
      {/* Christie's/Sotheby's always show "Estimate: $X–$Y" on the lot. */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="px-5 mt-2 supreme-info-enter">
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/15"
            >
              Est. Value
            </span>
            <span
              className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/10"
            >
              ·
            </span>
            <span
              className="text-[10px] font-mono tabular-nums text-white/25"
            >
              ${(selectedTier.price * 2.5).toFixed(0)}–${(selectedTier.price * 8).toFixed(0)}
            </span>
            <span
              className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/10"
            >
              ·
            </span>
            <span
              className="text-[8px] font-mono uppercase tracking-[0.2em]"
              style={{ color: `${moment.teamColors.primary}35` }}
            >
              Secondary
            </span>
          </div>
          {/* Value trend sparkline — implied secondary value rising with demand */}
          {/* At real auction houses, lot estimates get revised upward when interest is high */}
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <svg width="48" height="12" viewBox="0 0 48 12" fill="none" style={{ opacity: 0.15 }}>
              {/* Upward trend line — value increasing as claimed % grows */}
              <polyline
                points={(() => {
                  const pct = claimed / moment.editionSize;
                  // Generate 8 points showing upward value trend
                  const pts = Array.from({ length: 8 }, (_, i) => {
                    const x = (i / 7) * 48;
                    // Base upward curve with slight noise
                    const progress = i / 7;
                    const noise = (moment.id.charCodeAt(i % moment.id.length) % 5) * 0.3;
                    const y = 11 - (progress * pct * 8 + noise);
                    return `${x.toFixed(1)},${Math.max(1, Math.min(11, y)).toFixed(1)}`;
                  });
                  return pts.join(' ');
                })()}
                stroke={tierAccentColor}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Current value dot — pulsing at the trend tip */}
              <circle
                cx="48"
                cy={Math.max(1, 11 - (claimed / moment.editionSize) * 8).toString()}
                r="1.5"
                fill={tierAccentColor}
                style={{ opacity: 0.7 }}
              />
            </svg>
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/10">
              {claimed / moment.editionSize > 0.5 ? '↑ Rising' : 'Tracking'}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* COMPARABLE LOTS — recent market evidence anchoring the price   */}
      {/* At Christie's/Sotheby's, every lot page shows "Comparable     */}
      {/* Lots Sold" with recent hammer prices for similar items. These  */}
      {/* prices are always HIGHER than the current estimate, creating   */}
      {/* favorable anchoring: "The market says this is worth more than  */}
      {/* you're paying." Three comparables, all above current price,    */}
      {/* makes the asking price feel like an opportunity.               */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="px-5 mt-3 supreme-info-enter">
          <div className="flex flex-col items-center gap-1.5">
            {/* Header — thin institutional label */}
            <div className="flex items-center gap-2">
              <div className="h-[0.5px] w-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[7px] font-mono uppercase tracking-[0.35em] text-white/10">
                Comparable Lots Sold
              </span>
              <div className="h-[0.5px] w-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            {/* Three comparable prices — all anchored above current tier */}
            <div className="flex items-center justify-center gap-3">
              {[2.1, 3.4, 5.8].map((multiplier, i) => {
                const compPrice = Math.round(selectedTier.price * multiplier);
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span
                      className="text-[9px] font-mono tabular-nums"
                      style={{ color: `${tierAccentColor}25` }}
                    >
                      ${compPrice.toLocaleString()}
                    </span>
                    <span className="text-[6px] font-mono uppercase tracking-[0.2em] text-white/08">
                      {['Mar 2025', 'Jan 2025', 'Nov 2024'][i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* INTERNATIONAL CURRENCY EQUIVALENTS — global auction house      */}
      {/* standard. At Christie's/Sotheby's, every lot estimate shows    */}
      {/* approximate prices in GBP, EUR, and HKD for international      */}
      {/* bidders. The multi-currency display signals "this is a global   */}
      {/* auction house with international demand" — prestige through     */}
      {/* institutional convention, not marketing language. Subtle mono   */}
      {/* typography at minimal opacity, centered below comparables.      */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="flex items-center justify-center px-5 mt-1.5 supreme-info-enter">
          <span className="text-[6.5px] font-mono tabular-nums tracking-[0.15em] text-white/[0.07]">
            ≈ £{Math.round(selectedTier.price * 0.79)} / €{Math.round(selectedTier.price * 0.92)} / HK${Math.round(selectedTier.price * 7.8)} / ¥{Math.round(selectedTier.price * 149)}
          </span>
        </div>
      )}

      {/* Spacer pushes button to bottom */}
      <div className="flex-1" />

      {/* ============================================================= */}
      {/* AUCTIONEER'S BID CALL — "The bid stands at $5. Do I hear $25?" */}

      {/* At Christie's/Sotheby's the auctioneer verbally frames the     */}
      {/* current bid and invites the next increment. This creates both  */}
      {/* urgency (the sale is active) and subtle upsell (there's a     */}
      {/* higher tier). Minimal text, big psychological framing.         */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="flex items-center justify-center px-5 mb-3">
          <p
            className="text-[10px] tracking-[0.15em] text-center"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.14)',
            }}
          >
            {(() => {
              const nextTier = moment.rarityTiers[selectedTierIdx + 1];
              if (nextTier) {
                return (
                  <>
                    The bid stands at{' '}
                    <span
                      className="font-mono not-italic tabular-nums"
                      style={{ color: `${tierAccentColor}40`, letterSpacing: '0.05em' }}
                    >
                      ${selectedTier.price}
                    </span>
                    .{' '}Do I hear{' '}
                    <span
                      className="font-mono not-italic tabular-nums"
                      style={{ color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em' }}
                    >
                      ${nextTier.price}
                    </span>
                    ?
                  </>
                );
              }
              // Highest tier selected — no upsell, just authority
              return (
                <>
                  The bid stands at{' '}
                  <span
                    className="font-mono not-italic tabular-nums"
                    style={{ color: `${tierAccentColor}40`, letterSpacing: '0.05em' }}
                  >
                    ${selectedTier.price}
                  </span>
                  . Final offer.
                </>
              );
            })()}
          </p>
        </div>
      )}

      {/* ============================================================= */}
      {/* SALEROOM TEMPERATURE — the auctioneer's one-word read of the   */}
      {/* room. At Christie's/Sotheby's, everyone in the saleroom senses */}
      {/* the energy: quiet → active → competitive → heated. This single */}
      {/* word distills that atmosphere at the decision point.             */}
      {/* ============================================================= */}
      {saleroomTemperature && !isPurchasing && (
        <div className="flex items-center justify-center gap-2 px-5 mb-2">
          <div
            className="h-[0.5px] w-4 transition-all duration-700"
            style={{ backgroundColor: `${saleroomTemperature.color}${Math.round(saleroomTemperature.opacity * 255).toString(16).padStart(2, '0')}` }}
          />
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full transition-all duration-700"
              style={{
                backgroundColor: saleroomTemperature.color,
                opacity: saleroomTemperature.opacity * 1.5,
                boxShadow: saleroomTemperature.word === 'Heated'
                  ? `0 0 6px ${saleroomTemperature.color}40`
                  : 'none',
                animation: saleroomTemperature.word === 'Heated'
                  ? 'supreme-temp-pulse 1.5s ease-in-out infinite'
                  : saleroomTemperature.word === 'Competitive'
                    ? 'supreme-temp-pulse 2.5s ease-in-out infinite'
                    : 'none',
              }}
            />
            <span
              className="text-[8px] font-bold uppercase tracking-[0.35em] transition-all duration-700"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: saleroomTemperature.color,
                opacity: saleroomTemperature.opacity,
              }}
            >
              {saleroomTemperature.word}
            </span>
          </div>
          <div
            className="h-[0.5px] w-4 transition-all duration-700"
            style={{ backgroundColor: `${saleroomTemperature.color}${Math.round(saleroomTemperature.opacity * 255).toString(16).padStart(2, '0')}` }}
          />
        </div>
      )}

      {/* ============================================================= */}
      {/* CONDITIONS OF SALE — institutional trust strip at decision point  */}
      {/* At Christie's/Sotheby's, the "Conditions of Sale" are printed    */}
      {/* in the catalogue and govern every transaction. Key terms that     */}
      {/* real auction buyers look for: buyer's premium (typically 20-26%), */}
      {/* settlement terms, and authenticity guarantee. Showing "No Buyer's */}
      {/* Premium" is a major conversion signal for anyone who knows        */}
      {/* auction houses — it means the hammer price IS the final price.    */}
      {/* Distinctly Supreme: Arena would never mention terms (it's live    */}
      {/* commerce chaos), Broadcast would narrate it as editorial copy.    */}
      {/* Supreme puts it in institutional catalogue fine print.            */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="flex items-center justify-center gap-3 px-5 mb-2 supreme-info-enter">
          {[
            { label: 'No Buyer\u2019s Premium', accent: true },
            { label: 'Immediate Settlement', accent: false },
            { label: 'Certificate Included', accent: false },
          ].map((term, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span
                  className="text-[5px]"
                  style={{ color: `${tierAccentColor}15` }}
                >
                  ·
                </span>
              )}
              <span
                className="text-[7px] uppercase tracking-[0.2em]"
                style={{
                  fontFamily: 'Georgia, serif',
                  color: term.accent
                    ? `${tierAccentColor}30`
                    : 'rgba(255,255,255,0.08)',
                }}
              >
                {term.label}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* ============================================================= */}
      {/* SPECIALIST CONDITION REPORT — tappable drawer resolving doubt   */}
      {/* At Christie's/Sotheby's, every lot has a named specialist who   */}
      {/* provides a formal condition assessment. Serious bidders request  */}
      {/* this report before committing — it's the strongest intent       */}
      {/* signal before a bid. The named specialist creates authority     */}
      {/* bias (Cialdini), the clinical language signals institutional    */}
      {/* rigor, and the tap-to-reveal effort heuristic makes the        */}
      {/* information feel more trustworthy than freely displayed text.   */}
      {/* Distinctly Supreme: Arena would never have condition reports    */}
      {/* (live commerce), Broadcast would narrate it editorially.       */}
      {/* Supreme puts it in institutional catalogue fine print.          */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="px-5 mt-2 mb-1 supreme-info-enter">
          <div className="flex flex-col items-center">
            {/* Tappable trigger — magnifying glass + label */}
            <button
              onClick={() => { setConditionReportOpen(prev => !prev); HAPTIC.tierSelect(); }}
              className="flex items-center gap-1.5 py-1 transition-opacity duration-300"
              style={{ opacity: conditionReportOpen ? 0.22 : 0.10 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.22'; }}
              onMouseLeave={(e) => { if (!conditionReportOpen) (e.currentTarget as HTMLElement).style.opacity = '0.10'; }}
            >
              {/* Magnifying glass icon */}
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <circle cx="7" cy="7" r="4.5" />
                <line x1="10.2" y1="10.2" x2="14" y2="14" />
              </svg>
              <span
                className="text-[6.5px] uppercase tracking-[0.3em]"
                style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.30)' }}
              >
                {conditionReportOpen ? 'Close Report' : 'View Condition Report'}
              </span>
            </button>

            {/* Expandable drawer */}
            <div
              className="overflow-hidden transition-all duration-500 ease-out"
              style={{
                maxHeight: conditionReportOpen ? '280px' : '0px',
                opacity: conditionReportOpen ? 1 : 0,
              }}
            >
              <div
                className="mt-1.5 px-3 py-2.5 rounded-sm"
                style={{
                  border: `0.5px solid ${tierAccentColor}10`,
                  backgroundColor: `${tierAccentColor}03`,
                }}
              >
                {/* Specialist attribution */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center text-[6px] font-bold"
                    style={{
                      backgroundColor: `${tierAccentColor}12`,
                      color: `${tierAccentColor}60`,
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {moment.team === 'MIA' ? 'RP' : moment.team === 'DEN' ? 'AK' : 'JT'}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className="text-[7px] tracking-[0.1em]"
                      style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.25)' }}
                    >
                      {moment.team === 'MIA' ? 'Rachel Park' : moment.team === 'DEN' ? 'Alexei Kovalev' : 'James Thornton'}
                    </span>
                    <span className="text-[5.5px] font-mono uppercase tracking-[0.2em] text-white/10">
                      Senior Specialist, Digital Collectibles
                    </span>
                  </div>
                </div>

                {/* Hairline separator */}
                <div className="h-[0.5px] w-full mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />

                {/* Structured condition fields */}
                <div className="flex flex-col gap-1.5">
                  {/* Overall grade */}
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/10">
                      Overall Condition
                    </span>
                    <span
                      className="text-[7px] font-bold uppercase tracking-[0.15em]"
                      style={{ fontFamily: 'Georgia, serif', color: `${tierAccentColor}40` }}
                    >
                      Mint
                    </span>
                  </div>

                  {/* Provenance */}
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/10">
                      Provenance
                    </span>
                    <span
                      className="text-[6.5px] tracking-[0.08em]"
                      style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.18)' }}
                    >
                      Direct from NBA Top Shot
                    </span>
                  </div>

                  {/* Authentication */}
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/10">
                      Authentication
                    </span>
                    <span
                      className="text-[6.5px] tracking-[0.08em]"
                      style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.18)' }}
                    >
                      On-chain verified · Flow blockchain
                    </span>
                  </div>

                  {/* Media integrity */}
                  <div className="flex items-center justify-between">
                    <span className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/10">
                      Media Integrity
                    </span>
                    <span
                      className="text-[6.5px] tracking-[0.08em]"
                      style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.18)' }}
                    >
                      HD source · Official NBA footage
                    </span>
                  </div>

                  {/* Specialist note */}
                  <div className="h-[0.5px] w-full mt-0.5 mb-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
                  <p
                    className="text-[6.5px] leading-[1.6] tracking-[0.04em]"
                    style={{
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      color: 'rgba(255,255,255,0.13)',
                    }}
                  >
                    {moment.team === 'MIA'
                      ? 'A defining postseason performance from Adebayo. The play captured — a one-handed dunk over two defenders at TD Garden — represents the apex of this series. Primary market offering; no prior ownership history. Recommended without reservation.'
                      : moment.team === 'DEN'
                        ? 'Jokić\u2019s fourth consecutive playoff triple-double places this moment in a statistical lineage with Chamberlain and Robertson. The no-look assist captured in the final minute is among the most technically remarkable plays of the postseason. Recommended without reservation.'
                        : 'Gilgeous-Alexander\u2019s franchise-record performance cements his status as a generational talent. The play captured — a step-back three over two defenders — sealed a decisive playoff victory. Primary market offering with exceptional long-term significance. Recommended without reservation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>{/* END catalogue page turn wrapper */}

      {/* ============================================================= */}
      {/* REGISTER INTEREST — pre-commitment action at the decision point */}
      {/* At Christie's/Sotheby's online, "Register Interest" is the      */}
      {/* strongest pre-bid signal: a single tap that transforms you from  */}
      {/* browser → committed bidder. The foot-in-the-door effect means    */}
      {/* registered bidders are dramatically more likely to bid. Once     */}
      {/* registered, CTA upgrades from "OWN THIS MOMENT" to "PLACE BID"  */}
      {/* — more committed auction language. The tap also updates the      */}
      {/* interested parties count for social proof.                       */}
      {/* Distinctly Supreme: Arena would never have quiet registration    */}
      {/* (it's live chaos), Broadcast would frame it as a viewer poll.    */}
      {/* Supreme has the institutional registration protocol.             */}
      {/* ============================================================= */}
      {!isEnded && !isPurchasing && (
        <div className="flex items-center justify-center px-5 mb-2 supreme-info-enter">
          <button
            onClick={() => {
              if (!interestRegistered) {
                setInterestRegistered(true);
                HAPTIC.tierSelect();
              }
            }}
            className="flex items-center gap-2 py-1.5 transition-all duration-500"
            style={{ opacity: interestRegistered ? 1 : 0.6 }}
          >
            {interestRegistered ? (
              <>
                {/* Checkmark */}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4.5" stroke={tierAccentColor} strokeWidth="0.5" opacity="0.4" />
                  <path
                    d="M3 5.2 L4.5 6.7 L7.2 3.8"
                    stroke={tierAccentColor}
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </svg>
                <span
                  className="text-[8px] uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: `${tierAccentColor}50`,
                  }}
                >
                  Interest Registered
                </span>
                <span className="text-[7px] font-mono text-white/10">·</span>
                <span
                  className="text-[7px] font-mono uppercase tracking-[0.2em]"
                  style={{ color: `${tierAccentColor}25` }}
                >
                  Paddle {paddleNumber}
                </span>
              </>
            ) : (
              <>
                {/* Pen nib icon — registrar's pen */}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{ opacity: 0.25 }}>
                  <path
                    d="M7.5 1.5L3.5 5.5L2.5 6.5L2 7L3 6.5L7.5 1.5Z"
                    stroke="white"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M2 7L2.3 5.8" stroke="white" strokeWidth="0.4" />
                </svg>
                <span
                  className="text-[8px] uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: 'rgba(255,255,255,0.14)',
                  }}
                >
                  Register Interest in This Lot
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* LOT CLERK NARRATION — institutional voice during purchase        */}
      {/* At Sotheby's the lot clerk audibly announces each stage of the   */}
      {/* sale process. This floating text creates the same whispered      */}
      {/* ceremony: "The lot is reserved..." → "Recording the sale..."    */}
      {/* Georgia italic at 10px, theatrical timing, team-color accent.    */}
      {/* ============================================================= */}
      {isPurchasing && (
        <div className="flex items-center justify-center px-5 mb-3 supreme-info-enter">
          <p
            className="text-[10px] tracking-[0.15em] text-center transition-all duration-500"
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              color: purchaseStage === 3
                ? `${tierAccentColor}50`
                : 'rgba(255,255,255,0.18)',
              textShadow: purchaseStage === 3
                ? `0 0 8px ${tierAccentColor}20`
                : 'none',
            }}
          >
            {purchaseStage === 0 && (
              <>
                The lot is reserved for Paddle{' '}
                <span
                  className="font-mono not-italic tabular-nums"
                  style={{ color: `${tierAccentColor}40`, letterSpacing: '0.05em' }}
                >
                  {paddleNumber}
                </span>
                ...
              </>
            )}
            {purchaseStage === 1 && (
              <>The clerk opens the ledger...</>
            )}
            {purchaseStage === 2 && (
              <>Recording the sale &mdash; {selectedTier.tier} edition</>
            )}
            {purchaseStage === 3 && (
              <>
                Sold.
              </>
            )}
          </p>
        </div>
      )}

      {/* ============================================================= */}
      {/* LAST LIGHT — spotlight dim funnels attention to CTA in CRITICAL */}
      {/* ============================================================= */}
      {dropPhase === 'CRITICAL' && !isPurchasing && (
        <div
          className="fixed inset-0 z-[38] pointer-events-none transition-opacity duration-1000"
          style={{
            background: 'radial-gradient(ellipse 90% 30% at 50% 85%, transparent 0%, rgba(11,14,20,0.35) 60%, rgba(11,14,20,0.5) 100%)',
          }}
        />
      )}

      {/* ============================================================= */}
      {/* CTA-ADJACENT TIMER — urgency right at point of decision */}
      {/* ============================================================= */}
      {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && !isPurchasing && (
        <div className="flex items-center justify-center gap-1.5 mb-2 px-5">
          <div
            className="h-1 w-1 rounded-full animate-pulse"
            style={{ backgroundColor: dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B' }}
          />
          <span
            className="text-[11px] font-mono font-semibold tabular-nums tracking-wider"
            style={{ color: dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B' }}
          >
            {timerDisplay}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/20">left</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* THE BUTTON — with ambient glow */}
      {/* ============================================================= */}
      <div className={`px-5 mb-3 relative supreme-info-enter${tierBreathe ? ' supreme-tier-breathe' : ''}`}>
        {/* Sonar invite — single ring pulse drawing eye to CTA on load */}
        {sonarFired && !isEnded && (
          <div
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-[56px] rounded-2xl pointer-events-none z-20 supreme-sonar-invite"
            style={{
              border: `1px solid ${tierAccentColor}`,
              boxShadow: `0 0 12px ${tierAccentColor}30`,
            }}
            onAnimationEnd={() => setSonarFired(false)}
          />
        )}
        {/* Ambient glow behind button */}
        {!isEnded && (
          <div
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-16 rounded-2xl blur-xl pointer-events-none animate-glow-breathe"
            style={{
              backgroundColor: glowColor,
              opacity: glowOpacity,
            }}
          />
        )}
        <button
          ref={(el) => {
            // Merge refs: ctaRef for IntersectionObserver, magnetic.ref for cursor tracking
            (ctaRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
            (magnetic.ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          }}
          onMouseMove={!isEnded && !isPurchasing ? magnetic.onMouseMove : undefined}
          onMouseLeave={!isEnded && !isPurchasing ? magnetic.onMouseLeave : undefined}
          onClick={() => { HAPTIC.tap(); purchase(); }}
          disabled={isPurchasing || isEnded}
          className={`
            relative w-full h-[56px] rounded-2xl text-[15px] font-bold uppercase tracking-wider
            supreme-btn disabled:cursor-not-allowed overflow-hidden
            ${buttonAnimation}
          `}
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
            boxShadow: isPurchasing
              ? `0 4px 40px ${glowColor}50, 0 0 0 1px ${glowColor}20`
              : gavelPhase === 3
                ? `0 4px 40px #EF444470, 0 0 60px #EF444430, 0 0 0 2px #EF4444`
                : gavelPhase === 2
                  ? `0 4px 32px #EF444450, 0 0 40px #EF444420, 0 0 0 1.5px #EF444490`
                  : gavelPhase === 1
                    ? `0 4px 28px ${glowColor}40, 0 0 30px ${glowColor}15, 0 0 0 1px ${glowColor}50`
                    : !isEnded
                      ? `0 4px 24px ${glowColor}30, 0 0 0 1px ${glowColor}10`
                      : undefined,
            transform: !isEnded && !isPurchasing
              ? `translate(${magnetic.offset.x}px, ${magnetic.offset.y}px)`
              : undefined,
            transition: 'box-shadow 0.5s ease, background-color 0.3s ease, transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)',
            willChange: 'transform',
          }}
        >
          {/* Cursor-reactive glass highlight — light spot follows mouse across button surface */}
          {!isEnded && !isPurchasing && (magnetic.offset.x !== 0 || magnetic.offset.y !== 0) && (
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(circle 60px at ${magnetic.lightPos.x}% ${magnetic.lightPos.y}%, rgba(255,255,255,0.12) 0%, transparent 70%)`,
                transition: 'opacity 0.2s ease',
              }}
            />
          )}
          {isPurchasing ? (
            <span className="inline-flex items-center gap-2.5">
              {purchaseStage < 3 ? (
                /* Deterministic progress ring — fills in stages */
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.15" />
                  <circle
                    cx="10" cy="10" r="8"
                    stroke="#0B0E14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - (purchaseStage === 0 ? 0.25 : purchaseStage === 1 ? 0.5 : 0.8))}`}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      transition: 'stroke-dashoffset 0.4s ease-out',
                    }}
                  />
                </svg>
              ) : (
                /* Animated checkmark — draws in on "Yours." */
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.25" />
                  <path
                    d="M6 10.5 L9 13.5 L14 7"
                    stroke="#0B0E14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="supreme-checkmark-draw"
                  />
                </svg>
              )}
              {buttonText}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {!isEnded && gavelPhase > 0 ? (
                /* Raised gavel icon — hammer poised to fall */
                <svg className={`h-4 w-4 ${gavelPhase === 3 ? 'supreme-gavel-icon-strike' : 'supreme-gavel-icon-raised'}`} viewBox="0 0 20 20" fill="currentColor">
                  <rect x="9" y="10" width="2.5" height="8" rx="0.8" transform="rotate(-15 10 14)" opacity="0.85" />
                  <rect x="4" y="3" width="12" height="5" rx="1.5" transform="rotate(-15 10 5.5)" />
                </svg>
              ) : !isEnded ? (
                /* Lock icon — instant secure checkout signal */
                <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                </svg>
              ) : null}
              {buttonText}
            </span>
          )}
        </button>

        {/* Gavel strike — radial shockwave when "Yours." confirms */}
        {gavelStrike && (
          <div
            key={gavelStrikeKeyRef.current}
            className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center"
          >
            {/* Expanding ring — auction hammer impact */}
            <div
              className="absolute w-[56px] h-[56px] rounded-full supreme-gavel-strike-ring"
              style={{
                borderStyle: 'solid',
                borderColor: tierAccentColor,
                boxShadow: `0 0 20px ${tierAccentColor}30`,
              }}
            />
            {/* Brief flash — impact moment */}
            <div
              className="absolute inset-0 rounded-2xl supreme-gavel-strike-flash"
              style={{
                backgroundColor: tierAccentColor,
              }}
            />
          </div>
        )}

        {/* Claim pulse ring — expanding ring on each claimed edition */}
        {!isEnded && !isPurchasing && claimFlash && (
          <div
            className="absolute inset-x-5 top-1/2 -translate-y-1/2 h-[56px] rounded-2xl pointer-events-none z-20 supreme-claim-pulse-ring"
            style={{
              border: `1px solid ${glowColor}`,
            }}
          />
        )}

        {/* Stored payment + edition preview — conversion confidence */}
        {!isEnded && !isPurchasing && (
          <div className="mt-2.5 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-white/15">
              {/* Card icon — payment confidence */}
              <svg className="h-3 w-3 text-white/20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
                <line x1="1" y1="6.5" x2="15" y2="6.5" />
              </svg>
              Instant checkout · Visa ··4242
            </div>
            {/* Edition preview — makes purchase tangible */}
            <p className="text-[10px] tabular-nums text-white/12">
              You&apos;ll receive edition #{(claimed + 1).toLocaleString()}
            </p>
          </div>
        )}
        {/* Tier scarcity — minimal, just the number */}
        {!isEnded && !isPurchasing && selectedTier.tier !== 'Open' && (
          <p className="mt-1.5 text-center text-[10px] tabular-nums text-white/20">
            {selectedTier.remaining} of {selectedTier.size} remaining
          </p>
        )}
      </div>

      {/* ============================================================= */}
      {/* BIDDING LEDGER — auction house acquisition log                */}
      {/* At Christie's/Sotheby's live auctions, a scrolling log of    */}
      {/* bid increments is visible to the room. This is the digital   */}
      {/* equivalent: formal, timestamped, institutional — Supreme's   */}
      {/* quiet version of Arena's chaotic live feed.                   */}
      {/* ============================================================= */}
      <div className="px-5 pb-6 supreme-social-enter">
        {isEnded ? (
          <p className="text-[11px] text-white/15 tabular-nums text-center">
            {claimed.toLocaleString()} editions collected
          </p>
        ) : bidLog.length > 0 ? (
          <div className="flex flex-col items-center">
            {/* Ledger header */}
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="h-[1px] w-3"
                style={{ backgroundColor: `${moment.teamColors.primary}15` }}
              />
              <span
                className="text-[7px] font-bold uppercase tracking-[0.4em] text-white/10"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Bidding Ledger
              </span>
              <div
                className="h-[1px] w-3"
                style={{ backgroundColor: `${moment.teamColors.primary}15` }}
              />
            </div>
            {/* Entries — max 3 visible, newest on top */}
            <div className="w-full max-w-[260px] space-y-[2px] overflow-hidden" style={{ maxHeight: '52px' }}>
              {bidLog.slice(0, 3).map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-[9px] font-mono tabular-nums transition-all duration-300"
                  style={{
                    opacity: i === 0 ? 0.25 : i === 1 ? 0.15 : 0.08,
                    animation: i === 0 ? 'supreme-ledger-entry 0.4s ease-out' : undefined,
                  }}
                >
                  <span className="text-white/30">{entry.time}</span>
                  <span className="text-white/20 truncate mx-2">{entry.name}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[7px] uppercase tracking-wider text-white/10">claimed</span>
                    <span style={{ color: `${moment.teamColors.primary}40` }}>
                      #{entry.edition.toLocaleString()}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            {/* Watching count — institutional footnote */}
            <p className="mt-1.5 text-[9px] text-white/8 tabular-nums">
              {watching} registered bidders in viewing room
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-white/15 tabular-nums text-center">
            {watching} watching now
          </p>
        )}
      </div>

      {/* ============================================================= */}
      {/* GALLERY LOT NAVIGATION — museum-style lot browsing strip */}
      {/* ============================================================= */}
      <nav className="px-5 pb-8 pt-2">
        <div className="flex items-center justify-center gap-2">
          <span
            className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/15 mr-2"
          >
            Lot {MOMENTS.findIndex(m => m.id === momentId) + 1} of {MOMENTS.length}
          </span>
          {MOMENTS.map((m, i) => {
            const isCurrent = m.id === momentId;
            return (
              <a
                key={m.id}
                href={`/supreme/${m.id}`}
                className="group relative flex flex-col items-center gap-1.5"
                title={m.player}
              >
                {/* Dot indicator */}
                <div
                  className="h-[6px] w-[6px] rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isCurrent ? m.teamColors.primary : 'rgba(255,255,255,0.12)',
                    boxShadow: isCurrent ? `0 0 8px ${m.teamColors.primary}50` : 'none',
                    transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
                {/* Player initial — tiny label below dot */}
                <span
                  className="text-[7px] font-mono uppercase tracking-wider transition-colors duration-300"
                  style={{
                    color: isCurrent ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.10)',
                  }}
                >
                  {m.player.split(' ').pop()?.slice(0, 3)}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* ============================================================= */}
      {/* CATALOGUE COLOPHON — formal auction house footer/imprint      */}
      {/* Every Christie's/Sotheby's printed catalogue ends with a      */}
      {/* colophon: copyright, conditions of sale, catalogue credits.   */}
      {/* This institutional fine print completes the auction fiction —  */}
      {/* subliminal credibility that makes the purchase feel weighty   */}
      {/* and legitimate, like buying from a 280-year-old institution.  */}
      {/* ============================================================= */}
      <div className="px-8 pb-6 pt-1 flex flex-col items-center gap-2 supreme-context-enter">
        {/* Decorative rule — catalogue section break */}
        <div className="flex items-center gap-3 w-full max-w-[200px]">
          <div className="h-[0.5px] flex-1" style={{ backgroundColor: `${moment.teamColors.primary}08` }} />
          <span className="text-[5px] tracking-[0.4em] text-white/06" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
            ◆
          </span>
          <div className="h-[0.5px] flex-1" style={{ backgroundColor: `${moment.teamColors.primary}08` }} />
        </div>

        {/* Copyright + conditions — institutional legalese */}
        <p className="text-[6px] font-mono uppercase tracking-[0.25em] text-white/06 text-center leading-[2]">
          © {new Date().getFullYear()} TST Auctions, Inc. All rights reserved.
        </p>
        <p className="text-[6px] font-mono uppercase tracking-[0.15em] text-white/05 text-center leading-[1.8] max-w-[240px]">
          Conditions of sale and limited warranty apply. Buyer&apos;s premium waived for digital lots.
          Catalogue descriptions are statements of opinion only.
        </p>

        {/* Catalogue credits — printer's colophon */}
        <p
          className="text-[6px] tracking-[0.1em] text-white/04 text-center mt-1"
          style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
        >
          Catalogue designed and produced in New York
        </p>
      </div>

      {/* ============================================================= */}
      {/* CATALOGUE LOT NAVIGATION — adjacent lots in evening sale     */}
      {/* Every auction catalogue and online platform shows the lots   */}
      {/* before and after. This prevents dead-end bounces: if this    */}
      {/* lot doesn't resonate, the next one might. Cycle through the  */}
      {/* 3 moments as adjacent lots in the evening sale sequence.     */}
      {/* ============================================================= */}
      {(() => {
        const momentIds = MOMENTS.map(m => m.id);
        const currentIdx = momentIds.indexOf(moment.id);
        const prevIdx = (currentIdx - 1 + momentIds.length) % momentIds.length;
        const nextIdx = (currentIdx + 1) % momentIds.length;
        const prevMoment = MOMENTS[prevIdx];
        const nextMoment = MOMENTS[nextIdx];
        const lotNum = (id: string) => ((id.charCodeAt(0) * 37 + id.charCodeAt(1) * 13) % 9000 + 1000);
        return (
          <div className="px-5 pb-4 pt-2 supreme-context-enter">
            <div className="flex items-center justify-between">
              {/* Previous lot */}
              <a
                href={`/supreme/${prevMoment.id}`}
                className="group flex items-center gap-2 transition-opacity duration-300 hover:opacity-60"
              >
                <svg className="h-3 w-3 text-white/10 group-hover:text-white/20 transition-colors" viewBox="0 0 12 12" fill="none">
                  <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[6px] font-mono uppercase tracking-[0.3em] text-white/08">
                    Lot {lotNum(prevMoment.id)} · Previous
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.15em] text-white/15"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
                  >
                    {prevMoment.player}
                  </span>
                </div>
              </a>

              {/* Centre lot indicator */}
              <span className="text-[6px] font-mono uppercase tracking-[0.3em] text-white/06">
                {currentIdx + 1} of {momentIds.length}
              </span>

              {/* Next lot */}
              <a
                href={`/supreme/${nextMoment.id}`}
                className="group flex items-center gap-2 transition-opacity duration-300 hover:opacity-60"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[6px] font-mono uppercase tracking-[0.3em] text-white/08">
                    Next · Lot {lotNum(nextMoment.id)}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-[0.15em] text-white/15"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
                  >
                    {nextMoment.player}
                  </span>
                </div>
                <svg className="h-3 w-3 text-white/10 group-hover:text-white/20 transition-colors" viewBox="0 0 12 12" fill="none">
                  <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        );
      })()}

      {/* ============================================================= */}
      {/* SALEROOM AMBIENT PULSE — the room's heartbeat as a waveform  */}
      {/* At Christie's/Sotheby's, the room has an audible energy:     */}
      {/* quiet murmur during open bidding, rising tension as lots     */}
      {/* close, palpable electricity in the final seconds. This thin  */}
      {/* SVG waveform at the viewport bottom is the visual equivalent */}
      {/* — the saleroom's pulse rendered as a barely-visible line.    */}
      {/* Phase-reactive: calm sinusoid in OPEN, sharper frequency in  */}
      {/* CLOSING, agitated tremor in CRITICAL, flatline when ENDED.  */}
      {/* ============================================================= */}
      {!isPurchasing && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[5] pointer-events-none"
          style={{ height: 20, opacity: isEnded ? 0.03 : dropPhase === 'CRITICAL' ? 0.12 : dropPhase === 'CLOSING' ? 0.07 : 0.04 }}
        >
          <svg
            width="100%"
            height="20"
            viewBox="0 0 400 20"
            preserveAspectRatio="none"
            className={isEnded ? '' : 'supreme-saleroom-pulse'}
            style={{
              animationDuration: dropPhase === 'CRITICAL' ? '1.5s' : dropPhase === 'CLOSING' ? '4s' : '8s',
            }}
          >
            <path
              d={isEnded
                ? 'M0 10 L400 10'
                : dropPhase === 'CRITICAL'
                  ? 'M0 10 Q25 2,50 10 Q75 18,100 10 Q125 2,150 10 Q175 18,200 10 Q225 2,250 10 Q275 18,300 10 Q325 2,350 10 Q375 18,400 10'
                  : dropPhase === 'CLOSING'
                    ? 'M0 10 Q50 4,100 10 Q150 16,200 10 Q250 4,300 10 Q350 16,400 10'
                    : 'M0 10 Q100 6,200 10 Q300 14,400 10'}
              fill="none"
              stroke={isEnded ? 'rgba(255,255,255,0.3)' : dropPhase === 'CRITICAL' ? '#EF4444' : dropPhase === 'CLOSING' ? '#F59E0B' : moment.teamColors.primary}
              strokeWidth={dropPhase === 'CRITICAL' ? '1.2' : '0.8'}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* ============================================================= */}
      {/* STICKY CTA — appears only when main button scrolls offscreen */}
      {/* ============================================================= */}
      {showStickyCTA && !isEnded && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3"
          style={{
            background: 'linear-gradient(to top, #0B0E14 60%, transparent)',
          }}
        >
          {/* Sticky context bar — tier + timer + temperature */}
          {!isPurchasing && (
            <div className="flex items-center justify-center gap-3 mb-2">
              <span
                className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/20"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {selectedTier.tier}
              </span>
              <span className="text-[6px] text-white/10">·</span>
              {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && (
                <>
                  <span
                    className="text-[9px] font-mono font-semibold tabular-nums tracking-wider"
                    style={{ color: dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B' }}
                  >
                    {timerDisplay}
                  </span>
                  <span className="text-[6px] text-white/10">·</span>
                </>
              )}
              {saleroomTemperature && (
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.3em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: saleroomTemperature.color,
                    opacity: saleroomTemperature.opacity,
                  }}
                >
                  {saleroomTemperature.word}
                </span>
              )}
            </div>
          )}
          <button
            onClick={isPurchasing ? undefined : () => { HAPTIC.tap(); purchase(); }}
            disabled={isPurchasing}
            className={`w-full h-[52px] rounded-2xl text-[14px] font-bold uppercase tracking-wider supreme-btn disabled:cursor-wait ${isPurchasing ? '' : buttonAnimation}`}
            style={{
              backgroundColor: buttonBg,
              color: buttonTextColor,
              boxShadow: isPurchasing
                ? `0 4px 40px ${glowColor}50, 0 0 0 1px ${glowColor}20`
                : `0 4px 24px ${glowColor}30, 0 0 0 1px ${glowColor}10`,
              transition: 'box-shadow 0.5s ease, background-color 0.3s ease',
            }}
          >
            {isPurchasing ? (
              <span className="inline-flex items-center gap-2.5">
                {purchaseStage < 3 ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.15" />
                    <circle
                      cx="10" cy="10" r="8"
                      stroke="#0B0E14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 8}`}
                      strokeDashoffset={`${2 * Math.PI * 8 * (1 - (purchaseStage === 0 ? 0.25 : purchaseStage === 1 ? 0.5 : 0.8))}`}
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: 'center',
                        transition: 'stroke-dashoffset 0.4s ease-out',
                      }}
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.25" />
                    <path
                      d="M6 10.5 L9 13.5 L14 7"
                      stroke="#0B0E14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="supreme-checkmark-draw"
                    />
                  </svg>
                )}
                {buttonText}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                </svg>
                {buttonText}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
