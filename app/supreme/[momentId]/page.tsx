'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
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
// Confetti particle for W screen
// ---------------------------------------------------------------------------

function ConfettiParticles({ teamColor }: { teamColor: string }) {
  const particles = useMemo(() => {
    const colors = ['#00E5A0', teamColor, '#FFFFFF', '#F59E0B'];
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: 4 + Math.random() * 6,
      color: colors[i % colors.length],
      rotation: Math.random() * 360,
    }));
  }, [teamColor]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            opacity: 0.8,
            animation: `confetti-fall ${p.duration} ${p.delay} ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Share buttons for the W screen
// ---------------------------------------------------------------------------

function ShareButtons() {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {(['X', 'Instagram', 'Copy Link'] as const).map((label) => (
        <button
          key={label}
          className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase
                     bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmed / "W" Screen
// ---------------------------------------------------------------------------

function WScreen({
  moment,
  editionNumber,
  onReset,
}: {
  moment: Moment;
  editionNumber: number;
  onReset: () => void;
}) {
  const [show, setShow] = useState(false);
  const [flash, setFlash] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    // Staggered reveal: flash → W → details
    requestAnimationFrame(() => setShow(true));
    const t1 = setTimeout(() => setFlash(false), 350);
    const t2 = setTimeout(() => setShowDetails(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14] overflow-hidden">
      {/* Entry flash */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-400"
        style={{
          backgroundColor: '#00E5A0',
          opacity: flash ? 0.15 : 0,
        }}
      />

      {/* Confetti burst */}
      <ConfettiParticles teamColor={moment.teamColors.primary} />

      {/* Teal radial burst — intensified */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(0,229,160,0.2) 0%, transparent 60%)',
        }}
      />
      {/* Team color accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${moment.teamColors.primary}15 0%, transparent 50%)`,
        }}
      />

      {/* Content card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6 transition-all duration-700 ease-out"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)',
        }}
      >
        {/* Giant W */}
        <div
          className="text-[140px] leading-none tracking-tighter"
          style={{
            color: '#00E5A0',
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            textShadow: '0 0 60px rgba(0,229,160,0.4), 0 0 120px rgba(0,229,160,0.15)',
          }}
        >
          W
        </div>

        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          You own this moment
        </p>

        {/* Staggered details */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: showDetails ? 1 : 0,
            transform: showDetails ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          {/* Player + play */}
          <h2
            className="mt-6 text-4xl uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 700 }}
          >
            {moment.player}
          </h2>
          <p className="mt-1 text-sm text-white/40">{moment.playType}</p>

          {/* Edition pill */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 border border-white/[0.06]">
            <span className="text-sm font-mono font-semibold text-[#00E5A0]">
              #{editionNumber.toLocaleString()}
            </span>
            <span className="text-xs text-white/30">
              of {moment.editionSize.toLocaleString()}
            </span>
          </div>

          {/* Context timestamp */}
          <p className="mt-4 text-[11px] text-white/25 uppercase tracking-wider">
            {moment.team} vs {moment.opponent}
          </p>

          {/* Share row */}
          <ShareButtons />

          {/* View in collection */}
          <button
            className="mt-4 px-6 py-3 rounded-xl text-sm font-semibold tracking-wide
                       bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            View in Collection
          </button>
        </div>

        {/* Dev reset — tiny, bottom */}
        <button
          onClick={onReset}
          className="mt-8 text-[10px] text-white/20 hover:text-white/40 transition-colors"
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
  const { state: viewPhase, editionNumber, purchase, reset } = usePrototypeState(momentId);

  const watching = useSocialProof(moment ? 30 + moment.editionsClaimed % 40 : 30);
  const claimedPerMin = moment
    ? Math.max(3, Math.floor(moment.editionsClaimed / 200))
    : 8;

  // Derive drop phase from countdown
  const dropPhase = derivePhase(countdown.totalSeconds);
  const timerDisplay = formatTimer(countdown.totalSeconds);

  if (!moment) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0B0E14] text-white/40 text-sm">
        Moment not found.
      </div>
    );
  }

  const progressPct = ((moment.editionsClaimed / moment.editionSize) * 100).toFixed(1);

  // ---- CONFIRMED state ----
  if (viewPhase === 'confirmed' || viewPhase === 'sharing') {
    return (
      <WScreen
        moment={moment}
        editionNumber={editionNumber ?? moment.editionsClaimed + 1}
        onReset={reset}
      />
    );
  }

  // ---- Button config by phase ----
  const isPurchasing = viewPhase === 'purchasing';
  const isEnded = dropPhase === 'ENDED';

  let buttonBg = '#00E5A0';
  let buttonText = `OWN THIS MOMENT — $${moment.price}`;
  let buttonTextColor = '#0B0E14';
  let buttonAnimation = '';

  if (isPurchasing) {
    buttonBg = '#00E5A0';
    buttonText = 'Processing...';
    buttonTextColor = '#0B0E14';
  } else if (isEnded) {
    buttonBg = '#1C2333';
    buttonText = 'DROP ENDED';
    buttonTextColor = '#6B7A99';
  } else if (dropPhase === 'CRITICAL') {
    buttonBg = '#EF4444';
    buttonText = `OWN THIS MOMENT — $${moment.price}`;
    buttonTextColor = '#FFFFFF';
    buttonAnimation = 'animate-urgency-fast';
  } else if (dropPhase === 'CLOSING') {
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

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}
    >
      {/* ============================================================= */}
      {/* HERO — fills top 52% */}
      {/* ============================================================= */}
      <div
        className="relative w-full flex-none"
        style={{ height: '52dvh' }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
            backgroundSize: 'cover, cover',
            backgroundPosition: 'center top, center',
          }}
        />

        {/* Team color ambient glow — top center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${moment.teamColors.primary}30 0%, transparent 70%)`,
          }}
        />

        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #0B0E14 0%, rgba(11,14,20,0.4) 40%, transparent 70%)',
          }}
        />

        {/* Player name + stat line — bottom-left */}
        <div className="absolute bottom-6 left-5 right-5 z-10 supreme-hero-enter">
          {/* Play type — above name, small */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-2">
            {moment.playType}
          </p>
          <h1
            className="text-[52px] sm:text-[64px] uppercase leading-[0.88] text-white"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              textShadow: '0 2px 30px rgba(0,0,0,0.7)',
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
          {/* Game context */}
          <p className="mt-1 text-xs text-white/25 tracking-wide">
            {moment.context}
          </p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* INFO STRIP — timer + edition counter */}
      {/* ============================================================= */}
      <div className="flex items-center justify-between px-5 py-3.5 supreme-info-enter">
        {/* Timer */}
        <div className="flex items-baseline gap-2">
          <div
            className="font-mono text-[28px] font-bold tabular-nums transition-colors duration-300"
            style={{ color: timerColor(dropPhase) }}
          >
            {isEnded ? (
              <span className="text-lg font-semibold">Ended</span>
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

        {/* Edition counter */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[9px] uppercase tracking-wider text-[#00E5A0]/60 font-semibold">
              Open
            </span>
            <p className="text-sm font-mono tabular-nums text-white/70">
              <span className="text-white font-semibold">
                {moment.editionsClaimed.toLocaleString()}
              </span>
              <span className="text-white/20"> / </span>
              <span>{moment.editionSize.toLocaleString()}</span>
            </p>
          </div>
          {/* Thin progress bar */}
          <div className="mt-1.5 w-32 h-[2px] rounded-full bg-white/[0.06] overflow-hidden ml-auto">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progressPct}%`,
                backgroundColor: '#00E5A0',
              }}
            />
          </div>
        </div>
      </div>

      {/* Spacer pushes button to bottom */}
      <div className="flex-1" />

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
          onClick={purchase}
          disabled={isPurchasing || isEnded}
          className={`
            relative w-full h-[56px] rounded-2xl text-[15px] font-bold uppercase tracking-wider
            supreme-btn disabled:cursor-not-allowed
            ${isPurchasing ? 'supreme-purchasing' : ''}
            ${buttonAnimation}
          `}
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
            boxShadow: !isEnded && !isPurchasing
              ? `0 4px 24px ${glowColor}30, 0 0 0 1px ${glowColor}10`
              : undefined,
          }}
        >
          {isPurchasing ? (
            <span className="inline-flex items-center gap-2.5">
              {/* Pulsing dot instead of spinner — minimal */}
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0B0E14]/40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#0B0E14]/60" />
              </span>
              Securing...
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {/* ============================================================= */}
      {/* SOCIAL PROOF — tiny, below button */}
      {/* ============================================================= */}
      <p className="text-center text-[11px] text-white/20 pb-6 tabular-nums supreme-social-enter">
        {watching} watching &middot; {claimedPerMin} claimed/min
      </p>
    </div>
  );
}
