'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { getMoment, getSaleEndsAt } from '@/lib/mock-data';
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
  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14] overflow-hidden">
      {/* Teal radial burst */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(0,229,160,0.15) 0%, transparent 70%)',
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
          className="text-[120px] leading-none font-black tracking-tighter"
          style={{ color: '#00E5A0' }}
        >
          W
        </div>

        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/60">
          You own this moment
        </p>

        {/* Player + play */}
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
          {moment.player}
        </h2>
        <p className="mt-1 text-base text-white/50">{moment.playType}</p>

        {/* Edition pill */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5">
          <span className="text-sm font-mono font-semibold text-[#00E5A0]">
            #{editionNumber.toLocaleString()}
          </span>
          <span className="text-sm text-white/40">
            of {moment.editionSize.toLocaleString()}
          </span>
        </div>

        {/* Context timestamp */}
        <p className="mt-4 text-xs text-white/30">
          Acquired during {moment.team} vs {moment.opponent}
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

  const [saleEnd] = useState(() => getSaleEndsAt(momentId));
  const countdown = useCountdown(saleEnd);
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

  return (
    <div className="min-h-dvh flex flex-col bg-[#0B0E14] relative overflow-hidden select-none">
      {/* ============================================================= */}
      {/* HERO — fills top 55% */}
      {/* ============================================================= */}
      <div
        className="relative w-full flex-none"
        style={{ height: '55dvh' }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: moment.thumbnailGradient,
          }}
        />

        {/* Dark overlay for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #0B0E14 0%, transparent 50%)',
          }}
        />

        {/* Player name + play type — bottom-left */}
        <div className="absolute bottom-6 left-5 right-5 z-10">
          <h1
            className="text-5xl sm:text-6xl font-black uppercase leading-[0.9] tracking-tight text-white"
            style={{
              textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            }}
          >
            {moment.player}
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-white/40">
            {moment.playType}
          </p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* INFO STRIP — timer + edition counter */}
      {/* ============================================================= */}
      <div className="flex items-center justify-between px-5 py-4">
        {/* Timer */}
        <div
          className="font-mono text-2xl font-bold tabular-nums transition-colors duration-300"
          style={{ color: timerColor(dropPhase) }}
        >
          {isEnded ? (
            <span className="text-lg font-semibold">Ended</span>
          ) : (
            timerDisplay
          )}
        </div>

        {/* Edition counter */}
        <div className="text-right">
          <p className="text-sm font-mono tabular-nums text-white/70">
            <span className="text-white font-semibold">
              {moment.editionsClaimed.toLocaleString()}
            </span>
            <span className="text-white/30"> / </span>
            <span>{moment.editionSize.toLocaleString()}</span>
          </p>
          {/* Thin progress bar */}
          <div className="mt-1.5 w-32 h-[3px] rounded-full bg-white/10 overflow-hidden ml-auto">
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

      {/* ============================================================= */}
      {/* THE BUTTON */}
      {/* ============================================================= */}
      <div className="px-5 mt-auto mb-3">
        <button
          onClick={purchase}
          disabled={isPurchasing || isEnded}
          className={`
            relative w-full h-16 rounded-2xl text-base font-bold uppercase tracking-wider
            transition-all duration-200 active:scale-[0.98]
            disabled:cursor-not-allowed
            ${buttonAnimation}
          `}
          style={{
            backgroundColor: buttonBg,
            color: buttonTextColor,
          }}
        >
          {isPurchasing ? (
            <span className="inline-flex items-center gap-2">
              {/* Spinner */}
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {/* ============================================================= */}
      {/* SOCIAL PROOF — tiny, below button */}
      {/* ============================================================= */}
      <p className="text-center text-[11px] text-white/25 pb-6">
        {watching} watching &middot; {claimedPerMin} claimed/min
      </p>
    </div>
  );
}
