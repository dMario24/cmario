import { notFound } from "next/navigation";
import GameClient from "@/components/GameClient";
import { LEVELS } from "@/game/levels";

export function generateStaticParams() {
  return LEVELS.map((_, i) => ({ stage: String(i + 1) }));
}

export default async function PlayPage({ params }: PageProps<"/play/[stage]">) {
  const { stage } = await params;
  const index = Number(stage) - 1;
  if (!Number.isInteger(index) || !LEVELS[index]) notFound();
  return <GameClient key={index} index={index} />;
}
