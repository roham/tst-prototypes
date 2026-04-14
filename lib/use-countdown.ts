"use client";

import { useState, useEffect, useCallback } from "react";

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

export function useCountdown(endTime: number): CountdownState {
  const [state, setState] = useState<CountdownState>(() =>
    computeState(endTime)
  );

  const tick = useCallback(() => {
    setState(computeState(endTime));
  }, [endTime]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return state;
}
