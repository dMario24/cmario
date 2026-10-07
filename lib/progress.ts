"use client";

import { useSyncExternalStore } from "react";

const KEY = "cmario-progress-v1";
const CHANGE_EVENT = "cmario-progress";

export type Progress = { cleared: number[]; grace: number };

const EMPTY: Progress = { cleared: [], grace: 0 };

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const p = JSON.parse(raw) as Partial<Progress>;
    return { cleared: Array.isArray(p.cleared) ? p.cleared : [], grace: Number(p.grace) || 0 };
  } catch {
    return EMPTY;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useProgress(): Progress {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return parse(raw);
}

export function isUnlocked(progress: Progress, index: number) {
  return index === 0 || progress.cleared.includes(index - 1);
}

export function markCleared(index: number, gained: number) {
  const p = parse(readRaw());
  const firstClear = !p.cleared.includes(index);
  const next: Progress = {
    cleared: firstClear ? [...p.cleared, index].sort((a, b) => a - b) : p.cleared,
    grace: p.grace + (firstClear ? gained : 0),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 진행도만 저장되지 않는다
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
