"use client";

import Link from "next/link";
import { LEVELS } from "@/game/levels";
import { isUnlocked, useProgress } from "@/lib/progress";

export default function StageSelect() {
  const progress = useProgress();

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-sm text-amber-100/80">받은 은총 ✦ {progress.grace}</p>
      <ol className="space-y-2.5">
        {LEVELS.map((level, i) => {
          const unlocked = isUnlocked(progress, i);
          const cleared = progress.cleared.includes(i);
          const body = (
            <>
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full font-bold ${
                  cleared ? "bg-amber-500 text-white" : unlocked ? "bg-amber-100 text-amber-800" : "bg-stone-300 text-stone-500"
                }`}
              >
                {cleared ? "✓" : unlocked ? i + 1 : "🔒"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif font-bold text-stone-900">{level.title}</span>
                <span className="block text-xs text-stone-500">
                  {level.place} · {level.ref}
                </span>
              </span>
            </>
          );
          return (
            <li key={level.slug}>
              {unlocked ? (
                <Link
                  href={`/play/${i + 1}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#fdf6e3] p-3 shadow-md transition active:scale-[0.98]"
                >
                  {body}
                </Link>
              ) : (
                <div aria-disabled className="flex items-center gap-3 rounded-2xl bg-[#fdf6e3]/60 p-3">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
