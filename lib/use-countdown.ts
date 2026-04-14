"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type CountdownPhase = "NEUTRAL" | "AMBER" | "RED" | "PULSING" | "ENDED";

export interface CountdownState {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isClosing: boolean;
  isCritical: boolean;
  isEnded: boolean;
  phase: CountdownPhase;
}

function computeState(endTime: number): CountdownState {
  const diff = Math.max(0, endTime - Date.now());
  const totalSeconds = Math.ceil(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isEnded = totalSeconds <= 0;

  let phase: CountdownPhase;
  if (isEnded) {
    phase = "ENDED";
  } else if (totalSeconds <= 10) {
    phase = "PULSING";
  } else if (totalSeconds <= 60) {
    phase = "RED";
  } else if (totalSeconds <= 300) {
    phase = "AMBER";
  } else {
    phase = "NEUTRAL";
  }

  return {
    minutes,
    seconds,
    totalSeconds,
    isClosing: phase === "AMBER" || phase === "RED" || phase === "PULSING",
    isCritical: phase === "RED" || phase === "PULSING",
    isEnded,
    phase,
  };
}

const INITIAL_STATE: CountdownState = {
  minutes: 12, seconds: 0, totalSeconds: 720,
  isClosing: false, isCritical: false, isEnded: false, phase: "NEUTRAL",
};

/**
 * useCountdown — pass a DURATION in ms, not a timestamp.
 * The end time is computed on the client at mount time.
 * This avoids SSR/hydration mismatch.
 */
export function useCountdown(durationMs: number): CountdownState {
  const endTimeRef = useRef<number>(0);
  const [state, setState] = useState<CountdownState>(INITIAL_STATE);

  useEffect(() => {
    // Compute end time purely on client at mount
    endTimeRef.current = Date.now() + durationMs;
    const tick = () => setState(computeState(endTimeRef.current));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [durationMs]);

  return state;
}
