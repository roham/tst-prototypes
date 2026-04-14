'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { getMoment, SALE_DURATION_MS } from '@/lib/mock-data';
import type { Moment } from '@/lib/mock-data';
import { useCountdown } from '@/lib/use-countdown';
import { usePrototypeState } from '@/lib/use-prototype-state';

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

function useClaimTicker(baseClaimed: number, editionSize: number) {
  const [claimed, setClaimed] = useState(baseClaimed);
  const [lastClaimer, setLastClaimer] = useState<string | null>(null);
  const [claimFlash, setClaimFlash] = useState(false);

  useEffect(() => {
    // Random interval between 2-6s to simulate real claiming
    let timeout: NodeJS.Timeout;
    const tick = () => {
      const delay = 2000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        setClaimed((prev) => Math.min(prev + 1, editionSize));
        const name = CLAIM_NAMES[Math.floor(Math.random() * CLAIM_NAMES.length)];
        setLastClaimer(name);
        setClaimFlash(true);
        setTimeout(() => setClaimFlash(false), 600);
        setTimeout(() => setLastClaimer(null), 2800);
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timeout);
  }, [editionSize]);

  return { claimed, lastClaimer, claimFlash };
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
  onReset,
}: {
  moment: Moment;
  editionNumber: number;
  purchaseTime: number | null;
  tierName: string;
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
    const t3 = setTimeout(() => setShowSeal(true), 1600); // after edition counter locks (700+800+100)
    const t4 = setTimeout(() => setShowShare(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  // Format purchase date for screenshot permanence
  const dateStr = useMemo(() => {
    const d = purchaseTime ? new Date(purchaseTime) : new Date();
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }, [purchaseTime]);

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

      {/* Radial burst — clean expanding rings */}
      <RadialBurst teamColor={moment.teamColors.primary} />

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

        <p
          className="-mt-2 text-[13px] font-bold uppercase tracking-[0.5em] text-white/50"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          YOURS.
        </p>

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
        </div>

        {/* Share section — appears last */}
        <div
          className="mt-8 transition-all duration-600 ease-out"
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
  const [purchaseStage, setPurchaseStage] = useState(0); // 0=reserving, 1=confirming, 2=yours
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
      const t = setTimeout(() => setTransitionFlash(null), 600);
      return () => clearTimeout(t);
    }
    if (prev === 'CLOSING' && dropPhase === 'CRITICAL') {
      setTransitionFlash('red');
      const t = setTimeout(() => setTransitionFlash(null), 600);
      return () => clearTimeout(t);
    }
  }, [dropPhase]);

  // Live claim ticker
  const { claimed, lastClaimer, claimFlash } = useClaimTicker(
    moment?.editionsClaimed ?? 0,
    moment?.editionSize ?? 5000,
  );

  // Purchase stage progression (3 stages in 1.5s)
  useEffect(() => {
    if (viewPhase !== 'purchasing') {
      setPurchaseStage(0);
      return;
    }
    const t1 = setTimeout(() => setPurchaseStage(1), 500);
    const t2 = setTimeout(() => setPurchaseStage(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [viewPhase]);

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

  // ---- CONFIRMED state ----
  if (viewPhase === 'confirmed' || viewPhase === 'sharing') {
    return (
      <WScreen
        moment={moment}
        editionNumber={editionNumber ?? moment.editionsClaimed + 1}
        purchaseTime={purchaseTime}
        tierName={selectedTier.tier}
        onReset={reset}
      />
    );
  }

  // ---- Button config by phase ----
  const isPurchasing = viewPhase === 'purchasing';
  const isEnded = dropPhase === 'ENDED';

  let buttonBg = '#00E5A0';
  let buttonText = `OWN THIS MOMENT — ${scrambledPrice}`;
  let buttonTextColor = '#0B0E14';
  let buttonAnimation = '';

  if (isPurchasing) {
    buttonBg = '#00E5A0';
    buttonText = purchaseStage === 0 ? 'Reserving...' : purchaseStage === 1 ? 'Confirming...' : 'Yours.';
    buttonTextColor = '#0B0E14';
  } else if (isEnded) {
    buttonBg = '#1C2333';
    buttonText = 'DROP ENDED';
    buttonTextColor = '#6B7A99';
  } else if (dropPhase === 'CRITICAL') {
    buttonBg = '#EF4444';
    buttonText = `LAST CHANCE — ${scrambledPrice}`;
    buttonTextColor = '#FFFFFF';
    buttonAnimation = 'animate-urgency-fast';
  } else if (dropPhase === 'CLOSING') {
    buttonText = `CLOSING SOON — ${scrambledPrice}`;
    buttonAnimation = 'animate-urgency';
  }

  // Glow intensity increases with urgency
  const glowOpacity =
    dropPhase === 'CRITICAL' ? 0.5 : dropPhase === 'CLOSING' ? 0.3 : 0.2;
  const glowColor =
    dropPhase === 'CRITICAL' ? '#EF4444' : '#00E5A0';

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
            boxShadow: `inset 0 0 120px ${moment.teamColors.primary}08, inset 0 0 60px ${moment.teamColors.primary}05`,
          }}
        />
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

        {/* Edge light trace — luminous point traveling along hero bottom edge */}
        {!isEnded && !isPurchasing && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] z-[11] pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 w-12 h-[1px] supreme-edge-trace"
              style={{
                background: `radial-gradient(ellipse at center, ${moment.teamColors.primary}90 0%, ${moment.teamColors.primary}40 30%, transparent 70%)`,
                boxShadow: `0 0 8px ${moment.teamColors.primary}50, 0 0 20px ${moment.teamColors.primary}25`,
              }}
            />
          </div>
        )}

        {/* Ambient particles — luminous dust motes in museum spotlight */}
        {!isEnded && !isPurchasing && (
          <AmbientParticles teamColor={moment.teamColors.primary} />
        )}

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
        </div>
      </div>

      {/* ============================================================= */}
      {/* CONTEXT — one emotional sentence, given room to breathe */}
      {/* ============================================================= */}
      <div className="px-5 pt-4 pb-2 supreme-context-enter">
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
      </div>

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
            <div
              className={`font-mono font-bold tabular-nums transition-all duration-500 ${
                isEnded ? 'text-lg' :
                dropPhase === 'CRITICAL' ? 'text-[32px]' :
                'text-[28px]'
              }`}
              style={{ color: timerColor(dropPhase) }}
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
      {/* RARITY TIERS — minimal horizontal selector */}
      {/* ============================================================= */}
      <div className="px-5 mt-3 supreme-info-enter">
        <div className="flex items-center justify-center gap-1">
          {moment.rarityTiers.map((tier, idx) => {
            const isSelected = idx === selectedTierIdx;
            const isLow = tier.remaining <= 5;
            return (
              <button
                key={tier.tier}
                onClick={() => setSelectedTierIdx(idx)}
                className="relative px-3 py-2 text-center transition-all duration-200 active:scale-95"
              >
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
                {/* Underline indicator */}
                <div
                  className="absolute bottom-0 left-3 right-3 h-[1px] transition-all duration-200"
                  style={{
                    backgroundColor: isSelected ? moment.teamColors.primary : 'transparent',
                    opacity: isSelected ? 0.6 : 0,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer pushes button to bottom */}
      <div className="flex-1" />

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
      <div className="px-5 mb-3 relative supreme-info-enter">
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
          ref={ctaRef}
          onClick={purchase}
          disabled={isPurchasing || isEnded}
          className={`
            relative w-full h-[56px] rounded-2xl text-[15px] font-bold uppercase tracking-wider
            supreme-btn disabled:cursor-not-allowed
            ${buttonAnimation}
          `}
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
            boxShadow: isPurchasing
              ? `0 4px 40px ${glowColor}50, 0 0 0 1px ${glowColor}20`
              : !isEnded
                ? `0 4px 24px ${glowColor}30, 0 0 0 1px ${glowColor}10`
                : undefined,
            transition: 'box-shadow 0.5s ease, background-color 0.3s ease',
          }}
        >
          {isPurchasing ? (
            <span className="inline-flex items-center gap-2.5">
              {purchaseStage < 2 ? (
                /* Deterministic progress ring — fills in stages */
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.15" />
                  <circle
                    cx="10" cy="10" r="8"
                    stroke="#0B0E14"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 8}`}
                    strokeDashoffset={`${2 * Math.PI * 8 * (1 - (purchaseStage === 0 ? 0.33 : 0.75))}`}
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
              {!isEnded && (
                /* Lock icon — instant secure checkout signal */
                <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                </svg>
              )}
              {buttonText}
            </span>
          )}
        </button>

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
      {/* SOCIAL PROOF — claim ticker + watchers */}
      {/* ============================================================= */}
      <div className="px-5 pb-6 supreme-social-enter">
        {/* Last claimer notification / ended state */}
        <div className="h-5 flex items-center justify-center overflow-hidden">
          {isEnded ? (
            <p className="text-[11px] text-white/15 tabular-nums">
              {claimed.toLocaleString()} editions collected
            </p>
          ) : lastClaimer ? (
            <p
              className="text-[11px] text-white/30 tabular-nums supreme-claim-fade"
              key={lastClaimer + Date.now()}
            >
              <span className="text-[#00E5A0]/60 font-semibold">{lastClaimer}</span>
              {' '}just claimed
            </p>
          ) : (
            <p className="text-[11px] text-white/15 tabular-nums">
              {watching} watching now
            </p>
          )}
        </div>
      </div>

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
          <button
            onClick={isPurchasing ? undefined : purchase}
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
                {purchaseStage < 2 ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.15" />
                    <circle
                      cx="10" cy="10" r="8"
                      stroke="#0B0E14"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 8}`}
                      strokeDashoffset={`${2 * Math.PI * 8 * (1 - (purchaseStage === 0 ? 0.33 : 0.75))}`}
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
