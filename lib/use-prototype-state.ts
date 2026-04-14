"use client";

import { useState, useEffect, useCallback } from "react";

export type PrototypePhase =
  | "browsing"
  | "purchasing"
  | "confirmed"
  | "sharing";

interface StoredState {
  phase: PrototypePhase;
  editionNumber: number | null;
  purchaseTime: number | null;
}

const STORAGE_KEY_PREFIX = "tst-prototype-";

function storageKey(momentId: string): string {
  return `${STORAGE_KEY_PREFIX}${momentId}`;
}

function loadState(momentId: string): StoredState {
  if (typeof window === "undefined")
    return { phase: "browsing", editionNumber: null, purchaseTime: null };
  try {
    const raw = localStorage.getItem(storageKey(momentId));
    if (raw) return JSON.parse(raw) as StoredState;
  } catch {
    // corrupted — reset
  }
  return { phase: "browsing", editionNumber: null, purchaseTime: null };
}

function saveState(momentId: string, state: StoredState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(momentId), JSON.stringify(state));
}

export interface PrototypeStateReturn {
  state: PrototypePhase;
  editionNumber: number | null;
  purchaseTime: number | null;
  purchase: () => void;
  share: () => void;
  reset: () => void;
}

export function usePrototypeState(momentId: string): PrototypeStateReturn {
  const [stored, setStored] = useState<StoredState>(() => loadState(momentId));

  // Sync to localStorage on change
  useEffect(() => {
    saveState(momentId, stored);
  }, [momentId, stored]);

  // Re-load if momentId changes
  useEffect(() => {
    setStored(loadState(momentId));
  }, [momentId]);

  const purchase = useCallback(() => {
    if (stored.phase !== "browsing") return;

    // Transition to purchasing
    setStored({ phase: "purchasing", editionNumber: null, purchaseTime: null });

    // After 1.5s fake processing, transition to confirmed
    setTimeout(() => {
      const editionNumber = Math.floor(Math.random() * 4999) + 1;
      setStored({
        phase: "confirmed",
        editionNumber,
        purchaseTime: Date.now(),
      });
    }, 1500);
  }, [stored.phase]);

  const share = useCallback(() => {
    if (stored.phase !== "confirmed") return;
    setStored((prev) => ({ ...prev, phase: "sharing" }));
  }, [stored.phase]);

  const reset = useCallback(() => {
    const cleared: StoredState = {
      phase: "browsing",
      editionNumber: null,
      purchaseTime: null,
    };
    setStored(cleared);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey(momentId));
    }
  }, [momentId]);

  return {
    state: stored.phase,
    editionNumber: stored.editionNumber,
    purchaseTime: stored.purchaseTime,
    purchase,
    share,
    reset,
  };
}
