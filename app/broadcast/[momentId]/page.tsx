'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { getMoment, SALE_DURATION_MS } from '@/lib/mock-data';
import type { Moment, RarityTier } from '@/lib/mock-data';
import { useCountdown } from '@/lib/use-countdown';
import { usePrototypeState } from '@/lib/use-prototype-state';

// ---------------------------------------------------------------------------
// Direction B — "Broadcast"
// ESPN/TNT broadcast emotion meets Sotheby's prestige.
// Cinematic. The page makes you FEEL the moment before asking you to buy.
// Rich context, dramatic typography, editorial quality.
// Sports Illustrated commemorative cover as a purchase page.
// ---------------------------------------------------------------------------

// ── Helpers ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return '0,0,0';
  return `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}`;
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Expired';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function tierUrgencyLabel(remaining: number): string {
  if (remaining <= 1) return 'Last one';
  if (remaining <= 5) return `${remaining} left`;
  return `${remaining.toLocaleString()} left`;
}

type DropPhase = 'OPEN' | 'CLOSING' | 'CRITICAL' | 'ENDED';

function derivePhase(secondsLeft: number): DropPhase {
  if (secondsLeft <= 0) return 'ENDED';
  if (secondsLeft <= 120) return 'CRITICAL';
  if (secondsLeft <= 600) return 'CLOSING';
  return 'OPEN';
}

function editorialUrgencyCopy(phase: DropPhase, seconds: number): string | null {
  if (phase === 'CRITICAL') return 'CLOSING NOW';
  if (phase === 'CLOSING') return 'FINAL MINUTES';
  return null;
}

function supplyNarrative(claimed: number, total: number): string {
  const pct = (claimed / total) * 100;
  const remaining = total - claimed;
  if (pct >= 95) return `Only ${remaining.toLocaleString()} editions remain — nearly sold out`;
  if (pct >= 80) return `${claimed.toLocaleString()} collectors and counting — this edition is closing fast`;
  if (pct >= 60) return `${claimed.toLocaleString()} of ${total.toLocaleString()} claimed — momentum is building`;
  return `${claimed.toLocaleString()} collectors own a piece of this moment`;
}

// Simulated "recent collectors" count
function useRecentCollectors() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Start with a plausible number
    setCount(Math.floor(12 + Math.random() * 8));
    const id = setInterval(() => {
      setCount((prev) => Math.max(3, prev + Math.floor(Math.random() * 5) - 1));
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return count;
}

// Full team name for the broadcast overlay
const TEAM_FULL: Record<string, string> = {
  MIA: 'Miami Heat',
  BOS: 'Boston Celtics',
  DEN: 'Denver Nuggets',
  LAL: 'Los Angeles Lakers',
  OKC: 'Oklahoma City Thunder',
  PHX: 'Phoenix Suns',
};

function fullTeam(abbr: string): string {
  return TEAM_FULL[abbr] ?? abbr;
}

// ---------------------------------------------------------------------------
// ESPN-style stat breakdown — animated cards
// ---------------------------------------------------------------------------

function StatBreakdown({ statLine, teamColor }: { statLine: string; teamColor: string }) {
  // Parse "30 PTS / 8 REB / 4 AST" into segments
  const stats = statLine.split('/').map((s) => {
    const trimmed = s.trim();
    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    return match ? { value: match[1], label: match[2] } : { value: trimmed, label: '' };
  });

  return (
    <div className="mt-8 flex items-stretch gap-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-3 text-center"
          style={{ animation: `stat-fly-in 0.5s ease-out ${0.15 * i}s both` }}
        >
          <div
            className="text-2xl font-bold tabular-nums"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor }}
          >
            {stat.value}
          </div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BroadcastPage() {
  const params = useParams<{ momentId: string }>();
  const momentId = params.momentId;
  const moment = useMemo(() => getMoment(momentId), [momentId]);

  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [purchaseStage, setPurchaseStage] = useState(0); // 0=reserving, 1=authenticating, 2=acquired

  const countdown = useCountdown(SALE_DURATION_MS[params.momentId as string] ?? 12 * 60 * 1000);
  const proto = usePrototypeState(momentId);

  // Purchase stage progression (3 stages in 1.5s)
  useEffect(() => {
    if (proto.state !== 'purchasing') {
      setPurchaseStage(0);
      return;
    }
    const t1 = setTimeout(() => setPurchaseStage(1), 500);
    const t2 = setTimeout(() => setPurchaseStage(2), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [proto.state]);

  if (!moment) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0B0E14] text-white/40 text-sm">
        Moment not found.
      </div>
    );
  }

  const selectedTier = moment.rarityTiers[selectedTierIdx];
  const rgb = hexToRgb(moment.teamColors.primary);
  const isUrgent = countdown.isClosing;
  const dropPhase = derivePhase(countdown.totalSeconds);
  const urgencyCopy = editorialUrgencyCopy(dropPhase, countdown.totalSeconds);
  const recentCollectors = useRecentCollectors();

  // ── Confirmed: Certificate of Ownership ────────────────────────────────
  if (proto.state === 'confirmed') {
    return (
      <CertificateScreen
        moment={moment}
        tier={selectedTier}
        editionNumber={proto.editionNumber ?? moment.editionsClaimed + 1}
        purchaseTime={proto.purchaseTime}
        rgb={rgb}
        onReset={proto.reset}
      />
    );
  }

  // ── Browsing / Purchasing ──────────────────────────────────────────────
  const isPurchasing = proto.state === 'purchasing';

  return (
    <div className="relative min-h-dvh bg-[#0B0E14] text-white selection:bg-white/20">
      {/* Subtle team-color ambient wash */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(${rgb},0.08) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* ━━━ HERO — 50vh ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative h-[50dvh] min-h-[420px] overflow-hidden">
          {/* Thumbnail gradient background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center top, center',
              filter: countdown.isEnded ? 'grayscale(0.6) brightness(0.65)' :
                      dropPhase === 'CRITICAL' ? 'saturate(1.15) contrast(1.05)' : 'none',
            }}
          />
          {/* Dark overlay from bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />

          {/* Top bar: editorial label + status badge + countdown */}
          <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between md:left-10 md:right-10 md:top-10">
            <div className="flex items-center gap-2.5">
              <div
                className="h-px w-6 transition-colors duration-500"
                style={{
                  backgroundColor: countdown.isEnded ? '#6B7A99' :
                    dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                }}
              />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.25em] transition-colors duration-500"
                style={{
                  color: countdown.isEnded ? '#6B7A99' :
                    dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                }}
              >
                {countdown.isEnded ? 'Archived' :
                 dropPhase === 'CRITICAL' ? 'Breaking' :
                 dropPhase === 'CLOSING' ? 'Final Minutes' :
                 'Instant Classic'}
              </span>
            </div>
            {/* Status badge + countdown */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5 rounded-full backdrop-blur-sm px-3 py-1 transition-colors duration-500"
                style={{
                  backgroundColor: countdown.isEnded ? 'rgba(107,122,153,0.15)' :
                    dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.2)' :
                    'rgba(0,0,0,0.4)',
                }}
              >
                {!countdown.isEnded && (
                  <div
                    className="h-1.5 w-1.5 rounded-full animate-pulse transition-colors duration-500"
                    style={{
                      backgroundColor: dropPhase === 'CRITICAL' ? '#EF4444' : '#EF4444',
                    }}
                  />
                )}
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider transition-colors duration-500"
                  style={{
                    color: countdown.isEnded ? 'rgba(107,122,153,0.6)' :
                      dropPhase === 'CRITICAL' ? '#EF4444' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {countdown.isEnded ? 'Concluded' : 'Live'}
                </span>
              </div>
              <span
                className="font-mono text-sm font-semibold tabular-nums tracking-wider transition-colors duration-500"
                style={{
                  color: countdown.isEnded
                    ? 'rgba(255,255,255,0.25)'
                    : dropPhase === 'CRITICAL'
                      ? '#EF4444'
                      : isUrgent
                        ? '#F59E0B'
                        : 'rgba(255,255,255,0.5)',
                }}
              >
                {countdown.isEnded ? 'ENDED' : formatCountdown(countdown.totalSeconds)}
              </span>
            </div>
          </div>

          {/* Broadcast lower-third — slides in from left */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 md:px-10 md:pb-12 broadcast-lower-third"
          >
            {/* Team-color left edge accent */}
            <div
              className="absolute left-0 bottom-7 top-0 w-[3px] md:bottom-12"
              style={{ backgroundColor: moment.teamColors.primary }}
            />

            {/* Matchup context */}
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-1.5 pl-3 sm:text-xs">
              {fullTeam(moment.team)} vs {fullTeam(moment.opponent)}
            </span>

            {/* Player name — Oswald condensed broadcast headline */}
            <h1
              className="text-[clamp(2.8rem,9vw,5.5rem)] uppercase leading-[0.88] tracking-tight text-white pl-3"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                fontWeight: 700,
              }}
            >
              {moment.player}
            </h1>

            {/* Stat line — broadcast stat card style */}
            <div className="mt-3 pl-3 flex items-center gap-3">
              <p
                className="text-lg font-semibold tracking-wide text-white/90 sm:text-xl md:text-2xl"
                style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
              >
                {moment.statLine}
              </p>
            </div>

            {/* Team-color accent rule */}
            <div
              className="mt-4 ml-3 h-[2px] w-20 sm:w-28 md:w-32"
              style={{ backgroundColor: moment.teamColors.primary }}
            />

            {/* Context line */}
            <p className="mt-3 pl-3 text-sm tracking-wide text-white/40 md:text-base">
              {moment.context}
            </p>
          </div>

          {/* Hero countdown progress bar — thin line at very bottom */}
          {!countdown.isEnded && (
            <div className="absolute bottom-0 left-0 right-0 z-30 h-[2px] bg-white/[0.06]">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  dropPhase === 'CRITICAL' ? 'supreme-urgency-bar-critical' : ''
                }`}
                style={{
                  width: `${Math.min(100, (countdown.totalSeconds / ((SALE_DURATION_MS[momentId] ?? 720000) / 1000)) * 100)}%`,
                  background: dropPhase === 'CRITICAL'
                    ? '#EF4444'
                    : `linear-gradient(90deg, ${moment.teamColors.primary}, ${moment.teamColors.secondary || moment.teamColors.primary})`,
                }}
              />
            </div>
          )}
        </section>

        {/* ━━━ EDITORIAL URGENCY BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {urgencyCopy && (
          <div
            className="broadcast-urgency-banner relative overflow-hidden border-b"
            style={{
              borderColor: dropPhase === 'CRITICAL' ? '#EF444430' : '#F59E0B20',
              backgroundColor: dropPhase === 'CRITICAL' ? '#EF444408' : '#F59E0B06',
            }}
          >
            <div className="mx-auto max-w-2xl px-5 py-3 flex items-center gap-3 md:px-10">
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{
                  backgroundColor: dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                }}
              />
              <p
                className="text-[11px] font-bold uppercase tracking-[0.25em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: dropPhase === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                }}
              >
                {urgencyCopy}
              </p>
              <span className="text-[11px] text-white/25 tracking-wide">
                &mdash; {formatCountdown(countdown.totalSeconds)} left to collect
              </span>
            </div>
          </div>
        )}

        {/* ━━━ EDITORIAL NARRATIVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mx-auto max-w-2xl px-5 py-10 md:px-10 md:py-14">
          {/* Section header — broadcast style */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-[2px] w-8"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
              The Moment
            </span>
          </div>

          <p
            className="text-lg leading-[1.8] text-[#8892A7] md:text-xl md:leading-[1.85]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {/* Drop cap — magazine editorial style */}
            <span
              className="float-left mr-2 text-[3.5rem] leading-[0.8] font-bold text-white/80 mt-1"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {moment.historicalNote.charAt(0)}
            </span>
            {moment.historicalNote.slice(1)}
          </p>

          {/* ESPN-style stat breakdown */}
          <StatBreakdown statLine={moment.statLine} teamColor={moment.teamColors.primary} />
        </section>

        {/* Team-color thin divider */}
        <div className="mx-auto max-w-2xl px-5 md:px-10">
          <div
            className="h-[1px] opacity-20"
            style={{ backgroundColor: moment.teamColors.primary }}
          />
        </div>

        {/* ━━━ TRANSACTION SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mx-auto max-w-3xl px-5 pt-10 pb-16 md:px-10 md:pb-24">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-[2px] w-8"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
              Collect
            </span>
          </div>

          {/* Rarity tier selector — horizontal row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {moment.rarityTiers.map((tier, idx) => (
              <TierCard
                key={tier.tier}
                tier={tier}
                isSelected={idx === selectedTierIdx}
                teamColor={moment.teamColors.primary}
                rgb={rgb}
                onSelect={() => setSelectedTierIdx(idx)}
              />
            ))}
          </div>

          {/* Countdown — centered, elegant */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            <div
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                isUrgent ? 'animate-pulse bg-[#F59E0B]' : 'bg-white/20'
              }`}
            />
            <span
              className={`font-mono text-sm tabular-nums tracking-[0.12em] transition-colors ${
                countdown.isEnded
                  ? 'text-white/20'
                  : isUrgent
                    ? 'text-[#F59E0B]'
                    : 'text-white/30'
              }`}
            >
              {countdown.isEnded
                ? 'DROP ENDED'
                : `${formatCountdown(countdown.totalSeconds)} remaining`}
            </span>
          </div>

          {/* CTA button */}
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={proto.purchase}
              disabled={isPurchasing || countdown.isEnded}
              className={`group relative w-full max-w-md overflow-hidden rounded-lg border px-8 py-4 text-center text-base font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed sm:text-lg ${
                dropPhase === 'CRITICAL' && !isPurchasing
                  ? 'animate-urgency-fast'
                  : dropPhase === 'CLOSING' && !isPurchasing
                    ? 'animate-urgency'
                    : ''
              }`}
              style={{
                borderColor: countdown.isEnded
                  ? 'rgba(255,255,255,0.06)'
                  : isPurchasing
                    ? 'rgba(255,255,255,0.12)'
                    : dropPhase === 'CRITICAL'
                      ? '#EF4444'
                      : moment.teamColors.primary,
                backgroundColor: countdown.isEnded
                  ? 'rgba(28,35,51,0.6)'
                  : 'rgba(11,14,20,0.92)',
                boxShadow: countdown.isEnded
                  ? 'none'
                  : isPurchasing
                    ? 'none'
                    : dropPhase === 'CRITICAL'
                      ? `0 0 30px rgba(239,68,68,0.2), 0 0 80px rgba(239,68,68,0.08)`
                      : `0 0 20px rgba(${rgb},0.12), 0 0 60px rgba(${rgb},0.06)`,
                opacity: countdown.isEnded ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isPurchasing && !countdown.isEnded) {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 0 32px rgba(${rgb},0.28), 0 0 80px rgba(${rgb},0.10)`;
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    `rgba(${rgb},0.08)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isPurchasing && !countdown.isEnded) {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    dropPhase === 'CRITICAL'
                      ? `0 0 30px rgba(239,68,68,0.2), 0 0 80px rgba(239,68,68,0.08)`
                      : `0 0 20px rgba(${rgb},0.12), 0 0 60px rgba(${rgb},0.06)`;
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(11,14,20,0.92)';
                }
              }}
            >
              {/* Broadcast lower-third progress wipe during purchase */}
              {isPurchasing && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                  style={{
                    width: purchaseStage === 0 ? '33%' : purchaseStage === 1 ? '75%' : '100%',
                    backgroundColor: `rgba(${rgb},0.12)`,
                    borderRight: purchaseStage < 2 ? `1px solid rgba(${rgb},0.3)` : 'none',
                  }}
                />
              )}

              {countdown.isEnded ? (
                <span className="text-white/30 uppercase tracking-[0.15em]">
                  Drop Concluded
                </span>
              ) : isPurchasing ? (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span
                    className="text-white/70 tracking-wide"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                  >
                    {purchaseStage === 0
                      ? 'Reserving your edition...'
                      : purchaseStage === 1
                        ? 'Authenticating ownership...'
                        : 'Acquired.'}
                  </span>
                </span>
              ) : (
                <span className="text-white">
                  {dropPhase === 'CRITICAL'
                    ? 'Collect Now'
                    : dropPhase === 'CLOSING'
                      ? 'Closing Soon — Collect Now'
                      : 'Own This Piece of History'}
                  <span className={dropPhase === 'CRITICAL' ? 'text-white/60' : 'text-white/40'}>
                    {' '}&mdash; ${selectedTier.price}
                  </span>
                </span>
              )}
            </button>

            {/* Supply narrative — editorial urgency / ended wrap-up */}
            <p
              className="mt-5 text-[13px] tracking-wide transition-colors duration-500"
              style={{
                color: countdown.isEnded
                  ? 'rgba(255,255,255,0.2)'
                  : (moment.editionsClaimed / moment.editionSize) >= 0.8
                    ? '#F59E0B90'
                    : 'rgba(255,255,255,0.25)',
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
              }}
            >
              {countdown.isEnded
                ? `${moment.editionsClaimed.toLocaleString()} collectors secured a piece of this moment`
                : supplyNarrative(moment.editionsClaimed, moment.editionSize)}
            </p>

            {/* Competition signal + checkout reassurance */}
            {!countdown.isEnded && (
              <>
                <p className="mt-2 text-[11px] text-white/20 tabular-nums">
                  {recentCollectors} collectors joined in the last minute
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/12">
                  Registered collector &middot; Instant acquisition
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tier Card
// ═══════════════════════════════════════════════════════════════════════════

// Editorial taglines per tier — Sotheby's catalog energy
const TIER_TAGLINE: Record<string, string> = {
  Open: 'Collector Edition',
  Rare: 'Limited Series',
  Legendary: 'Museum Edition',
  Ultimate: 'Vault Reserve',
};

// Rarity diamond count — visual hierarchy
const TIER_DIAMONDS: Record<string, number> = {
  Open: 0,
  Rare: 1,
  Legendary: 2,
  Ultimate: 3,
};

function TierCard({
  tier,
  isSelected,
  teamColor,
  rgb,
  onSelect,
}: {
  tier: RarityTier;
  isSelected: boolean;
  teamColor: string;
  rgb: string;
  onSelect: () => void;
}) {
  const isPremium = tier.tier === 'Legendary' || tier.tier === 'Ultimate';
  const isLowStock = tier.remaining <= 5;
  const diamonds = TIER_DIAMONDS[tier.tier] ?? 0;

  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col items-start rounded-lg border p-4 text-left transition-all duration-300 overflow-hidden active:scale-[0.97] md:p-5 ${
        isPremium && isSelected ? 'broadcast-tier-shimmer' : ''
      }`}
      style={{
        borderColor: isSelected
          ? isLowStock ? '#F59E0B' : teamColor
          : 'rgba(255,255,255,0.06)',
        backgroundColor: isSelected
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(255,255,255,0.015)',
        boxShadow: isSelected
          ? isLowStock
            ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(245,158,11,0.12)`
            : `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px rgba(${rgb},0.10)`
          : 'none',
      }}
    >
      {/* Team-color top accent when selected */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          backgroundColor: isLowStock && isSelected ? '#F59E0B' : teamColor,
          opacity: isSelected ? 1 : 0,
        }}
      />

      {/* Tier name + diamonds */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {tier.tier}
        </span>
        {diamonds > 0 && (
          <span className="flex gap-0.5">
            {Array.from({ length: diamonds }).map((_, i) => (
              <span
                key={i}
                className="inline-block w-[5px] h-[5px] rotate-45"
                style={{
                  backgroundColor: isSelected ? teamColor : 'rgba(255,255,255,0.15)',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Editorial tagline */}
      <span className="mt-1 text-[9px] tracking-[0.12em] text-white/20"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
      >
        {TIER_TAGLINE[tier.tier] ?? tier.tier}
      </span>

      {/* Price */}
      <span className="mt-3 text-2xl font-bold text-white md:text-3xl">
        ${tier.price}
      </span>

      {/* Edition context — "X of Y" format feels more prestige than just "X left" */}
      <span
        className={`mt-2 text-[11px] tabular-nums tracking-wide transition-colors duration-300 ${
          isLowStock ? 'text-[#F59E0B] font-semibold' : 'text-white/25'
        }`}
      >
        {isLowStock ? (
          <span className={isSelected ? 'broadcast-low-stock-pulse' : ''}>
            {tier.remaining === 1 ? 'Final edition' : `Only ${tier.remaining} remain`}
          </span>
        ) : (
          <span>{tier.remaining.toLocaleString()} of {tier.size.toLocaleString()}</span>
        )}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Loading Dots — premium purchasing animation
// ═══════════════════════════════════════════════════════════════════════════

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-white/40"
          style={{
            animation: 'broadcast-dot 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes broadcast-dot {
          0%, 80%, 100% { opacity: 0.15; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Certificate of Ownership — Confirmed State
// Museum-grade prestige. Not a receipt — a certificate.
// ═══════════════════════════════════════════════════════════════════════════

function CertificateScreen({
  moment,
  tier,
  editionNumber,
  purchaseTime,
  rgb,
  onReset,
}: {
  moment: Moment;
  tier: RarityTier;
  editionNumber: number;
  purchaseTime: number | null;
  rgb: string;
  onReset: () => void;
}) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=hero, 2=details, 3=cert, 4=share
  useEffect(() => {
    const t0 = setTimeout(() => setPhase(1), 50);
    const t1 = setTimeout(() => setPhase(2), 600);
    const t2 = setTimeout(() => setPhase(3), 1200);
    const t3 = setTimeout(() => setPhase(4), 2000);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const dateStr = useMemo(() => {
    const d = purchaseTime ? new Date(purchaseTime) : new Date();
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [purchaseTime]);

  return (
    <div className="relative min-h-dvh bg-[#0B0E14] text-white overflow-hidden">
      {/* ── Cinematic hero backdrop ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-[2s] ease-out"
        style={{
          backgroundImage: `url(${moment.actionImageUrl})`,
          backgroundPosition: 'center 25%',
          opacity: phase >= 1 ? 0.12 : 0,
          transform: phase >= 1 ? 'scale(1.02)' : 'scale(1.08)',
          filter: 'grayscale(0.3)',
        }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'linear-gradient(to bottom, rgba(11,14,20,0.5) 0%, #0B0E14 55%)',
      }} />

      {/* Team-color cinematic wash */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-[1.5s]"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 25%, rgba(${rgb},0.12) 0%, transparent 70%)`,
          opacity: phase >= 1 ? 1 : 0,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center min-h-dvh">

        {/* ── TOP: Broadcast "COLLECTED" announcement ── */}
        <div
          className="w-full pt-16 pb-8 px-5 text-center transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {/* COLLECTED banner — broadcast lower-third energy */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-[2px] w-8" style={{ backgroundColor: moment.teamColors.primary }} />
            <span
              className="text-[11px] font-bold uppercase tracking-[0.35em]"
              style={{ color: moment.teamColors.primary, fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Collected
            </span>
            <div className="h-[2px] w-8" style={{ backgroundColor: moment.teamColors.primary }} />
          </div>

          {/* Player name — massive broadcast headline */}
          <h1
            className="text-[clamp(3rem,11vw,6rem)] uppercase leading-[0.88] tracking-tight"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 700,
              textShadow: `0 2px 40px rgba(${rgb},0.3)`,
            }}
          >
            {moment.player}
          </h1>

          {/* Stat line — flies in */}
          <p
            className="mt-3 text-lg tracking-wide text-white/60 transition-all duration-600 ease-out"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              fontWeight: 500,
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            {moment.statLine}
          </p>

          {/* Context */}
          <p
            className="mt-1.5 text-sm text-white/30 tracking-wide transition-all duration-500"
            style={{
              opacity: phase >= 2 ? 1 : 0,
            }}
          >
            {fullTeam(moment.team)} vs {fullTeam(moment.opponent)}
          </p>
        </div>

        {/* ── CERTIFICATE CARD — slides up from below ── */}
        <div
          className="w-full max-w-md mx-auto px-5 transition-all duration-800 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          <div
            className="rounded-lg border p-7 sm:p-9 relative overflow-hidden"
            style={{
              borderColor: `rgba(${rgb},0.2)`,
              backgroundColor: 'rgba(20,25,37,0.8)',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 0 80px rgba(${rgb},0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Team-color top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: moment.teamColors.primary }}
            />

            {/* Certificate header */}
            <p className="text-center text-[9px] font-semibold uppercase tracking-[0.4em] text-white/30">
              Certificate of Ownership
            </p>

            {/* Tier tagline — editorial prestige */}
            <p
              className="text-center mt-2 text-[11px] tracking-[0.1em] text-white/20"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
            >
              {TIER_TAGLINE[tier.tier] ?? tier.tier}
            </p>

            {/* Accent rule */}
            <div
              className="mx-auto mt-4 mb-6 h-[1px] w-12"
              style={{ backgroundColor: `${moment.teamColors.primary}50` }}
            />

            {/* Edition — the star of the certificate */}
            <div className="text-center">
              {/* Diamonds for premium tiers */}
              {(TIER_DIAMONDS[tier.tier] ?? 0) > 0 && (
                <div className="flex items-center justify-center gap-1 mb-3">
                  {Array.from({ length: TIER_DIAMONDS[tier.tier] ?? 0 }).map((_, i) => (
                    <span
                      key={i}
                      className="inline-block w-[6px] h-[6px] rotate-45"
                      style={{ backgroundColor: moment.teamColors.primary }}
                    />
                  ))}
                </div>
              )}
              <span
                className="text-[42px] font-mono font-bold tabular-nums tracking-tight"
                style={{ color: moment.teamColors.primary }}
              >
                #{editionNumber.toLocaleString()}
              </span>
              <div className="mt-1 text-[11px] text-white/25 tracking-wide">
                of {tier.size.toLocaleString()} · {tier.tier} Edition
              </div>
            </div>

            {/* Divider */}
            <div className="mx-auto mt-5 mb-5 h-[1px] w-full bg-white/[0.06]" />

            {/* Play details — two-column broadcast style */}
            <div className="flex justify-between text-[11px] text-white/35 tracking-wide">
              <div>
                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/20 mb-0.5">Play</span>
                {moment.playType}
              </div>
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-[0.2em] text-white/20 mb-0.5">Date</span>
                {dateStr}
              </div>
            </div>

            {/* Flow auth line */}
            <div className="mt-5 flex items-center justify-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#00E5A0]/40" />
              <span className="text-[10px] tracking-wide text-white/20">
                Verified on Flow blockchain
              </span>
            </div>
          </div>
        </div>

        {/* ── SHARE — appears last ── */}
        <div
          className="mt-8 mb-12 flex flex-col items-center transition-all duration-600 ease-out"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <div className="flex items-center gap-3">
            <ShareButton label="Share on X" />
            <ShareButton label="Instagram" />
            <ShareButton label="Copy Link" />
          </div>

          <p className="mt-4 text-[10px] text-white/15 uppercase tracking-[0.2em]">
            Share your collection
          </p>

          <button
            onClick={onReset}
            className="mt-6 text-[10px] text-white/15 hover:text-white/30 transition-colors"
          >
            View another moment
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Small shared components
// ═══════════════════════════════════════════════════════════════════════════

function ShareButton({ label }: { label: string }) {
  return (
    <button
      className="rounded-md border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 text-xs font-medium tracking-wide text-white/40 transition-all hover:border-white/[0.16] hover:text-white/60"
      onClick={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );
}

