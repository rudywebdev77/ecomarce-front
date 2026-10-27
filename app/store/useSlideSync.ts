"use client";

import { useSyncExternalStore } from "react";

// Hero slider aur announcement bar ka ek hi shared timer.
// Jab tick badalta hai to dono ek saath, ek hi render mein badalte hain.

export const SLIDE_INTERVAL_MS = 5000;

let tick = 0;
let paused = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function schedule() {
  clearTimer();
  if (paused || listeners.size === 0) return;
  timer = setTimeout(() => {
    tick += 1;
    emit();
    schedule();
  }, SLIDE_INTERVAL_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) clearTimer();
  };
}

export const slideSync = {
  next() {
    tick += 1;
    emit();
    schedule();
  },
  prev() {
    tick -= 1;
    emit();
    schedule();
  },
  // Dot par click: us index wali slide par jao (hero ke total slides ke hisaab se)
  goTo(index: number, total: number) {
    const currentIndex = ((tick % total) + total) % total;
    tick += (((index - currentIndex) % total) + total) % total;
    emit();
    schedule();
  },
  setPaused(value: boolean) {
    paused = value;
    schedule();
  },
};

export function useSlideTick() {
  return useSyncExternalStore(
    subscribe,
    () => tick,
    () => 0
  );
}

export const mod = (n: number, m: number) => ((n % m) + m) % m;