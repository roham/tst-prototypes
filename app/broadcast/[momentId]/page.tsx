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
    // 3 → 2 → 1 → LIVE → fade out
    const t1 = setTimeout(() => { setFlash(true); }, 380);
    const t1b = setTimeout(() => { setFlash(false); setDigit(2); }, 480);
    const t2 = setTimeout(() => { setFlash(true); }, 860);
    const t2b = setTimeout(() => { setFlash(false); setDigit(1); }, 960);
    const t3 = setTimeout(() => { setFlash(true); }, 1340);
    const t3b = setTimeout(() => { setFlash(false); setDigit(null); setShowLive(true); }, 1440);
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
    const t1 = setTimeout(() => setSpecialReport('in'), 800);
    // Hold 3s then slide out
    const t2 = setTimeout(() => setSpecialReport('out'), 3800);
    const t3 = setTimeout(() => setSpecialReport('done'), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [leaderDone]);

  // Channel switch static — brief TV static flash + channel number on tier change
  const [channelSwitch, setChannelSwitch] = useState<number | null>(null);
  const prevTierRef = useRef(0);
  const handleTierSelect = useCallback((idx: number) => {
    if (idx === prevTierRef.current) return;
    prevTierRef.current = idx;
    setChannelSwitch(idx + 1); // CH 1, CH 2, CH 3, CH 4
    setSelectedTierIdx(idx);
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

  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showPip, setShowPip] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const transactionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

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

  // "SOLD TO" lower-third — broadcast auction announcement on purchase confirmation
  const [soldToVisible, setSoldToVisible] = useState(false);
  useEffect(() => {
    if (proto.state === 'purchasing' && purchaseStage === 2) {
      setSoldToVisible(true);
    } else if (proto.state !== 'purchasing') {
      setSoldToVisible(false);
    }
  }, [proto.state, purchaseStage]);

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

  // Feed cut — brief static band on phase transition (camera feed switch)
  // Crash zoom — broadcast director punch-in on phase shift
  const [feedCut, setFeedCut] = useState(false);
  const [camLabel, setCamLabel] = useState('ISO CAM 1');
  const [crashZoom, setCrashZoom] = useState(false);
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
      const t = setTimeout(() => setFeedCut(false), 350);
      const t2 = setTimeout(() => setCrashZoom(false), 500);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
  }, [countdown.totalSeconds]);

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

      {/* ━━━ SCORE BUG — persistent game score overlay ━━━━━━━━━━━━━━ */}
      <ScoreBug moment={moment} isEnded={countdown.isEnded} teamColor={moment.teamColors.primary} rgb={rgb} dropPhase={dropPhase} />

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

          {/* ── ANALYST REACTION — ESPN "SportsCenter" studio take ── */}
          {/* Every broadcast cuts to the analyst desk for expert commentary. */}
          <div className="mt-8 mb-8 relative">
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
                Analysis
              </span>
              <div className="h-[1px] flex-1 bg-white/[0.06]" />
            </div>
            {/* Analyst card — studio desk energy */}
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
              <div className="px-4 py-3.5 flex gap-3">
                {/* Analyst avatar — circular initial */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `rgba(${rgb},0.15)`,
                    border: `1px solid rgba(${rgb},0.2)`,
                  }}
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: `${moment.teamColors.primary}80`, fontFamily: 'var(--font-oswald), sans-serif' }}
                  >
                    {moment.id === 'bam' ? 'RJ' : moment.id === 'jokic' ? 'JJ' : 'CW'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {/* Name + role */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60"
                      style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
                    >
                      {moment.id === 'bam' ? 'Richard Jefferson' : moment.id === 'jokic' ? 'JJ Redick' : 'Chiney Ogwumike'}
                    </span>
                    <span className="text-[8px] font-mono uppercase tracking-[0.15em] text-white/20">
                      TST Analyst
                    </span>
                  </div>
                  {/* Hot take — per-moment expert opinion */}
                  <p
                    className="mt-1.5 text-[12px] leading-relaxed text-white/35"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: 'italic' }}
                  >
                    &ldquo;{moment.id === 'bam'
                      ? 'This is the Bam we\u2019ve been waiting for. When he\u2019s this aggressive, Miami is a different team. You don\u2019t see bigs take over games like this anymore.'
                      : moment.id === 'jokic'
                        ? 'There is no playbook for guarding Joki\u0107. He sees passes two moves ahead. This is the best passing big man in NBA history \u2014 and I don\u2019t think it\u2019s close.'
                        : 'SGA is the most unguardable player in the league right now. That mid-range is automatic, and he\u2019s doing it in the biggest moments. This kid is special.'
                    }&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tale of the Tape — tonight vs season average comparison */}
          <TaleOfTheTape moment={moment} rgb={rgb} />

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

          {/* CTA button */}
          <div className={`${!countdown.isEnded && !isPurchasing ? '' : 'mt-8'} flex flex-col items-center`}>
            <button
              ref={ctaRef}
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
                onClick={proto.purchase}
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
            {/* Stat grid — broadcast-style large values with labels */}
            <div className="grid grid-cols-3 gap-[1px]" style={{ backgroundColor: `rgba(${rgb},0.06)` }}>
              {moment.statLine.split(' / ').map((stat) => {
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
                      }}
                    >
                      {value}
                    </span>
                    <span
                      className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30"
                      style={{ fontFamily: 'var(--font-oswald), sans-serif' }}
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
      onClick={(e) => e.preventDefault()}
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

