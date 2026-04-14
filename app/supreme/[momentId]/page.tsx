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
  const [showShare, setShowShare] = useState(false);
  useEffect(() => {
    // Staggered reveal: flash → W → details → share hint
    requestAnimationFrame(() => setShow(true));
    const t1 = setTimeout(() => setFlash(false), 400);
    const t2 = setTimeout(() => setShowDetails(true), 700);
    const t3 = setTimeout(() => setShowShare(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
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

          {/* Edition serial — luxury serial number treatment */}
          <div className="mt-6 flex flex-col items-center">
            {tierName !== 'Open' && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2"
                style={{ color: moment.teamColors.primary }}
              >
                {tierName} Edition
              </span>
            )}
            <div className="flex items-baseline gap-2">
              <span
                className="text-[32px] font-mono font-bold tabular-nums tracking-tight"
                style={{ color: moment.teamColors.primary }}
              >
                #{editionNumber.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-white/15 tabular-nums">
                / {moment.editionSize.toLocaleString()}
              </span>
            </div>
            {/* Thin line under serial */}
            <div className="mt-2 w-20 h-[1px] bg-white/[0.06]" />
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
          <ShareButtons />

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

  // Derive drop phase from countdown
  const dropPhase = derivePhase(countdown.totalSeconds);
  const timerDisplay = formatTimer(countdown.totalSeconds);

  // Live claim ticker
  const { claimed, lastClaimer, claimFlash } = useClaimTicker(
    moment?.editionsClaimed ?? 0,
    moment?.editionSize ?? 5000,
  );

  if (!moment) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0B0E14] text-white/40 text-sm">
        Moment not found.
      </div>
    );
  }

  const selectedTier = moment.rarityTiers[selectedTierIdx];
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
  let buttonText = `OWN THIS MOMENT — $${selectedTier.price}`;
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
    buttonText = `LAST CHANCE — $${selectedTier.price}`;
    buttonTextColor = '#FFFFFF';
    buttonAnimation = 'animate-urgency-fast';
  } else if (dropPhase === 'CLOSING') {
    buttonText = `CLOSING SOON — $${selectedTier.price}`;
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

  // Hero desaturation for ENDED state
  const heroFilter =
    isEnded ? 'grayscale(0.7) brightness(0.6)' :
    dropPhase === 'CRITICAL' ? 'saturate(1.1) contrast(1.05)' :
    'none';

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden select-none transition-colors duration-1000"
      style={{ backgroundColor: bgColor }}
    >
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
        className="relative w-full flex-none"
        style={{ height: '52dvh' }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
            backgroundSize: 'cover, cover',
            backgroundPosition: 'center top, center',
            filter: heroFilter,
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
              {/* Minimal progress ring */}
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#0B0E14" strokeWidth="2" opacity="0.2" />
                <path d="M10 2a8 8 0 0 1 8 8" stroke="#0B0E14" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Securing...
            </span>
          ) : (
            buttonText
          )}
        </button>

        {/* Stored payment / instant checkout indicator */}
        {!isEnded && !isPurchasing && (
          <p className="mt-2.5 text-center text-[10px] uppercase tracking-[0.15em] text-white/15">
            Instant checkout · Stored payment
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
    </div>
  );
}
