import type { CutsceneSlide } from "@/game/levels/types";

/** 수난·부활 장면을 위한 단순한 그림 (게임플레이 없이 경건하게 보여 준다) */
export default function SceneArt({ art }: { art: CutsceneSlide["art"] }) {
  return (
    <svg viewBox="0 0 160 90" className="h-auto w-full rounded-lg" role="img" aria-hidden>
      {art === "supper" && (
        <>
          <rect width="160" height="90" fill="#3b2a3f" />
          <circle cx="80" cy="34" r="28" fill="#f3c66b" opacity="0.25" />
          <rect x="20" y="58" width="120" height="8" rx="2" fill="#8b5a2b" />
          <rect x="28" y="66" width="6" height="18" fill="#6b4523" />
          <rect x="126" y="66" width="6" height="18" fill="#6b4523" />
          <ellipse cx="68" cy="54" rx="12" ry="5" fill="#e3a656" />
          <path d="M90 38 h12 l-2 12 h-8 z" fill="#c9a24a" />
          <rect x="94" y="50" width="4" height="6" fill="#c9a24a" />
          <rect x="90" y="55" width="12" height="3" fill="#c9a24a" />
        </>
      )}
      {art === "garden" && (
        <>
          <rect width="160" height="90" fill="#1d2440" />
          <circle cx="126" cy="20" r="9" fill="#f5f0d8" />
          <rect y="70" width="160" height="20" fill="#2f3b2a" />
          <rect x="30" y="40" width="5" height="32" fill="#4a3826" />
          <circle cx="32" cy="34" r="16" fill="#3f5a3a" />
          <rect x="108" y="46" width="4" height="26" fill="#4a3826" />
          <circle cx="110" cy="42" r="12" fill="#3f5a3a" />
          <ellipse cx="74" cy="68" rx="9" ry="5" fill="#b2393a" />
          <circle cx="68" cy="62" r="4" fill="#3b2414" />
          <path d="M66 52 l2 -6 l2 6" stroke="#ffd75e" strokeWidth="0.8" fill="none" opacity="0.7" />
        </>
      )}
      {art === "cross" && (
        <>
          <rect width="160" height="90" fill="#4a3a4f" />
          <rect width="160" height="90" fill="url(#dusk)" />
          <defs>
            <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c2236" />
              <stop offset="1" stopColor="#b5704f" />
            </linearGradient>
          </defs>
          <path d="M0 90 Q80 50 160 90 z" fill="#3a2a22" />
          <rect x="77" y="18" width="6" height="52" fill="#5a3a1a" />
          <rect x="62" y="30" width="36" height="5" fill="#5a3a1a" />
          <circle cx="80" cy="32" r="16" fill="#ffd75e" opacity="0.15" />
        </>
      )}
      {art === "tomb" && (
        <>
          <rect width="160" height="90" fill="#f6d7a6" />
          <circle cx="132" cy="62" r="18" fill="#ffe9a8" />
          <path d="M0 90 V60 Q30 26 70 30 Q100 34 104 90 z" fill="#8c7a63" />
          <path d="M40 90 V66 Q52 50 66 66 V90 z" fill="#2a1f18" />
          <circle cx="92" cy="74" r="15" fill="#a8977e" stroke="#7b6a54" strokeWidth="2" />
          <path d="M120 90 l4 -12 l4 12 M134 90 l3 -9 l3 9" stroke="#6fae45" strokeWidth="2" fill="none" />
        </>
      )}
      {art === "galilee" && (
        <>
          <rect width="160" height="90" fill="#9fd3f5" />
          <circle cx="40" cy="26" r="12" fill="#fff6c8" />
          <path d="M0 50 Q40 38 80 48 T160 44 V90 H0 z" fill="#a8a368" />
          <rect y="62" width="160" height="28" fill="#3f86b8" />
          <path d="M60 60 h30 l-4 6 h-22 z" fill="#7d5226" />
          <rect x="74" y="44" width="2" height="16" fill="#7d5226" />
          <path d="M76 45 l10 12 h-10 z" fill="#efe6cf" />
        </>
      )}
    </svg>
  );
}
