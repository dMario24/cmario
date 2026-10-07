"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { resetTouchInput } from "./input";
import { LEVELS } from "./levels";
import { StageScene, VIEW_H, VIEW_W, type GameEvent } from "./StageScene";

type Props = {
  levelIndex: number;
  /** 값이 바뀌면 스테이지를 처음부터 다시 시작한다 */
  runId: number;
  onEvent: (e: GameEvent) => void;
};

export default function PhaserGame({ levelIndex, runId, onEvent }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    resetTouchInput();
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: parentRef.current!,
      width: VIEW_W,
      height: VIEW_H,
      backgroundColor: "#1b1a2e",
      pixelArt: true,
      roundPixels: true,
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 900 } } },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      banner: false,
    });
    game.scene.add("stage", StageScene, true, {
      level: LEVELS[levelIndex],
      emit: (e: GameEvent) => onEventRef.current(e),
    });
    return () => game.destroy(true);
  }, [levelIndex, runId]);

  return <div ref={parentRef} className="absolute inset-0" />;
}
