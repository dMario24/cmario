"use client";

import type { PointerEvent, ReactNode } from "react";
import { touchInput } from "@/game/input";

type Key = keyof typeof touchInput;

function Pad({ k, label, children, className = "" }: { k: Key; label: string; children: ReactNode; className?: string }) {
  const set = (v: boolean) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    touchInput[k] = v;
    if (v) e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.dataset.active = String(v);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerCancel={set(false)}
      onLostPointerCapture={set(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`pointer-events-auto grid size-16 touch-none select-none place-items-center rounded-full border-2 border-white/40 bg-black/25 text-2xl text-white/90 backdrop-blur-sm transition-transform data-[active=true]:scale-90 data-[active=true]:bg-white/30 ${className}`}
    >
      {children}
    </button>
  );
}

export default function TouchControls() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pointer-coarse:flex">
      <div className="flex gap-3">
        <Pad k="left" label="왼쪽">◀</Pad>
        <Pad k="right" label="오른쪽">▶</Pad>
      </div>
      <Pad k="jump" label="점프" className="size-20 text-base font-bold">
        점프
      </Pad>
    </div>
  );
}
