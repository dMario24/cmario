import StageSelect from "@/components/StageSelect";

export default function Home() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#f3b76a_0%,#7b4a5e_38%,#1e1b33_80%)] px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <p className="text-xs tracking-[0.3em] text-amber-100/80">마르코 복음 여행</p>
        <h1 className="mt-2 font-serif text-5xl font-bold text-[#fff6dc] drop-shadow">따라오너라</h1>
        <p className="mt-3 text-center font-serif text-sm leading-relaxed text-amber-50/85">
          젊은 마르코가 되어 갈릴래아에서 예루살렘까지
          <br />
          예수님의 발자취를 따라 걸어요.
        </p>
        <div className="mt-8 w-full">
          <StageSelect />
        </div>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-amber-50/50">
          성경 내용은 게임에 맞게 쉽게 풀어 쓴 것이며, 표기된 장·절에서 원문을 읽어 보세요.
        </p>
      </div>
    </main>
  );
}
