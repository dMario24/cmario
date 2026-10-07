"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { LEVELS } from "@/game/levels";
import type { Counts, GameEvent } from "@/game/StageScene";
import { markCleared } from "@/lib/progress";
import SceneArt from "./SceneArt";
import TouchControls from "./TouchControls";

const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
  loading: () => <p className="absolute inset-0 grid place-items-center text-amber-100/70">길을 준비하는 중…</p>,
});

type Phase = "intro" | "play" | "outro" | "cutscene" | "end";

const EMPTY_COUNTS: Counts = { light: 0, bread: 0, fish: 0, palm: 0 };
const ICONS: Record<keyof Counts, string> = { light: "✦", bread: "빵", fish: "물고기", palm: "종려" };

export default function GameClient({ index }: { index: number }) {
  const level = LEVELS[index];
  const next = index + 1 < LEVELS.length ? index + 1 : null;

  const [phase, setPhase] = useState<Phase>("intro");
  const [runId, setRunId] = useState(0);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [bubble, setBubble] = useState<{ text: string; id: number } | null>(null);
  const [slide, setSlide] = useState(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleEvent(e: GameEvent) {
    if (e.type === "counts") setCounts(e.counts);
    else if (e.type === "say") {
      clearTimeout(bubbleTimer.current);
      setBubble({ text: e.text, id: Date.now() });
      bubbleTimer.current = setTimeout(() => setBubble(null), 3600);
    } else if (e.type === "clear") {
      const gained = e.counts.light + e.counts.bread + e.counts.fish + e.counts.palm;
      markCleared(index, gained);
      clearTimeout(bubbleTimer.current);
      setBubble(null);
      setPhase("outro");
    }
  }

  function restart() {
    setCounts(EMPTY_COUNTS);
    setBubble(null);
    setRunId((n) => n + 1);
  }

  const tracked = (Object.keys(level.requires ?? {}) as (keyof Counts)[]).filter((k) => k !== "light");

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#14121f] text-stone-100">
      {phase !== "intro" && <PhaserGame levelIndex={index} runId={runId} onEvent={handleEvent} />}

      {phase === "play" && (
        <>
          <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] text-sm">
            <div className="rounded-xl bg-black/35 px-3 py-1.5 backdrop-blur-sm">
              <p className="font-bold">{level.title}</p>
              <p className="flex flex-wrap gap-x-3 text-xs text-amber-100/90">
                <span>✦ 은총 {counts.light}</span>
                {tracked.map((k) => (
                  <span key={k} className={counts[k] >= (level.requires?.[k] ?? 0) ? "text-lime-300" : ""}>
                    {ICONS[k]} {counts[k]}/{level.requires?.[k]}
                  </span>
                ))}
              </p>
            </div>
            <div className="pointer-events-auto flex gap-2">
              <button type="button" onClick={restart} className="rounded-xl bg-black/35 px-3 py-2 backdrop-blur-sm">
                다시
              </button>
              <Link href="/" className="rounded-xl bg-black/35 px-3 py-2 backdrop-blur-sm">
                메뉴
              </Link>
            </div>
          </header>

          {bubble && (
            <p
              key={bubble.id}
              className="animate-bubble pointer-events-none absolute left-1/2 top-16 w-[min(92vw,30rem)] -translate-x-1/2 rounded-2xl border border-amber-200/40 bg-[#fdf6e3] px-4 py-2.5 text-center text-sm leading-relaxed text-stone-800 shadow-lg"
            >
              {bubble.text}
            </p>
          )}

          <p className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 text-xs text-white/50 pointer-fine:block">
            ← → 또는 A D 이동 · 스페이스/↑ 점프
          </p>
          <TouchControls />
        </>
      )}

      {phase === "intro" && (
        <Card>
          <p className="text-xs tracking-widest text-amber-700">
            {index + 1}장 · {level.place}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-stone-900">{level.title}</h1>
          <p className="mt-0.5 text-sm text-stone-500">{level.ref}</p>
          <div className="mt-4 space-y-2 font-serif leading-relaxed text-stone-700">
            {level.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <PrimaryButton onClick={() => setPhase("play")}>따라가기</PrimaryButton>
        </Card>
      )}

      {phase === "outro" && (
        <Card>
          <p className="text-xs tracking-widest text-amber-700">예수님께서 말씀하셨어요</p>
          <blockquote className="mt-3 border-l-4 border-amber-400 pl-4 font-serif text-lg leading-relaxed text-stone-900">
            “{level.outro.words}”
          </blockquote>
          <p className="mt-1 pl-5 text-xs text-stone-500">{level.outro.wordsRef}</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-stone-700">
            <span className="mr-1 font-bold text-amber-700">묵상</span>
            {level.outro.meditation}
          </p>
          <p className="mt-3 text-center text-sm text-stone-500">
            이번 길에서 받은 은총 ✦ {counts.light + counts.bread + counts.fish + counts.palm}
          </p>
          {level.cutscene ? (
            <PrimaryButton onClick={() => setPhase("cutscene")}>이야기 계속하기</PrimaryButton>
          ) : (
            <div className="mt-5 flex gap-2">
              <Link href="/" className="flex-1 rounded-full border border-stone-300 py-3 text-center text-stone-600">
                메뉴
              </Link>
              {next !== null && (
                <Link href={`/play/${next + 1}`} className="flex-[2] rounded-full bg-amber-600 py-3 text-center font-bold text-white">
                  다음 이야기 →
                </Link>
              )}
            </div>
          )}
        </Card>
      )}

      {phase === "cutscene" && level.cutscene && (
        <Card>
          <SceneArt art={level.cutscene[slide].art} />
          <p className="mt-3 text-xs tracking-widest text-amber-700">{level.cutscene[slide].ref}</p>
          <h2 className="font-serif text-xl font-bold text-stone-900">{level.cutscene[slide].title}</h2>
          <p className="mt-2 font-serif leading-relaxed text-stone-700">{level.cutscene[slide].text}</p>
          <div className="mt-4 flex justify-center gap-1.5">
            {level.cutscene.map((s, i) => (
              <span key={s.title} className={`size-1.5 rounded-full ${i === slide ? "bg-amber-600" : "bg-stone-300"}`} />
            ))}
          </div>
          <PrimaryButton
            onClick={() => (slide + 1 < level.cutscene!.length ? setSlide(slide + 1) : setPhase("end"))}
          >
            {slide + 1 < level.cutscene.length ? "다음" : "마치기"}
          </PrimaryButton>
        </Card>
      )}

      {phase === "end" && (
        <Card>
          <p className="text-center text-4xl">✝</p>
          <h2 className="mt-2 text-center font-serif text-2xl font-bold text-stone-900">마르코 복음 여정을 마쳤어요</h2>
          <p className="mt-3 text-center font-serif leading-relaxed text-stone-700">
            세례에서 부활까지, 마르코와 함께 예수님을 따라 걸었어요.
            <br />
            오늘 하루도 예수님과 함께 걸어가요.
          </p>
          <Link href="/" className="mt-6 block rounded-full bg-amber-600 py-3 text-center font-bold text-white">
            처음으로
          </Link>
        </Card>
      )}
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-[2px]">
      <section className="animate-rise w-full max-w-md rounded-3xl bg-[#fdf6e3] p-6 shadow-2xl">{children}</section>
    </div>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 w-full rounded-full bg-amber-600 py-3 font-bold text-white shadow active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
