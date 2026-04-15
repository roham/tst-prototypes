'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getMoment, SALE_DURATION_MS, MOMENTS } from '@/lib/mock-data';
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

// ── Broadcast Haptic — TV production control room feel ──────────────────
// Clean switcher button presses: precise, authoritative, deliberate.
// Not stomping (Arena) or restrained taps (Supreme). These are the confident
// clicks of a broadcast director punching between camera feeds.

function broadcastHaptic(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* silent */ }
  }
}

const BROADCAST_HAPTIC = {
  /** CTA press — authoritative switcher punch */
  ctaPress: () => broadcastHaptic(14),
  /** Tier channel switch — clean channel-change click */
  channelSwitch: () => broadcastHaptic([8, 20, 8]),
  /** Purchase stage advance — escalating production cue */
  purchaseStage: (stage: number) =>
    broadcastHaptic(stage === 0 ? 12 : stage === 1 ? 20 : [18, 30, 18, 30, 25]),
  /** Acquired confirmation — broadcast wrap double-tap */
  acquired: () => broadcastHaptic([18, 40, 25]),
  /** Phase transition — dramatic bumper hit */
  phaseBumper: (to: 'CLOSING' | 'CRITICAL') =>
    broadcastHaptic(to === 'CRITICAL' ? [25, 20, 25, 20, 30] : [15, 30, 15]),
  /** Special Report alert — news alert double-pulse */
  specialReport: () => broadcastHaptic([12, 25, 12]),
  /** Countdown leader digit — production count pulse */
  leaderDigit: () => broadcastHaptic(10),
  /** Share button — quick production tap */
  share: () => broadcastHaptic(6),
} as const;

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

// Teleprompter typewriter reveal — types text character-by-character like a broadcast prompter
function useTypewriter(text: string, started: boolean, speed = 28) {
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!started) { setCharIndex(0); setDone(false); return; }
    if (charIndex >= text.length) { setDone(true); return; }
    const id = setTimeout(() => setCharIndex((prev) => prev + 1), speed);
    return () => clearTimeout(id);
  }, [text, started, charIndex, speed]);
  return { displayText: text.slice(0, charIndex), done, started };
}

// SMPTE timecode — running production counter (HH:MM:SS:FF format)
function useSmpteTimecode(isEnded: boolean) {
  const [tc, setTc] = useState('00:00:00:00');
  const startRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (isEnded) return;
    startRef.current = performance.now();
    function tick() {
      const elapsed = performance.now() - startRef.current;
      const totalFrames = Math.floor(elapsed / (1000 / 30)); // 30fps
      const ff = totalFrames % 30;
      const totalSec = Math.floor(totalFrames / 30);
      const ss = totalSec % 60;
      const mm = Math.floor(totalSec / 60) % 60;
      const hh = Math.floor(totalSec / 3600);
      setTc(
        `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isEnded]);
  return tc;
}

// ── Broadcast Countdown Leader — "3-2-1-LIVE" intro sequence ──────────────
// Classic broadcast TV countdown leader that plays on first page load.
// Every sports fan recognizes this from live TV production.

function BroadcastCountdownLeader({ teamColor, rgb, onComplete }: {
  teamColor: string; rgb: string; onComplete: () => void;
}) {
  const [digit, setDigit] = useState<number | null>(3);
  const [flash, setFlash] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 3 → 2 → 1 → LIVE → fade out (with production haptic on each count)
    const t1 = setTimeout(() => { setFlash(true); BROADCAST_HAPTIC.leaderDigit(); }, 380);
    const t1b = setTimeout(() => { setFlash(false); setDigit(2); }, 480);
    const t2 = setTimeout(() => { setFlash(true); BROADCAST_HAPTIC.leaderDigit(); }, 860);
    const t2b = setTimeout(() => { setFlash(false); setDigit(1); }, 960);
    const t3 = setTimeout(() => { setFlash(true); BROADCAST_HAPTIC.leaderDigit(); }, 1340);
    const t3b = setTimeout(() => { setFlash(false); setDigit(null); setShowLive(true); BROADCAST_HAPTIC.acquired(); }, 1440);
    const t4 = setTimeout(() => setFading(true), 1900);
    const t5 = setTimeout(() => onComplete(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t1b); clearTimeout(t2); clearTimeout(t2b); clearTimeout(t3); clearTimeout(t3b); clearTimeout(t4); clearTimeout(t5); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0E14]"
      style={{
        animation: fading ? 'broadcast-leader-fade-out 0.4s ease-out forwards' : 'none',
      }}
    >
      {/* Registration crosshair — classic film leader element */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '160px',
          height: '160px',
          animation: 'broadcast-leader-crosshair-spin 2.3s linear',
        }}
      >
        {/* Circle */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="72" stroke={`rgba(${rgb},0.12)`} strokeWidth="1" />
          <circle cx="80" cy="80" r="48" stroke={`rgba(${rgb},0.08)`} strokeWidth="0.5" />
          {/* Crosshair lines */}
          <line x1="80" y1="4" x2="80" y2="156" stroke={`rgba(${rgb},0.10)`} strokeWidth="0.5" />
          <line x1="4" y1="80" x2="156" y2="80" stroke={`rgba(${rgb},0.10)`} strokeWidth="0.5" />
          {/* Tick marks */}
          <line x1="80" y1="4" x2="80" y2="16" stroke={`rgba(${rgb},0.2)`} strokeWidth="1" />
          <line x1="80" y1="144" x2="80" y2="156" stroke={`rgba(${rgb},0.2)`} strokeWidth="1" />
          <line x1="4" y1="80" x2="16" y2="80" stroke={`rgba(${rgb},0.2)`} strokeWidth="1" />
          <line x1="144" y1="80" x2="156" y2="80" stroke={`rgba(${rgb},0.2)`} strokeWidth="1" />
        </svg>
      </div>

      {/* Flash between digits */}
      {flash && (
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={{ animation: 'broadcast-leader-flash 100ms ease-out forwards' }}
        />
      )}

      {/* Countdown digit */}
      {digit !== null && (
        <span
          key={digit}
          className="relative z-10 text-[120px] font-bold tabular-nums text-white/90"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            animation: 'broadcast-leader-digit 480ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
            textShadow: `0 0 40px rgba(${rgb},0.3)`,
          }}
        >
          {digit}
        </span>
      )}

      {/* LIVE badge — appears after 1 */}
      {showLive && (
        <div
          className="relative z-10 flex items-center gap-3"
          style={{ animation: 'broadcast-leader-digit 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <div
            className="h-[10px] w-[10px] rounded-full"
            style={{
              backgroundColor: '#EF4444',
              boxShadow: '0 0 12px rgba(239,68,68,0.6)',
            }}
          />
          <span
            className="text-[48px] font-bold uppercase tracking-[0.15em] text-white"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              textShadow: `0 0 30px rgba(${rgb},0.3)`,
            }}
          >
            Live
          </span>
        </div>
      )}

      {/* Production label — bottom */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <span
          className="text-[8px] font-mono uppercase tracking-[0.4em] text-white/10"
        >
          TST Broadcast · Program Leader
        </span>
      </div>
    </div>
  );
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

// Arena locations — broadcast geography identifier
const TEAM_ARENA: Record<string, { arena: string; city: string }> = {
  MIA: { arena: 'Kaseya Center', city: 'Miami, FL' },
  BOS: { arena: 'TD Garden', city: 'Boston, MA' },
  DEN: { arena: 'Ball Arena', city: 'Denver, CO' },
  LAL: { arena: 'Crypto.com Arena', city: 'Los Angeles, CA' },
  OKC: { arena: 'Paycom Center', city: 'Oklahoma City, OK' },
  PHX: { arena: 'Footprint Center', city: 'Phoenix, AZ' },
};

// Score Update alerts — other games' results shown during the broadcast
// ESPN/TNT flash "SCORE UPDATE" alerts during live games with results from
// around the league. These one-shot notifications reinforce the live broadcast
// illusion: you're watching a real telecast with a full production team.
const SCORE_UPDATES: Record<string, { away: string; home: string; awayScore: number; homeScore: number; status: string }> = {
  bam:   { away: 'LAL', home: 'PHX', awayScore: 104, homeScore: 98, status: '4TH — 3:22' },
  jokic: { away: 'MIA', home: 'BOS', awayScore: 96, homeScore: 101, status: 'FINAL' },
  sga:   { away: 'DEN', home: 'LAL', awayScore: 112, homeScore: 108, status: '4TH — 1:45' },
};

// Plausible game scores for score bug (derived from moment context)
// Quarter-by-quarter breakdown adds broadcast depth
const GAME_SCORES: Record<string, {
  home: number; away: number;
  quarters: { home: number[]; away: number[] };
}> = {
  bam:   { home: 108, away: 101, quarters: { home: [28, 24, 30, 26], away: [26, 27, 22, 26] } },
  jokic: { home: 122, away: 109, quarters: { home: [32, 28, 34, 28], away: [24, 31, 26, 28] } },
  sga:   { home: 118, away: 112, quarters: { home: [30, 26, 32, 30], away: [28, 30, 24, 30] } },
};

// Opponent team colors for score bug accent bars
const OPPONENT_COLORS: Record<string, string> = {
  BOS: '#007A33',
  LAL: '#552583',
  PHX: '#E56020',
};

// Per-moment iconic commentator calls — every great NBA moment has an iconic call
const COMMENTATOR_CALLS: Record<string, { call: string; announcer: string; network: string }> = {
  bam:   { call: 'THROWS IT DOWN!', announcer: 'Mike Breen', network: 'ESPN' },
  jokic: { call: 'ARE YOU KIDDING ME?!', announcer: 'Kevin Harlan', network: 'TNT' },
  sga:   { call: 'HE IS ON FIRE!', announcer: 'Mark Jones', network: 'ESPN' },
};

// ---------------------------------------------------------------------------
// Hero Ghost Text — dramatic ESPN-style watermark behind the lower-third.
// ESPN's premium graphics layer huge semi-transparent words behind highlights:
// "TRIPLE DOUBLE", "PLAYOFF RECORD", "CAREER HIGH". It's the broadcast
// equivalent of a magazine cover's oversized pull word. Creates emotional
// weight and editorial framing without adding UI clutter.
// ---------------------------------------------------------------------------
const HERO_GHOST_TEXT: Record<string, { word: string; subtext: string }> = {
  bam:   { word: 'POSTERIZED', subtext: 'SIGNATURE MOMENT' },
  jokic: { word: 'DAGGER', subtext: 'DEFINING PLAY' },
  sga:   { word: 'CLUTCH', subtext: 'TAKEOVER' },
};

// ---------------------------------------------------------------------------
// Sideline Report data — per-moment courtside reporter inserts.
// Every ESPN/TNT broadcast cuts to the sideline reporter for courtside color:
// injury updates, locker room intel, and emotional context the booth can't see.
// Lisa Salters, Katie George, Jorge Sedano — real ESPN sideline voices.
// ---------------------------------------------------------------------------

const SIDELINE_REPORTS: Record<string, { reporter: string; report: string; arena: string }> = {
  bam:   { reporter: 'Lisa Salters', report: 'I spoke with Erik Spoelstra at the break — he said Bam came into tonight with something to prove. You can see it in every possession.', arena: 'Kaseya Center, Miami' },
  jokic: { reporter: 'Katie George', report: 'The Nuggets bench hasn\u2019t stopped talking about that pass. Michael Malone told me this is the kind of play you can\u2019t coach — pure basketball IQ.', arena: 'Ball Arena, Denver' },
  sga:   { reporter: 'Jorge Sedano', report: 'Mark Daigneault just shook his head and smiled when I asked about SGA\u2019s fourth quarter. He said: \u201CWe just get out of his way.\u201D', arena: 'Paycom Center, OKC' },
};

// ---------------------------------------------------------------------------
// Breaking News Acquisition Cut-In — ESPN-style full-screen overlay during
// the 1.5s purchase processing window. Every ESPN breaking news interruption
// has: red stinger flash → "BREAKING NEWS" banner expanding from center →
// detail text wiping in → resolution. This transforms a generic loading state
// into a broadcast production event. Supreme has "lot clerk ceremony," Arena
// has "replay center review" — Broadcast has "breaking news cut-in."
// ---------------------------------------------------------------------------

function BreakingNewsCutIn({ moment, tier, purchaseStage, rgb }: {
  moment: Moment; tier: RarityTier; purchaseStage: number; rgb: string;
}) {
  return (
    <div className="fixed inset-0 z-[58] pointer-events-none flex items-center justify-center">
      {/* Dark backdrop — broadcast cuts to dark before graphics */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(11,14,20,${purchaseStage === 2 ? 0.88 : 0.92})`,
          transition: 'background-color 0.3s ease-out',
        }}
      />

      {/* Red stinger flash — the initial breaking news alert flash */}
      {purchaseStage === 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#EF4444',
            animation: 'broadcast-cutin-stinger 0.5s ease-out forwards',
          }}
        />
      )}

      {/* Confirmed green flash */}
      {purchaseStage === 2 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: '#00E5A0',
            animation: 'broadcast-cutin-confirmed-flash 0.4s ease-out forwards',
          }}
        />
      )}

      {/* Scanline sweep — production cut artifact */}
      <div
        className="absolute inset-x-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${rgb},0.15), transparent)`,
          animation: 'broadcast-cutin-scanline 0.8s ease-out forwards',
        }}
      />

      {/* Center banner — the core breaking news graphic */}
      <div
        className="relative z-10 w-full flex flex-col items-center"
        style={{
          animation: 'broadcast-cutin-band-expand 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          transformOrigin: 'center',
        }}
      >
        {/* Red accent lines — top and bottom bracket the banner */}
        <div
          className="w-full h-[2px]"
          style={{
            background: purchaseStage === 2
              ? `linear-gradient(90deg, transparent 10%, #00E5A0 50%, transparent 90%)`
              : `linear-gradient(90deg, transparent 10%, #EF4444 30%, ${moment.teamColors.primary} 50%, #EF4444 70%, transparent 90%)`,
            transition: 'background 0.3s ease-out',
          }}
        />

        {/* Banner body */}
        <div
          className="w-full py-6 px-4 flex flex-col items-center gap-3"
          style={{
            background: `linear-gradient(180deg, rgba(11,14,20,0.96) 0%, rgba(${rgb},0.06) 50%, rgba(11,14,20,0.96) 100%)`,
          }}
        >
          {/* Stage 0: BREAKING NEWS */}
          {purchaseStage === 0 && (
            <>
              <div className="flex items-center gap-2.5">
                {/* Red pulse dot */}
                <div
                  className="h-[8px] w-[8px] rounded-full"
                  style={{
                    backgroundColor: '#EF4444',
                    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                    animation: 'pulse 1s ease-in-out infinite',
                  }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.3em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#EF4444',
                    animation: 'broadcast-cutin-text-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
                  }}
                >
                  Breaking News
                </span>
              </div>
              <p
                className="text-[10px] uppercase tracking-[0.15em] text-white/30"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  animation: 'broadcast-cutin-detail-wipe 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
                }}
              >
                Acquisition in progress&hellip;
              </p>
            </>
          )}

          {/* Stage 1: Details wiping in — player + tier */}
          {purchaseStage === 1 && (
            <>
              <div className="flex items-center gap-2.5">
                <div
                  className="h-[8px] w-[8px] rounded-full"
                  style={{
                    backgroundColor: moment.teamColors.primary,
                    boxShadow: `0 0 8px rgba(${rgb},0.5)`,
                    animation: 'pulse 1s ease-in-out infinite',
                  }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: moment.teamColors.primary,
                    animation: 'broadcast-cutin-text-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  Live Acquisition
                </span>
              </div>
              <p
                className="text-[18px] font-bold uppercase tracking-[0.05em] text-white/90"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  animation: 'broadcast-cutin-detail-wipe 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
                }}
              >
                {moment.player}
              </p>
              <div
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-white/35"
                style={{
                  animation: 'broadcast-cutin-detail-wipe 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
                }}
              >
                <span style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                  {tier.tier} Edition
                </span>
                <span className="text-white/15">&middot;</span>
                <span className="font-mono tabular-nums">${tier.price}</span>
              </div>
              {/* Authenticating — broadcast verification text */}
              <p
                className="text-[9px] tracking-[0.2em] text-white/20 mt-1"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: 'italic',
                  animation: 'broadcast-cutin-detail-wipe 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both',
                }}
              >
                Authenticating ownership&hellip;
              </p>
            </>
          )}

          {/* Stage 2: CONFIRMED — resolution */}
          {purchaseStage === 2 && (
            <>
              <div className="flex items-center gap-2.5">
                {/* Green checkmark */}
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#00E5A0" strokeWidth="1.2" opacity="0.4" />
                  <path
                    d="M6 10.5 L9 13.5 L14 7"
                    stroke="#00E5A0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="broadcast-checkmark-draw"
                  />
                </svg>
                <span
                  className="text-[12px] font-bold uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#00E5A0',
                    animation: 'broadcast-cutin-text-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  }}
                >
                  Confirmed
                </span>
              </div>
              <p
                className="text-[15px] font-bold uppercase tracking-[0.05em] text-white/80"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  animation: 'broadcast-cutin-detail-wipe 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both',
                }}
              >
                {moment.player} &middot; {tier.tier}
              </p>
              <p
                className="text-[10px] font-mono tabular-nums text-white/30"
                style={{
                  animation: 'broadcast-cutin-detail-wipe 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both',
                }}
              >
                Edition #{(moment.editionsClaimed + 1).toLocaleString()} &middot; ${tier.price}
              </p>
            </>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          className="w-full h-[2px]"
          style={{
            background: purchaseStage === 2
              ? `linear-gradient(90deg, transparent 10%, #00E5A0 50%, transparent 90%)`
              : `linear-gradient(90deg, transparent 10%, #EF4444 30%, ${moment.teamColors.primary} 50%, #EF4444 70%, transparent 90%)`,
            transition: 'background 0.3s ease-out',
          }}
        />

        {/* SMPTE timecode — production technical detail */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="h-[5px] w-[5px] rounded-full"
            style={{
              backgroundColor: purchaseStage === 2 ? '#00E5A0' : '#EF4444',
              opacity: 0.4,
            }}
          />
          <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/12">
            TST Broadcast &middot; Live Acquisition
          </span>
        </div>
      </div>

      {/* BottomLine News Ticker — ESPN's continuous scrolling crawl */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[59] overflow-hidden"
        style={{
          height: '26px',
          backgroundColor: purchaseStage === 2 ? 'rgba(0,229,160,0.12)' : 'rgba(239,68,68,0.08)',
          borderTop: `1px solid ${purchaseStage === 2 ? 'rgba(0,229,160,0.25)' : 'rgba(239,68,68,0.2)'}`,
          transition: 'background-color 0.3s, border-color 0.3s',
        }}
      >
        {/* Red/teal "LIVE" label — fixed left anchor */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-2.5"
          style={{
            backgroundColor: purchaseStage === 2 ? '#00E5A0' : '#EF4444',
          }}
        >
          <span
            className="text-[8px] font-bold uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: purchaseStage === 2 ? '#0B0E14' : '#FFFFFF',
            }}
          >
            {purchaseStage === 2 ? 'DONE' : 'LIVE'}
          </span>
        </div>
        {/* Scrolling ticker text */}
        <div
          className="absolute top-0 bottom-0 flex items-center whitespace-nowrap"
          style={{
            left: '52px',
            animation: 'broadcast-ticker-scroll 18s linear infinite',
          }}
        >
          {[0, 1].map((copy) => (
            <span
              key={copy}
              className="inline-flex items-center gap-4 mr-8 text-[9px] uppercase tracking-[0.1em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: 'rgba(240,242,245,0.5)',
              }}
            >
              <span style={{ color: purchaseStage === 2 ? '#00E5A0' : moment.teamColors.primary }}>
                {purchaseStage === 2 ? '✓ ACQUISITION CONFIRMED' : '● BREAKING'}
              </span>
              <span className="text-white/20">|</span>
              <span>{moment.player} — {moment.statLine}</span>
              <span className="text-white/20">|</span>
              <span>{tier.tier} Edition · #{(moment.editionsClaimed + 1).toLocaleString()} of {tier.size.toLocaleString()}</span>
              <span className="text-white/20">|</span>
              <span>{moment.team} vs {moment.opponent} · {moment.playType}</span>
              <span className="text-white/20">|</span>
              <span style={{ color: 'rgba(240,242,245,0.3)' }}>
                {purchaseStage === 0 ? 'Processing transaction...' : purchaseStage === 1 ? 'Verifying authenticity...' : 'Added to collection'}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast Bumper — ESPN production transition between purchase and W screen
// In real TV production, segments transition through a "bumper" — a brief
// animated slate with the show's branding, team graphics, and a swoosh wipe.
// This plays when purchasing→confirmed, creating the beat that Supreme fills
// with the gavel-fall curtain and Arena fills with the blackout blast.
// ---------------------------------------------------------------------------

function BroadcastBumper({ teamColor, rgb, playerName }: {
  teamColor: string; rgb: string; playerName: string;
}) {
  const [phase, setPhase] = useState<'swoosh' | 'slate' | 'done'>('swoosh');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('slate'), 350);
    const t2 = setTimeout(() => setPhase('done'), 950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(11,14,20,0.95)' }}
      />

      {/* Swoosh wipe — diagonal team-color band sweeps across screen */}
      {phase === 'swoosh' && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, transparent 0%, transparent 35%, ${teamColor} 48%, rgba(${rgb},0.6) 52%, transparent 65%, transparent 100%)`,
            animation: 'broadcast-bumper-swoosh 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      )}

      {/* Production slate — "COLLECTED" centered text */}
      {phase === 'slate' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {/* Horizontal accent line — top */}
          <div
            className="h-[1px] w-[120px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${teamColor}60, transparent)`,
              animation: 'broadcast-bumper-line 0.4s ease-out forwards',
            }}
          />
          {/* COLLECTED text */}
          <span
            className="text-[28px] font-bold uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: '#00E5A0',
              textShadow: '0 0 30px rgba(0,229,160,0.3)',
              animation: 'broadcast-bumper-text 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            Collected
          </span>
          {/* Player name subtitle */}
          <span
            className="text-[11px] uppercase tracking-[0.2em] text-white/30"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              animation: 'broadcast-bumper-text 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both',
            }}
          >
            {playerName}
          </span>
          {/* Horizontal accent line — bottom */}
          <div
            className="h-[1px] w-[120px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${teamColor}60, transparent)`,
              animation: 'broadcast-bumper-line 0.4s ease-out forwards',
            }}
          />
          {/* Production label */}
          <span
            className="text-[7px] font-mono uppercase tracking-[0.3em] text-white/10 mt-2"
          >
            TST Broadcast &middot; Special Report
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Commentator Call Banner — iconic play-by-play announcer call on replay
// ESPN/TNT replays always overlay the announcer's call as a dramatic text
// treatment. "BANG!" "ARE YOU KIDDING ME?!" "THROWS IT DOWN!" — the voice
// made visual. Slams in from left after replay tag, with audio wave bars.
// ---------------------------------------------------------------------------

function CommentatorCallBanner({ momentId, teamColor, rgb }: {
  momentId: string; teamColor: string; rgb: string;
}) {
  const [phase, setPhase] = useState<'waiting' | 'in' | 'holding' | 'out' | 'done'>('waiting');
  const callData = COMMENTATOR_CALLS[momentId] ?? COMMENTATOR_CALLS.bam;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('in'), 5200);     // After replay tag + telestrator
    const t2 = setTimeout(() => setPhase('holding'), 6000); // Fully in
    const t3 = setTimeout(() => setPhase('out'), 8500);     // Hold 2.5s
    const t4 = setTimeout(() => setPhase('done'), 9200);    // Fade complete
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === 'done' || phase === 'waiting') return null;

  return (
    <div
      className="absolute left-0 right-0 z-[22] pointer-events-none"
      style={{
        top: '52%',
        animation: phase === 'out'
          ? 'broadcast-call-fade-out 0.7s ease-in forwards'
          : 'broadcast-call-slam-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div className="flex items-stretch max-w-[85%]">
        {/* Team-color accent bar — left edge */}
        <div
          className="w-[4px] flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        />
        <div
          className="relative flex items-center gap-3 px-5 py-3 overflow-hidden"
          style={{
            backgroundColor: 'rgba(11,14,20,0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: `4px 0 20px rgba(0,0,0,0.4), inset 0 0 0 0.5px rgba(${rgb},0.1)`,
          }}
        >
          {/* Audio waveform bars — behind text, simulating live mic */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-[2px] opacity-[0.06]">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="w-[2.5px] rounded-full"
                style={{
                  height: `${14 + Math.sin(i * 0.8) * 10}px`,
                  backgroundColor: teamColor,
                  animation: `broadcast-call-wave ${0.3 + (i % 5) * 0.08}s ease-in-out ${i * 0.04}s infinite`,
                  transformOrigin: 'center',
                }}
              />
            ))}
          </div>
          {/* Mic icon — small broadcast microphone indicator */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            className="flex-shrink-0"
            style={{ opacity: 0.35 }}
          >
            <rect x="9" y="2" width="6" height="12" rx="3" stroke={teamColor} strokeWidth="1.5" />
            <path d="M5 11a7 7 0 0014 0" stroke={teamColor} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="18" x2="12" y2="22" stroke={teamColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {/* Call text — dramatic Oswald */}
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[clamp(1.1rem,4vw,1.5rem)] font-bold uppercase tracking-[0.08em] leading-tight text-white/90"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                textShadow: `0 0 20px rgba(${rgb},0.25)`,
              }}
            >
              &ldquo;{callData.call}&rdquo;
            </span>
            <span
              className="text-[8px] uppercase tracking-[0.25em]"
              style={{
                color: `rgba(${rgb},0.5)`,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
              }}
            >
              &mdash; {callData.announcer}, {callData.network}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sideline Report Insert — courtside reporter graphic on hero.
// Appears after the commentator call fades (~10.5s). The sideline reporter
// is the broadcast's courtside voice: emotional context, coach quotes,
// locker room intel. Every ESPN/TNT game has 2-3 sideline inserts per half.
// Visual: left-anchored card with reporter circle avatar, name badge, and
// one-line report in Georgia serif italic. Slides in from left, holds, exits.
// ---------------------------------------------------------------------------

function SidelineReportInsert({ momentId, teamColor, rgb }: {
  momentId: string; teamColor: string; rgb: string;
}) {
  const [phase, setPhase] = useState<'waiting' | 'in' | 'holding' | 'out' | 'done'>('waiting');
  const data = SIDELINE_REPORTS[momentId] ?? SIDELINE_REPORTS.bam;

  useEffect(() => {
    // Sequence: in at 10.5s (after commentator call exits at ~9.2s), hold 3.5s, out
    const t1 = setTimeout(() => setPhase('in'), 10500);
    const t2 = setTimeout(() => setPhase('holding'), 11300);
    const t3 = setTimeout(() => setPhase('out'), 14800);
    const t4 = setTimeout(() => setPhase('done'), 15600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === 'done' || phase === 'waiting') return null;

  return (
    <div
      className="absolute left-0 right-0 z-[21] pointer-events-none"
      style={{
        top: '56%',
        animation: phase === 'out'
          ? 'broadcast-call-fade-out 0.7s ease-in forwards'
          : 'broadcast-sideline-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div className="flex items-stretch max-w-[88%]">
        {/* Team-color accent bar — left edge, thinner than commentator call */}
        <div
          className="w-[3px] flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        />
        <div
          className="relative flex items-center gap-3 px-4 py-2.5 overflow-hidden"
          style={{
            backgroundColor: 'rgba(11,14,20,0.88)',
            backdropFilter: 'blur(10px)',
            boxShadow: `4px 0 16px rgba(0,0,0,0.35), inset 0 0 0 0.5px rgba(${rgb},0.08)`,
          }}
        >
          {/* Reporter avatar circle — initial letter, ESPN sideline reporter style */}
          <div
            className="flex-shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `rgba(${rgb},0.15)`,
              border: `1px solid ${teamColor}40`,
            }}
          >
            <span
              className="text-[11px] font-bold"
              style={{ color: teamColor, fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {data.reporter.charAt(0)}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-0.5 min-w-0">
            {/* Reporter name + SIDELINE badge */}
            <div className="flex items-center gap-2">
              <span
                className="text-[8px] font-bold uppercase tracking-[0.25em] px-1.5 py-px rounded-sm"
                style={{
                  backgroundColor: `rgba(${rgb},0.18)`,
                  color: teamColor,
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                Sideline
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/60"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {data.reporter}
              </span>
            </div>
            {/* Report text — Georgia italic, courtside voice */}
            <p
              className="text-[10px] leading-[1.4] text-white/50"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: 'italic',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}
            >
              {data.report}
            </p>
            {/* Location — courtside + arena */}
            <span className="text-[7px] uppercase tracking-[0.2em] text-white/20">
              Courtside &middot; {data.arena}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Camera Flash Sparkles — press cameras firing in the crowd.
// Every iconic NBA moment has thousands of camera flashes popping in the
// stands. This overlays the hero with random brief flash bursts that create
// the feeling of a packed arena reacting to the play. Density increases
// during CLOSING/CRITICAL phases (crowd excitement). Flashes appear mostly
// in the upper portion of the hero (where the crowd sits).
// Distinctly Broadcast: Supreme has dust motes (gallery), Arena has confetti.
// Broadcast has press cameras — literal broadcast production equipment.
// ---------------------------------------------------------------------------

function CameraFlashSparkles({ phase, rgb }: { phase: DropPhase; rgb: string }) {
  const [flashes, setFlashes] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    if (phase === 'ENDED') return;
    // Base interval: OPEN=2.2s, CLOSING=1.4s, CRITICAL=0.8s (more excitement)
    const baseInterval = phase === 'CRITICAL' ? 800 : phase === 'CLOSING' ? 1400 : 2200;
    // Spawn 1-3 flashes per burst
    const spawnBurst = () => {
      const count = phase === 'CRITICAL' ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
      const burst: typeof flashes = [];
      for (let i = 0; i < count; i++) {
        counterRef.current += 1;
        burst.push({
          id: counterRef.current,
          x: 8 + Math.random() * 84,         // 8-92% horizontal spread
          y: 5 + Math.random() * 40,          // 5-45% vertical (upper crowd area)
          size: 2 + Math.random() * 4,        // 2-6px flash radius
          delay: Math.random() * 200,         // stagger within burst
        });
      }
      setFlashes(prev => [...prev.slice(-12), ...burst]); // keep max 15 active
    };

    spawnBurst(); // initial burst
    const id = setInterval(spawnBurst, baseInterval + Math.random() * 400);
    return () => clearInterval(id);
  }, [phase]);

  // Clean up expired flashes
  useEffect(() => {
    if (flashes.length === 0) return;
    const id = setTimeout(() => {
      setFlashes(prev => prev.slice(Math.max(0, prev.length - 10)));
    }, 800);
    return () => clearTimeout(id);
  }, [flashes.length]);

  if (phase === 'ENDED') return null;

  return (
    <div className="absolute inset-0 z-[7] pointer-events-none overflow-hidden">
      {flashes.map(f => (
        <div
          key={f.id}
          className="absolute rounded-full"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px rgba(255,255,255,0.6), 0 0 ${f.size * 6}px ${f.size * 2}px rgba(${rgb},0.2)`,
            animation: `broadcast-camera-flash 600ms ease-out ${f.delay}ms forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// Live game clock — ticks down through Q4 while the drop is active
function useGameClock(isEnded: boolean) {
  // Start at ~2:00 remaining in Q4 and tick down
  const [seconds, setSeconds] = useState(120);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const initialRef = useRef(120);

  useEffect(() => {
    if (isEnded) { setSeconds(0); return; }
    startRef.current = performance.now();
    initialRef.current = 120;
    function tick() {
      const elapsed = (performance.now() - startRef.current) / 1000;
      // Game clock runs ~3x slower than real time for dramatic effect
      const remaining = Math.max(0, initialRef.current - elapsed / 3);
      setSeconds(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isEnded]);

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return {
    display: seconds <= 0 ? 'FINAL' : `${mins}:${secs.toString().padStart(2, '0')}`,
    isFinal: seconds <= 0,
    isLastMinute: seconds > 0 && seconds <= 60,
  };
}

// ── Broadcast Score Bug — persistent game score overlay (ESPN/TNT style) ──
// Authentic ESPN score bug: team-color accent bars, live game clock,
// possession arrow, quarter-by-quarter mini scores.

function ScoreBug({ moment, isEnded, teamColor, rgb, dropPhase }: {
  moment: Moment; isEnded: boolean; teamColor: string; rgb: string; dropPhase: DropPhase;
}) {
  const scores = GAME_SCORES[moment.id] ?? {
    home: 110, away: 104,
    quarters: { home: [28, 26, 30, 26], away: [24, 28, 26, 26] },
  };
  const gameClock = useGameClock(isEnded);
  const oppColor = OPPONENT_COLORS[moment.opponent] ?? '#6B7A99';
  // Possession arrow alternates every ~8s for realism
  const [possession, setPossession] = useState<'home' | 'away'>('home');
  useEffect(() => {
    if (isEnded || gameClock.isFinal) return;
    const id = setInterval(() => {
      setPossession((p) => p === 'home' ? 'away' : 'home');
    }, 6000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [isEnded, gameClock.isFinal]);

  return (
    <div
      className="fixed top-14 left-4 z-40 pointer-events-none broadcast-score-bug md:top-16 md:left-6"
      style={{ opacity: isEnded ? 0.25 : 0.85, transition: 'opacity 0.7s ease' }}
    >
      <div
        className="rounded-sm overflow-hidden"
        style={{
          backgroundColor: 'rgba(11,14,20,0.94)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
          minWidth: '138px',
        }}
      >
        {/* Home team row — with team-color left accent */}
        <div className="flex items-stretch border-b border-white/[0.04]">
          <div className="w-[3px] flex-shrink-0" style={{ backgroundColor: teamColor }} />
          <div className="flex-1 flex items-center justify-between gap-3 px-2.5 py-[5px]">
            <div className="flex items-center gap-1.5">
              {/* Possession arrow */}
              {!gameClock.isFinal && possession === 'home' && (
                <svg width="5" height="8" viewBox="0 0 5 8" className="flex-shrink-0" style={{ opacity: 0.7 }}>
                  <polygon points="0,0 5,4 0,8" fill={teamColor} />
                </svg>
              )}
              {!gameClock.isFinal && possession !== 'home' && <div className="w-[5px] flex-shrink-0" />}
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {moment.team}
              </span>
            </div>
            <span
              className="text-[12px] font-bold tabular-nums text-white"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {scores.home}
            </span>
          </div>
        </div>
        {/* Away team row — with opponent-color left accent */}
        <div className="flex items-stretch border-b border-white/[0.04]">
          <div className="w-[3px] flex-shrink-0" style={{ backgroundColor: oppColor, opacity: 0.6 }} />
          <div className="flex-1 flex items-center justify-between gap-3 px-2.5 py-[5px]">
            <div className="flex items-center gap-1.5">
              {!gameClock.isFinal && possession === 'away' && (
                <svg width="5" height="8" viewBox="0 0 5 8" className="flex-shrink-0" style={{ opacity: 0.5 }}>
                  <polygon points="0,0 5,4 0,8" fill={oppColor} />
                </svg>
              )}
              {!gameClock.isFinal && possession !== 'away' && <div className="w-[5px] flex-shrink-0" />}
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-white/45"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {moment.opponent}
              </span>
            </div>
            <span
              className="text-[11px] font-bold tabular-nums text-white/55"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {scores.away}
            </span>
          </div>
        </div>
        {/* Game clock + quarter status bar */}
        <div
          className="flex items-center justify-between px-2.5 py-[3px] border-b"
          style={{
            borderColor: `rgba(${rgb},0.12)`,
            backgroundColor: `rgba(${rgb},0.06)`,
          }}
        >
          <span
            className="text-[8px] font-bold uppercase tracking-[0.2em]"
            style={{
              color: gameClock.isFinal ? teamColor : 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            {gameClock.isFinal ? 'Final' : '4th'}
          </span>
          <span
            className="font-mono text-[9px] font-bold tabular-nums tracking-wider"
            style={{
              color: gameClock.isLastMinute
                ? '#EF4444'
                : gameClock.isFinal
                  ? teamColor
                  : 'rgba(255,255,255,0.6)',
              animation: gameClock.isLastMinute ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          >
            {gameClock.display}
          </span>
        </div>
        {/* Quarter-by-quarter mini scores */}
        <div className="flex items-center px-1.5 py-[2px] gap-0">
          <span className="text-[6px] text-white/15 w-[18px] font-mono" />
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <span
              key={q}
              className="text-[6px] font-mono text-white/20 text-center tabular-nums"
              style={{ width: '24px' }}
            >
              {q}
            </span>
          ))}
        </div>
        {/* Home quarter scores */}
        <div className="flex items-center px-1.5 pb-[1px] gap-0">
          <span
            className="text-[6px] font-bold text-white/30 w-[18px]"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {moment.team}
          </span>
          {scores.quarters.home.map((q, i) => (
            <span
              key={i}
              className="text-[7px] font-mono tabular-nums text-center"
              style={{
                width: '24px',
                color: q > scores.quarters.away[i] ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {q}
            </span>
          ))}
        </div>
        {/* Away quarter scores */}
        <div className="flex items-center px-1.5 pb-1 gap-0">
          <span
            className="text-[6px] font-bold text-white/20 w-[18px]"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {moment.opponent}
          </span>
          {scores.quarters.away.map((q, i) => (
            <span
              key={i}
              className="text-[7px] font-mono tabular-nums text-center"
              style={{
                width: '24px',
                color: q > scores.quarters.home[i] ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)',
              }}
            >
              {q}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function fullTeam(abbr: string): string {
  return TEAM_FULL[abbr] ?? abbr;
}

// ── Network Bug — persistent channel identifier (top-right corner) ─────────
// Every live broadcast has a semi-transparent network logo in one corner.
// ESPN, TNT, ABC — the bug is always there. It's the single most ubiquitous
// element across all TV broadcasts. Placed opposite the ScoreBug (top-left).
// Phase-aware: breathing animation speeds up during CRITICAL.
function NetworkBug({ isEnded, teamColor, rgb, dropPhase }: {
  isEnded: boolean; teamColor: string; rgb: string; dropPhase: DropPhase;
}) {
  return (
    <div
      className="fixed top-14 right-4 z-40 pointer-events-none md:top-16 md:right-6"
      style={{
        opacity: isEnded ? 0.1 : dropPhase === 'CRITICAL' ? 0.55 : 0.35,
        transition: 'opacity 0.8s ease',
      }}
    >
      <div className="flex flex-col items-end gap-[2px]">
        {/* Network logo — "TST" in bold condensed, the channel identifier */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[14px] font-black uppercase tracking-[0.35em] leading-none"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: 'rgba(240,242,245,0.9)',
              textShadow: `0 0 8px rgba(${rgb},0.3)`,
              animation: dropPhase === 'CRITICAL'
                ? 'broadcast-network-bug-breathe 2s ease-in-out infinite'
                : 'broadcast-network-bug-breathe 4s ease-in-out infinite',
            }}
          >
            TST
          </span>
          {/* HD badge — small quality indicator */}
          <span
            className="text-[6px] font-bold uppercase tracking-[0.15em] px-[4px] py-[1px] rounded-[2px] leading-none"
            style={{
              backgroundColor: `rgba(${rgb},0.15)`,
              color: `rgba(${rgb},0.7)`,
              border: `0.5px solid rgba(${rgb},0.2)`,
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            HD
          </span>
        </div>
        {/* Micro line — network tag */}
        <span
          className="text-[5px] font-mono uppercase tracking-[0.3em]"
          style={{ color: 'rgba(240,242,245,0.2)' }}
        >
          Top Shot This
        </span>
      </div>
    </div>
  );
}

// ── TV Content Rating Badge — appears at start of every broadcast ───────────
// At the start of every ESPN/TNT/ABC broadcast, the TV content rating badge
// (TV-G, TV-PG, etc.) appears in the upper-left corner for ~4 seconds then
// fades. It's one of the most universally recognized broadcast UI elements —
// viewers have been conditioned to see it since childhood. A semi-transparent
// box with the rating inside, positioned below the ScoreBug. Shows on page
// load, auto-dismisses after 4.5s. Purely atmospheric broadcast production
// detail. Distinctly Broadcast: Supreme would never show a content rating
// (institutional silence), Arena would never show it (live commerce chaos).
function TVRatingBadge({ isEnded }: { isEnded: boolean }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (isEnded) return;
    // Show after countdown leader completes (~2.8s)
    const show = setTimeout(() => setVisible(true), 3200);
    const fade = setTimeout(() => setFading(true), 7000);
    const hide = setTimeout(() => setVisible(false), 7800);
    return () => { clearTimeout(show); clearTimeout(fade); clearTimeout(hide); };
  }, [isEnded]);

  if (!visible || isEnded) return null;

  return (
    <div
      className="fixed top-[108px] left-4 z-40 pointer-events-none md:top-[120px] md:left-6"
      style={{
        opacity: fading ? 0 : 0.35,
        transition: 'opacity 0.8s ease',
      }}
    >
      <div
        className="flex items-center gap-0"
        style={{
          border: '1px solid rgba(240,242,245,0.25)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <span
          className="text-[8px] font-bold uppercase leading-none px-[5px] py-[3px]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: 'rgba(240,242,245,0.8)',
            letterSpacing: '0.05em',
          }}
        >
          TV-G
        </span>
      </div>
    </div>
  );
}

// ── Graphics Package Accent Trim — ESPN-style L-frame accent lines ─────────
// Every ESPN/FOX/TNT broadcast graphics package has consistent accent lines
// that frame lower-thirds, stat cards, and hero graphics. These thin animated
// lines create the "you're watching a live production" feel. Drawn via CSS
// stroke-dashoffset on page load, phase-aware color temperature.
function GraphicsPackageTrim({ rgb, dropPhase, isEnded }: {
  rgb: string; dropPhase: DropPhase; isEnded: boolean;
}) {
  if (isEnded) return null;
  const trimColor = dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.5)'
    : dropPhase === 'CLOSING' ? 'rgba(245,158,11,0.4)'
    : `rgba(${rgb},0.3)`;
  const glowColor = dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.3)'
    : dropPhase === 'CLOSING' ? 'rgba(245,158,11,0.2)'
    : `rgba(${rgb},0.15)`;

  return (
    <div className="absolute inset-0 z-[11] pointer-events-none overflow-hidden">
      {/* Left vertical accent — runs from 20% to 85% of hero height */}
      <svg
        className="absolute left-0 top-0 h-full w-[20px]"
        viewBox="0 0 20 400"
        preserveAspectRatio="none"
        style={{ opacity: dropPhase === 'CRITICAL' ? 0.9 : 0.7 }}
      >
        <line
          x1="6" y1="80" x2="6" y2="340"
          stroke={trimColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: '260',
            strokeDashoffset: '0',
            animation: 'broadcast-trim-draw 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
          }}
        />
        {/* Secondary thinner parallel line */}
        <line
          x1="10" y1="100" x2="10" y2="320"
          stroke={trimColor}
          strokeWidth="0.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: '220',
            strokeDashoffset: '0',
            animation: 'broadcast-trim-draw 2.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards',
            opacity: 0.5,
          }}
        />
        {/* Corner tick at top of primary line */}
        <line
          x1="6" y1="80" x2="16" y2="80"
          stroke={trimColor}
          strokeWidth="1"
          strokeLinecap="round"
          style={{
            strokeDasharray: '10',
            strokeDashoffset: '0',
            animation: 'broadcast-trim-draw 0.6s ease-out 1.8s forwards',
            filter: `drop-shadow(0 0 3px ${glowColor})`,
          }}
        />
      </svg>
      {/* Bottom horizontal accent — runs across bottom-left corner */}
      <svg
        className="absolute bottom-[12%] left-0 w-full h-[20px]"
        viewBox="0 0 400 20"
        preserveAspectRatio="none"
        style={{ opacity: dropPhase === 'CRITICAL' ? 0.8 : 0.6 }}
      >
        <line
          x1="6" y1="10" x2="120" y2="10"
          stroke={trimColor}
          strokeWidth="1"
          strokeLinecap="round"
          style={{
            strokeDasharray: '114',
            strokeDashoffset: '0',
            animation: 'broadcast-trim-draw-h 1.4s cubic-bezier(0.4, 0, 0.2, 1) 2s forwards',
            filter: `drop-shadow(0 0 3px ${glowColor})`,
          }}
        />
        {/* Accent dot at line end */}
        <circle
          cx="120" cy="10" r="2"
          fill={trimColor}
          style={{
            animation: 'broadcast-trim-dot-in 0.4s ease-out 3.4s both',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
          }}
        />
      </svg>
    </div>
  );
}

// ── ESPN BottomLine — scrolling score ticker for broadcast atmosphere ──────

const TICKER_SCORES = [
  { away: 'BOS', aScore: 112, home: 'NYK', hScore: 108, status: 'FINAL' },
  { away: 'LAL', aScore: 98, home: 'GSW', hScore: 103, status: 'FINAL' },
  { away: 'PHI', aScore: 91, home: 'MIL', hScore: 96, status: 'FINAL' },
  { away: 'DAL', aScore: 117, home: 'PHX', hScore: 114, status: 'FINAL/OT' },
  { away: 'MIN', aScore: 105, home: 'SAC', hScore: 99, status: 'FINAL' },
  { away: 'CLE', aScore: 110, home: 'IND', hScore: 106, status: 'FINAL' },
  { away: 'ATL', aScore: 88, home: 'CHI', hScore: 94, status: 'FINAL' },
];

function BroadcastTicker() {
  return (
    <div className="relative w-full overflow-hidden border-b border-white/[0.04] bg-[#0B0E14]/80 backdrop-blur-sm">
      <div className="flex animate-[broadcast-ticker_30s_linear_infinite] whitespace-nowrap">
        {[...TICKER_SCORES, ...TICKER_SCORES].map((g, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-3 px-5 py-1.5 border-r border-white/[0.04]"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">
              {g.status}
            </span>
            <span className="text-[11px] tabular-nums text-white/40">
              <span className={g.aScore > g.hScore ? 'text-white/70 font-semibold' : ''}>{g.away} {g.aScore}</span>
              <span className="text-white/15 mx-1.5">—</span>
              <span className={g.hScore > g.aScore ? 'text-white/70 font-semibold' : ''}>{g.home} {g.hScore}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast BREAKING NEWS Crawl — red urgency ticker during CRITICAL phase
// Every major news network replaces the normal ticker with a red "BREAKING"
// crawl during emergencies. This fires when ≤2 min remain, scrolling urgent
// drop stats across a fixed bar near the bottom — maximum conversion pressure
// right where the user is deciding to buy.
// ---------------------------------------------------------------------------

function BreakingNewsCrawl({
  moment,
  totalSeconds,
  rgb,
}: {
  moment: Moment;
  totalSeconds: number;
  rgb: string;
}) {
  const remaining = moment.editionSize - moment.editionsClaimed;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

  const messages = [
    `BREAKING: ${moment.player.toUpperCase()} MOMENT CLOSING IN ${timeStr}`,
    `${remaining.toLocaleString()} EDITIONS REMAINING`,
    `CLAIM NOW — FROM $${moment.price}`,
    `${moment.editionsClaimed.toLocaleString()} COLLECTORS ALREADY OWN THIS MOMENT`,
    `FINAL MINUTES — ${moment.team} vs ${moment.opponent}`,
    `DO NOT MISS: ${moment.playType.toUpperCase()} — ${moment.statLine}`,
  ];

  const crawlText = messages.join('   ●   ');

  return (
    <div
      className="fixed left-0 right-0 z-[48] pointer-events-none overflow-hidden"
      style={{
        bottom: '56px',
        height: '26px',
        background: 'linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
        borderTop: '1px solid rgba(239,68,68,0.25)',
        borderBottom: '1px solid rgba(239,68,68,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* BREAKING label — pinned left */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3"
        style={{
          backgroundColor: 'rgba(239,68,68,0.9)',
          boxShadow: '4px 0 12px rgba(239,68,68,0.3)',
        }}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.3em] text-white"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Breaking
        </span>
      </div>
      {/* Scrolling crawl text */}
      <div className="absolute inset-0 flex items-center pl-[88px]">
        <div
          className="flex whitespace-nowrap animate-[broadcast-breaking-crawl_20s_linear_infinite]"
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400/80 px-4"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {crawlText}
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-red-400/80 px-4"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {crawlText}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast Location Tag — "LIVE FROM [ARENA]" geography identifier
// Slides in from left after countdown leader, holds 4s, slides out.
// Every live sports broadcast shows where they're reporting from.
// ---------------------------------------------------------------------------

function BroadcastLocationTag({ team, teamColor, rgb }: {
  team: string; teamColor: string; rgb: string;
}) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'gone'>('in');
  const arena = TEAM_ARENA[team] ?? { arena: 'Arena', city: '' };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 800);
    const t2 = setTimeout(() => setPhase('out'), 4800);
    const t3 = setTimeout(() => setPhase('gone'), 5400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className="absolute bottom-32 left-0 z-20 pointer-events-none md:bottom-36"
      style={{
        animation: phase === 'in'
          ? 'broadcast-location-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          : phase === 'out'
            ? 'broadcast-location-out 0.5s ease-in forwards'
            : 'none',
      }}
    >
      <div className="flex items-stretch">
        {/* Team-color accent bar — left edge */}
        <div
          className="w-[3px] flex-shrink-0"
          style={{ backgroundColor: teamColor }}
        />
        <div
          className="flex flex-col gap-0.5 pl-3 pr-5 py-2"
          style={{
            backgroundColor: 'rgba(11,14,20,0.88)',
            backdropFilter: 'blur(10px)',
            boxShadow: `2px 0 16px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(${rgb},0.08)`,
          }}
        >
          {/* "LIVE FROM" label */}
          <div className="flex items-center gap-1.5">
            <div
              className="h-[5px] w-[5px] rounded-full flex-shrink-0"
              style={{
                backgroundColor: '#EF4444',
                boxShadow: '0 0 6px rgba(239,68,68,0.5)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/40"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Live from
            </span>
          </div>
          {/* Arena name — bold, larger */}
          <span
            className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/80 leading-tight"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {arena.arena}
          </span>
          {/* City — muted, smaller */}
          {arena.city && (
            <span
              className="text-[8px] tracking-[0.2em] text-white/25 leading-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
            >
              {arena.city}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Telestrator — broadcast analyst circle drawn on replay footage
// Every ESPN/TNT broadcast analyst (Madden, Romo, Barkley) circles the key
// player on a replay. A yellow/team-color ellipse traces itself over the
// hero image via SVG stroke-dashoffset animation, with a small arrow.
// Fires ~2s after page load (after replay tag), holds 2.5s, fades out.
// ---------------------------------------------------------------------------

function TelestatorCircle({ teamColor, rgb }: { teamColor: string; rgb: string }) {
  const [phase, setPhase] = useState<'waiting' | 'drawing' | 'holding' | 'fading' | 'done'>('waiting');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('drawing'), 2200);
    const t2 = setTimeout(() => setPhase('holding'), 3200);
    const t3 = setTimeout(() => setPhase('fading'), 5200);
    const t4 = setTimeout(() => setPhase('done'), 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  if (phase === 'done' || phase === 'waiting') return null;

  // Classic telestrator yellow with slight team-color tint
  const strokeColor = '#FFD700';

  return (
    <div
      className="absolute z-[18] pointer-events-none"
      style={{
        top: '22%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: phase === 'fading' ? 0 : phase === 'drawing' ? 0.7 : 0.55,
        transition: 'opacity 0.6s ease',
      }}
    >
      <svg
        width="140"
        height="100"
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Main telestrator ellipse — hand-drawn feel with imperfect path */}
        <ellipse
          cx="70"
          cy="50"
          rx="58"
          ry="38"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="300"
          strokeDashoffset={phase === 'drawing' ? '0' : '300'}
          style={{
            transition: 'stroke-dashoffset 1.0s cubic-bezier(0.22, 1, 0.36, 1)',
            filter: `drop-shadow(0 0 6px ${strokeColor}60) drop-shadow(0 0 14px ${strokeColor}30)`,
          }}
          transform="rotate(-5 70 50)"
        />
        {/* Arrow tip — small directional pointer at bottom-right of ellipse */}
        <path
          d="M118 68 L128 74 L120 78"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40"
          strokeDashoffset={phase === 'drawing' ? '0' : '40'}
          style={{
            transition: 'stroke-dashoffset 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.7s',
            filter: `drop-shadow(0 0 4px ${strokeColor}50)`,
          }}
        />
      </svg>
      {/* "KEY PLAY" micro-label — analyst annotation text */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2"
        style={{
          opacity: phase === 'holding' || phase === 'fading' ? 0.5 : 0,
          transition: 'opacity 0.4s ease 0.2s',
        }}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.35em] whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: strokeColor,
            textShadow: `0 0 8px ${strokeColor}40`,
          }}
        >
          Key Play
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ESPN-style stat breakdown — animated cards
// ---------------------------------------------------------------------------

// Animated stat counter — counts from 0 to target with easeOutQuad
function useAnimatedCounter(target: number, duration: number, started: boolean): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!started) { setValue(0); return; }
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, started]);
  return value;
}

function AnimatedStatCard({ value, label, teamColor, delay, isVisible }: {
  value: string; label: string; teamColor: string; delay: number; isVisible: boolean;
}) {
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [isVisible, delay]);

  const animatedValue = useAnimatedCounter(
    isNumeric ? numericValue : 0,
    1200,
    started
  );

  return (
    <div
      className="flex-1 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-3 text-center relative overflow-hidden"
      style={{ animation: isVisible ? `stat-fly-in 0.5s ease-out ${delay}s both` : 'none' }}
    >
      {/* Broadcast-style top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: teamColor, opacity: 0.6 }}
      />
      <div
        className="text-2xl font-bold tabular-nums"
        style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor }}
      >
        {isNumeric ? animatedValue : value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function StatBreakdown({ statLine, teamColor }: { statLine: string; teamColor: string }) {
  // Parse "30 PTS / 8 REB / 4 AST" into segments
  const stats = statLine.split('/').map((s) => {
    const trimmed = s.trim();
    const match = trimmed.match(/^(\d+)\s+(.+)$/);
    return match ? { value: match[1], label: match[2] } : { value: trimmed, label: '' };
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mt-8 flex items-stretch gap-3">
      {stats.map((stat, i) => (
        <AnimatedStatCard
          key={stat.label}
          value={stat.value}
          label={stat.label}
          teamColor={teamColor}
          delay={0.15 * i}
          isVisible={isVisible}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shot Chart — ESPN/TNT on-screen half-court diagram with highlighted play
// Every broadcast shows shot charts during analysis. The most recognizable
// basketball data visualization. Minimal half-court SVG with a pulsing dot
// at the approximate play location, styled as a broadcast overlay graphic.
// ---------------------------------------------------------------------------

// Per-moment shot locations (approximate x,y on 200x120 half-court)
const SHOT_LOCATIONS: Record<string, { x: number; y: number; label: string }[]> = {
  bam: [
    { x: 100, y: 18, label: 'Monster Dunk' },     // at the rim
    { x: 85, y: 38, label: 'Mid-Range' },
    { x: 115, y: 35, label: 'Hook Shot' },
  ],
  jokic: [
    { x: 100, y: 30, label: 'Post Up' },           // low post
    { x: 75, y: 55, label: 'Triple-Double Assist' },
    { x: 130, y: 48, label: 'Mid-Range' },
    { x: 100, y: 75, label: 'Three-Pointer' },     // top of key
  ],
  sga: [
    { x: 55, y: 55, label: 'Step-Back Three' },    // wing three
    { x: 100, y: 25, label: 'Driving Layup' },
    { x: 145, y: 55, label: 'Pull-Up Three' },
    { x: 100, y: 78, label: 'Deep Three' },
    { x: 80, y: 35, label: 'Floater' },
  ],
};

function ShotChartGraphic({ moment, rgb }: { moment: Moment; rgb: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shots = SHOT_LOCATIONS[moment.id] ?? SHOT_LOCATIONS.bam;
  const primaryShot = shots[0]; // The highlight play

  return (
    <div ref={containerRef} className="mt-8 mb-4">
      {/* Broadcast graphic header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
          style={{
            backgroundColor: `rgba(${rgb},0.12)`,
            color: moment.teamColors.primary,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Shot Chart
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.06]" />
        <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/15">
          Tonight&apos;s Game
        </span>
      </div>

      {/* Half-court SVG */}
      <div
        className="relative w-full max-w-[320px] mx-auto overflow-hidden rounded-sm"
        style={{
          backgroundColor: 'rgba(20,25,37,0.4)',
          border: `1px solid rgba(${rgb},0.08)`,
          aspectRatio: '200/120',
        }}
      >
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full"
          fill="none"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease-out' }}
        >
          {/* Court lines — minimal broadcast overlay style */}
          {/* Baseline */}
          <line x1="10" y1="5" x2="190" y2="5" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Sidelines */}
          <line x1="10" y1="5" x2="10" y2="115" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          <line x1="190" y1="5" x2="190" y2="115" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Half-court line */}
          <line x1="10" y1="115" x2="190" y2="115" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
          {/* Paint / key */}
          <rect x="68" y="5" width="64" height="60" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" fill="none" />
          {/* Free-throw circle */}
          <circle cx="100" cy="65" r="18" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          {/* Three-point arc */}
          <path
            d="M 28 5 L 28 28 Q 28 95, 100 95 Q 172 95, 172 28 L 172 5"
            stroke={`rgba(${rgb},0.12)`}
            strokeWidth="0.8"
            fill="none"
          />
          {/* Basket */}
          <circle cx="100" cy="10" r="3" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <line x1="95" y1="5" x2="105" y2="5" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Shot dots — secondary shots (smaller, dimmer) */}
          {shots.slice(1).map((shot, i) => (
            <circle
              key={i}
              cx={shot.x}
              cy={shot.y}
              r="3"
              fill={moment.teamColors.primary}
              opacity={isVisible ? 0.25 : 0}
              style={{
                transition: `opacity 0.5s ease-out ${0.3 + i * 0.15}s`,
              }}
            />
          ))}

          {/* Primary shot — the highlight play (larger, pulsing, labeled) */}
          <circle
            cx={primaryShot.x}
            cy={primaryShot.y}
            r="6"
            fill={moment.teamColors.primary}
            opacity={isVisible ? 0.15 : 0}
            style={{ transition: 'opacity 0.6s ease-out 0.2s' }}
          />
          <circle
            cx={primaryShot.x}
            cy={primaryShot.y}
            r="3.5"
            fill={moment.teamColors.primary}
            opacity={isVisible ? 0.6 : 0}
            style={{ transition: 'opacity 0.6s ease-out 0.2s' }}
          />
          {/* Primary shot label — play type */}
          <text
            x={primaryShot.x + (primaryShot.x > 130 ? -8 : primaryShot.x < 70 ? 8 : 0)}
            y={primaryShot.y + (primaryShot.y < 30 ? 16 : -10)}
            textAnchor="middle"
            fontSize="6"
            fontFamily="var(--font-oswald), sans-serif"
            fontWeight="500"
            letterSpacing="0.5"
            fill="white"
            opacity={isVisible ? 0.35 : 0}
            style={{ transition: 'opacity 0.6s ease-out 0.6s', textTransform: 'uppercase' }}
          >
            {primaryShot.label}
          </text>

          {/* Broadcast "MAKE" legend */}
          <circle cx="16" cy="110" r="2.5" fill={moment.teamColors.primary} opacity="0.4" />
          <text x="22" y="112" fontSize="5" fill="white" opacity="0.2" fontFamily="monospace">
            MAKE
          </text>
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tale of the Tape — ESPN head-to-head stat comparison (tonight vs season avg)
// ---------------------------------------------------------------------------

// Per-moment season averages for Tale of the Tape comparison
const SEASON_AVERAGES: Record<string, { pts: number; reb: number; ast: number }> = {
  bam: { pts: 21.5, reb: 10.4, ast: 3.9 },
  jokic: { pts: 26.4, reb: 12.3, ast: 9.8 },
  sga: { pts: 31.2, reb: 5.5, ast: 6.2 },
};

function TaleOfTheTape({ moment, rgb }: { moment: Moment; rgb: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Parse tonight's stats from statLine ("30 PTS / 8 REB / 4 AST")
  const parsed = moment.statLine.split('/').map((s) => {
    const m = s.trim().match(/^(\d+)\s+(.+)$/);
    return m ? { value: parseInt(m[1], 10), label: m[2].trim() } : null;
  }).filter(Boolean) as { value: number; label: string }[];

  const seasonAvg = SEASON_AVERAGES[moment.id] ?? { pts: 20, reb: 8, ast: 5 };
  const avgMap: Record<string, number> = { PTS: seasonAvg.pts, REB: seasonAvg.reb, AST: seasonAvg.ast };

  // Build comparison rows
  const rows = parsed.map((stat) => {
    const avg = avgMap[stat.label] ?? 10;
    const maxVal = Math.max(stat.value, avg) * 1.25; // scale to 80% max width
    return {
      label: stat.label,
      tonight: stat.value,
      avg: avg,
      tonightPct: Math.min(100, (stat.value / maxVal) * 100),
      avgPct: Math.min(100, (avg / maxVal) * 100),
      isAbove: stat.value > avg,
    };
  });

  return (
    <div ref={containerRef} className="mt-10 mb-2">
      {/* Section header — broadcast graphic style */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-[2px] w-5" style={{ backgroundColor: moment.teamColors.primary }} />
        <span
          className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/25"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Tale of the Tape
        </span>
        <div className="h-[1px] flex-1" style={{ backgroundColor: `rgba(${rgb},0.08)` }} />
      </div>

      {/* Comparison card */}
      <div
        className="rounded-lg border relative overflow-hidden"
        style={{
          borderColor: `rgba(${rgb},0.1)`,
          backgroundColor: 'rgba(20,25,37,0.5)',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: `rgba(${rgb},0.25)` }} />

        {/* Column headers */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-oswald), sans-serif', color: moment.teamColors.primary }}
          >
            Tonight
          </span>
          <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
            vs Season Avg
          </span>
        </div>

        {/* Stat rows */}
        <div className="px-4 pb-4 space-y-3">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: `${0.15 * i}s`,
              }}
            >
              {/* Label + values row */}
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {row.label}
                  </span>
                  {row.isAbove && (
                    <span
                      className="text-[7px] font-bold uppercase tracking-[0.2em] px-1 py-px rounded-sm"
                      style={{
                        backgroundColor: `rgba(${rgb},0.12)`,
                        color: moment.teamColors.primary,
                        fontFamily: 'var(--font-oswald), sans-serif',
                      }}
                    >
                      Above avg
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: row.isAbove ? moment.teamColors.primary : '#F0F2F5',
                    }}
                  >
                    {row.tonight}
                  </span>
                  <span className="text-[11px] tabular-nums text-white/25 font-mono">
                    {row.avg.toFixed(1)}
                  </span>
                </div>
              </div>
              {/* Dual bar comparison */}
              <div className="space-y-1">
                {/* Tonight bar */}
                <div className="h-[6px] rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: isVisible ? `${row.tonightPct}%` : '0%',
                      transitionDuration: '1.2s',
                      transitionDelay: `${0.2 + 0.15 * i}s`,
                      background: `linear-gradient(90deg, ${moment.teamColors.primary}90, ${moment.teamColors.primary})`,
                      boxShadow: `0 0 8px ${moment.teamColors.primary}30`,
                    }}
                  />
                </div>
                {/* Season avg bar */}
                <div className="h-[3px] rounded-full bg-white/[0.03] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: isVisible ? `${row.avgPct}%` : '0%',
                      transitionDuration: '1s',
                      transitionDelay: `${0.3 + 0.15 * i}s`,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fan Verdict — ESPN-style live poll graphic
// Every ESPN/TNT broadcast runs on-screen fan polls: "Is this the dunk of the
// playoffs?" with a percentage bar that fills live. This transforms editorial
// opinion into data-backed consensus — social proof in broadcast language.
// ---------------------------------------------------------------------------

const FAN_POLLS: Record<string, { question: string; yesLabel: string; noLabel: string; yesPercent: number; totalVotes: number }> = {
  bam:   { question: 'PLAY OF THE PLAYOFFS?', yesLabel: 'YES', noLabel: 'NO', yesPercent: 91, totalVotes: 48200 },
  jokic: { question: 'BEST PASS THIS SEASON?', yesLabel: 'YES', noLabel: 'NO', yesPercent: 87, totalVotes: 52700 },
  sga:   { question: 'MOST UNSTOPPABLE PLAYER?', yesLabel: 'YES', noLabel: 'NO', yesPercent: 94, totalVotes: 61300 },
};

function FanVerdict({ moment, rgb }: { moment: Moment; rgb: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  const [fillPct, setFillPct] = useState(0);
  const [voteCount, setVoteCount] = useState(0);

  const poll = FAN_POLLS[moment.id] ?? FAN_POLLS.bam;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate the percentage bar and vote count AFTER user votes
  useEffect(() => {
    if (!voted) return;
    const target = voted === 'yes' ? poll.yesPercent : 100 - poll.yesPercent;
    // Show the YES bar percentage regardless (it's the primary bar)
    const yesTarget = voted === 'yes' ? poll.yesPercent + 1 : poll.yesPercent;
    const clampedYes = Math.min(99, yesTarget);
    const targetVotes = poll.totalVotes + 1;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    function tick() {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setFillPct(Math.round(eased * clampedYes));
      setVoteCount(Math.round(eased * targetVotes));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [voted, poll.yesPercent, poll.totalVotes]);

  return (
    <div ref={containerRef} className="mt-8 mb-2">
      {/* Section header — broadcast graphic style */}
      <div className="flex items-center gap-3 mb-4">
        {/* Poll icon — bar chart SVG */}
        <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" style={{ color: moment.teamColors.primary, opacity: 0.5 }}>
          <rect x="1" y="6" width="2.5" height="5.5" rx="0.5" fill="currentColor" opacity="0.6" />
          <rect x="4.75" y="3" width="2.5" height="8.5" rx="0.5" fill="currentColor" opacity="0.8" />
          <rect x="8.5" y="0.5" width="2.5" height="11" rx="0.5" fill="currentColor" />
        </svg>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/25"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Fan Verdict
        </span>
        <div className="h-[1px] flex-1" style={{ backgroundColor: `rgba(${rgb},0.08)` }} />
        <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/15">
          LIVE POLL
        </span>
      </div>

      {/* Poll card */}
      <div
        className="rounded-sm relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(20,25,37,0.55)',
          border: `1px solid rgba(${rgb},0.1)`,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(to right, ${moment.teamColors.primary}, ${moment.teamColors.primary}40)`,
          }}
        />

        <div className="px-5 py-4 sm:px-6">
          {/* Poll question */}
          <p
            className="text-[18px] sm:text-[20px] font-bold uppercase tracking-[0.06em] text-white/80 mb-4"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            {poll.question}
          </p>

          {/* PRE-VOTE: tappable YES / NO options */}
          {!voted && (
            <div className="flex gap-3 mb-3">
              {[
                { key: 'yes' as const, label: poll.yesLabel },
                { key: 'no' as const, label: poll.noLabel },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => { setVoted(option.key); BROADCAST_HAPTIC.ctaPress(); }}
                  className="flex-1 py-3 rounded-sm text-center cursor-pointer transition-all duration-200 active:scale-[0.97]"
                  style={{
                    backgroundColor: option.key === 'yes'
                      ? `rgba(${rgb},0.08)`
                      : 'rgba(255,255,255,0.04)',
                    border: option.key === 'yes'
                      ? `1px solid rgba(${rgb},0.2)`
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span
                    className="text-[13px] font-bold uppercase tracking-[0.15em]"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: option.key === 'yes' ? moment.teamColors.primary : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* POST-VOTE: animated result bars */}
          {voted && (
            <>
              {/* Your vote indicator */}
              <div className="flex items-center gap-1.5 mb-3">
                <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 10" fill="none">
                  <path d="M2.5 5.5L4.5 7.5L7.5 3" stroke={moment.teamColors.primary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: `rgba(${rgb},0.5)`, fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  You voted: {voted === 'yes' ? poll.yesLabel : poll.noLabel}
                </span>
              </div>

              {/* YES bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {poll.yesLabel}
                  </span>
                  <span
                    className="text-[16px] font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: moment.teamColors.primary,
                      textShadow: fillPct >= poll.yesPercent - 1
                        ? `0 0 8px rgba(${rgb},0.3)`
                        : 'none',
                      transition: 'text-shadow 0.3s ease',
                    }}
                  >
                    {fillPct}%
                  </span>
                </div>
                <div
                  className="relative h-[6px] rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${fillPct}%`,
                      background: `linear-gradient(to right, ${moment.teamColors.primary}CC, ${moment.teamColors.primary})`,
                      boxShadow: fillPct >= poll.yesPercent - 1
                        ? `0 0 8px rgba(${rgb},0.4), 0 0 2px rgba(${rgb},0.6)`
                        : 'none',
                      transition: 'box-shadow 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* NO bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {poll.noLabel}
                  </span>
                  <span
                    className="text-[14px] font-bold tabular-nums text-white/25"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {100 - fillPct}%
                  </span>
                </div>
                <div
                  className="relative h-[6px] rounded-full overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${100 - fillPct}%`,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Vote count + live indicator */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tabular-nums text-white/20">
              {voted ? voteCount.toLocaleString() : poll.totalVotes.toLocaleString()} votes
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="h-[5px] w-[5px] rounded-full"
                style={{
                  backgroundColor: '#EF4444',
                  animation: isVisible ? 'pulse 2s ease-in-out infinite' : 'none',
                  boxShadow: '0 0 4px #EF444460',
                }}
              />
              <span
                className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#EF4444]/50"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game Flow Chart — ESPN win probability / momentum sparkline
// Shows simulated game momentum with the key moment at the peak.
// ---------------------------------------------------------------------------

function GameFlowChart({ moment, rgb }: { moment: Moment; rgb: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Generate a plausible momentum curve peaking at ~75% through the game
  const points = useMemo(() => {
    const w = 300, h = 60, mid = h / 2;
    const pts: string[] = [];
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * w;
      const t = i / 20;
      // Bell-shaped curve peaking around t=0.75 (4th quarter climax)
      const peak = Math.exp(-Math.pow((t - 0.75) / 0.18, 2));
      // Add some noise for realism
      const noise = Math.sin(i * 2.7) * 4 + Math.cos(i * 1.3) * 3;
      const y = mid - (peak * (h * 0.42)) - noise;
      pts.push(`${x.toFixed(1)},${Math.max(4, Math.min(h - 4, y)).toFixed(1)}`);
    }
    return pts;
  }, []);

  const polyline = points.join(' ');
  // Peak point (index 15 = t=0.75)
  const peakPt = points[15].split(',').map(Number);

  return (
    <div ref={ref} className="mt-8 mb-4">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
          style={{
            backgroundColor: `rgba(${rgb},0.12)`,
            color: moment.teamColors.primary,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Game Flow
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.06]" />
        <span className="text-[7px] font-mono uppercase tracking-wider text-white/15">
          Momentum Index
        </span>
      </div>

      {/* Chart */}
      <div
        className="relative overflow-hidden rounded-md"
        style={{
          backgroundColor: 'rgba(20,25,37,0.5)',
          border: `1px solid rgba(${rgb},0.1)`,
        }}
      >
        <svg
          viewBox="0 0 300 60"
          className="w-full h-auto"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
        >
          {/* Midline — neutral momentum */}
          <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />
          {/* Quarter markers */}
          {[75, 150, 225].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="60" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {/* Momentum line */}
          <polyline
            points={polyline}
            fill="none"
            stroke={moment.teamColors.primary}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: visible ? 0.7 : 0,
              strokeDasharray: 500,
              strokeDashoffset: visible ? 0 : 500,
              transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
            }}
          />
          {/* Area fill under the line */}
          <polygon
            points={`0,30 ${polyline} 300,30`}
            style={{
              fill: `rgba(${rgb},${visible ? 0.06 : 0})`,
              transition: 'fill 1.5s ease',
            }}
          />
          {/* Peak marker — "THE MOMENT" */}
          <circle
            cx={peakPt[0]}
            cy={peakPt[1]}
            r="3"
            fill={moment.teamColors.primary}
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.5s ease 1.5s',
              filter: `drop-shadow(0 0 4px ${moment.teamColors.primary})`,
            }}
          />
        </svg>
        {/* Quarter labels */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-3">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <span key={q} className="text-[6px] font-mono uppercase tracking-wider text-white/15">{q}</span>
          ))}
        </div>
        {/* Peak annotation */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${(peakPt[0] / 300) * 100}%`,
            top: `${(peakPt[1] / 60) * 100 - 28}%`,
            transform: 'translateX(-50%)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.5s ease 1.8s',
          }}
        >
          <span
            className="text-[6px] font-bold uppercase tracking-[0.2em] px-1 py-px rounded-sm whitespace-nowrap"
            style={{
              backgroundColor: `rgba(${rgb},0.2)`,
              color: moment.teamColors.primary,
              fontFamily: 'var(--font-oswald), sans-serif',
            }}
          >
            The Moment
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SportsCenter Top 10 — "#1 Play of the Night" ranking graphic
// Every NBA fan knows the SportsCenter Top 10. This card ranks the moment as
// tonight's #1 play with dimmed lower-ranked plays for context. The ranking
// badge uses a bold countdown-style number. Triggered by IntersectionObserver.
// Adds editorial prestige: the play isn't just a moment — it's THE moment.
// ---------------------------------------------------------------------------

const SC_TOP_10: Record<string, { rank1Desc: string; others: { rank: number; desc: string }[] }> = {
  bam: {
    rank1Desc: 'Bam Adebayo one-handed poster over two defenders',
    others: [
      { rank: 2, desc: 'Edwards coast-to-coast windmill in transition' },
      { rank: 3, desc: 'Brunson step-back three to force overtime' },
      { rank: 4, desc: 'Wembanyama chasedown block at the rim' },
      { rank: 5, desc: 'Fox behind-the-back dish for the and-one' },
    ],
  },
  jokic: {
    rank1Desc: 'Jokić no-look dagger assist with 47 seconds left',
    others: [
      { rank: 2, desc: 'Gilgeous-Alexander pull-up three from the logo' },
      { rank: 3, desc: 'Davis alley-oop putback off the glass' },
      { rank: 4, desc: 'Haliburton full-court bounce pass for the layup' },
      { rank: 5, desc: 'Tatum poster dunk in transition' },
    ],
  },
  sga: {
    rank1Desc: 'SGA 42-point masterclass — unguardable mid-range clinic',
    others: [
      { rank: 2, desc: 'Adebayo one-handed slam over two defenders' },
      { rank: 3, desc: 'Luka step-back dagger from 30 feet' },
      { rank: 4, desc: 'Jokić behind-the-back no-look assist' },
      { rank: 5, desc: 'Ant-Man 360 layup through contact' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Analyst Desk — "Inside the NBA" multi-analyst roundtable panel
// 3 analysts with contrasting perspectives: enthusiastic, analytical, historical
// ---------------------------------------------------------------------------

const ANALYST_DESK: Record<string, Array<{
  initials: string;
  name: string;
  role: string;
  take: string;
  style: 'hot' | 'analytical' | 'historical';
}>> = {
  bam: [
    {
      initials: 'RJ',
      name: 'Richard Jefferson',
      role: 'Studio Analyst',
      take: 'This is the Bam we\u2019ve been waiting for. When he\u2019s this aggressive, Miami is a different team. You don\u2019t see bigs take over games like this anymore.',
      style: 'hot',
    },
    {
      initials: 'TL',
      name: 'Tim Legler',
      role: 'NBA Analyst',
      take: 'Look at the efficiency — 12-for-16 from the field with 6 assists. He was the primary ball-handler on half those possessions. That\u2019s point-center basketball at the highest level.',
      style: 'analytical',
    },
    {
      initials: 'MJ',
      name: 'Mark Jackson',
      role: 'Game Analyst',
      take: 'Mama, there goes that man. Alonzo Mourning paved the way, Shaq carried the torch — Bam is writing the next chapter of Heat big man dominance.',
      style: 'historical',
    },
  ],
  jokic: [
    {
      initials: 'JJ',
      name: 'JJ Redick',
      role: 'Studio Analyst',
      take: 'There is no playbook for guarding Joki\u0107. He sees passes two moves ahead. This is the best passing big man in NBA history \u2014 and I don\u2019t think it\u2019s close.',
      style: 'hot',
    },
    {
      initials: 'ZL',
      name: 'Zach Lowe',
      role: 'NBA Analyst',
      take: 'The assist-to-turnover ratio tonight was 4.3. He touched the ball on 62% of Denver\u2019s possessions. The gravity numbers are off the charts — every defender shifted when he caught it.',
      style: 'analytical',
    },
    {
      initials: 'HH',
      name: 'Hubie Brown',
      role: 'Hall of Fame Analyst',
      take: 'Give this guy credit. In 50 years of basketball, I\u2019ve never seen a center with this passing IQ. Bird, Magic — this kid belongs in that conversation for pure court vision.',
      style: 'historical',
    },
  ],
  sga: [
    {
      initials: 'CW',
      name: 'Chiney Ogwumike',
      role: 'Studio Analyst',
      take: 'SGA is the most unguardable player in the league right now. That mid-range is automatic, and he\u2019s doing it in the biggest moments. This kid is special.',
      style: 'hot',
    },
    {
      initials: 'SAS',
      name: 'Stephen A. Smith',
      role: 'NBA Analyst',
      take: 'Forty-two points on 58% shooting? In THESE playoffs? Let me tell you something \u2014 we are witnessing the ascension. This is an MVP doing MVP things when it matters MOST.',
      style: 'analytical',
    },
    {
      initials: 'VH',
      name: 'Vince Carter',
      role: 'Game Analyst',
      take: 'The mid-range game is dying? Tell that to SGA. He\u2019s bringing back the lost art. Kobe, MJ, D-Wade \u2014 he\u2019s got that same killer instinct from 15 feet.',
      style: 'historical',
    },
  ],
};

function AnalystDesk({ moment, rgb }: { moment: Moment; rgb: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const analysts = ANALYST_DESK[moment.id] ?? ANALYST_DESK.bam;
  const styleIcons: Record<string, string> = { hot: '\ud83d\udd25', analytical: '\ud83d\udcca', historical: '\ud83c\udfc6' };
  const styleLabels: Record<string, string> = { hot: 'Hot Take', analytical: 'By the Numbers', historical: 'Historical Context' };

  return (
    <div ref={ref} className="mt-8 mb-8 relative">
      {/* Broadcast lower-third style header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
          style={{
            backgroundColor: `rgba(${rgb},0.12)`,
            color: moment.teamColors.primary,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Analyst Desk
        </span>
        <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20">
          Inside the Moment
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.06]" />
      </div>

      {/* Studio desk card — frosted dark surface */}
      <div
        className="relative rounded-md border overflow-hidden"
        style={{
          borderColor: `rgba(${rgb},0.12)`,
          backgroundColor: 'rgba(20,25,37,0.5)',
        }}
      >
        {/* Team-color top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: `${moment.teamColors.primary}40` }}
        />

        {/* "LIVE FROM STUDIO" label — broadcast production tag */}
        <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
          <span className="relative flex h-[5px] w-[5px]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ backgroundColor: '#EF4444' }} />
            <span className="relative inline-flex h-[5px] w-[5px] rounded-full" style={{ backgroundColor: '#EF4444' }} />
          </span>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.35em] text-white/20"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Live from Studio
          </span>
          <div className="h-[1px] flex-1 bg-white/[0.04]" />
          <span className="text-[7px] font-mono uppercase tracking-[0.15em] text-white/10">
            3 analysts
          </span>
        </div>

        {/* Analyst rows — each with avatar, name, take style badge, and quote */}
        {analysts.map((analyst, i) => (
          <div
            key={analyst.initials}
            className="px-4 py-3 flex gap-3 border-t"
            style={{
              borderColor: 'rgba(255,255,255,0.04)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-16px)',
              transition: `opacity 0.5s ease-out ${0.1 + i * 0.15}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.15}s`,
            }}
          >
            {/* Analyst avatar — circular initial with team-color tint */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                backgroundColor: `rgba(${rgb},${i === 0 ? 0.18 : 0.1})`,
                border: `1px solid rgba(${rgb},${i === 0 ? 0.25 : 0.15})`,
              }}
            >
              <span
                className="text-[10px] font-bold"
                style={{ color: `${moment.teamColors.primary}${i === 0 ? 'CC' : '66'}`, fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {analyst.initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {/* Name + role + take style badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {analyst.name}
                </span>
                <span className="text-[7px] font-mono uppercase tracking-[0.12em] text-white/15">
                  {analyst.role}
                </span>
              </div>
              {/* Take style label — small colored badge */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8px]">{styleIcons[analyst.style]}</span>
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: analyst.style === 'hot'
                      ? '#FF6B35'
                      : analyst.style === 'analytical'
                        ? '#00E5A0'
                        : '#F59E0B',
                    opacity: 0.6,
                  }}
                >
                  {styleLabels[analyst.style]}
                </span>
              </div>
              {/* The take — Georgia italic, broadcast expert commentary */}
              <p
                className="mt-1.5 text-[12px] leading-relaxed text-white/35"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
              >
                &ldquo;{analyst.take}&rdquo;
              </p>
            </div>
          </div>
        ))}

        {/* Bottom production bar — broadcast graphic footer */}
        <div
          className="px-4 py-1.5 flex items-center gap-2"
          style={{ backgroundColor: `rgba(${rgb},0.03)`, borderTop: '1px solid rgba(255,255,255,0.03)' }}
        >
          <span className="text-[6px] font-mono uppercase tracking-[0.2em] text-white/10">
            TST BROADCAST
          </span>
          <div className="h-[1px] flex-1 bg-white/[0.03]" />
          <span className="text-[6px] font-mono uppercase tracking-[0.15em] text-white/10">
            POST-GAME ANALYSIS
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analyst Verdict — editorial consensus "COLLECT" recommendation card
// ESPN pre-game shows end with each analyst giving their "LOCK" — the pick
// they're most confident about. This compact graphic synthesizes the full
// analyst desk's consensus into a single authoritative recommendation placed
// right above the CTA button. The most powerful conversion tool in broadcast:
// expert authority endorsing the purchase decision.
// ---------------------------------------------------------------------------

const ANALYST_VERDICT: Record<string, {
  headline: string;
  reasons: Array<{ icon: string; label: string; detail: string }>;
  consensus: string;
}> = {
  bam: {
    headline: 'Bam Adebayo — Tonight\u2019s Lock',
    reasons: [
      { icon: '🔥', label: 'SIGNIFICANCE', detail: 'Career-defining poster dunk in playoff elimination' },
      { icon: '📈', label: 'VALUE', detail: 'Primary sale at a fraction of projected secondary' },
      { icon: '📊', label: 'SCARCITY', detail: 'Limited editions selling fast — editions won\u2019t restock' },
    ],
    consensus: '3 of 3 analysts say COLLECT',
  },
  jokic: {
    headline: 'Nikola Joki\u0107 — Tonight\u2019s Lock',
    reasons: [
      { icon: '🔥', label: 'SIGNIFICANCE', detail: 'No-look dagger assist — quintessential Joki\u0107 magic' },
      { icon: '📈', label: 'VALUE', detail: 'Primary price vs. secondary upside is a steal' },
      { icon: '📊', label: 'SCARCITY', detail: 'Joki\u0107 moments consistently sell out — don\u2019t wait' },
    ],
    consensus: '3 of 3 analysts say COLLECT',
  },
  sga: {
    headline: 'Shai Gilgeous-Alexander — Tonight\u2019s Lock',
    reasons: [
      { icon: '🔥', label: 'SIGNIFICANCE', detail: '42-point masterclass in a must-win playoff game' },
      { icon: '📈', label: 'VALUE', detail: 'MVP candidate at entry-level pricing' },
      { icon: '📊', label: 'SCARCITY', detail: 'Highest demand drop this quarter — moving fast' },
    ],
    consensus: '3 of 3 analysts say COLLECT',
  },
};

function AnalystVerdict({ moment, tier, rgb, phase }: {
  moment: Moment;
  tier: RarityTier;
  rgb: string;
  phase: DropPhase;
}) {
  const verdict = ANALYST_VERDICT[moment.id] ?? ANALYST_VERDICT.bam;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full max-w-md mx-auto mb-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }}
    >
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          backgroundColor: 'rgba(20,25,37,0.6)',
          border: `1px solid rgba(${rgb},0.1)`,
        }}
      >
        {/* Gold top accent — league-level authority, not team-specific */}
        <div
          className="h-[2px] w-full"
          style={{ background: 'linear-gradient(to right, #D4A01780, #D4A01720)' }}
        />
        <div className="px-4 py-3">
          {/* Header row — verdict badge + analyst consensus */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              {/* Gavel / verdict icon */}
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" style={{ color: '#D4A017', opacity: 0.6 }}>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="0.8" />
                <path d="M4 6.5 L5.5 8 L8 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span
                className="text-[8px] font-bold uppercase tracking-[0.3em]"
                style={{ color: '#D4A017', opacity: 0.8, fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Analyst Verdict
              </span>
            </div>
            {/* Consensus badge */}
            <span
              className="text-[7px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: '#00E5A015',
                color: '#00E5A0',
                opacity: 0.7,
                fontFamily: 'var(--font-oswald), sans-serif',
                border: '1px solid #00E5A015',
              }}
            >
              {verdict.consensus}
            </span>
          </div>

          {/* Headline — player + "Tonight's Lock" */}
          <p
            className="text-[13px] font-bold uppercase tracking-wide mb-3"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: moment.teamColors.primary,
              textShadow: `0 0 12px ${moment.teamColors.primary}20`,
            }}
          >
            {verdict.headline}
          </p>

          {/* 3 reasons — compact one-liners */}
          <div className="flex flex-col gap-1.5">
            {verdict.reasons.map((reason, idx) => (
              <div
                key={reason.label}
                className="flex items-start gap-2"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                  transition: `opacity 0.35s ease-out ${0.15 + idx * 0.1}s, transform 0.35s ease-out ${0.15 + idx * 0.1}s`,
                }}
              >
                <span className="text-[9px] leading-none mt-0.5 shrink-0">{reason.icon}</span>
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.2em] shrink-0"
                    style={{ color: '#D4A017', opacity: 0.5, fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {reason.label}
                  </span>
                  <span
                    className="text-[10px] text-white/40 leading-snug truncate"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                  >
                    {reason.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Large COLLECT recommendation — the verdict itself */}
          <div
            className="mt-3 pt-2.5 flex items-center justify-center gap-2.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span
              className="text-[18px] font-bold uppercase tracking-[0.15em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: '#00E5A0',
                textShadow: '0 0 16px rgba(0,229,160,0.15)',
              }}
            >
              COLLECT
            </span>
            <span className="text-[9px] text-white/20 font-mono">
              ${tier.price} &middot; {tier.tier}
            </span>
          </div>
        </div>

        {/* Production footer */}
        <div
          className="px-4 py-1 flex items-center gap-2"
          style={{ backgroundColor: 'rgba(212,160,23,0.02)', borderTop: '1px solid rgba(255,255,255,0.02)' }}
        >
          <span className="text-[6px] font-mono uppercase tracking-[0.2em] text-white/8">
            TST BROADCAST
          </span>
          <div className="h-[1px] flex-1 bg-white/[0.02]" />
          <span className="text-[6px] font-mono uppercase tracking-[0.15em] text-white/8">
            {phase === 'CRITICAL' ? 'FINAL VERDICT' : phase === 'CLOSING' ? 'PRE-CLOSE VERDICT' : 'ANALYST CONSENSUS'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast Shot Clock — ESPN-style countdown graphic at the decision point.
// Every sports broadcast has the clock visible at crunch time. During the
// final minutes, ESPN shows a prominent game clock overlay — the entire
// broadcast centers around it. This compact graphic places a broadcast-style
// countdown directly above the CTA during CLOSING/CRITICAL phases, making
// urgency VISUAL at the exact purchase decision point. Previously, Broadcast
// relied on CommentatorCall text and the global countdown — but neither is
// visually prominent AT the CTA. Supreme has saleroom temperature, Arena has
// the purchase sparkline. Broadcast now has the shot clock.
// ---------------------------------------------------------------------------

function BroadcastShotClock({ totalSeconds, phase, rgb, teamColor, remaining }: {
  totalSeconds: number;
  phase: DropPhase;
  rgb: string;
  teamColor: string;
  remaining: number;
}) {
  // Progress: fraction of time remaining within the phase window
  // CLOSING: 600→120s, CRITICAL: 120→0s
  const maxSeconds = phase === 'CRITICAL' ? 120 : 600;
  const progress = Math.min(1, totalSeconds / maxSeconds);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;
  const isCritical = phase === 'CRITICAL';
  const phaseLabel = isCritical ? 'FINAL 2:00' : 'CLOSING';

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div
        className="relative overflow-hidden rounded-sm"
        style={{
          backgroundColor: 'rgba(11,14,20,0.95)',
          border: `1px solid ${isCritical ? 'rgba(239,68,68,0.25)' : `rgba(${rgb},0.15)`}`,
          boxShadow: isCritical
            ? '0 0 20px rgba(239,68,68,0.08), inset 0 0 20px rgba(239,68,68,0.03)'
            : `0 0 12px rgba(${rgb},0.06)`,
        }}
      >
        {/* Top accent bar — depleting progress indicator */}
        <div className="relative h-[2px] w-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <div
            className="absolute inset-y-0 left-0 transition-all duration-1000 ease-linear"
            style={{
              width: `${progress * 100}%`,
              background: isCritical
                ? 'linear-gradient(to right, #EF4444, #F59E0B)'
                : `linear-gradient(to right, ${teamColor}, rgba(${rgb},0.4))`,
            }}
          />
        </div>

        <div className="px-4 py-2.5 flex items-center justify-between">
          {/* Left: phase label + LIVE dot */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isCritical ? '#EF4444' : '#F59E0B',
                  animation: 'broadcast-live-dot-pulse 1.5s ease-in-out infinite',
                  boxShadow: isCritical
                    ? '0 0 6px rgba(239,68,68,0.5)'
                    : '0 0 4px rgba(245,158,11,0.4)',
                }}
              />
              <span
                className="text-[8px] font-bold uppercase tracking-[0.25em]"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: isCritical ? '#EF4444' : '#F59E0B',
                }}
              >
                {phaseLabel}
              </span>
            </div>
            {/* Edition count — scarcity at a glance */}
            <span className="text-[9px] text-white/25 font-mono tracking-wide">
              {remaining <= 5
                ? `${remaining} LEFT`
                : `${remaining.toLocaleString()} EDITIONS`}
            </span>
          </div>

          {/* Right: prominent countdown timer */}
          <div className="flex items-baseline gap-1">
            <span
              className={`text-[22px] font-bold tabular-nums tracking-tight leading-none ${
                isCritical && totalSeconds <= 30 ? 'broadcast-timer-pulse' : ''
              }`}
              style={{
                fontFamily: 'var(--font-oswald), monospace',
                color: isCritical
                  ? totalSeconds <= 30 ? '#EF4444' : '#F59E0B'
                  : 'white',
                textShadow: isCritical
                  ? `0 0 12px ${totalSeconds <= 30 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.2)'}`
                  : 'none',
              }}
            >
              {timeStr}
            </span>
          </div>
        </div>

        {/* Bottom production strip */}
        <div
          className="px-4 py-0.5 flex items-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)', backgroundColor: 'rgba(255,255,255,0.01)' }}
        >
          <span className="text-[6px] font-mono uppercase tracking-[0.2em] text-white/8">
            {isCritical ? 'GAME CLOCK · CRITICAL' : 'GAME CLOCK · LIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast BottomLine — ESPN's iconic scrolling ticker below the CTA.
// Runs in ALL phases (OPEN/CLOSING/CRITICAL). During OPEN it contextualizes
// the moment with editorial facts. During CLOSING/CRITICAL it escalates to
// urgency messaging. The BottomLine is the single most recognized ESPN UI
// element — adding it at the CTA creates persistent conversion support.
// ---------------------------------------------------------------------------

function BroadcastBottomLine({
  moment,
  dropPhase,
  totalSeconds,
  rgb,
  teamColor,
  recentCollectors,
}: {
  moment: Moment;
  dropPhase: DropPhase;
  totalSeconds: number;
  rgb: string;
  teamColor: string;
  recentCollectors: number;
}) {
  const remaining = moment.editionSize - moment.editionsClaimed;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

  // Phase-specific messages — editorial voice escalates with urgency
  const items: string[] = dropPhase === 'CRITICAL'
    ? [
        `FINAL ${timeStr}`,
        `${remaining.toLocaleString()} EDITIONS LEFT`,
        `${recentCollectors} COLLECTING NOW`,
        `${moment.player.toUpperCase()} · ${moment.statLine}`,
        `FROM $${moment.price}`,
      ]
    : dropPhase === 'CLOSING'
      ? [
          `CLOSING IN ${timeStr}`,
          `${moment.editionsClaimed.toLocaleString()} COLLECTED`,
          `${remaining.toLocaleString()} EDITIONS AVAILABLE`,
          `${moment.player.toUpperCase()} · ${moment.playType}`,
          `${moment.team} VS ${moment.opponent}`,
        ]
      : [
          `${moment.player.toUpperCase()} · ${moment.statLine}`,
          `${moment.editionSize.toLocaleString()} TOTAL EDITIONS`,
          `${moment.editionsClaimed.toLocaleString()} ALREADY COLLECTED`,
          `${moment.team} VS ${moment.opponent}`,
          `FROM $${moment.price}`,
          `${moment.playType.toUpperCase()}`,
        ];

  const crawlText = items.join('   ◆   ') + '   ◆   ' + items.join('   ◆   ');

  const accentColor = dropPhase === 'CRITICAL' ? '#EF4444' : dropPhase === 'CLOSING' ? '#F59E0B' : teamColor;
  const labelBg = dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : dropPhase === 'CLOSING' ? 'rgba(245,158,11,0.1)' : `rgba(${rgb},0.08)`;
  const labelText = dropPhase === 'CRITICAL' ? 'ALERT' : dropPhase === 'CLOSING' ? 'UPDATE' : 'BOTTOMLINE';

  return (
    <div
      className="w-full max-w-md mx-auto mt-3 rounded overflow-hidden"
      style={{
        height: '22px',
        background: `linear-gradient(90deg, rgba(${rgb},0.04) 0%, rgba(${rgb},0.02) 100%)`,
        borderTop: `0.5px solid ${accentColor}20`,
        borderBottom: `0.5px solid ${accentColor}10`,
      }}
    >
      <div className="relative h-full flex items-center">
        {/* Label — pinned left */}
        <div
          className="relative z-10 flex items-center h-full px-2 shrink-0"
          style={{
            background: labelBg,
            borderRight: `0.5px solid ${accentColor}30`,
          }}
        >
          <span
            className="text-[7px] font-bold tracking-[0.2em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: accentColor,
            }}
          >
            {labelText}
          </span>
        </div>

        {/* Scrolling text */}
        <div className="flex-1 overflow-hidden h-full flex items-center">
          <div
            className="broadcast-bottomline-scroll whitespace-nowrap"
            style={{
              color: `${accentColor}90`,
              fontSize: '8px',
              fontFamily: 'var(--font-mono), monospace',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {crawlText}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Broadcast Ratings Spike — "Peak Viewership" chart showing the moment's
// audience spike. ESPN tracks live ratings and highlights peak moments.
// A sparkline SVG shows viewership ramping up then spiking at the play,
// with the peak value called out. Ratings are the broadcast industry's
// ultimate validation — "America was watching when this happened."
// ---------------------------------------------------------------------------

const RATINGS_DATA: Record<string, { peak: string; avg: string; share: string }> = {
  bam: { peak: '4.2M', avg: '2.8M', share: '12.4' },
  jokic: { peak: '3.9M', avg: '2.5M', share: '11.1' },
  sga: { peak: '5.1M', avg: '3.3M', share: '14.7' },
};

function RatingsSpike({ moment, rgb }: { moment: Moment; rgb: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = RATINGS_DATA[moment.id] ?? RATINGS_DATA.bam;

  // Generate sparkline points: gradual rise, sharp spike at ~75%, drop-off
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    const w = 240;
    const h = 48;
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const t = i / steps;
      // Base curve: gradual rise
      let y = h - (t * 0.4 * h);
      // Spike at 75%
      const dist = Math.abs(t - 0.75);
      if (dist < 0.12) {
        const spike = 1 - dist / 0.12;
        y = h - (0.4 * h + spike * 0.55 * h);
      }
      // Add slight noise
      y += (Math.sin(i * 3.7) * 2);
      pts.push([x, Math.max(2, Math.min(h - 2, y))]);
    }
    return pts;
  }, []);

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${points[points.length - 1][0].toFixed(1)},48 L0,48 Z`;

  // Peak point coordinates
  const peakPt = points.reduce((min, p) => p[1] < min[1] ? p : min, points[0]);

  return (
    <div ref={ref} className="mt-8 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
          style={{
            backgroundColor: `rgba(${rgb},0.12)`,
            color: moment.teamColors.primary,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Ratings
        </span>
        <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20">
          Live Viewership
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.06]" />
      </div>

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-md border"
        style={{
          borderColor: `rgba(${rgb},0.12)`,
          backgroundColor: 'rgba(20,25,37,0.5)',
        }}
      >
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: `${moment.teamColors.primary}40` }}
        />

        <div className="px-4 pt-3 pb-2">
          {/* Peak viewership headline */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span
                className="text-[22px] font-bold tabular-nums leading-none"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  color: moment.teamColors.primary,
                  textShadow: `0 0 12px rgba(${rgb},0.2)`,
                }}
              >
                {data.peak}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Peak Viewers
              </span>
            </div>
            <span className="text-[9px] font-mono tabular-nums text-white/20">
              {data.share} share
            </span>
          </div>

          {/* Sparkline chart */}
          <div className="relative" style={{ height: 48 }}>
            <svg
              width="100%"
              height="48"
              viewBox="0 0 240 48"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* Gradient fill under the line */}
              <defs>
                <linearGradient id={`ratings-grad-${moment.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={moment.teamColors.primary} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={moment.teamColors.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area fill */}
              <path
                d={areaD}
                fill={`url(#ratings-grad-${moment.id})`}
                className="transition-opacity duration-1000"
                style={{ opacity: visible ? 1 : 0 }}
              />
              {/* Line */}
              <path
                d={pathD}
                fill="none"
                stroke={moment.teamColors.primary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-1000"
                style={{
                  opacity: visible ? 0.8 : 0,
                  strokeDasharray: visible ? 'none' : '600',
                  strokeDashoffset: visible ? 0 : 600,
                }}
              />
              {/* Peak dot */}
              {visible && (
                <>
                  <circle
                    cx={peakPt[0]}
                    cy={peakPt[1]}
                    r="3"
                    fill={moment.teamColors.primary}
                    opacity="0.9"
                  />
                  <circle
                    cx={peakPt[0]}
                    cy={peakPt[1]}
                    r="6"
                    fill="none"
                    stroke={moment.teamColors.primary}
                    strokeWidth="0.5"
                    opacity="0.4"
                    className="broadcast-ratings-peak-ring"
                  />
                </>
              )}
              {/* "THE PLAY" label at peak */}
              {visible && (
                <text
                  x={peakPt[0]}
                  y={peakPt[1] - 10}
                  textAnchor="middle"
                  fontSize="6"
                  fill="white"
                  opacity="0.4"
                  fontWeight="700"
                  letterSpacing="0.15em"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  THE PLAY
                </text>
              )}
            </svg>
          </div>

          {/* Footer — avg viewership + context */}
          <div className="flex items-center justify-between mt-1.5 pt-1.5"
            style={{ borderTop: `1px solid rgba(${rgb},0.08)` }}
          >
            <span className="text-[8px] text-white/15 tracking-wide">
              Avg: {data.avg} &middot; Most-watched moment of the night
            </span>
            {/* Live dot */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-red-500/60 broadcast-live-dot" />
              <span className="text-[7px] font-mono uppercase tracking-wider text-white/15">
                Nielsen
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SportsCenterTop10({ moment, rgb }: { moment: Moment; rgb: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = SC_TOP_10[moment.id] ?? SC_TOP_10.bam;

  return (
    <div ref={ref} className="mt-8 mb-4">
      {/* Broadcast graphic header */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
          style={{
            backgroundColor: `rgba(${rgb},0.12)`,
            color: moment.teamColors.primary,
            fontFamily: 'var(--font-oswald), sans-serif',
          }}
        >
          Top 10
        </span>
        <span
          className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20"
        >
          SportsCenter
        </span>
        <div className="h-[1px] flex-1 bg-white/[0.06]" />
      </div>

      {/* Card */}
      <div
        className="relative overflow-hidden rounded-md border"
        style={{
          borderColor: `rgba(${rgb},0.12)`,
          backgroundColor: 'rgba(20,25,37,0.5)',
        }}
      >
        {/* Team-color top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: `${moment.teamColors.primary}40` }}
        />

        {/* #1 Play — highlighted row */}
        <div
          className="relative flex items-center gap-3 px-4 py-3.5 border-b"
          style={{
            borderColor: `rgba(${rgb},0.08)`,
            backgroundColor: `rgba(${rgb},0.04)`,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Rank badge — large "#1" with team-color glow */}
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0"
            style={{
              backgroundColor: `rgba(${rgb},0.15)`,
              border: `1px solid ${moment.teamColors.primary}40`,
              boxShadow: visible ? `0 0 16px rgba(${rgb},0.2)` : 'none',
              transition: 'box-shadow 0.8s ease-out 0.3s',
            }}
          >
            <span
              className="text-[22px] font-bold leading-none"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: moment.teamColors.primary,
              }}
            >
              1
            </span>
          </div>
          {/* Play description */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.04em] text-white/75 leading-snug"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {data.rank1Desc}
            </p>
            <p className="text-[9px] text-white/25 mt-0.5 tracking-wide">
              {fullTeam(moment.team)} vs {fullTeam(moment.opponent)} &middot; Tonight
            </p>
          </div>
          {/* Highlight indicator — pulsing team-color dot */}
          <div
            className="w-[6px] h-[6px] rounded-full flex-shrink-0 animate-pulse"
            style={{ backgroundColor: moment.teamColors.primary }}
          />
        </div>

        {/* Remaining plays — dimmed rows */}
        {data.others.map((play, i) => (
          <div
            key={play.rank}
            className="flex items-center gap-3 px-4 py-2 border-b last:border-b-0"
            style={{
              borderColor: 'rgba(255,255,255,0.03)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.5s ease-out ${0.15 + i * 0.1}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.1}s`,
            }}
          >
            {/* Rank number — small, dimmed */}
            <span
              className="text-[14px] font-bold tabular-nums w-10 text-center flex-shrink-0 text-white/15"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {play.rank}
            </span>
            {/* Description */}
            <p className="text-[10px] text-white/20 tracking-wide truncate">
              {play.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cinematic Section Reveal — line expands from center on scroll-into-view
// ---------------------------------------------------------------------------

function SectionRevealLine({ teamColor }: { teamColor: string }) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={lineRef} className="mx-auto max-w-2xl px-5 md:px-10">
      <div
        className={`h-[1px] broadcast-reveal-line ${revealed ? 'broadcast-reveal-line-active' : ''}`}
        style={{
          background: `linear-gradient(90deg, transparent, ${teamColor}50 30%, ${teamColor} 50%, ${teamColor}50 70%, transparent)`,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teleprompter Pull Quote — typewriter reveal on scroll-into-view
// ---------------------------------------------------------------------------

function TeleprompterQuote({ moment, rgb }: { moment: Moment; rgb: string }) {
  const quoteRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const quoteText = `${moment.historicalNote.split('.')[0]}.`;
  const { displayText, done, started } = useTypewriter(quoteText, isVisible, 28);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={quoteRef} className="mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-10">
      <blockquote
        className="relative pl-6 border-l-[3px]"
        style={{ borderColor: `${moment.teamColors.primary}70` }}
      >
        {/* Oversized decorative quotation mark — ESPN quote graphic energy */}
        <span
          className="absolute -left-1 -top-4 text-[4rem] leading-none font-bold pointer-events-none select-none"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: `${moment.teamColors.primary}20`,
          }}
        >
          &ldquo;
        </span>
        <p
          className="relative text-2xl leading-[1.55] text-white/60 md:text-[1.75rem] md:leading-[1.5]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic', minHeight: '4.5em' }}
        >
          {started ? displayText : '\u00A0'}
          {started && !done && (
            <span
              className="broadcast-teleprompter-cursor"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
          )}
          {done && (
            <span
              className="broadcast-teleprompter-cursor-done"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
          )}
        </p>
        <footer
          className="mt-4 flex items-center gap-2.5 transition-opacity duration-500"
          style={{ opacity: done ? 1 : 0 }}
        >
          <div
            className="h-[1px] w-6"
            style={{ backgroundColor: `${moment.teamColors.primary}50` }}
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            {moment.context}
          </span>
        </footer>
      </blockquote>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Live Acquisition Lower-Third — ESPN-style "just claimed" social proof
// At ESPN/TNT, breaking updates slide in as lower-third graphics during live
// coverage. This simulates real-time purchases as broadcast news updates,
// creating social proof at any scroll position. Distinctly Broadcast: Supreme
// whispers bids, Arena shouts with floating toasts, Broadcast presents them
// as editorial graphics with team-color accents and production labels.
// ---------------------------------------------------------------------------

const ACQUISITION_NAMES = [
  'Mike R.', 'Sarah K.', 'JayHoops', 'DunkCity', 'Alex M.',
  'NBAFan99', 'Chris B.', 'TopShot_OG', 'BallDontLie', 'Maya W.',
  'HoopsJunkie', 'TripleDbl', 'FastBreak', 'CourtVision', 'Dime_Drop',
];

interface AcquisitionEvent {
  id: number;
  name: string;
  edition: number;
}

function useAcquisitionFeed(baseClaimed: number, isEnded: boolean) {
  const [latest, setLatest] = useState<AcquisitionEvent | null>(null);
  const editionRef = useRef(baseClaimed);
  const idRef = useRef(0);

  useEffect(() => {
    if (isEnded) return;
    let timer: ReturnType<typeof setTimeout>;
    const fire = () => {
      const delay = 3500 + Math.random() * 5000;
      timer = setTimeout(() => {
        editionRef.current += 1;
        idRef.current += 1;
        const name = ACQUISITION_NAMES[Math.floor(Math.random() * ACQUISITION_NAMES.length)];
        setLatest({ id: idRef.current, name, edition: editionRef.current });
        // Clear after display duration
        setTimeout(() => setLatest(null), 3200);
        fire();
      }, delay);
    };
    fire();
    return () => clearTimeout(timer);
  }, [isEnded]);

  return latest;
}

// Tier claim flash — picks a random tier to "flash" when an acquisition fires.
// Broadcast-style: a brief editorial reaction on the card, not Arena-style
// pulse rings. The card gets a team-color bottom wipe with "NEW" label.
function useTierClaimFlash(event: AcquisitionEvent | null, tierCount: number) {
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const prevEventId = useRef<number | null>(null);

  useEffect(() => {
    if (!event || event.id === prevEventId.current) return;
    prevEventId.current = event.id;
    const idx = Math.floor(Math.random() * tierCount);
    setFlashIdx(idx);
    setFlashKey((k) => k + 1);
    const t = setTimeout(() => setFlashIdx(null), 2200);
    return () => clearTimeout(t);
  }, [event, tierCount]);

  return { flashIdx, flashKey };
}

function AcquisitionLowerThird({ event, teamColor, rgb }: {
  event: AcquisitionEvent;
  teamColor: string;
  rgb: string;
}) {
  return (
    <div
      key={event.id}
      className="fixed bottom-20 left-4 right-4 z-[52] pointer-events-none flex justify-center"
    >
      <div
        className="broadcast-acquisition-lower-third relative overflow-hidden rounded-sm max-w-sm w-full"
        style={{
          backgroundColor: `rgba(${rgb},0.08)`,
          border: `1px solid rgba(${rgb},0.15)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Team-color left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: teamColor }}
        />
        <div className="flex items-center gap-2.5 px-4 py-2.5">
          {/* Live dot */}
          <span className="relative flex h-[5px] w-[5px] shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ backgroundColor: teamColor }}
            />
            <span
              className="relative inline-flex h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: teamColor }}
            />
          </span>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[7px] font-bold uppercase tracking-[0.3em]"
                style={{ fontFamily: 'var(--font-oswald), sans-serif', color: teamColor, opacity: 0.8 }}
              >
                New Acquisition
              </span>
            </div>
            <p className="text-[10px] text-white/50 mt-0.5 truncate">
              <span className="font-semibold text-white/60">{event.name}</span>
              {' '}claimed Edition{' '}
              <span className="font-mono tabular-nums" style={{ color: `rgba(${rgb},0.7)` }}>
                #{event.edition.toLocaleString()}
              </span>
            </p>
          </div>
          {/* SMPTE timestamp */}
          <span className="text-[7px] font-mono tabular-nums text-white/15 shrink-0">
            LIVE
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Commentator's Call — play-by-play urgency narration above CTA
// The announcer's voice IS the urgency in a broadcast. "Shot clock winding
// down..." makes you hold your breath. Per-moment, per-phase quotes from
// recognizable broadcast voices create editorial tension before the buy.
// ---------------------------------------------------------------------------

const COMMENTATOR_URGENCY_CALLS: Record<string, Record<'CLOSING' | 'CRITICAL', { voice: string; call: string }[]>> = {
  bam: {
    CLOSING: [
      { voice: 'Mike Breen', call: 'The window is closing on this moment — collectors moving fast.' },
      { voice: 'Jeff Van Gundy', call: 'If you\'re on the fence, this is your last commercial break.' },
    ],
    CRITICAL: [
      { voice: 'Mike Breen', call: 'Final moments. This is it. Don\'t let this one get away.' },
      { voice: 'Mark Jackson', call: 'Mama, there goes that moment — going, going...' },
    ],
  },
  jokic: {
    CLOSING: [
      { voice: 'Kevin Harlan', call: 'Time running short — the Joker waits for no one.' },
      { voice: 'Reggie Miller', call: 'Are you kidding me? This moment won\'t last.' },
    ],
    CRITICAL: [
      { voice: 'Kevin Harlan', call: 'The clock is against you! This is the final possession!' },
      { voice: 'Reggie Miller', call: 'No OT tonight — it\'s now or never.' },
    ],
  },
  sga: {
    CLOSING: [
      { voice: 'Ian Eagle', call: 'The young man is special — and editions are moving.' },
      { voice: 'Richard Jefferson', call: 'Don\'t overthink this one. Trust your instincts.' },
    ],
    CRITICAL: [
      { voice: 'Ian Eagle', call: 'Down to the wire! SGA\'s moment is about to close!' },
      { voice: 'Richard Jefferson', call: 'Last call. The bucket is about to be empty.' },
    ],
  },
};

function CommentatorCall({ momentId, phase, totalSeconds, teamColor, rgb }: {
  momentId: string;
  phase: 'CLOSING' | 'CRITICAL';
  totalSeconds: number;
  teamColor: string;
  rgb: string;
}) {
  // Pick a call based on seconds remaining for variety
  const calls = COMMENTATOR_URGENCY_CALLS[momentId]?.[phase] ?? COMMENTATOR_URGENCY_CALLS.bam[phase];
  const callIdx = totalSeconds % calls.length;
  const { voice, call } = calls[callIdx];

  return (
    <div
      className="mb-4 w-full max-w-md rounded-lg overflow-hidden"
      style={{
        animation: 'broadcast-commentator-call 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        border: `1px solid ${phase === 'CRITICAL' ? 'rgba(239,68,68,0.2)' : `rgba(${rgb},0.15)`}`,
        background: phase === 'CRITICAL'
          ? 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(11,14,20,0.95) 100%)'
          : `linear-gradient(135deg, rgba(${rgb},0.05) 0%, rgba(11,14,20,0.95) 100%)`,
      }}
    >
      {/* Accent bar — team color or red for critical */}
      <div
        className="h-[2px]"
        style={{
          background: phase === 'CRITICAL'
            ? 'linear-gradient(90deg, #EF4444, #EF444460, #EF4444)'
            : `linear-gradient(90deg, ${teamColor}, ${teamColor}60, ${teamColor})`,
        }}
      />
      <div className="px-4 py-3">
        {/* Voice attribution — small, authoritative */}
        <div className="flex items-center gap-2 mb-1.5">
          {/* Mic icon */}
          <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="none" style={{ color: phase === 'CRITICAL' ? '#EF4444' : teamColor }}>
            <path d="M8 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" fill="currentColor" opacity="0.6" />
            <path d="M4 7v1a4 4 0 008 0V7M8 12v2.5M6 14.5h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
          <span
            className="text-[8px] font-bold uppercase tracking-[0.25em]"
            style={{
              fontFamily: 'var(--font-oswald), sans-serif',
              color: phase === 'CRITICAL' ? 'rgba(239,68,68,0.6)' : `rgba(${rgb},0.5)`,
            }}
          >
            {voice}
          </span>
          {/* LIVE indicator */}
          <span className="relative flex h-[5px] w-[5px] ml-auto">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
              style={{ backgroundColor: phase === 'CRITICAL' ? '#EF4444' : teamColor }}
            />
            <span
              className="relative inline-flex h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: phase === 'CRITICAL' ? '#EF4444' : teamColor }}
            />
          </span>
        </div>
        {/* The call itself — editorial italic for broadcast voice */}
        <p
          className="text-[13px] leading-snug text-white/70"
          style={{
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
          }}
        >
          &ldquo;{call}&rdquo;
        </p>
      </div>
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
  const [leaderDone, setLeaderDone] = useState(false);
  const handleLeaderComplete = useCallback(() => setLeaderDone(true), []);

  // Special Report alert — one-shot ESPN breaking news banner after leader finishes
  const [specialReport, setSpecialReport] = useState<'waiting' | 'in' | 'out' | 'done'>('waiting');
  useEffect(() => {
    if (!leaderDone) return;
    // Slide in 0.8s after leader completes
    const t1 = setTimeout(() => { setSpecialReport('in'); BROADCAST_HAPTIC.specialReport(); }, 800);
    // Hold 3s then slide out
    const t2 = setTimeout(() => setSpecialReport('out'), 3800);
    const t3 = setTimeout(() => setSpecialReport('done'), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [leaderDone]);

  // Score Update alert — "around the league" score from another game
  const [scoreUpdatePhase, setScoreUpdatePhase] = useState<'waiting' | 'in' | 'hold' | 'out' | 'done'>('waiting');
  useEffect(() => {
    if (!leaderDone) return;
    // Fire 8s after leader completes — enough time to absorb the hero
    const t1 = setTimeout(() => setScoreUpdatePhase('in'), 8000);
    const t2 = setTimeout(() => setScoreUpdatePhase('hold'), 8500);
    const t3 = setTimeout(() => setScoreUpdatePhase('out'), 12500);
    const t4 = setTimeout(() => setScoreUpdatePhase('done'), 13000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [leaderDone]);

  // Channel switch static — brief TV static flash + channel number on tier change
  const [channelSwitch, setChannelSwitch] = useState<number | null>(null);
  const prevTierRef = useRef(0);
  const handleTierSelect = useCallback((idx: number) => {
    if (idx === prevTierRef.current) return;
    prevTierRef.current = idx;
    setChannelSwitch(idx + 1); // CH 1, CH 2, CH 3, CH 4
    setSelectedTierIdx(idx);
    BROADCAST_HAPTIC.channelSwitch();
    const t = setTimeout(() => setChannelSwitch(null), 400);
    return () => clearTimeout(t);
  }, []);
  // Replay count — increments periodically like a broadcast replaying the highlight
  const [replayCount, setReplayCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setReplayCount((prev) => Math.min(prev + 1, 12));
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  // Replay angle graphic — camera angle label that fires on each replay increment
  const REPLAY_ANGLES = ['REVERSE ANGLE', 'BASELINE CAM', 'SKY CAM', 'ISO PLAYER', 'CORNER CAM', 'WIDE SHOT', 'CLOSE-UP', 'PRESS ROW'];
  const [replayAngle, setReplayAngle] = useState<string | null>(null);
  const prevReplayCount = useRef(replayCount);
  useEffect(() => {
    if (replayCount !== prevReplayCount.current) {
      prevReplayCount.current = replayCount;
      const angle = REPLAY_ANGLES[(replayCount - 1) % REPLAY_ANGLES.length];
      setReplayAngle(angle);
      const t = setTimeout(() => setReplayAngle(null), 2400);
      return () => clearTimeout(t);
    }
  }, [replayCount]);

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showPip, setShowPip] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const transactionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const countdown = useCountdown(SALE_DURATION_MS[params.momentId as string] ?? 12 * 60 * 1000);
  const proto = usePrototypeState(momentId);

  // Purchase stage progression (3 stages in 1.5s) with broadcast haptic cues
  useEffect(() => {
    if (proto.state !== 'purchasing') {
      setPurchaseStage(0);
      return;
    }
    BROADCAST_HAPTIC.purchaseStage(0);
    const t1 = setTimeout(() => { setPurchaseStage(1); BROADCAST_HAPTIC.purchaseStage(1); }, 500);
    const t2 = setTimeout(() => { setPurchaseStage(2); BROADCAST_HAPTIC.purchaseStage(2); }, 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [proto.state]);

  // "SOLD TO" lower-third — broadcast auction announcement on purchase confirmation
  const [soldToVisible, setSoldToVisible] = useState(false);
  useEffect(() => {
    if (proto.state === 'purchasing' && purchaseStage === 2) {
      setSoldToVisible(true);
    } else if (proto.state !== 'purchasing') {
      setSoldToVisible(false);
    }
  }, [proto.state, purchaseStage]);

  // Broadcast bumper — production transition between purchasing and W screen
  // Intercepts the purchasing→confirmed transition with a swoosh wipe + "COLLECTED" slate
  const [bumperActive, setBumperActive] = useState(false);
  const prevProtoState = useRef(proto.state);
  useEffect(() => {
    const prev = prevProtoState.current;
    prevProtoState.current = proto.state;
    if (prev === 'purchasing' && proto.state === 'confirmed') {
      setBumperActive(true);
      const t = setTimeout(() => setBumperActive(false), 950);
      return () => clearTimeout(t);
    }
  }, [proto.state]);

  // Sticky bottom bar: show when main CTA scrolls out of viewport
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // PiP — mini hero thumbnail when hero scrolls out of view (broadcast picture-in-picture)
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowPip(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "Continuing Live Coverage" bumper — fires once when transaction section enters view
  const [coverageBumper, setCoverageBumper] = useState<'hidden' | 'in' | 'out' | 'done'>('hidden');
  useEffect(() => {
    const el = transactionRef.current;
    if (!el) return;
    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired && !countdown.isEnded) {
          fired = true;
          setCoverageBumper('in');
          const t1 = setTimeout(() => setCoverageBumper('out'), 2200);
          const t2 = setTimeout(() => setCoverageBumper('done'), 2800);
          return () => { clearTimeout(t1); clearTimeout(t2); };
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [countdown.isEnded]);

  // Producer cue — ESPN "Scroll to Continue" nudge fires 10s after page load
  // if the user hasn't scrolled to the transaction section. Addresses the
  // 67-82% bounce rate by re-engaging viewers stuck in the editorial section.
  // The producer in the control room cues the next segment.
  const [producerCue, setProducerCue] = useState<'waiting' | 'in' | 'out' | 'done'>('waiting');
  const hasReachedTransactionRef = useRef(false);
  useEffect(() => {
    // Track if user scrolls to transaction section
    const el = transactionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasReachedTransactionRef.current = true;
          setProducerCue((prev) => (prev === 'waiting' ? 'done' : prev));
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!leaderDone || countdown.isEnded) return;
    // Fire 10s after leader completes — gives user time to absorb the hero
    const t1 = setTimeout(() => {
      if (!hasReachedTransactionRef.current) {
        setProducerCue('in');
      }
    }, 10000);
    const t2 = setTimeout(() => {
      setProducerCue((prev) => (prev === 'in' ? 'out' : prev));
    }, 14000); // Hold 4s
    const t3 = setTimeout(() => {
      setProducerCue((prev) => (prev === 'out' ? 'done' : prev));
    }, 14700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [leaderDone, countdown.isEnded]);

  // Feed cut — brief static band on phase transition (camera feed switch)
  // Crash zoom — broadcast director punch-in on phase shift
  // Quarter break bumper — ESPN quarter-transition graphic on phase change
  const [feedCut, setFeedCut] = useState(false);
  const [camLabel, setCamLabel] = useState('ISO CAM 1');
  const [crashZoom, setCrashZoom] = useState(false);
  const [quarterBumper, setQuarterBumper] = useState<{ phase: 'CLOSING' | 'CRITICAL'; state: 'in' | 'hold' | 'out' } | null>(null);
  const prevBroadcastPhase = useRef<DropPhase>('OPEN');
  useEffect(() => {
    const currentPhase = derivePhase(countdown.totalSeconds);
    const prev = prevBroadcastPhase.current;
    prevBroadcastPhase.current = currentPhase;
    if (
      (prev === 'OPEN' && currentPhase === 'CLOSING') ||
      (prev === 'CLOSING' && currentPhase === 'CRITICAL')
    ) {
      setFeedCut(true);
      setCrashZoom(true);
      setCamLabel(currentPhase === 'CLOSING' ? 'ISO CAM 2' : 'ISO CAM 3');
      BROADCAST_HAPTIC.phaseBumper(currentPhase as 'CLOSING' | 'CRITICAL');
      // Quarter break bumper: in → hold → out → gone
      setQuarterBumper({ phase: currentPhase as 'CLOSING' | 'CRITICAL', state: 'in' });
      const tHold = setTimeout(() => setQuarterBumper((prev) => prev ? { ...prev, state: 'hold' } : null), 400);
      const tOut = setTimeout(() => setQuarterBumper((prev) => prev ? { ...prev, state: 'out' } : null), 2400);
      const tGone = setTimeout(() => setQuarterBumper(null), 3000);
      const t = setTimeout(() => setFeedCut(false), 350);
      const t2 = setTimeout(() => setCrashZoom(false), 500);
      return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(tHold); clearTimeout(tOut); clearTimeout(tGone); };
    }
  }, [countdown.totalSeconds]);

  // Broadcast Wrap — sign-off ceremony when clock expires (CRITICAL→ENDED)
  // ESPN/TNT live broadcasts end with a dramatic sign-off: the host wraps,
  // the theme sting plays, and the screen fades to the network card. This
  // overlay fires once on the CRITICAL→ENDED transition to punctuate the
  // end of the live broadcast window. Dedicated ref avoids conflict with
  // prevBroadcastPhase (already consumed by feed-cut/quarter-bumper above).
  const [broadcastWrap, setBroadcastWrap] = useState(false);
  const prevPhaseForWrapRef = useRef<DropPhase>('OPEN');
  useEffect(() => {
    const currentPhase = derivePhase(countdown.totalSeconds);
    const prev = prevPhaseForWrapRef.current;
    prevPhaseForWrapRef.current = currentPhase;
    if (prev === 'CRITICAL' && currentPhase === 'ENDED' && proto.state !== 'purchasing' && proto.state !== 'confirmed') {
      setBroadcastWrap(true);
      BROADCAST_HAPTIC.phaseBumper('CRITICAL');
      const t = setTimeout(() => setBroadcastWrap(false), 2200);
      return () => clearTimeout(t);
    }
  }, [countdown.totalSeconds, proto.state]);

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
  const smpteTimecode = useSmpteTimecode(countdown.isEnded);
  const acquisitionEvent = useAcquisitionFeed(moment?.editionsClaimed ?? 0, countdown.isEnded);
  const tierClaimFlash = useTierClaimFlash(acquisitionEvent, moment.rarityTiers.length);

  // ── Confirmed: Certificate of Ownership ────────────────────────────────
  if (proto.state === 'confirmed') {
    if (bumperActive) {
      return (
        <div className="fixed inset-0 z-50 bg-[#0B0E14]">
          <BroadcastBumper
            teamColor={moment.teamColors.primary}
            rgb={rgb}
            playerName={moment.player}
          />
        </div>
      );
    }
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
      {/* ━━━ BROADCAST COUNTDOWN LEADER — 3-2-1-LIVE intro sequence ━━━ */}
      {!leaderDone && (
        <BroadcastCountdownLeader
          teamColor={moment.teamColors.primary}
          rgb={rgb}
          onComplete={handleLeaderComplete}
        />
      )}

      {/* Subtle team-color ambient wash */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(${rgb},0.08) 0%, transparent 70%)`,
        }}
      />

      {/* ━━━ FEED CUT — camera switch static band on phase transition ━━━ */}
      {feedCut && <div className="broadcast-feed-cut" />}

      {/* ━━━ QUARTER BREAK BUMPER — ESPN quarter-transition graphic on phase change ━━━ */}
      {/* Every ESPN/TNT broadcast shows a dramatic quarter-break graphic between       */}
      {/* periods: the team logos swoosh in, "END OF 3RD QUARTER" slams center, the     */}
      {/* network brand flashes. This fires when the drop phase transitions (OPEN →     */}
      {/* CLOSING, CLOSING → CRITICAL) to make the urgency escalation unmissable.       */}
      {/* Without it, users might not notice the phase changed — the feed cut flash is  */}
      {/* too subtle. This adds broadcast-weight to the moment the clock gets serious.  */}
      {quarterBumper && (
        <div
          className="fixed inset-0 z-[55] pointer-events-none flex items-center justify-center"
          style={{
            opacity: quarterBumper.state === 'out' ? 0 : 1,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          {/* Dark scrim — broadcast cuts to near-black between segments */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: quarterBumper.state === 'in' ? 'rgba(11,14,20,0.96)' : 'rgba(11,14,20,0.88)',
              transition: 'background-color 0.4s ease-out',
            }}
          />

          {/* Team-color accent swoosh — top and bottom lines that wipe in */}
          <div
            className="absolute top-[42%] left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${
                quarterBumper.phase === 'CRITICAL' ? '#EF4444' : '#F59E0B'
              } 50%, transparent 95%)`,
              opacity: quarterBumper.state === 'in' ? 0 : 0.6,
              transition: 'opacity 0.3s ease-out 0.15s',
            }}
          />
          <div
            className="absolute bottom-[42%] left-0 right-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${
                quarterBumper.phase === 'CRITICAL' ? '#EF4444' : '#F59E0B'
              } 50%, transparent 95%)`,
              opacity: quarterBumper.state === 'in' ? 0 : 0.6,
              transition: 'opacity 0.3s ease-out 0.15s',
            }}
          />

          {/* Center content — phase announcement */}
          <div
            className="relative z-10 flex flex-col items-center gap-2"
            style={{
              transform: quarterBumper.state === 'in'
                ? 'scale(1.15)'
                : quarterBumper.state === 'out'
                  ? 'scale(0.95)'
                  : 'scale(1)',
              opacity: quarterBumper.state === 'in' ? 0 : 1,
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out',
            }}
          >
            {/* Phase label — small tracked header */}
            <span
              className="text-[9px] font-bold uppercase tracking-[0.4em]"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: quarterBumper.phase === 'CRITICAL' ? '#EF444490' : '#F59E0B90',
              }}
            >
              {quarterBumper.phase === 'CRITICAL' ? 'Broadcast Alert' : 'Drop Update'}
            </span>

            {/* Main headline — large broadcast text */}
            <span
              className="text-[clamp(1.8rem,7vw,3.2rem)] font-bold uppercase leading-none tracking-tight text-center"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                color: quarterBumper.phase === 'CRITICAL' ? '#EF4444' : '#F59E0B',
                textShadow: quarterBumper.phase === 'CRITICAL'
                  ? '0 0 30px rgba(239,68,68,0.3), 0 0 80px rgba(239,68,68,0.1)'
                  : '0 0 30px rgba(245,158,11,0.3), 0 0 80px rgba(245,158,11,0.1)',
              }}
            >
              {quarterBumper.phase === 'CRITICAL' ? 'Final 2 Minutes' : 'Final Minutes'}
            </span>

            {/* Sub-label — team-color accent */}
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-white/25 mt-1"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {moment.player} &middot; {moment.team} vs {moment.opponent}
            </span>

            {/* Team-color dot separator */}
            <div
              className="mt-2 h-[3px] w-[3px] rounded-full"
              style={{
                backgroundColor: moment.teamColors.primary,
                boxShadow: `0 0 6px ${moment.teamColors.primary}60`,
              }}
            />
          </div>
        </div>
      )}

      {/* ━━━ BROADCAST WRAP — sign-off ceremony on CRITICAL→ENDED ━━━━━━━━━━ */}
      {/* ESPN/TNT broadcasts end with a dramatic wrap: horizontal wipe,       */}
      {/* "BROADCAST CONCLUDED" headline, player + stat line, theme sting.     */}
      {/* This fires once when the live window expires — the broadcast         */}
      {/* equivalent of Supreme's "LOT CLOSED" ceremony (cycle 240).          */}
      {broadcastWrap && (
        <div className="fixed inset-0 z-[57] pointer-events-none flex items-center justify-center">
          {/* Full-screen team-color wipe — horizontal sweep L→R */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${moment.teamColors.primary}18 0%, rgba(${rgb},0.06) 60%, transparent 100%)`,
              animation: 'broadcast-wrap-wipe 2.2s cubic-bezier(0.22,1,0.36,1) forwards',
            }}
          />
          {/* Horizontal rule — sweeps from center */}
          <div
            className="absolute left-0 right-0 h-[1px]"
            style={{
              top: '46%',
              background: `linear-gradient(90deg, transparent 10%, ${moment.teamColors.primary}60 40%, ${moment.teamColors.primary}60 60%, transparent 90%)`,
              transformOrigin: 'center',
              animation: 'broadcast-wrap-rule 1.6s cubic-bezier(0.22,1,0.36,1) 0.15s both',
            }}
          />
          {/* Center card — headline + stat */}
          <div
            className="relative text-center px-10 py-5"
            style={{
              backgroundColor: 'rgba(11,14,20,0.8)',
              backdropFilter: 'blur(8px)',
              borderTop: `2px solid ${moment.teamColors.primary}50`,
              borderBottom: `2px solid ${moment.teamColors.primary}50`,
              animation: 'broadcast-wrap-card 1.8s cubic-bezier(0.22,1,0.36,1) 0.1s both',
            }}
          >
            {/* "BROADCAST CONCLUDED" — tracked Oswald headline */}
            <p
              className="text-[clamp(1rem,3.5vw,1.6rem)] font-bold uppercase tracking-[0.35em] text-white/60"
              style={{
                fontFamily: 'var(--font-oswald), sans-serif',
                animation: 'broadcast-wrap-text 1.6s cubic-bezier(0.22,1,0.36,1) 0.25s both',
              }}
            >
              Broadcast Concluded
            </p>
            {/* Player + stat — team-color accent */}
            <p
              className="mt-2 text-[11px] uppercase tracking-[0.2em]"
              style={{
                color: `${moment.teamColors.primary}90`,
                fontFamily: 'var(--font-oswald), sans-serif',
                animation: 'broadcast-wrap-stat 1.4s cubic-bezier(0.22,1,0.36,1) 0.5s both',
              }}
            >
              {moment.player} &middot; {moment.statLine}
            </p>
            {/* Team-color dot — anchor */}
            <div
              className="mx-auto mt-3 h-[3px] w-[3px] rounded-full"
              style={{
                backgroundColor: moment.teamColors.primary,
                boxShadow: `0 0 8px ${moment.teamColors.primary}60`,
                animation: 'broadcast-wrap-stat 1.4s cubic-bezier(0.22,1,0.36,1) 0.65s both',
              }}
            />
          </div>
          {/* Brief screen flash — broadcast transition sting */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(${rgb},0.08)`,
              animation: 'broadcast-wrap-flash 0.6s ease-out forwards',
            }}
          />
        </div>
      )}

      {/* ━━━ BREAKING NEWS CUT-IN — full-screen overlay during purchase processing ━━━ */}
      {isPurchasing && (
        <BreakingNewsCutIn
          moment={moment}
          tier={selectedTier}
          purchaseStage={purchaseStage}
          rgb={rgb}
        />
      )}

      {/* ━━━ "SOLD TO" LOWER-THIRD — broadcast auction announcement on confirmation ━━━ */}
      <div
        className="fixed z-[56] pointer-events-none"
        style={{
          bottom: '18%',
          left: 0,
          right: 0,
          transform: soldToVisible ? 'translateX(0)' : 'translateX(-105%)',
          opacity: soldToVisible ? 1 : 0,
          transition: soldToVisible
            ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out'
            : 'transform 0.4s ease-in, opacity 0.3s ease-in',
        }}
      >
        <div className="flex items-stretch max-w-[380px]">
          {/* Team-color accent bar */}
          <div
            className="w-[3px] shrink-0"
            style={{ backgroundColor: moment.teamColors.primary }}
          />
          {/* Content */}
          <div
            className="flex-1 px-4 py-2.5"
            style={{
              backgroundColor: 'rgba(11,14,20,0.92)',
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid rgba(${rgb},0.15)`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[9px] font-bold uppercase tracking-[0.25em] px-1.5 py-0.5"
                style={{
                  backgroundColor: `rgba(${rgb},0.15)`,
                  color: moment.teamColors.primary,
                  fontFamily: 'var(--font-oswald), sans-serif',
                }}
              >
                SOLD
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                Live Auction Result
              </span>
            </div>
            <p
              className="text-[13px] text-white/80 tracking-wide"
              style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 600 }}
            >
              {moment.player} &middot; {selectedTier.tier} Edition
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono tabular-nums">
              Acquired for ${selectedTier.price} &middot; Edition #{(moment.editionsClaimed + 1).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ━━━ CHANNEL SWITCH — TV static flash + channel number on tier change ━━━ */}
      {channelSwitch !== null && (
        <div className="fixed inset-0 z-[55] pointer-events-none broadcast-channel-switch">
          {/* Brief static noise overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
              mixBlendMode: 'screen',
            }}
          />
          {/* Channel number indicator — top-right like old TV sets */}
          <div className="absolute top-16 right-6 flex items-baseline gap-1">
            <span
              className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40"
            >
              CH
            </span>
            <span
              className="text-[28px] font-mono font-bold tabular-nums text-white/50"
              style={{ textShadow: '0 0 12px rgba(255,255,255,0.2)' }}
            >
              {channelSwitch}
            </span>
          </div>
        </div>
      )}

      {/* ━━━ SPECIAL REPORT — ESPN breaking news interrupt banner ━━━━━ */}
      {specialReport !== 'waiting' && specialReport !== 'done' && (
        <div
          className="fixed top-[38%] left-0 right-0 z-[58] pointer-events-none flex items-center"
          style={{
            transform: specialReport === 'in' ? 'translateX(0)' : 'translateX(-105%)',
            transition: specialReport === 'in'
              ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 0.4s cubic-bezier(0.55, 0, 1, 0.45)',
          }}
        >
          <div
            className="relative w-full px-5 py-3 flex items-center gap-3"
            style={{
              background: `linear-gradient(90deg, rgba(239,68,68,0.9) 0%, rgba(${rgb},0.85) 100%)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Red accent bar — left edge */}
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-white/30" />
            {/* SPECIAL REPORT label */}
            <span
              className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/90 shrink-0"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Special Report
            </span>
            {/* Divider */}
            <div className="h-4 w-[1px] bg-white/30 shrink-0" />
            {/* Player + play headline */}
            <span
              className="text-[13px] font-bold uppercase tracking-wide text-white truncate"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {moment.player} — {moment.playType}
            </span>
          </div>
        </div>
      )}

      {/* ━━━ CONTINUING COVERAGE BUMPER — segment transition when scrolling to Collect ━━━ */}
      {coverageBumper !== 'hidden' && coverageBumper !== 'done' && (
        <div
          className="fixed top-[44%] left-0 right-0 z-[52] pointer-events-none flex items-center"
          style={{
            transform: coverageBumper === 'in' ? 'translateX(0)' : 'translateX(105%)',
            transition: coverageBumper === 'in'
              ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 0.4s cubic-bezier(0.55, 0, 1, 0.45)',
          }}
        >
          <div
            className="relative w-full px-5 py-2.5 flex items-center gap-3"
            style={{
              background: `linear-gradient(90deg, rgba(${rgb},0.7) 0%, rgba(${rgb},0.5) 60%, transparent 100%)`,
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/40" />
            <span
              className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/80 shrink-0"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Continuing Live Coverage
            </span>
            <div className="h-3 w-[1px] bg-white/20 shrink-0" />
            <span
              className="text-[10px] uppercase tracking-wide text-white/50 truncate"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              {moment.player} &middot; {moment.playType}
            </span>
          </div>
        </div>
      )}

      {/* ━━━ PRODUCER CUE — "Scroll to Continue" nudge for idle viewers ━━━ */}
      {/* ESPN mobile app shows a persistent "Scroll to Continue" CTA.     */}
      {/* This fires 10s after page load if the user hasn't scrolled to    */}
      {/* the transaction section — the producer in the control room cues  */}
      {/* the viewer to the next segment. Addresses 67-82% bounce rate.    */}
      {producerCue !== 'waiting' && producerCue !== 'done' && !isPurchasing && (
        <div
          className="fixed z-[51] pointer-events-auto"
          style={{
            bottom: showStickyBar ? '76px' : '24px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            transition: 'bottom 0.3s ease',
          }}
        >
          <button
            onClick={() => {
              transactionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setProducerCue('done');
            }}
            className="group cursor-pointer"
            style={{
              animation: producerCue === 'in'
                ? 'broadcast-producer-cue-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                : 'broadcast-producer-cue-out 0.5s ease-in forwards',
            }}
          >
            <div
              className="flex items-center gap-3 rounded-md px-5 py-2.5 backdrop-blur-xl transition-all duration-200 group-hover:scale-[1.02]"
              style={{
                backgroundColor: 'rgba(11,14,20,0.88)',
                border: `1px solid rgba(${rgb},0.25)`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(${rgb},0.08)`,
              }}
            >
              {/* Team-color accent dot — production cue indicator */}
              <div
                className="h-[6px] w-[6px] rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: moment.teamColors.primary }}
              />
              {/* Cue text — producer voice */}
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/60"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Collection Available
              </span>
              {/* Divider */}
              <div className="h-3 w-[1px] bg-white/10 shrink-0" />
              {/* Price anchor */}
              <span
                className="text-[11px] font-bold tabular-nums text-white/80"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                From ${moment.price}
              </span>
              {/* Scroll chevron */}
              <svg
                className="w-3 h-3 text-white/30 group-hover:text-white/50 transition-all animate-bounce"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
        </div>
      )}

      {/* ━━━ NETWORK BUG — ESPN/TNT corner watermark ━━━━━━━━━━━━━━━━━ */}
      <div
        className="fixed top-4 right-4 z-40 pointer-events-none flex items-center gap-1.5 transition-opacity duration-700 md:top-6 md:right-6"
        style={{ opacity: countdown.isEnded ? 0 : 0.35 }}
      >
        <div
          className="h-[6px] w-[6px] rounded-full"
          style={{
            backgroundColor: dropPhase === 'CRITICAL' ? '#EF4444' : moment.teamColors.primary,
            animation: countdown.isEnded ? 'none' : 'pulse 2s ease-in-out infinite',
          }}
        />
        <span
          className="text-[9px] font-bold uppercase tracking-[0.3em]"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: dropPhase === 'CRITICAL' ? '#EF4444' : 'rgba(255,255,255,0.7)',
          }}
        >
          TST
        </span>
        {!countdown.isEnded && (
          <span
            className="text-[8px] font-semibold uppercase tracking-[0.2em] rounded-sm px-1 py-px"
            style={{
              backgroundColor: dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.25)' : `rgba(${rgb},0.2)`,
              color: dropPhase === 'CRITICAL' ? '#EF4444' : moment.teamColors.primary,
            }}
          >
            Live
          </span>
        )}
      </div>

      {/* ━━━ SCORE UPDATE — ESPN "around the league" alert ━━━━━━━━━━━ */}
      {/* During live broadcasts, ESPN/TNT flash score updates from other   */}
      {/* games. This one-shot alert fires 8s after leader completes,      */}
      {/* slides in from right, holds 4s, slides out. Deeply broadcast.    */}
      {(() => {
        const update = SCORE_UPDATES[momentId] ?? SCORE_UPDATES.bam;
        return scoreUpdatePhase !== 'waiting' && scoreUpdatePhase !== 'done' && (
          <div
            className="fixed top-14 right-0 z-[42] pointer-events-none md:top-16"
            style={{
              transform: scoreUpdatePhase === 'in' || scoreUpdatePhase === 'hold' ? 'translateX(0)' : 'translateX(105%)',
              transition: scoreUpdatePhase === 'in'
                ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                : 'transform 0.4s ease-in',
            }}
          >
            <div className="flex items-stretch">
              <div
                className="flex flex-col gap-0.5 pl-3 pr-4 py-2"
                style={{
                  backgroundColor: 'rgba(11,14,20,0.92)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '-2px 0 16px rgba(0,0,0,0.3)',
                  borderLeft: '2px solid #F59E0B',
                }}
              >
                {/* "SCORE UPDATE" label */}
                <span
                  className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#F59E0B]/70"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Score Update
                </span>
                {/* Score line: AWAY 104 — HOME 98 */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/60" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {update.away}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums text-white/80" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {update.awayScore}
                  </span>
                  <span className="text-[8px] text-white/20">&mdash;</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/60" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {update.home}
                  </span>
                  <span className="text-[11px] font-bold tabular-nums text-white/80" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
                    {update.homeScore}
                  </span>
                </div>
                {/* Game status */}
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/25">
                  {update.status}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ━━━ SCORE BUG — persistent game score overlay ━━━━━━━━━━━━━━ */}
      <ScoreBug moment={moment} isEnded={countdown.isEnded} teamColor={moment.teamColors.primary} rgb={rgb} dropPhase={dropPhase} />
      <NetworkBug isEnded={countdown.isEnded} teamColor={moment.teamColors.primary} rgb={rgb} dropPhase={dropPhase} />
      <TVRatingBadge isEnded={countdown.isEnded} />

      <div className="relative z-10">
        {/* ━━━ ESPN BOTTOMLINE — scrolling score ticker ━━━━━━━━━━━━━━━ */}
        {!countdown.isEnded && <BroadcastTicker />}

        {/* ━━━ HERO — 50vh ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          ref={heroRef}
          className="relative h-[50dvh] min-h-[420px] overflow-hidden broadcast-grain broadcast-scanlines broadcast-film-frame"
          style={{
            ['--film-hole-color' as string]: `rgba(${rgb},0.07)`,
            ['--film-border-color' as string]: `rgba(${rgb},0.06)`,
            transform: crashZoom ? 'scale(1.03)' : 'scale(1)',
            transition: crashZoom
              ? 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)'
              : 'transform 300ms ease-out',
          }}
        >
          {/* Action image — cinematic depth layer with Ken Burns drift */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 broadcast-ken-burns"
            style={{
              backgroundImage: `url(${moment.actionImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              opacity: countdown.isEnded ? 0.06 : 0.10,
              filter: countdown.isEnded ? 'grayscale(0.8) brightness(0.5)' : 'grayscale(0.2) brightness(0.8)',
            }}
          />
          {/* Player headshot + gradient overlay */}
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

          {/* ── GRAPHICS PACKAGE ACCENT TRIM — ESPN-style L-frame accent lines ── */}
          <GraphicsPackageTrim rgb={rgb} dropPhase={dropPhase} isEnded={countdown.isEnded} />

          {/* ── CINEMATIC LETTERBOX — widescreen bars for broadcast film treatment ── */}
          {/* ESPN SportsCenter Top 10 and TNT dramatic replays use letterbox bars   */}
          {/* (2.39:1 ratio) to signal "this is cinema-quality content." The bars    */}
          {/* are subtle (5% hero height each) but immediately create a widescreen   */}
          {/* production feel. Small aspect ratio badge in the top bar for broadcast  */}
          {/* authenticity. Distinctly Broadcast: Supreme has gallery silence, Arena  */}
          {/* has LED bezels. Broadcast has film language — the letterbox.            */}
          <div
            className="absolute top-0 left-0 right-0 z-[12] pointer-events-none"
            style={{
              height: '5%',
              background: 'linear-gradient(180deg, #0B0E14 60%, transparent 100%)',
            }}
          >
            {/* Aspect ratio badge — top-right of letterbox */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span
                className="text-[6px] font-mono uppercase tracking-[0.2em]"
                style={{
                  color: 'rgba(240,242,245,0.12)',
                }}
              >
                2.39:1
              </span>
              <div
                className="h-[4px] w-[10px] rounded-[0.5px]"
                style={{
                  border: '0.5px solid rgba(240,242,245,0.08)',
                }}
              />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 z-[12] pointer-events-none"
            style={{
              height: '5%',
              background: 'linear-gradient(0deg, #0B0E14 60%, transparent 100%)',
            }}
          />

          {/* ── GHOST TEXT WATERMARK — ESPN premium graphic word behind lower-third ── */}
          {/* Large semi-transparent editorial word that frames the moment emotionally. */}
          {/* Like when ESPN overlays "PLAYOFF RECORD" in huge ghosted type behind a   */}
          {/* highlight — it tells you what you're witnessing before you read a word.   */}
          {(() => {
            const ghost = HERO_GHOST_TEXT[momentId] ?? HERO_GHOST_TEXT.bam;
            return (
              <div
                className="absolute inset-0 z-[5] pointer-events-none overflow-hidden flex flex-col items-end justify-end"
                style={{ padding: '0 20px 110px 0' }}
              >
                {/* Subtext — small editorial label above the big word */}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.35em] mb-1"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: `rgba(${rgb},0.12)`,
                    animation: 'broadcast-ghost-sub 1s cubic-bezier(0.22,1,0.36,1) 2.2s both',
                  }}
                >
                  {ghost.subtext}
                </span>
                {/* Main ghost word — huge, transparent, cinematic */}
                <span
                  className="text-[clamp(4.5rem,18vw,9rem)] font-bold uppercase leading-[0.85] text-right"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: 'transparent',
                    WebkitTextStroke: `1px rgba(${rgb},0.08)`,
                    textShadow: `0 0 60px rgba(${rgb},0.04)`,
                    animation: 'broadcast-ghost-word 1.4s cubic-bezier(0.22,1,0.36,1) 2s both',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {ghost.word}
                </span>
              </div>
            );
          })()}

          {/* ── URGENCY VIGNETTE — team-color edge pulse during CLOSING/CRITICAL ── */}
          {/* Broadcast control rooms cue a red/amber tint on transitions to signal  */}
          {/* urgency. This subtle vignette pulses at the hero edges to create       */}
          {/* subconscious tension during the final minutes.                          */}
          {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && !countdown.isEnded && (
            <div
              className="absolute inset-0 z-[6] pointer-events-none"
              style={{
                boxShadow: `inset 0 0 ${dropPhase === 'CRITICAL' ? '80px' : '60px'} ${
                  dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : `rgba(${rgb},0.08)`
                }`,
                animation: `broadcast-vignette-pulse ${dropPhase === 'CRITICAL' ? '2s' : '3.5s'} ease-in-out infinite`,
              }}
            />
          )}

          {/* ── CAMERA FLASH SPARKLES — press cameras in the crowd ── */}
          {!countdown.isEnded && leaderDone && (
            <CameraFlashSparkles phase={dropPhase} rgb={rgb} />
          )}

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

            {/* Editorial badge — emotional framing */}
            <div className="flex items-center gap-2 mb-2 pl-3">
              <span
                className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.25em] rounded-sm"
                style={{
                  backgroundColor: `${moment.teamColors.primary}25`,
                  color: moment.teamColors.primary,
                  border: `1px solid ${moment.teamColors.primary}40`,
                }}
              >
                Play of the Game
              </span>
              <span className="text-[10px] text-white/25 tracking-wide">
                {fullTeam(moment.team)} vs {fullTeam(moment.opponent)}
              </span>
            </div>

            {/* Player name — Oswald condensed broadcast headline with reveal wipe */}
            <div className="relative pl-3">
              <h1
                className="text-[clamp(2.8rem,9vw,5.5rem)] uppercase leading-[0.88] tracking-tight text-white broadcast-name-reveal"
                style={{
                  fontFamily: 'var(--font-oswald), sans-serif',
                  fontWeight: 700,
                }}
              >
                {moment.player}
              </h1>
              {/* Wipe edge highlight — bright team-color line traveling with the reveal */}
              <div
                className="broadcast-name-edge"
                style={{
                  backgroundColor: moment.teamColors.primary,
                  boxShadow: `0 0 12px ${moment.teamColors.primary}, 0 0 28px ${moment.teamColors.primary}60`,
                }}
              />
            </div>

            {/* Stat line — broadcast data wipe reveal (ESPN two-layer clip-path) */}
            <div className="mt-3 pl-3 broadcast-data-wipe">
              {/* Layer 1: team-color bar wipes in first */}
              <div
                className="absolute inset-y-0 left-3 right-0 broadcast-data-wipe-bar"
                style={{
                  backgroundColor: `rgba(${rgb},0.12)`,
                  borderLeft: `2px solid ${moment.teamColors.primary}`,
                }}
              />
              {/* Layer 2: text content revealed with slight delay */}
              <div className="relative broadcast-data-wipe-text">
                <p
                  className="text-lg font-semibold tracking-wide text-white/90 sm:text-xl md:text-2xl py-1.5 px-2"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 500 }}
                >
                  {moment.statLine}
                </p>
              </div>
            </div>

            {/* Team-color accent rule */}
            <div
              className="mt-4 ml-3 h-[2px] w-20 sm:w-28 md:w-32"
              style={{ backgroundColor: moment.teamColors.primary }}
            />

            {/* Context line — data wipe reveal with later timing */}
            <div className="mt-3 pl-3 broadcast-data-wipe relative">
              <div
                className="absolute inset-y-0 left-3 right-0"
                style={{
                  backgroundColor: `rgba(${rgb},0.06)`,
                  animation: 'broadcast-data-wipe-bar 0.24s cubic-bezier(0.22, 1, 0.36, 1) 1.35s both',
                }}
              />
              <p
                className="relative text-sm tracking-wide text-white/40 md:text-base py-1 px-2"
                style={{
                  animation: 'broadcast-data-wipe-text 0.28s cubic-bezier(0.22, 1, 0.36, 1) 1.48s both',
                }}
              >
                {moment.context}
              </p>
            </div>

            {/* ── PRICE TAG — broadcast "FROM $X" above-the-fold price indicator ── */}
            {/* Research insight #5: Above the Fold Is Everything. The hero had */}
            {/* zero price visibility — 67-82% bounce without scrolling. This   */}
            {/* ESPN-style price badge surfaces cost instantly and scrolls to    */}
            {/* the transaction section on tap, acting as a conversion shortcut. */}
            {!countdown.isEnded && !isPurchasing && (
              <button
                onClick={() => transactionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="mt-4 ml-3 inline-flex items-center gap-2 group cursor-pointer broadcast-data-wipe relative"
                style={{
                  animation: 'broadcast-data-wipe-text 0.28s cubic-bezier(0.22, 1, 0.36, 1) 1.7s both',
                }}
              >
                {/* Team-color pill badge — compact broadcast price graphic */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-all duration-300 group-hover:scale-[1.03]"
                  style={{
                    backgroundColor: `rgba(${rgb},0.12)`,
                    border: `1px solid ${moment.teamColors.primary}30`,
                    boxShadow: `0 0 12px rgba(${rgb},0.06)`,
                  }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{
                      fontFamily: 'var(--font-oswald), sans-serif',
                      color: `${moment.teamColors.primary}90`,
                    }}
                  >
                    From
                  </span>
                  <span
                    className="text-[14px] font-bold tabular-nums text-white/80"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    ${moment.price}
                  </span>
                </span>
                {/* Scroll hint — small chevron */}
                <svg
                  className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-all group-hover:translate-y-0.5"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* INSTANT REPLAY — broadcast overlay tag, slides in from right */}
          {!countdown.isEnded && (
            <div className="absolute top-[38%] right-0 z-20 broadcast-replay-tag pointer-events-none">
              <div className="flex items-center gap-0">
                {/* Team-color accent bar */}
                <div
                  className="h-[28px] w-[3px] flex-shrink-0"
                  style={{ backgroundColor: moment.teamColors.primary }}
                />
                <div
                  className="flex items-center gap-2.5 px-4 py-1.5"
                  style={{ backgroundColor: 'rgba(11,14,20,0.85)', backdropFilter: 'blur(8px)' }}
                >
                  <div
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: moment.teamColors.primary }}
                  />
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    Instant Replay
                  </span>
                  {/* Replay count — how many times the broadcast has replayed this highlight */}
                  <span
                    className="text-[9px] font-mono tabular-nums tracking-wider"
                    style={{ color: `${moment.teamColors.primary}90` }}
                  >
                    ×{replayCount}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* REPLAY ANGLE GRAPHIC — camera angle label on each replay increment */}
          {/* ESPN always shows the camera angle when cutting to a replay:       */}
          {/* "REVERSE ANGLE", "BASELINE CAM", "SKY CAM". This fires briefly    */}
          {/* each time the replay counter increments (every 8-12s), reinforcing */}
          {/* the live production illusion with a deeply broadcast-specific cue. */}
          {replayAngle && !countdown.isEnded && (
            <div
              className="absolute top-[44%] right-0 z-20 pointer-events-none broadcast-replay-angle-tag"
              key={`angle-${replayCount}`}
            >
              <div className="flex items-center gap-0">
                <div
                  className="h-[22px] w-[2px] flex-shrink-0"
                  style={{ backgroundColor: `${moment.teamColors.primary}80` }}
                />
                <div
                  className="flex items-center gap-2 px-3 py-1"
                  style={{ backgroundColor: 'rgba(11,14,20,0.75)', backdropFilter: 'blur(6px)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="opacity-50">
                    <rect x="1" y="4" width="10" height="8" rx="1" stroke="white" strokeWidth="1.2" />
                    <path d="M11 6.5L15 4.5V11.5L11 9.5" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.35em] text-white/50"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {replayAngle}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TELESTRATOR — analyst circle annotation drawn on replay footage */}
          {!countdown.isEnded && (
            <TelestatorCircle teamColor={moment.teamColors.primary} rgb={rgb} />
          )}

          {/* COMMENTATOR CALL — iconic announcer call overlay on replay */}
          {!countdown.isEnded && leaderDone && (
            <CommentatorCallBanner
              momentId={moment.id}
              teamColor={moment.teamColors.primary}
              rgb={rgb}
            />
          )}

          {/* SIDELINE REPORT — courtside reporter insert after commentator call */}
          {!countdown.isEnded && leaderDone && (
            <SidelineReportInsert
              momentId={moment.id}
              teamColor={moment.teamColors.primary}
              rgb={rgb}
            />
          )}

          {/* Anamorphic lens flare — horizontal light streak, classic broadcast camera */}
          {!countdown.isEnded && (
            <div
              className="broadcast-lens-flare"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${moment.teamColors.primary}15 20%, rgba(255,255,255,0.25) 48%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 52%, ${moment.teamColors.primary}15 80%, transparent 100%)`,
              }}
            />
          )}

          {/* Production markers — broadcast control room details (bottom-right of hero) */}
          {!countdown.isEnded && (
            <div className="absolute bottom-16 right-5 z-20 flex flex-col items-end gap-1 pointer-events-none md:bottom-20 md:right-10"
              style={{ opacity: 0.25 }}
            >
              {/* REC indicator with blinking dot */}
              <div className="flex items-center gap-1.5">
                <div
                  className="h-[5px] w-[5px] rounded-full"
                  style={{
                    backgroundColor: '#EF4444',
                    animation: 'pulse 2s ease-in-out infinite',
                    boxShadow: '0 0 4px #EF444480',
                  }}
                />
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#EF4444]/70"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Rec
                </span>
              </div>
              {/* ISO CAM label — technical camera designation, updates on feed cut */}
              <span className="text-[7px] font-mono uppercase tracking-[0.15em] text-white/20 transition-opacity duration-200">
                {camLabel}
              </span>
              {/* SMPTE timecode — running production counter */}
              <span className="text-[7px] font-mono tabular-nums tracking-[0.08em] text-white/15 broadcast-timecode">
                {smpteTimecode}
              </span>
              {/* VU audio level meter — bouncing green/yellow/red bars */}
              <div className="flex items-end gap-[1.5px] h-[14px] mt-0.5">
                {[
                  { peak: '75%', dur: '0.6s', delay: '0s' },
                  { peak: '90%', dur: '0.5s', delay: '0.1s' },
                  { peak: '60%', dur: '0.7s', delay: '0.05s' },
                  { peak: '85%', dur: '0.55s', delay: '0.15s' },
                  { peak: '50%', dur: '0.65s', delay: '0.08s' },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="w-[2px] rounded-[0.5px]"
                    style={{
                      ['--vu-peak' as string]: bar.peak,
                      animation: `broadcast-vu-bounce ${bar.dur} ease-in-out ${bar.delay} infinite`,
                      background: i <= 2
                        ? 'linear-gradient(to top, #22c55e 0%, #22c55e 60%, #eab308 80%, #ef4444 100%)'
                        : 'linear-gradient(to top, #22c55e 0%, #22c55e 50%, #eab308 75%, #ef4444 100%)',
                      opacity: 0.7,
                    }}
                  />
                ))}
                <span className="text-[5px] font-mono uppercase tracking-wider text-white/15 ml-1 self-center">
                  VU
                </span>
              </div>
            </div>
          )}

          {/* LOCATION TAG — "LIVE FROM [ARENA]" broadcast geography identifier */}
          {!countdown.isEnded && leaderDone && (
            <BroadcastLocationTag
              team={moment.team}
              teamColor={moment.teamColors.primary}
              rgb={rgb}
            />
          )}

          {/* "TST EXCLUSIVE" watermark — diagonal branding on exclusive footage */}
          {/* ESPN/FOX/TNT brand their exclusive highlights with translucent on-screen */}
          {/* watermarks. This marks the footage as proprietary broadcast content.     */}
          {!countdown.isEnded && (
            <div
              className="absolute z-10 pointer-events-none"
              style={{
                top: '38%',
                right: '8%',
                transform: 'rotate(-15deg)',
                opacity: 0.04,
              }}
            >
              <span
                className="text-[clamp(1.4rem,4vw,2.2rem)] font-bold uppercase tracking-[0.5em] text-white"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                TST Exclusive
              </span>
            </div>
          )}

          {/* Broadcast END SLATE — SMPTE color bars + off-air card when drop concludes */}
          {countdown.isEnded && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none broadcast-end-slate">
              {/* SMPTE color bars — classic broadcast test pattern behind off-air card */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ opacity: 0.06, animation: 'broadcast-color-bars-in 2s ease-out forwards' }}
              >
                {/* Top row — 7 primary bars */}
                <div className="flex h-[67%]">
                  {['#C0C0C0', '#C0C000', '#00C0C0', '#00C000', '#C000C0', '#C00000', '#0000C0'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {/* Middle castellations row */}
                <div className="flex h-[8%]">
                  {['#0000C0', '#131313', '#C000C0', '#131313', '#00C0C0', '#131313', '#C0C0C0'].map((c, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                {/* Bottom row — PLUGE + gray ramp */}
                <div className="flex h-[25%]">
                  <div className="flex-[3]" style={{ backgroundColor: '#00214C' }} />
                  <div className="flex-1" style={{ backgroundColor: '#FFFFFF' }} />
                  <div className="flex-[2]" style={{ backgroundColor: '#32006A' }} />
                  <div className="flex-[6]" style={{ backgroundColor: '#131313' }} />
                  <div className="flex-1" style={{ backgroundColor: '#090909' }} />
                  <div className="flex-1" style={{ backgroundColor: '#131313' }} />
                  <div className="flex-1" style={{ backgroundColor: '#1D1D1D' }} />
                  <div className="flex-[3]" style={{ backgroundColor: '#131313' }} />
                </div>
              </div>

              {/* Off-air card */}
              <div
                className="relative text-center px-8 py-4 rounded-sm"
                style={{
                  backgroundColor: 'rgba(11,14,20,0.75)',
                  backdropFilter: 'blur(6px)',
                  border: `1px solid rgba(${rgb},0.12)`,
                  boxShadow: `0 0 40px rgba(0,0,0,0.4)`,
                }}
              >
                <div
                  className="h-[1px] w-10 mx-auto mb-3"
                  style={{ backgroundColor: `rgba(${rgb},0.3)` }}
                />
                <p
                  className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/25"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  This Broadcast Has Concluded
                </p>
                <p
                  className="mt-1.5 text-[7px] font-mono uppercase tracking-[0.25em] text-white/10"
                >
                  Please Stand By
                </p>
                <div
                  className="h-[1px] w-10 mx-auto mt-3"
                  style={{ backgroundColor: `rgba(${rgb},0.3)` }}
                />
              </div>
            </div>
          )}

          {/* Cinematic letterbox bars — widescreen aspect ratio */}
          <div
            className="absolute top-0 left-0 right-0 z-[25] pointer-events-none transition-all duration-1000"
            style={{
              height: dropPhase === 'CRITICAL' ? '7%' : '4.5%',
              background: 'linear-gradient(to bottom, #0B0E14 60%, transparent)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-[25] pointer-events-none transition-all duration-1000"
            style={{
              height: dropPhase === 'CRITICAL' ? '7%' : '4.5%',
              background: 'linear-gradient(to top, #0B0E14 60%, transparent)',
            }}
          />

          {/* Scroll indicator — animated chevron that scrolls to transaction */}
          {!countdown.isEnded && (
            <div className="absolute bottom-14 left-0 right-0 z-20 flex justify-center">
              <button
                onClick={() => transactionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="animate-bounce opacity-30 hover:opacity-50 transition-opacity cursor-pointer"
                aria-label="Scroll to collect"
              >
                <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                  <path d="M2 2L10 8L18 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

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
                className={`text-[11px] font-bold uppercase tracking-[0.25em] ${
                  dropPhase === 'CRITICAL' ? 'broadcast-breaking-text' : ''
                }`}
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

        {/* Team-color section rule — broadcast segment divider */}
        <div className="mx-auto max-w-2xl px-5 md:px-10">
          <div
            className="h-[1px]"
            style={{
              background: `linear-gradient(90deg, ${moment.teamColors.primary}40, ${moment.teamColors.primary}15, transparent)`,
            }}
          />
        </div>

        {/* ━━━ EDITORIAL PULL QUOTE — teleprompter typewriter reveal ━━━━━ */}
        <TeleprompterQuote moment={moment} rgb={rgb} />

        {/* ━━━ EDITORIAL NARRATIVE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mx-auto max-w-2xl px-5 pb-10 md:px-10 md:pb-14">
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

          {/* ESPN/TNT broadcast shot chart — half-court diagram with play locations */}
          <ShotChartGraphic moment={moment} rgb={rgb} />

          {/* ── GAME FLOW — ESPN win probability style momentum chart ── */}
          {/* Every ESPN/TNT broadcast shows a win probability or game     */}
          {/* flow chart during analysis segments. This SVG sparkline      */}
          {/* shows simulated game momentum with the key moment marked     */}
          {/* at the peak — visually placing the play at the game's climax */}
          <GameFlowChart moment={moment} rgb={rgb} />

          {/* ── ANALYST DESK — "Inside the NBA" multi-analyst roundtable ── */}
          {/* The studio desk panel is the defining broadcast format. Multiple   */}
          {/* analysts with contrasting takes — enthusiastic, analytical,        */}
          {/* historical — create the ESPN/TNT "let's go to the studio" energy.  */}
          <AnalystDesk moment={moment} rgb={rgb} />

          {/* Tale of the Tape — tonight vs season average comparison */}
          <TaleOfTheTape moment={moment} rgb={rgb} />

          {/* Fan Verdict — ESPN live poll (social proof as broadcast data) */}
          <FanVerdict moment={moment} rgb={rgb} />

          {/* SportsCenter Top 10 — #1 Play of the Night ranking graphic */}
          <SportsCenterTop10 moment={moment} rgb={rgb} />

          {/* Ratings Spike — "Peak Viewership" Nielsen chart (broadcast prestige) */}
          <RatingsSpike moment={moment} rgb={rgb} />

          {/* Emotional closing beat — editorial thesis */}
          <p
            className="mt-8 text-center text-sm tracking-wide text-white/25"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
          >
            This is the moment. Own it before it&apos;s history.
          </p>
        </section>

        {/* ━━━ POST-GAME INTERVIEW — player quote in broadcast graphic card ━━━ */}
        {/* Every ESPN/TNT broadcast closes with post-game interview quotes.     */}
        {/* This adds the player's voice right before the purchase decision —    */}
        {/* emotional weight from the athlete themselves, not just editorial.    */}
        <div className="mx-auto max-w-2xl px-5 pb-8 md:px-10">
          <div
            className="relative overflow-hidden rounded-sm"
            style={{
              backgroundColor: 'rgba(20,25,37,0.7)',
              border: `1px solid rgba(${rgb},0.1)`,
            }}
          >
            {/* Team-color top accent bar */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(to right, ${moment.teamColors.primary}, ${moment.teamColors.primary}40)`,
              }}
            />
            <div className="px-5 py-4 sm:px-6">
              {/* POST-GAME label */}
              <div className="flex items-center gap-2.5 mb-3">
                {/* Mic icon */}
                <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" style={{ color: moment.teamColors.primary, opacity: 0.6 }}>
                  <rect x="4" y="0.5" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M2.5 5.5 C2.5 7.5 4 9 6 9 C8 9 9.5 7.5 9.5 5.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                  <line x1="6" y1="9" x2="6" y2="11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                  <line x1="4.5" y1="11" x2="7.5" y2="11" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: moment.teamColors.primary, fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Post-Game
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/15">
                  Interview
                </span>
              </div>

              {/* Quote — large Georgia italic with team-color open-quote mark */}
              <div className="relative pl-4">
                <span
                  className="absolute left-0 top-0 text-[28px] leading-none"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: `rgba(${rgb},0.15)`,
                  }}
                >
                  &ldquo;
                </span>
                <p
                  className="text-[15px] sm:text-[16px] leading-relaxed text-white/60"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                >
                  {moment.id === 'bam'
                    ? 'I wanted to come out and make a statement. Playoffs, on the road \u2014 this is what I live for.'
                    : moment.id === 'jokic'
                    ? 'I don\u2019t think about the stats. I just try to make the right play every time. Tonight it worked out.'
                    : 'When I get in that zone, I feel like I can\u2019t miss. The team needed me to be aggressive, and I was.'}
                </p>
              </div>

              {/* Attribution — player name + context */}
              <div className="mt-3 flex items-center gap-2.5 pl-4">
                <div
                  className="h-[1px] w-4"
                  style={{ backgroundColor: `rgba(${rgb},0.2)` }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  {moment.player}
                </span>
                <span className="text-[9px] text-white/15">&middot;</span>
                <span
                  className="text-[9px] uppercase tracking-[0.15em] text-white/20"
                >
                  {moment.team} vs {moment.opponent}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team-color thin divider — cinematic section reveal (expands from center on scroll) */}
        <SectionRevealLine teamColor={moment.teamColors.primary} />

        {/* ━━━ TRANSACTION SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section ref={transactionRef} className="mx-auto max-w-3xl px-5 pt-10 pb-16 md:px-10 md:pb-24 scroll-mt-4">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-[2px] w-8"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
              Collect
            </span>
            {/* "Presented by" — broadcast segment sponsor tag */}
            <span className="ml-auto text-[7px] uppercase tracking-[0.25em] text-white/10 italic"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Presented by NBA Top Shot
            </span>
          </div>

          {/* ── ACQUISITION TICKER — live "THIS JUST IN" crawl at the decision point ── */}
          {/* The floating AcquisitionLowerThird is at viewport bottom — easy to miss. */}
          {/* This compact ticker puts social proof AT the tier selector, right where  */}
          {/* the user is deciding which edition to buy. Broadcast-style: news crawl,  */}
          {/* not a raw feed. Appears only when an acquisition event is active.        */}
          {acquisitionEvent && !isPurchasing && !countdown.isEnded && (
            <div
              key={acquisitionEvent.id}
              className="mb-3 overflow-hidden rounded-sm"
              style={{
                backgroundColor: `rgba(${rgb},0.05)`,
                border: `1px solid rgba(${rgb},0.08)`,
                animation: 'broadcast-tier-claim-label 3s ease-out forwards',
              }}
            >
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className="h-[4px] w-[4px] rounded-full"
                    style={{
                      backgroundColor: '#EF4444',
                      boxShadow: '0 0 4px rgba(239,68,68,0.5)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.3em]"
                    style={{
                      color: moment.teamColors.primary,
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    This Just In
                  </span>
                </div>
                <div className="h-3 w-[1px] bg-white/8 shrink-0" />
                <span className="text-[9px] text-white/40 tracking-wide truncate">
                  <span className="font-semibold text-white/55">{acquisitionEvent.name}</span>
                  {' '}collected edition #{acquisitionEvent.edition.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Rarity tier selector — horizontal row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {moment.rarityTiers.map((tier, idx) => (
              <TierCard
                key={tier.tier}
                tier={tier}
                isSelected={idx === selectedTierIdx}
                teamColor={moment.teamColors.primary}
                rgb={rgb}
                onSelect={() => handleTierSelect(idx)}
                isFlashing={tierClaimFlash.flashIdx === idx}
                flashKey={tierClaimFlash.flashKey}
              />
            ))}
          </div>

          {/* Tier Comparison — ESPN tier attribute bars */}
          <TierComparison
            tierName={selectedTier.tier}
            teamColor={moment.teamColors.primary}
            rgb={rgb}
            isVisible={!countdown.isEnded && !isPurchasing}
          />

          {/* Countdown — broadcast game clock escalation */}
          {/* During CRITICAL phase, the countdown transforms into a dominant    */}
          {/* ESPN-style game clock graphic — large digits, team-color accents,  */}
          {/* "FINAL SECONDS" label. Every NBA broadcast makes the game clock    */}
          {/* massive during crunch time. This does the same at the decision     */}
          {/* point: the urgency is visual, not just textual.                    */}
          {dropPhase === 'CRITICAL' && !countdown.isEnded && !isPurchasing ? (
            <div className="mt-8 flex flex-col items-center gap-2">
              {/* Game clock panel — broadcast graphic style */}
              <div
                className="relative overflow-hidden rounded-md px-6 py-3"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.08)',
                }}
              >
                {/* Red accent top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: '#EF4444' }}
                />
                {/* FINAL SECONDS label */}
                <span
                  className="block text-center text-[8px] font-bold uppercase tracking-[0.4em] mb-1"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: '#EF4444',
                    opacity: 0.7,
                  }}
                >
                  Final Seconds
                </span>
                {/* Large clock digits */}
                <span
                  className="block text-center text-[36px] font-bold tabular-nums leading-none font-mono tracking-tight"
                  style={{
                    color: '#EF4444',
                    textShadow: '0 0 12px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.1)',
                  }}
                >
                  {formatCountdown(countdown.totalSeconds)}
                </span>
                {/* Pulsing dot — live indicator */}
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <div
                    className="h-[5px] w-[5px] rounded-full animate-pulse"
                    style={{ backgroundColor: '#EF4444' }}
                  />
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#EF4444]/50">
                    Closing
                  </span>
                </div>
              </div>
            </div>
          ) : (
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
          )}

          {/* Live viewer count — broadcast stream audience meter */}
          {!countdown.isEnded && !isPurchasing && (
            <div className="mt-8 mb-3 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-[6px] w-[6px]">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-[6px] w-[6px] rounded-full bg-red-500" />
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/25"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  Live
                </span>
              </div>
              <div className="h-[10px] w-[1px] bg-white/10" />
              <span className="text-[10px] tabular-nums text-white/25 tracking-wide">
                <span className="font-mono font-semibold text-white/35">
                  {(1247 + Math.floor(moment.editionsClaimed * 2.1) + Math.floor(countdown.totalSeconds * 0.3)).toLocaleString()}
                </span>
                {' '}watching this drop
              </span>
            </div>
          )}

          {/* ── BROADCAST EDITION GRAPHIC — ESPN on-screen stat bar ── */}
          {/* Every ESPN broadcast overlays graphical stat bars (possession %, */}
          {/* shooting splits) during live games. This shows edition supply as */}
          {/* a broadcast-style horizontal stat graphic with team-color fill. */}
          {!countdown.isEnded && !isPurchasing && (
            <div className="mt-6 mb-6 max-w-md mx-auto w-full">
              {/* Broadcast graphic header — team-color accent + label */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-[2px] w-3"
                    style={{ backgroundColor: `${moment.teamColors.primary}60` }}
                  />
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/25"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    Editions
                  </span>
                </div>
                <span className="text-[9px] font-mono tabular-nums text-white/30">
                  {moment.editionsClaimed.toLocaleString()} / {moment.editionSize.toLocaleString()}
                </span>
              </div>
              {/* Bar — team-color fill on dark track, broadcast stat bar style */}
              <div
                className="relative h-[6px] rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (moment.editionsClaimed / moment.editionSize) * 100)}%`,
                    background: (moment.editionsClaimed / moment.editionSize) >= 0.8
                      ? `linear-gradient(90deg, ${moment.teamColors.primary}, #F59E0B)`
                      : `linear-gradient(90deg, ${moment.teamColors.primary}80, ${moment.teamColors.primary})`,
                    boxShadow: (moment.editionsClaimed / moment.editionSize) >= 0.8
                      ? `0 0 8px ${moment.teamColors.primary}40, 0 0 4px #F59E0B30`
                      : `0 0 6px ${moment.teamColors.primary}30`,
                  }}
                />
                {/* Tip marker — bright dot at the fill edge, like a broadcast stat highlight */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-[10px] w-[10px] rounded-full border-2"
                  style={{
                    left: `calc(${Math.min(100, (moment.editionsClaimed / moment.editionSize) * 100)}% - 5px)`,
                    borderColor: (moment.editionsClaimed / moment.editionSize) >= 0.8 ? '#F59E0B' : moment.teamColors.primary,
                    backgroundColor: '#0B0E14',
                    boxShadow: `0 0 6px ${(moment.editionsClaimed / moment.editionSize) >= 0.8 ? '#F59E0B' : moment.teamColors.primary}50`,
                  }}
                />
              </div>
              {/* Labels — left (claimed %) and right (remaining) */}
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className="text-[8px] font-bold tabular-nums"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: `${moment.teamColors.primary}60`,
                  }}
                >
                  {Math.round((moment.editionsClaimed / moment.editionSize) * 100)}% CLAIMED
                </span>
                <span className="text-[8px] font-mono tabular-nums text-white/15">
                  {(moment.editionSize - moment.editionsClaimed).toLocaleString()} remaining
                </span>
              </div>
            </div>
          )}

          {/* ── MARKET SNAPSHOT — ESPN-style value comparison graphic ── */}
          {/* Every ESPN broadcast shows comparative stat panels: "Player A    */}
          {/* vs Player B" with side-by-side numbers. This applies the same    */}
          {/* format to price vs. estimated secondary value — the most direct  */}
          {/* conversion tool possible. The buyer sees "$5 → $16-40 est."     */}
          {/* presented as broadcast data, creating instant value perception.  */}
          {!countdown.isEnded && !isPurchasing && (
            <div className="mt-6 mb-6 max-w-md mx-auto w-full">
              <div
                className="relative overflow-hidden rounded-sm"
                style={{
                  backgroundColor: 'rgba(20,25,37,0.5)',
                  border: `1px solid rgba(${rgb},0.08)`,
                }}
              >
                {/* Team-color top accent */}
                <div
                  className="h-[2px] w-full"
                  style={{ background: `linear-gradient(to right, ${moment.teamColors.primary}60, ${moment.teamColors.primary}15)` }}
                />
                <div className="px-4 py-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* Chart icon */}
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="none" style={{ color: moment.teamColors.primary, opacity: 0.5 }}>
                      <polyline points="1,9 4,5 7,7 11,2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="1" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
                    </svg>
                    <span
                      className="text-[8px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: moment.teamColors.primary, opacity: 0.7, fontFamily: 'var(--font-oswald), sans-serif' }}
                    >
                      Market Snapshot
                    </span>
                    <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/15 ml-auto">
                      {selectedTier.tier} Tier
                    </span>
                  </div>
                  {/* Split comparison — buy price vs secondary est. */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left: Buy Price */}
                    <div className="text-center">
                      <span className="block text-[7px] font-mono uppercase tracking-[0.25em] text-white/20 mb-1">
                        Buy Price
                      </span>
                      <span
                        className="block text-[22px] font-bold tabular-nums leading-none"
                        style={{ color: '#00E5A0', fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        ${selectedTier.price}
                      </span>
                      <span className="block text-[7px] font-mono text-white/15 mt-1">
                        Primary Sale
                      </span>
                    </div>
                    {/* Divider */}
                    <div className="relative text-center">
                      {/* Vertical line between columns */}
                      <div
                        className="absolute left-0 top-1 bottom-1 w-[1px]"
                        style={{ backgroundColor: `rgba(${rgb},0.1)` }}
                      />
                      <span className="block text-[7px] font-mono uppercase tracking-[0.25em] text-white/20 mb-1">
                        Est. Secondary
                      </span>
                      <span
                        className="block text-[22px] font-bold tabular-nums leading-none text-white/70"
                        style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                      >
                        ${Math.round(selectedTier.price * 3.2)}
                        <span className="text-[14px] text-white/30">+</span>
                      </span>
                      <span className="block text-[7px] font-mono text-white/15 mt-1">
                        ${Math.round(selectedTier.price * 1.8)}–${Math.round(selectedTier.price * 8)} range
                      </span>
                    </div>
                  </div>
                  {/* ROI indicator — bottom bar */}
                  <div
                    className="mt-3 pt-2 flex items-center justify-center gap-2"
                    style={{ borderTop: `1px solid rgba(${rgb},0.06)` }}
                  >
                    <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none">
                      <path d="M5 8 L5 2 M3 4 L5 2 L7 4" stroke="#00E5A0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                    </svg>
                    <span
                      className="text-[8px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: '#00E5A080', fontFamily: 'var(--font-oswald), sans-serif' }}
                    >
                      {Math.round(((selectedTier.price * 3.2 - selectedTier.price) / selectedTier.price) * 100)}% est. upside
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Analyst Verdict — editorial consensus recommendation ── */}
          {/* ESPN's pre-game shows end with each analyst giving their "LOCK" —  */}
          {/* the pick they're most confident in. This card synthesizes the full */}
          {/* analyst desk's consensus into a single editorial recommendation    */}
          {/* right before the CTA. Authority-driven conversion: "the experts    */}
          {/* agree, this is worth collecting." Distinctly Broadcast: Supreme    */}
          {/* would never editorialize (auction houses don't recommend), Arena   */}
          {/* would show crowd behavior. Broadcast uses expert authority.        */}
          {!isPurchasing && !countdown.isEnded && (
            <AnalystVerdict moment={moment} tier={selectedTier} rgb={rgb} phase={dropPhase} />
          )}

          {/* Broadcast Shot Clock — ESPN-style countdown graphic at decision point */}
          {/* Supreme has saleroom temperature, Arena has the sparkline. Broadcast */}
          {/* has the shot clock: a visual countdown timer in broadcast graphics   */}
          {/* language, placed right above the CTA during CLOSING/CRITICAL.       */}
          {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && !isPurchasing && !countdown.isEnded && (
            <BroadcastShotClock
              totalSeconds={countdown.totalSeconds}
              phase={dropPhase}
              rgb={rgb}
              teamColor={moment.teamColors.primary}
              remaining={selectedTier.remaining}
            />
          )}

          {/* Commentator's Call — play-by-play urgency line above CTA */}
          {/* In every close game, the announcer's voice creates the urgency.    */}
          {/* "Clock winding down..." This is the broadcaster narrating the      */}
          {/* conversion moment — editorial urgency, not raw countdown numbers.  */}
          {(dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && !isPurchasing && !countdown.isEnded && (
            <CommentatorCall
              momentId={momentId}
              phase={dropPhase}
              totalSeconds={countdown.totalSeconds}
              teamColor={moment.teamColors.primary}
              rgb={rgb}
            />
          )}

          {/* CTA button */}
          <div className={`${!countdown.isEnded && !isPurchasing ? '' : 'mt-8'} flex flex-col items-center`}>
            <button
              ref={ctaRef}
              onClick={() => { BROADCAST_HAPTIC.ctaPress(); proto.purchase(); }}
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
                  {purchaseStage === 2 && (
                    /* Authenticated seal — SVG checkmark draws in on "Acquired." */
                    <svg className="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
                      <path
                        d="M6 10.5 L9 13.5 L14 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="broadcast-checkmark-draw"
                      />
                    </svg>
                  )}
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
                <span className="text-white inline-flex items-center justify-center gap-2">
                  {/* Lock — prestige trust signal */}
                  <svg className="h-3.5 w-3.5 text-white/40" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 7V5a3 3 0 0 0-6 0v2H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1Zm-4.5-2a1.5 1.5 0 0 1 3 0v2h-3V5Z" />
                  </svg>
                  {dropPhase === 'CRITICAL'
                    ? 'Collect Now'
                    : dropPhase === 'CLOSING'
                      ? 'Closing Soon — Collect Now'
                      : 'Own This Piece of History'}
                  <span className={dropPhase === 'CRITICAL' ? 'text-white/60' : 'text-white/40'}>
                    &mdash; ${selectedTier.price}
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
                  Registered collector &middot; Visa ··4242
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* ━━━ BREAKING NEWS CRAWL — red urgency ticker during CRITICAL phase ━━━ */}
      {dropPhase === 'CRITICAL' && !isPurchasing && (
        <BreakingNewsCrawl
          moment={moment}
          totalSeconds={countdown.totalSeconds}
          rgb={rgb}
        />
      )}

      {/* ━━━ PiP THUMBNAIL — broadcast picture-in-picture when hero scrolls out ━━━ */}
      {!countdown.isEnded && (
        <div
          className="fixed z-40 pointer-events-none transition-all duration-500 ease-out"
          style={{
            bottom: showStickyBar ? '72px' : '20px',
            right: '12px',
            width: '110px',
            height: '72px',
            opacity: showPip ? 1 : 0,
            transform: showPip ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.85)',
          }}
        >
          <div
            className="relative w-full h-full rounded-[4px] overflow-hidden"
            style={{
              boxShadow: `0 2px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(${rgb},0.2)`,
            }}
          >
            {/* Mini hero image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${moment.playerImageUrl}), ${moment.thumbnailGradient}`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center top, center',
              }}
            />
            {/* Dark bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {/* Team-color top accent */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
            {/* Mini LIVE badge */}
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1 py-px rounded-sm"
              style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            >
              <div
                className="h-[4px] w-[4px] rounded-full animate-pulse"
                style={{ backgroundColor: '#EF4444' }}
              />
              <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-white/70"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                Live
              </span>
            </div>
            {/* Player name */}
            <div className="absolute bottom-1 left-1.5 right-1.5">
              <p
                className="text-[8px] font-bold uppercase tracking-wider text-white/80 truncate"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {moment.player}
              </p>
            </div>
            {/* PiP border label — broadcast PiP indicator */}
            <div className="absolute top-1.5 right-1.5">
              <span className="text-[5px] font-bold uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                PiP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ ACQUISITION LOWER-THIRD — ESPN-style live claim social proof ━━━ */}
      {acquisitionEvent && !isPurchasing && !countdown.isEnded && (
        <AcquisitionLowerThird
          event={acquisitionEvent}
          teamColor={moment.teamColors.primary}
          rgb={rgb}
        />
      )}

      {/* ━━━ STICKY BOTTOM CTA BAR — appears when main CTA scrolls out ━━━ */}
      {!countdown.isEnded && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
            opacity: showStickyBar ? 1 : 0,
          }}
        >
          <div
            className="border-t px-5 py-3 backdrop-blur-xl flex items-center justify-between gap-4"
            style={{
              borderColor: isPurchasing ? `rgba(${rgb},0.25)` : `rgba(${rgb},0.15)`,
              backgroundColor: 'rgba(11,14,20,0.92)',
            }}
          >
            <div className="flex flex-col min-w-0">
              <span
                className="text-sm font-bold uppercase tracking-tight truncate"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {moment.player}
              </span>
              <span className="text-[10px] text-white/30 tracking-wide">
                {isPurchasing
                  ? `${selectedTier.tier} Edition · Acquiring...`
                  : `${selectedTier.tier} Edition · $${selectedTier.price}`}
              </span>
              {/* Sticky bar countdown — timer at the decision point when scrolled */}
              {!isPurchasing && (dropPhase === 'CLOSING' || dropPhase === 'CRITICAL') && (
                <span
                  className={`text-[9px] font-mono tracking-wide mt-0.5 tabular-nums ${
                    dropPhase === 'CRITICAL' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                  }`}
                  style={{
                    textShadow: dropPhase === 'CRITICAL'
                      ? '0 0 6px rgba(239,68,68,0.3)'
                      : 'none',
                  }}
                >
                  {dropPhase === 'CRITICAL' ? 'FINAL ' : ''}
                  {Math.floor(countdown.totalSeconds / 60)}:{(countdown.totalSeconds % 60).toString().padStart(2, '0')} remaining
                </span>
              )}
              {!isPurchasing && selectedTier.remaining <= 20 && (
                <span className={`text-[9px] tracking-wide mt-0.5 ${
                  selectedTier.remaining <= 5 ? 'text-[#F59E0B]' : 'text-white/20'
                }`}>
                  {selectedTier.remaining <= 5
                    ? `Only ${selectedTier.remaining} remain`
                    : `${selectedTier.remaining} of ${selectedTier.size.toLocaleString()} left`}
                </span>
              )}
            </div>
            {isPurchasing ? (
              <div
                className="shrink-0 relative rounded-lg border px-6 py-2.5 text-sm tracking-wide overflow-hidden"
                style={{
                  borderColor: `rgba(${rgb},0.3)`,
                  backgroundColor: 'rgba(11,14,20,0.92)',
                }}
              >
                {/* Progress wipe — mirrors main CTA */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                  style={{
                    width: purchaseStage === 0 ? '33%' : purchaseStage === 1 ? '75%' : '100%',
                    backgroundColor: `rgba(${rgb},0.12)`,
                    borderRight: purchaseStage < 2 ? `1px solid rgba(${rgb},0.3)` : 'none',
                  }}
                />
                <span
                  className="relative z-10 text-white/60 inline-flex items-center gap-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                >
                  {purchaseStage === 2 && (
                    <svg className="h-4 w-4 text-white/70" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M6 10.5 L9 13.5 L14 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="broadcast-checkmark-draw"
                      />
                    </svg>
                  )}
                  {purchaseStage === 0
                    ? 'Reserving...'
                    : purchaseStage === 1
                      ? 'Authenticating...'
                      : 'Acquired.'}
                </span>
              </div>
            ) : (
              <button
                onClick={() => { BROADCAST_HAPTIC.ctaPress(); proto.purchase(); }}
                className={`shrink-0 rounded-lg border px-6 py-2.5 text-sm font-semibold tracking-wide transition-all active:scale-[0.97] ${
                  dropPhase === 'CRITICAL' ? 'animate-urgency-fast' : ''
                }`}
                style={{
                  borderColor: dropPhase === 'CRITICAL' ? '#EF4444' : moment.teamColors.primary,
                  backgroundColor: dropPhase === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : `rgba(${rgb},0.08)`,
                  color: dropPhase === 'CRITICAL' ? '#EF4444' : 'white',
                }}
              >
                {dropPhase === 'CRITICAL' ? 'Collect Now' : 'Own This Moment'}
              </button>
            )}
          </div>
          {/* Safe area spacer for notch phones */}
          <div className="h-[env(safe-area-inset-bottom,0px)]" style={{ backgroundColor: 'rgba(11,14,20,0.92)' }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Tier Card
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// Tier Comparison — ESPN-style tier attribute bars at decision point
// ESPN's "Tale of the Tape" comparison graphic is used before every big fight
// and matchup. Here it compares the selected tier across 3 dimensions:
// Exclusivity (inverse of edition size), Value (secondary market multiplier),
// and Prestige (tier position). Team-color bars animate on tier switch.
// ═══════════════════════════════════════════════════════════════════════════

const TIER_TAPE_DATA: Record<string, { exclusivity: number; value: number; prestige: number }> = {
  Open:      { exclusivity: 15, value: 25, prestige: 20 },
  Rare:      { exclusivity: 55, value: 60, prestige: 50 },
  Legendary: { exclusivity: 82, value: 80, prestige: 80 },
  Ultimate:  { exclusivity: 98, value: 95, prestige: 98 },
};

function TierComparison({ tierName, teamColor, rgb, isVisible }: {
  tierName: string;
  teamColor: string;
  rgb: string;
  isVisible: boolean;
}) {
  const data = TIER_TAPE_DATA[tierName] ?? TIER_TAPE_DATA.Open;

  if (!isVisible) return null;

  const metrics = [
    { label: 'Exclusivity', value: data.exclusivity },
    { label: 'Value Potential', value: data.value },
    { label: 'Prestige', value: data.prestige },
  ];

  const totalScore = metrics.reduce((sum, m) => sum + m.value, 0);
  const isEliteTier = totalScore >= 240; // Legendary+ territory

  return (
    <div
      key={tierName}
      className="mt-4 rounded-lg overflow-hidden relative"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(${rgb},${isEliteTier ? '0.15' : '0.05'})`,
      }}
    >
      {/* Top accent gradient — ESPN graphic header bar */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${teamColor} 50%, transparent 95%)`,
          opacity: isEliteTier ? 0.7 : 0.3,
        }}
      />

      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="h-[10px] w-[2px] rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          <span
            className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/35"
            style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
          >
            Tier Breakdown
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isEliteTier && (
            <span
              className="text-[6px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm"
              style={{
                backgroundColor: `rgba(${rgb},0.15)`,
                color: teamColor,
                fontFamily: 'var(--font-oswald), sans-serif',
                border: `0.5px solid rgba(${rgb},0.25)`,
              }}
            >
              Elite
            </span>
          )}
          <span
            className="text-[7px] font-bold uppercase tracking-[0.2em]"
            style={{
              color: teamColor,
              fontFamily: 'var(--font-oswald), sans-serif',
              opacity: 0.6,
            }}
          >
            {tierName}
          </span>
        </div>
      </div>

      {/* Comparison bars */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {metrics.map((metric, i) => (
          <div key={metric.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase tracking-[0.15em] text-white/30"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {metric.label}
              </span>
              <div className="flex items-center gap-1.5">
                {metric.value >= 90 && (
                  <span
                    className="text-[5px] font-bold uppercase tracking-[0.15em] px-1 py-px rounded-sm"
                    style={{
                      backgroundColor: `rgba(${rgb},0.12)`,
                      color: teamColor,
                      fontFamily: 'var(--font-oswald), sans-serif',
                    }}
                  >
                    Max
                  </span>
                )}
                <span
                  className="text-[9px] font-bold tabular-nums"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    color: metric.value >= 80 ? teamColor : 'rgba(255,255,255,0.4)',
                    textShadow: metric.value >= 90 ? `0 0 8px rgba(${rgb},0.4)` : 'none',
                  }}
                >
                  {metric.value}
                </span>
              </div>
            </div>
            {/* Bar track with tip marker */}
            <div
              className="h-[4px] rounded-full overflow-hidden relative"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
            >
              {/* Bar fill — animates on tier switch */}
              <div
                className="h-full rounded-full"
                style={{
                  width: `${metric.value}%`,
                  background: metric.value >= 80
                    ? `linear-gradient(90deg, rgba(${rgb},0.4), rgba(${rgb},0.7), ${teamColor})`
                    : `linear-gradient(90deg, rgba(${rgb},0.2), rgba(${rgb},0.35))`,
                  animation: `broadcast-tape-bar-fill 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s both`,
                  boxShadow: metric.value >= 80 ? `0 0 8px rgba(${rgb},0.3), 0 0 2px rgba(${rgb},0.5)` : 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer summary — broadcast graphic bottom rule */}
      <div
        className="px-4 py-1.5 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
      >
        <span className="text-[6px] uppercase tracking-[0.15em] text-white/15"
          style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
        >
          Composite Score
        </span>
        <span
          className="text-[8px] font-bold tabular-nums"
          style={{
            fontFamily: 'var(--font-oswald), sans-serif',
            color: isEliteTier ? teamColor : 'rgba(255,255,255,0.3)',
            textShadow: isEliteTier ? `0 0 6px rgba(${rgb},0.3)` : 'none',
          }}
        >
          {Math.round(totalScore / 3)}
        </span>
      </div>
    </div>
  );
}

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
  isFlashing,
  flashKey,
}: {
  tier: RarityTier;
  isSelected: boolean;
  teamColor: string;
  rgb: string;
  onSelect: () => void;
  isFlashing?: boolean;
  flashKey?: number;
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
        borderColor: isFlashing
          ? teamColor
          : isSelected
            ? isLowStock ? '#F59E0B' : teamColor
            : 'rgba(255,255,255,0.06)',
        backgroundColor: isSelected
          ? 'rgba(255,255,255,0.035)'
          : 'rgba(255,255,255,0.015)',
        boxShadow: isFlashing
          ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px rgba(${rgb},0.15)`
          : isSelected
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
          opacity: isSelected || isFlashing ? 1 : 0,
        }}
      />

      {/* ── Claim flash — broadcast-style bottom wipe + "JUST COLLECTED" ── */}
      {isFlashing && (
        <div key={flashKey} className="absolute inset-0 pointer-events-none z-10">
          {/* Team-color wash sweeping from left */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(${rgb},0.12) 0%, rgba(${rgb},0.04) 60%, transparent 100%)`,
              animation: 'broadcast-tier-claim-wash 2s ease-out forwards',
            }}
          />
          {/* "JUST COLLECTED" micro-label — slides in from left */}
          <div
            className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5"
            style={{
              animation: 'broadcast-tier-claim-label 2s ease-out forwards',
            }}
          >
            <div
              className="h-[4px] w-[4px] rounded-full shrink-0"
              style={{
                backgroundColor: teamColor,
                boxShadow: `0 0 4px ${teamColor}60`,
              }}
            />
            <span
              className="text-[7px] font-bold uppercase tracking-[0.2em]"
              style={{
                color: teamColor,
                fontFamily: 'var(--font-oswald), sans-serif',
                opacity: 0.8,
              }}
            >
              Just Collected
            </span>
          </div>
        </div>
      )}

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
  const [phase, setPhase] = useState(0); // 0=hidden, 1=hero+flash, 2=details+chyron, 3=cert, 4=share
  const [showFlash, setShowFlash] = useState(false);
  const [chyronState, setChyronState] = useState<'hidden' | 'in' | 'out'>('hidden'); // chyron lifecycle
  useEffect(() => {
    const t0 = setTimeout(() => { setPhase(1); setShowFlash(true); }, 50);
    const tFlash = setTimeout(() => setShowFlash(false), 350); // flash ends
    const t1 = setTimeout(() => { setPhase(2); setChyronState('in'); }, 600);
    const tChyronOut = setTimeout(() => setChyronState('out'), 3600); // chyron holds 3s then exits
    const tChyronHide = setTimeout(() => setChyronState('hidden'), 4200);
    const t2 = setTimeout(() => setPhase(3), 1200);
    const t3 = setTimeout(() => setPhase(4), 2000);
    return () => { clearTimeout(t0); clearTimeout(tFlash); clearTimeout(t1); clearTimeout(tChyronOut); clearTimeout(tChyronHide); clearTimeout(t2); clearTimeout(t3); };
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

      {/* ── Photographer flash burst — press cameras at prestige auction ── */}
      {showFlash && (
        <div
          className="absolute inset-0 z-[5] pointer-events-none bg-white"
          style={{ animation: 'broadcast-flash-burst 300ms ease-out forwards' }}
        />
      )}

      {/* ── BREAKING chyron — broadcast announcement of collection ── */}
      {chyronState !== 'hidden' && (
        <div
          className="fixed bottom-[15%] left-0 right-0 z-30 pointer-events-none flex justify-center"
          style={{
            animation: chyronState === 'in'
              ? 'broadcast-chyron-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : 'broadcast-chyron-out 0.5s ease-in forwards',
          }}
        >
          <div className="flex items-stretch max-w-md w-[90%] overflow-hidden rounded-sm"
            style={{ boxShadow: `0 4px 30px rgba(${rgb},0.15), 0 0 0 1px rgba(${rgb},0.2)` }}
          >
            {/* Team-color accent bar */}
            <div className="w-[4px] flex-shrink-0" style={{ backgroundColor: moment.teamColors.primary }} />
            <div className="flex-1 px-4 py-2.5" style={{ backgroundColor: 'rgba(11,14,20,0.94)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
                  style={{
                    backgroundColor: `${moment.teamColors.primary}20`,
                    color: moment.teamColors.primary,
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  Breaking
                </span>
                <div className="h-[1px] flex-1" style={{ backgroundColor: `rgba(${rgb},0.15)` }} />
              </div>
              <p
                className="text-[12px] font-semibold tracking-wide text-white/80"
                style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                {moment.player} &mdash; {moment.statLine}
              </p>
              <p
                className="mt-0.5 text-[10px] tracking-wide text-white/30"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
              >
                Collected &middot; {tier.tier} Edition #{editionNumber.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center min-h-dvh">

        {/* ── TOP: Broadcast "COLLECTED" announcement ── */}
        <div
          className="w-full pt-16 pb-8 px-5 text-center transition-all duration-700 ease-out relative"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {/* Signal burst — single clean expanding ring behind headline */}
          {/* TV broadcast signal emission: one authoritative ring.     */}
          {phase >= 1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute rounded-full"
                style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid rgba(${rgb},0.6)`,
                  animation: 'broadcast-signal-burst 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
                  opacity: 0,
                  boxShadow: `0 0 16px rgba(${rgb},0.2)`,
                }}
              />
            </div>
          )}

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

            {/* Prestige border shimmer — traveling glow traces card edges */}
            <div
              className="absolute w-[30%] h-[30%] rounded-full pointer-events-none z-0"
              style={{
                background: `radial-gradient(circle, ${moment.teamColors.primary} 0%, transparent 70%)`,
                opacity: 0.1,
                filter: 'blur(16px)',
                animation: 'broadcast-cert-shimmer 6s ease-in-out infinite',
              }}
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

            {/* Wax seal — Sotheby's authentication mark */}
            <div
              className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6"
              style={{ opacity: 0.5 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {/* Outer notched circle — wax seal edge */}
                <circle cx="24" cy="24" r="22" stroke={moment.teamColors.primary} strokeWidth="1" opacity="0.4" />
                <circle cx="24" cy="24" r="18" stroke={moment.teamColors.primary} strokeWidth="0.5" opacity="0.25" />
                {/* Radial lines — emboss detail */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const x1 = 24 + Math.cos(angle) * 18;
                  const y1 = 24 + Math.sin(angle) * 18;
                  const x2 = 24 + Math.cos(angle) * 22;
                  const y2 = 24 + Math.sin(angle) * 22;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={moment.teamColors.primary} strokeWidth="0.5" opacity="0.3" />
                  );
                })}
                {/* Inner circle — seal center */}
                <circle cx="24" cy="24" r="14" stroke={moment.teamColors.primary} strokeWidth="0.5" opacity="0.3" />
                {/* TST monogram */}
                <text
                  x="24" y="26"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  fill={moment.teamColors.primary}
                  opacity="0.5"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                >
                  TST
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── TONIGHT'S NUMBERS — ESPN stat graphic overlay card ── */}
        {/* Every NBA broadcast shows a stat breakdown graphic during the    */}
        {/* postgame recap. This presents the player's performance in the    */}
        {/* familiar broadcast on-screen graphic style: team-color header,   */}
        {/* stat grid, editorial context line.                               */}
        <div
          className="mt-6 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: '0.25s',
          }}
        >
          <div
            className="relative overflow-hidden rounded-md"
            style={{
              border: `1px solid rgba(${rgb},0.15)`,
              backgroundColor: 'rgba(20,25,37,0.6)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Header bar — team-color gradient */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                background: `linear-gradient(90deg, rgba(${rgb},0.2), rgba(${rgb},0.05))`,
                borderBottom: `1px solid rgba(${rgb},0.12)`,
              }}
            >
              <span
                className="text-[9px] font-bold uppercase tracking-[0.3em]"
                style={{ fontFamily: 'var(--font-oswald), sans-serif', color: moment.teamColors.primary }}
              >
                Tonight&apos;s Numbers
              </span>
              <span className="text-[8px] font-mono uppercase tracking-wider text-white/20">
                {fullTeam(moment.team)}
              </span>
            </div>
            {/* Stat grid — broadcast-style large values with staggered reveal */}
            <div className="grid grid-cols-3 gap-[1px]" style={{ backgroundColor: `rgba(${rgb},0.06)` }}>
              {moment.statLine.split(' / ').map((stat, idx) => {
                const parts = stat.trim().split(' ');
                const value = parts[0];
                const label = parts.slice(1).join(' ');
                return (
                  <div
                    key={stat}
                    className="flex flex-col items-center py-3 bg-[#0B0E14]/80"
                  >
                    <span
                      className="text-[22px] font-bold tabular-nums leading-none"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: moment.teamColors.primary,
                        textShadow: `0 0 12px rgba(${rgb},0.2)`,
                        animation: phase >= 3 ? `broadcast-stat-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.4 + idx * 0.2}s both` : undefined,
                      }}
                    >
                      {value}
                    </span>
                    <span
                      className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        animation: phase >= 3 ? `broadcast-stat-reveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.55 + idx * 0.2}s both` : undefined,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Context line — editorial footnote */}
            <div
              className="px-4 py-2 text-center"
              style={{ borderTop: `1px solid rgba(${rgb},0.08)` }}
            >
              <p
                className="text-[10px] tracking-wide text-white/20"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
              >
                {moment.context}
              </p>
            </div>
          </div>
        </div>

        {/* ── FINAL SCORE — ESPN end-of-game scoreboard graphic ─────── */}
        {/* Every NBA broadcast ends with the final score overlay —     */}
        {/* this contextualizes the moment within the game result.      */}
        <div
          className="mt-5 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '0.35s',
          }}
        >
          {(() => {
            const GAME_SCORES: Record<string, { home: string; away: string; hScore: number; aScore: number; status: string }> = {
              bam: { away: 'BOS', home: 'MIA', aScore: 102, hScore: 118, status: 'FINAL' },
              jokic: { away: 'LAL', home: 'DEN', aScore: 108, hScore: 126, status: 'FINAL' },
              sga: { away: 'DAL', home: 'OKC', aScore: 104, hScore: 119, status: 'FINAL' },
            };
            const game = GAME_SCORES[moment.id] ?? { away: moment.opponent, home: moment.team, aScore: 98, hScore: 112, status: 'FINAL' };
            const isHomeWinner = game.hScore > game.aScore;
            return (
              <div
                className="relative overflow-hidden rounded-md"
                style={{
                  border: `1px solid rgba(${rgb},0.12)`,
                  backgroundColor: 'rgba(20,25,37,0.6)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-1.5"
                  style={{
                    background: `linear-gradient(90deg, rgba(${rgb},0.15), rgba(${rgb},0.04))`,
                    borderBottom: `1px solid rgba(${rgb},0.08)`,
                  }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-[0.3em]"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif', color: moment.teamColors.primary }}
                  >
                    Final Score
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-white/15">
                    {game.status}
                  </span>
                </div>
                {/* Score rows */}
                {[
                  { team: game.away, score: game.aScore, isWinner: !isHomeWinner },
                  { team: game.home, score: game.hScore, isWinner: isHomeWinner },
                ].map((row) => (
                  <div
                    key={row.team}
                    className="flex items-center justify-between px-4 py-2"
                    style={{ borderBottom: `1px solid rgba(${rgb},0.05)` }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Team color dot */}
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: row.team === moment.team ? moment.teamColors.primary : 'rgba(255,255,255,0.2)',
                        }}
                      />
                      <span
                        className="text-[13px] font-bold uppercase tracking-wide"
                        style={{
                          fontFamily: 'var(--font-oswald), sans-serif',
                          color: row.isWinner ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {fullTeam(row.team)}
                      </span>
                    </div>
                    <span
                      className="text-[18px] font-bold tabular-nums"
                      style={{
                        fontFamily: 'var(--font-oswald), sans-serif',
                        color: row.isWinner ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                        textShadow: row.isWinner ? `0 0 12px rgba(${rgb},0.2)` : undefined,
                      }}
                    >
                      {row.score}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── INSTANT REPLAY — broadcast director cuts to the replay ── */}
        <div
          className="mt-6 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '0.4s',
          }}
        >
          <div className="relative rounded-md overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {/* Action image — broadcast-graded */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${moment.actionImageUrl})`,
                backgroundPosition: 'center 30%',
                filter: 'saturate(0.85) contrast(1.15) brightness(0.9)',
              }}
            />
            {/* Dark vignette */}
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(11,14,20,0.7) 100%)' }}
            />
            {/* Play triangle — suggests replayable moment */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              >
                <svg className="w-4 h-4 ml-0.5 text-white/80" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5v11l10-5.5L4 2.5z" />
                </svg>
              </div>
            </div>
            {/* REPLAY badge — top-left, broadcast style */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-sm"
                style={{
                  backgroundColor: 'rgba(11,14,20,0.8)',
                  backdropFilter: 'blur(6px)',
                  border: `1px solid rgba(${rgb},0.3)`,
                }}
              >
                {/* Replay icon — circular arrow */}
                <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke={moment.teamColors.primary} strokeWidth="1.2" strokeLinecap="round">
                  <path d="M1 4.5A5 5 0 0 1 10.5 3.5" />
                  <path d="M11 1v3H8" />
                  <path d="M11 7.5A5 5 0 0 1 1.5 8.5" />
                  <path d="M1 11V8h3" />
                </svg>
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif', color: moment.teamColors.primary }}
                >
                  Replay
                </span>
              </div>
            </div>
            {/* Team-color accent line — bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: moment.teamColors.primary }}
            />
          </div>
        </div>

        {/* ── DIRECTOR'S MONITOR WALL — broadcast control room 2×2 grid ── */}
        {/* ESPN's control room has a 56-monitor North Wall. The director    */}
        {/* watches all camera feeds simultaneously then "punches" the one   */}
        {/* that goes to air. This 2×2 grid simulates that control room     */}
        {/* view — different angles of the same moment, with tally lights   */}
        {/* showing which feed is "live." Distinctly broadcast: the viewer  */}
        {/* sees the production infrastructure behind the highlight.        */}
        <div
          className="mt-6 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(14px)',
            transitionDelay: '0.55s',
          }}
        >
          {/* Section label */}
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                color: '#EF4444',
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              Control Room
            </span>
            <div className="h-[1px] flex-1 bg-white/[0.06]" />
            <span className="text-[7px] uppercase tracking-[0.15em] text-white/15 font-mono">
              4 feeds
            </span>
          </div>

          {/* 2×2 monitor grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'CAM 1', sub: 'Wide', live: true, crop: 'center 30%', filter: 'saturate(0.7) contrast(1.2) brightness(0.85)', img: moment.actionImageUrl },
              { label: 'CAM 2', sub: 'Tight', live: false, crop: 'center 40%', filter: 'saturate(0.5) contrast(1.3) brightness(0.75)', img: moment.playerImageUrl },
              { label: 'ISO', sub: moment.player.split(' ').pop(), live: false, crop: 'center 25%', filter: 'saturate(0.6) contrast(1.25) brightness(0.8) sepia(0.1)', img: moment.actionImageUrl },
              { label: 'REPLAY', sub: 'SLO-MO', live: false, crop: 'center 50%', filter: 'saturate(0.4) contrast(1.1) brightness(0.7)', img: moment.actionImageUrl },
            ].map((cam, i) => (
              <div
                key={cam.label}
                className="relative overflow-hidden rounded-sm"
                style={{
                  aspectRatio: '16/10',
                  border: cam.live
                    ? '1px solid rgba(239,68,68,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  animation: cam.live ? undefined : undefined,
                }}
              >
                {/* Camera feed image */}
                <div
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: `url(${cam.img})`,
                    backgroundPosition: cam.crop,
                    filter: cam.filter,
                    transform: i === 2 ? 'scale(1.4)' : i === 3 ? 'scale(1.15) translateX(-5%)' : undefined,
                  }}
                />
                {/* Scanline overlay — CRT monitor texture */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                  }}
                />
                {/* Dark vignette */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
                />
                {/* Camera label — top-left */}
                <div className="absolute top-1 left-1.5 flex items-center gap-1">
                  {/* Tally light — red dot for live feed */}
                  {cam.live && (
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#EF4444',
                        boxShadow: '0 0 4px rgba(239,68,68,0.6), 0 0 8px rgba(239,68,68,0.3)',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                  <span
                    className="text-[7px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      color: cam.live ? '#EF4444' : 'rgba(255,255,255,0.35)',
                      textShadow: cam.live ? '0 0 6px rgba(239,68,68,0.4)' : undefined,
                    }}
                  >
                    {cam.label}
                  </span>
                </div>
                {/* Sub-label — bottom-left */}
                <div className="absolute bottom-1 left-1.5">
                  <span
                    className="text-[6px] uppercase tracking-[0.15em]"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      color: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    {cam.sub}
                  </span>
                </div>
                {/* Timecode — bottom-right */}
                <div className="absolute bottom-1 right-1.5">
                  <span
                    className="text-[6px] tabular-nums"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      color: cam.live ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.12)',
                    }}
                  >
                    {`00:${String(4 - i).padStart(2, '0')}:${String(17 + i * 3).padStart(2, '0')}:${String(i * 7 + 12).padStart(2, '0')}`}
                  </span>
                </div>
                {/* LIVE badge on active feed */}
                {cam.live && (
                  <div className="absolute top-1 right-1.5">
                    <span
                      className="text-[6px] font-bold uppercase tracking-[0.15em] px-1 py-px rounded-sm"
                      style={{
                        backgroundColor: 'rgba(239,68,68,0.2)',
                        color: '#EF4444',
                        fontFamily: 'var(--font-oswald), sans-serif',
                        border: '0.5px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      Live
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Production footer bar */}
          <div
            className="mt-1.5 flex items-center justify-between px-1"
          >
            <span className="text-[6px] uppercase tracking-[0.2em] text-white/10 font-mono">
              PGM OUT: CAM 1
            </span>
            <span className="text-[6px] uppercase tracking-[0.2em] text-white/10 font-mono">
              REC ● 00:04:17
            </span>
          </div>
        </div>

        {/* ── AUDIO LEVELS — broadcast control room VU meters ───────── */}
        {/* In every ESPN/TNT control room, audio engineers monitor VU   */}
        {/* meters during the broadcast. After a huge play, the crowd    */}
        {/* levels spike and the meters pin. This is that moment frozen. */}
        <div
          className="mt-5 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '0.6s',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="text-[7px] font-bold uppercase tracking-[0.25em] text-white/20"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              Audio Levels
            </span>
            <div className="h-[1px] flex-1 bg-white/[0.05]" />
            <span className="text-[6px] font-mono uppercase tracking-[0.15em] text-white/10">
              PGM L/R
            </span>
          </div>

          {/* VU meter bars — 5 channels */}
          <div className="flex flex-col gap-1">
            {[
              { label: 'CROWD', level: 92, peak: true },
              { label: 'COURT', level: 67, peak: false },
              { label: 'PBP', level: 74, peak: false },
              { label: 'ANLST', level: 58, peak: false },
              { label: 'MIX', level: 85, peak: true },
            ].map((ch, idx) => (
              <div key={ch.label} className="flex items-center gap-2">
                <span className="text-[6px] font-mono uppercase tracking-[0.1em] text-white/15 w-[28px] text-right tabular-nums">
                  {ch.label}
                </span>
                {/* Meter bar background */}
                <div className="flex-1 h-[5px] rounded-[1px] bg-white/[0.04] relative overflow-hidden">
                  {/* Level fill */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-[1px]"
                    style={{
                      width: `${ch.level}%`,
                      background: ch.level > 85
                        ? `linear-gradient(90deg, rgba(${rgb},0.3) 0%, rgba(${rgb},0.6) 75%, #EF4444 95%)`
                        : `linear-gradient(90deg, rgba(${rgb},0.2) 0%, rgba(${rgb},0.5) 100%)`,
                      animation: phase >= 3 ? `broadcast-vu-fill 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.6 + idx * 0.08}s both` : undefined,
                    }}
                  />
                  {/* Peak indicator — red clip mark */}
                  {ch.peak && (
                    <div
                      className="absolute inset-y-0 w-[2px] rounded-[1px]"
                      style={{
                        left: `${Math.min(ch.level + 3, 98)}%`,
                        backgroundColor: '#EF4444',
                        opacity: 0.7,
                        animation: phase >= 3 ? `broadcast-vu-peak 1.5s ease-in-out ${1.2 + idx * 0.1}s infinite` : undefined,
                      }}
                    />
                  )}
                </div>
                {/* dB reading */}
                <span className="text-[6px] font-mono tabular-nums text-white/10 w-[22px]">
                  {ch.level > 85 ? '-2' : ch.level > 70 ? '-8' : '-14'}dB
                </span>
              </div>
            ))}
          </div>

          {/* Scale markers */}
          <div className="flex items-center mt-1 ml-[36px]">
            <div className="flex-1 flex justify-between">
              {['-40', '-20', '-10', '-6', '0'].map((mark) => (
                <span key={mark} className="text-[5px] font-mono text-white/8 tabular-nums">{mark}</span>
              ))}
            </div>
            <div className="w-[22px]" />
          </div>
        </div>

        {/* ── PLAYER OF THE GAME — ESPN-style award graphic ──────────── */}
        {/* Every ESPN/TNT broadcast ends with a "Player of the Game"   */}
        {/* graphic: the highest individual honor in a broadcast recap.  */}
        {/* This frames the collected player as THE player of the game,  */}
        {/* creating prestige and screenshot-worthy celebration content.  */}
        <div
          className="mt-6 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(14px)',
            transitionDelay: '0.5s',
          }}
        >
          <div
            className="relative overflow-hidden rounded-md"
            style={{
              border: `1px solid rgba(${rgb},0.2)`,
              backgroundColor: 'rgba(20,25,37,0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Gold gradient top accent — award prestige */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, #D4A017, ${moment.teamColors.primary}, #D4A017)`,
              }}
            />

            <div className="px-5 py-5 sm:px-6 flex items-center gap-4">
              {/* Trophy icon — broadcast award emblem */}
              <div className="flex-shrink-0">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  {/* Trophy cup */}
                  <path
                    d="M10 6h16v2c0 5.5-3.6 10-8 10s-8-4.5-8-10V6z"
                    stroke="#D4A017"
                    strokeWidth="1.2"
                    fill="none"
                    opacity="0.7"
                  />
                  {/* Left handle */}
                  <path
                    d="M10 9H7c0 3 1.5 5 3 5.5"
                    stroke="#D4A017"
                    strokeWidth="0.8"
                    fill="none"
                    opacity="0.4"
                  />
                  {/* Right handle */}
                  <path
                    d="M26 9h3c0 3-1.5 5-3 5.5"
                    stroke="#D4A017"
                    strokeWidth="0.8"
                    fill="none"
                    opacity="0.4"
                  />
                  {/* Stem */}
                  <line x1="18" y1="18" x2="18" y2="24" stroke="#D4A017" strokeWidth="0.8" opacity="0.5" />
                  {/* Base */}
                  <rect x="13" y="24" width="10" height="2" rx="0.5" stroke="#D4A017" strokeWidth="0.8" fill="none" opacity="0.4" />
                  {/* Star — award symbol */}
                  <path
                    d="M18 9l1.2 2.4 2.6.4-1.9 1.8.5 2.6L18 14.8l-2.4 1.4.5-2.6-1.9-1.8 2.6-.4z"
                    fill="#D4A017"
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* Award text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.08))',
                      color: '#D4A017',
                      fontFamily: 'var(--font-oswald), sans-serif',
                      border: '1px solid rgba(212,160,23,0.15)',
                    }}
                  >
                    Player of the Game
                  </span>
                </div>
                <p
                  className="text-[18px] uppercase tracking-tight leading-tight"
                  style={{
                    fontFamily: 'var(--font-oswald), sans-serif',
                    fontWeight: 700,
                    color: moment.teamColors.primary,
                    textShadow: `0 0 16px rgba(${rgb},0.25)`,
                  }}
                >
                  {moment.player}
                </p>
                <p
                  className="mt-0.5 text-[11px] tracking-wide text-white/40"
                  style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 400 }}
                >
                  {moment.statLine}
                </p>
              </div>
            </div>

            {/* Bottom bar — production detail */}
            <div
              className="px-5 py-1.5 flex items-center justify-between"
              style={{
                borderTop: `1px solid rgba(${rgb},0.08)`,
                backgroundColor: 'rgba(11,14,20,0.4)',
              }}
            >
              <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/15">
                {fullTeam(moment.team)} vs {fullTeam(moment.opponent)}
              </span>
              <span
                className="text-[7px] uppercase tracking-[0.2em]"
                style={{ color: `rgba(212,160,23,0.35)`, fontFamily: 'var(--font-oswald), sans-serif' }}
              >
                ESPN Award
              </span>
            </div>
          </div>
        </div>

        {/* ── POST-GAME PRESS CONFERENCE — player quote, broadcast editorial depth ── */}
        <div
          className="mt-5 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(10px)',
            transitionDelay: '0.3s',
          }}
        >
          {/* Section label — broadcast lower-third style */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
              style={{
                backgroundColor: `rgba(${rgb},0.12)`,
                color: moment.teamColors.primary,
                fontFamily: 'var(--font-oswald), sans-serif',
              }}
            >
              Postgame
            </span>
            <div className="h-[1px] flex-1 bg-white/[0.06]" />
          </div>
          {/* Quote block — editorial serif italic */}
          <div className="relative pl-4">
            {/* Left accent bar — broadcast pull quote */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
              style={{ backgroundColor: `rgba(${rgb},0.3)` }}
            />
            <p
              className="text-[13px] leading-relaxed text-white/35"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
            >
              &ldquo;{
                moment.id === 'bam'
                  ? 'I felt like I couldn\u2019t be stopped tonight. Every time I got to the rim, I knew it was going in.'
                  : moment.id === 'jokic'
                    ? 'I don\u2019t think about records. I just play the game. If my teammates are open, I pass. If they\u2019re not, I score.'
                    : 'That mid-range is my spot. I\u2019ve taken that shot a million times. Tonight it just felt different \u2014 like every one was going in.'
              }&rdquo;
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/20">
              <span style={{ fontFamily: 'var(--font-oswald), sans-serif', fontWeight: 600 }}>
                {moment.player}
              </span>
              <span className="text-white/10"> &middot; </span>
              Postgame Press Conference
            </p>
          </div>
        </div>

        {/* ── UP NEXT — broadcast promo for next available moment ── */}
        {(() => {
          const others = MOMENTS.filter((m) => m.id !== moment.id);
          const next = others[Math.floor((editionNumber ?? 1) % others.length)];
          if (!next) return null;
          return (
            <div
              className="mt-6 w-full max-w-md mx-auto px-5 transition-all duration-700 ease-out"
              style={{
                opacity: phase >= 4 ? 1 : 0,
                transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)',
                transitionDelay: '0.2s',
              }}
            >
              {/* Broadcast-style "UP NEXT" header */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[8px] font-bold uppercase tracking-[0.3em] px-1.5 py-px rounded-sm"
                  style={{
                    backgroundColor: `rgba(${rgb},0.12)`,
                    color: moment.teamColors.primary,
                    fontFamily: 'var(--font-oswald), sans-serif',
                  }}
                >
                  Up Next
                </span>
                <div className="h-[1px] flex-1 bg-white/[0.06]" />
              </div>

              {/* Promo card — compact horizontal layout */}
              <a
                href={`/broadcast/${next.id}`}
                className="group flex items-center gap-3 rounded-md border border-white/[0.06] px-3 py-2.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.02]"
                style={{ cursor: 'pointer' }}
              >
                {/* Thumbnail — small, broadcast-graded */}
                <div
                  className="w-14 h-14 flex-shrink-0 rounded-sm bg-cover bg-center relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${next.actionImageUrl})`,
                    filter: 'saturate(0.8) contrast(1.1) brightness(0.85)',
                  }}
                >
                  {/* Team-color accent */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: next.teamColors.primary }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12px] font-bold uppercase tracking-[0.05em] text-white/70 truncate group-hover:text-white/90 transition-colors"
                    style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {next.player}
                  </p>
                  <p className="text-[10px] text-white/30 truncate mt-0.5">
                    {next.playType} &middot; {next.team} vs {next.opponent}
                  </p>
                  <p className="text-[10px] font-mono tabular-nums text-white/20 mt-0.5">
                    From ${next.price}
                  </p>
                </div>

                {/* Arrow — broadcast transition indicator */}
                <svg className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          );
        })()}

        {/* ── SHARE — appears last ── */}
        <div
          className="mt-8 mb-12 flex flex-col items-center transition-all duration-600 ease-out"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <div className="flex items-center gap-3">
            <ShareButton label="Share on X" icon="𝕏" teamColor={moment.teamColors.primary} />
            <ShareButton label="Instagram" icon="◎" teamColor={moment.teamColors.primary} />
            <ShareButton label="Copy Link" icon="⎘" teamColor={moment.teamColors.primary} />
          </div>

          <p className="mt-4 text-[10px] text-white/15 uppercase tracking-[0.2em]">
            Share your collection
          </p>

          {/* Broadcast end credit — program sign-off */}
          <div className="mt-8 flex flex-col items-center gap-2">
            {/* Viewership stat — ratings overlay */}
            <div className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-[9px] tabular-nums text-white/15 tracking-wide">
                {(847 + Math.floor(moment.editionsClaimed * 1.3)).toLocaleString()} viewers tuned in
              </span>
            </div>
            {/* Production credits — broadcast end card with crew roles */}
            <div
              className="h-[1px] w-16 mx-auto"
              style={{ backgroundColor: `rgba(${rgb},0.12)` }}
            />
            <div className="mt-3 flex flex-col items-center gap-1">
              {[
                { role: 'Director', name: 'R. Chen' },
                { role: 'Executive Producer', name: 'M. Ramirez' },
                { role: 'Technical Director', name: 'J. Okafor' },
              ].map((credit) => (
                <div key={credit.role} className="flex items-center gap-2">
                  <span className="text-[6px] font-mono uppercase tracking-[0.2em] text-white/8 w-[80px] text-right">
                    {credit.role}
                  </span>
                  <span className="text-[7px] tracking-wide text-white/15">
                    {credit.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Program sign-off — broadcast lifecycle bookend */}
            <div
              className="h-[1px] w-16 mx-auto mt-3"
              style={{ backgroundColor: `rgba(${rgb},0.12)` }}
            />
            <p
              className="text-[7px] uppercase tracking-[0.3em] text-white/10 mt-2"
              style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
            >
              A TST Broadcast Production · {dateStr}
            </p>
          </div>

          <button
            onClick={onReset}
            className="mt-4 text-[10px] text-white/15 hover:text-white/30 transition-colors"
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

function ShareButton({ label, icon, teamColor }: { label: string; icon: string; teamColor: string }) {
  return (
    <button
      className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-[11px] font-medium tracking-wide text-white/45 transition-all duration-200 hover:text-white/70"
      onClick={(e) => { e.preventDefault(); BROADCAST_HAPTIC.share(); }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${teamColor}40`;
        (e.currentTarget as HTMLElement).style.backgroundColor = `${teamColor}10`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.03)';
      }}
    >
      <span className="text-[13px]">{icon}</span>
      {label}
    </button>
  );
}

