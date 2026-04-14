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

  const countdown = useCountdown(SALE_DURATION_MS[params.momentId as string] ?? 12 * 60 * 1000);
  const proto = usePrototypeState(momentId);

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
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
              backgroundSize: 'cover, cover',
              backgroundPosition: 'center top, center',
            }}
          />
          {/* Dark overlay from bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />

          {/* Top bar: "INSTANT CLASSIC" + LIVE badge + countdown */}
          <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between md:left-10 md:right-10 md:top-10">
            <div className="flex items-center gap-2.5">
              <div className="h-px w-6 bg-[#F59E0B]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F59E0B]">
                Instant Classic
              </span>
            </div>
            {/* LIVE badge + countdown */}
            <div className="flex items-center gap-3">
              {!countdown.isEnded && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-sm px-3 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    Live
                  </span>
                </div>
              )}
              <span
                className="font-mono text-sm font-semibold tabular-nums tracking-wider"
                style={{
                  color: countdown.isEnded
                    ? 'rgba(255,255,255,0.25)'
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
                className="h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${Math.min(100, (countdown.totalSeconds / ((SALE_DURATION_MS[momentId] ?? 720000) / 1000)) * 100)}%`,
                  background: `linear-gradient(90deg, ${moment.teamColors.primary}, ${moment.teamColors.secondary || moment.teamColors.primary})`,
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
              className="group relative w-full max-w-md overflow-hidden rounded-lg border px-8 py-4 text-center text-base font-semibold tracking-wide transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
              style={{
                borderColor: isPurchasing
                  ? 'rgba(255,255,255,0.12)'
                  : moment.teamColors.primary,
                backgroundColor: 'rgba(11,14,20,0.92)',
                boxShadow: isPurchasing
                  ? 'none'
                  : `0 0 20px rgba(${rgb},0.12), 0 0 60px rgba(${rgb},0.06)`,
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
                    `0 0 20px rgba(${rgb},0.12), 0 0 60px rgba(${rgb},0.06)`;
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    'rgba(11,14,20,0.92)';
                }
              }}
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-3">
                  <LoadingDots />
                  <span className="text-white/60">Acquiring...</span>
                </span>
              ) : (
                <span className="text-white">
                  Own This Piece of History
                  <span className="text-white/40">
                    {' '}&mdash; ${selectedTier.price}
                  </span>
                </span>
              )}
            </button>

            {/* Supply narrative — editorial urgency */}
            <p
              className="mt-5 text-[13px] tracking-wide transition-colors duration-500"
              style={{
                color: (moment.editionsClaimed / moment.editionSize) >= 0.8
                  ? '#F59E0B90'
                  : 'rgba(255,255,255,0.25)',
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
              }}
            >
              {supplyNarrative(moment.editionsClaimed, moment.editionSize)}
            </p>

            {/* Competition signal */}
            {!countdown.isEnded && (
              <p className="mt-2 text-[11px] text-white/20 tabular-nums">
                {recentCollectors} collectors joined in the last minute
              </p>
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
  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col items-start rounded-lg border p-4 text-left transition-all duration-200 overflow-hidden md:p-5"
      style={{
        borderColor: isSelected ? teamColor : 'rgba(255,255,255,0.06)',
        backgroundColor: isSelected
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(255,255,255,0.015)',
        boxShadow: isSelected
          ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px rgba(${rgb},0.10)`
          : 'none',
      }}
    >
      {/* Team-color top accent when selected */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{
          backgroundColor: teamColor,
          opacity: isSelected ? 1 : 0,
        }}
      />
      {/* Tier name */}
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {tier.tier}
      </span>

      {/* Price */}
      <span className="mt-2.5 text-2xl font-bold text-white md:text-3xl">
        ${tier.price}
      </span>

      {/* Remaining */}
      <span
        className={`mt-2.5 text-xs tracking-wide ${
          tier.remaining <= 5 ? 'text-[#F59E0B]' : 'text-white/25'
        }`}
      >
        {tierUrgencyLabel(tier.remaining)}
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
  rgb,
  onReset,
}: {
  moment: Moment;
  tier: RarityTier;
  editionNumber: number;
  rgb: string;
  onReset: () => void;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
  }, []);

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[#0B0E14] px-5 py-16 text-white">
      {/* Ambient team color glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 35% at 50% 50%, rgba(${rgb},0.05) 0%, transparent 70%)`,
        }}
      />

      {/* Certificate card */}
      <div
        className="relative z-10 w-full max-w-lg rounded-lg border p-8 sm:p-12 transition-all duration-700 ease-out"
        style={{
          borderColor: `rgba(${rgb},0.25)`,
          backgroundColor: 'rgba(20,25,37,0.85)',
          boxShadow: `0 0 60px rgba(${rgb},0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {/* Header — staggered entrance */}
        <p
          className="text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-white/35 transition-all duration-500 delay-100"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          Certificate of Ownership
        </p>

        {/* Accent rule — grows from center */}
        <div
          className="mx-auto mt-4 h-[1px] transition-all duration-700 delay-200"
          style={{
            backgroundColor: moment.teamColors.primary,
            width: show ? 56 : 0,
          }}
        />

        {/* Player name — Oswald broadcast style */}
        <h2
          className="mt-8 text-center text-4xl uppercase tracking-tight sm:text-5xl transition-all duration-500 delay-300"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            fontWeight: 700,
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          {moment.player}
        </h2>

        {/* Play details */}
        <p className="mt-2 text-center text-sm tracking-wide text-white/45">
          {moment.playType}
        </p>
        <p className="mt-1 text-center text-sm tracking-wide text-white/30">
          {fullTeam(moment.team)} vs {fullTeam(moment.opponent)}
        </p>

        {/* Edition block */}
        <div className="mt-8 rounded-md border border-white/[0.06] bg-white/[0.02] px-6 py-4 text-center">
          <p className="text-2xl font-bold tabular-nums">
            #{editionNumber.toLocaleString()}{' '}
            <span className="text-base font-normal text-white/35">
              of {tier.size.toLocaleString()}
            </span>
          </p>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-white/25">
            {tier.tier} Edition
          </p>
        </div>

        {/* Flow authentication */}
        <p className="mt-6 text-center text-[11px] tracking-wide text-white/20">
          Authenticated on Flow blockchain
        </p>

        {/* QR code placeholder */}
        <div className="mx-auto mt-5 flex h-[72px] w-[72px] items-center justify-center rounded border border-white/[0.08] bg-white/[0.02]">
          <QRPlaceholder />
        </div>

        {/* Share buttons */}
        <div className="mt-7 flex items-center justify-center gap-3">
          <ShareButton label="Share on X" />
          <ShareButton label="Copy Link" />
        </div>

        {/* Reset / back */}
        <button
          onClick={onReset}
          className="mt-8 block w-full text-center text-[10px] tracking-wide text-white/20 transition-colors hover:text-white/40"
        >
          View another moment
        </button>
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

function QRPlaceholder() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 40 40"
      fill="none"
      className="text-white/15"
    >
      <rect x="2" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="24" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="24" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="6" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="28" y="6" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="6" y="28" width="6" height="6" rx="0.5" fill="currentColor" />
      <rect x="24" y="24" width="4" height="4" fill="currentColor" />
      <rect x="30" y="24" width="4" height="4" fill="currentColor" />
      <rect x="24" y="30" width="4" height="4" fill="currentColor" />
      <rect x="34" y="30" width="4" height="4" fill="currentColor" />
      <rect x="30" y="34" width="4" height="4" fill="currentColor" />
    </svg>
  );
}
