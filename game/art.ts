import type * as Phaser from "phaser";

export const TILE = 16;

type Palette = Record<string, string>;

const BASE: Palette = {
  h: "#3b2414", // 머리카락
  s: "#e2ae80", // 피부
  e: "#1d1410", // 눈
  w: "#efe6cf", // 흰 옷
  b: "#8b5a2b", // 띠
  f: "#5a3a1a", // 샌들
  g: "#ffd75e", // 후광
  r: "#b2393a", // 붉은 옷
  u: "#3a5ba8", // 푸른 겉옷
  d: "#4a2c18", // 수염
  c: "#7d9fc0", // 머릿수건
};

const MARK = {
  idle: [
    "...hhhhh....",
    "..hhhhhhh...",
    "..hhssss....",
    "..hsssess...",
    "...sssss....",
    "....sss.....",
    "...wwwww....",
    "..wwwwwww...",
    "..wwwwwwws..",
    "..swwwwww...",
    "...bbbbb....",
    "...wwwww....",
    "...wwwww....",
    "....s.s.....",
    "....s.s.....",
    "...ff.ff....",
  ],
  legsA: ["...s...s....", "..s.....s...", "..f.....ff.."],
  legsB: ["....ss......", "....ss......", "....fff....."],
  legsJump: ["...s..s.....", "..s....s....", "..f....f...."],
};

function withLegs(legs: string[]) {
  return [...MARK.idle.slice(0, 13), ...legs];
}

const NPC = [
  "...cccccc...",
  "..cccccccc..",
  "..cssssssc..",
  "..cseesesc..",
  "..cssssssc..",
  "...dddddd...",
  "...wwwwww...",
  "..wwwwwwww..",
  ".swwwwwwwws.",
  ".swwwwwwwws.",
  "...bbbbbb...",
  "...wwwwww...",
  "...wwwwww...",
  "...wwwwww...",
  "....s..s....",
  "...ff..ff...",
];

const JESUS = [
  "....gggggg....",
  "...g......g...",
  "..g.hhhhhh.g..",
  "..ghhhhhhhhg..",
  "...hhsssshh...",
  "...hseesesh...",
  "...hssssssh...",
  "...hhddddhh...",
  "...h.dddd.h...",
  "...uurrrruu...",
  "..uurrrrrruu..",
  ".suurrrrrruus.",
  ".suurrrrrruus.",
  "..uurrbbrruu..",
  "..uurrrrrruu..",
  "..uurrrrrruu..",
  "..uurrrrrruu..",
  "...urrrrrru...",
  "....ff..ff....",
  "..............",
];

const JESUS_DONKEY = [
  "......gggggg..........",
  ".....g......g.........",
  "....g.hhhhhh.g........",
  "....ghhhhhhhhg........",
  ".....hhsssshh.........",
  ".....hseesesh.........",
  ".....hssssssh.........",
  ".....hhddddhh.........",
  ".....uurrrruu.........",
  "....uurrrrrruus.......",
  "....uurrrrrruu........",
  "...nnuurrrrrrunnnn.oo.",
  "..nnnnurrrrrnnnnnnnoo.",
  ".n.nnnnnnnnnnnnnnnnnnk",
  "...nnnnnnnnnnnnnnnnnn.",
  "....nnnnnnnnnnnnnnn...",
  "....nn..nn....nn..nn..",
  "....nn..nn....nn..nn..",
  "....kk..kk....kk..kk..",
];

const BREAD = [
  "..yyyyyy..",
  ".yYYYYYYy.",
  "yYyYYyYYYy",
  "yYYYYYYYYy",
  "yYYYYYYYYy",
  ".yyyyyyyy.",
];

const FISH = [
  "...aaaaa...a",
  "..aAAAAAa.aa",
  ".aAeAAAAAaaa",
  ".aAAAAAAAaaa",
  "..aAAAAAa.aa",
  "...aaaaa...a",
];

const PALM = [
  "....GG..",
  "...GG.G.",
  "..GGG..G",
  ".G.GGG..",
  "G..GG.G.",
  "...GGG.G",
  "..G.GG..",
  ".G..G.G.",
  "....G...",
  "....n...",
  "....n...",
  "....n...",
  "....n...",
  "....n...",
];

const LIGHT = [
  "...gg...",
  "...gg...",
  ".g.WW.g.",
  "ggWWWWgg",
  "ggWWWWgg",
  ".g.WW.g.",
  "...gg...",
  "...gg...",
];

const DOVE = [
  "....WWW.....",
  "...WWWWW....",
  "WWWWWWWWWe..",
  ".WWWWWWWWWoo",
  "...WWWWW....",
  "....W.W.....",
];

const LAMP_OFF = [
  "..kkkk..",
  ".k....k.",
  ".k....k.",
  ".k....k.",
  "..kkkk..",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "...nn...",
  "..nnnn..",
  ".nnnnnn.",
];

const ITEM_PAL: Palette = {
  y: "#a5642a",
  Y: "#e3a656",
  a: "#4f6f8c",
  A: "#9cc3de",
  e: "#1d1410",
  G: "#4c9a3b",
  n: "#7a4d24",
  g: "#ffd75e",
  W: "#fffbe8",
  o: "#e39a3b",
  k: "#3a2a20",
};

function drawPixels(ctx: CanvasRenderingContext2D, rows: string[], pal: Palette, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = pal[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

function pixelTexture(scene: Phaser.Scene, key: string, rows: string[], pal: Palette) {
  if (scene.textures.exists(key)) return;
  const w = Math.max(...rows.map((r) => r.length));
  const tex = scene.textures.createCanvas(key, w, rows.length)!;
  drawPixels(tex.getContext(), rows, pal);
  tex.refresh();
}

function canvasTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, w, h)!;
  draw(tex.getContext());
  tex.refresh();
}

/** 텍스처 키는 고정해 두었으므로 나중에 실제 스프라이트 이미지로 바꿔 끼울 수 있다. */
export function generateTextures(scene: Phaser.Scene, stone: "sand" | "town" = "sand") {
  const pal = { ...BASE, ...ITEM_PAL };

  pixelTexture(scene, "mark-idle", MARK.idle, BASE);
  pixelTexture(scene, "mark-walk1", withLegs(MARK.legsA), BASE);
  pixelTexture(scene, "mark-walk2", withLegs(MARK.legsB), BASE);
  pixelTexture(scene, "mark-jump", withLegs(MARK.legsJump), BASE);
  pixelTexture(scene, "jesus", JESUS, BASE);
  pixelTexture(scene, "jesus-donkey", JESUS_DONKEY, { ...BASE, n: "#8d8073", k: "#3a2a20", o: "#8d8073" });

  const npcColors = [
    ["#7d9fc0", "#c9b48a"],
    ["#b0704a", "#d8d0b8"],
    ["#6f8f5a", "#c4a882"],
    ["#a65e7d", "#e0d4bc"],
  ];
  npcColors.forEach(([cloth, robe], i) => {
    pixelTexture(scene, `npc-${i}`, NPC, { ...BASE, c: cloth, w: robe });
  });

  pixelTexture(scene, "bread", BREAD, pal);
  pixelTexture(scene, "fish", FISH, pal);
  pixelTexture(scene, "palm", PALM, pal);
  pixelTexture(scene, "light", LIGHT, pal);
  pixelTexture(scene, "dove", DOVE, pal);
  pixelTexture(scene, "lamp-off", LAMP_OFF, pal);
  pixelTexture(
    scene,
    "lamp-on",
    LAMP_OFF.map((r, i) => (i >= 1 && i <= 3 ? r.replace(/\.\.\.\./, "gWWg") : r)),
    pal,
  );

  // ── 타일 ──
  canvasTexture(scene, "ground-top", TILE, TILE, (c) => {
    c.fillStyle = "#9a6b3f";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#86592f";
    [[3, 7], [10, 10], [6, 13], [13, 6]].forEach(([x, y]) => c.fillRect(x, y, 2, 1));
    c.fillStyle = "#6fae45";
    c.fillRect(0, 0, 16, 4);
    c.fillStyle = "#4f8a32";
    for (let x = 0; x < 16; x += 3) c.fillRect(x, 4, 2, 1);
  });
  canvasTexture(scene, "ground", TILE, TILE, (c) => {
    c.fillStyle = "#9a6b3f";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#86592f";
    [[2, 3], [9, 6], [5, 11], [12, 13]].forEach(([x, y]) => c.fillRect(x, y, 2, 1));
  });
  const [stoneLight, stoneDark] = stone === "town" ? ["#e3cfa4", "#b89c6c"] : ["#c8b591", "#9a8763"];
  canvasTexture(scene, "stone", TILE, TILE, (c) => {
    c.fillStyle = stoneLight;
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = stoneDark;
    c.fillRect(0, 7, 16, 1);
    c.fillRect(0, 15, 16, 1);
    c.fillRect(7, 0, 1, 7);
    c.fillRect(3, 8, 1, 7);
    c.fillRect(12, 8, 1, 7);
  });
  canvasTexture(scene, "plank", TILE, 6, (c) => {
    c.fillStyle = "#b07a3e";
    c.fillRect(0, 0, 16, 6);
    c.fillStyle = "#7d5226";
    c.fillRect(0, 5, 16, 1);
    c.fillRect(0, 0, 1, 6);
    c.fillStyle = "#d39a55";
    c.fillRect(1, 1, 14, 1);
  });
  canvasTexture(scene, "hull", TILE, TILE, (c) => {
    c.fillStyle = "#6b4523";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#4d3018";
    c.fillRect(0, 5, 16, 1);
    c.fillRect(0, 11, 16, 1);
  });
  canvasTexture(scene, "boat", TILE * 3, 10, (c) => {
    c.fillStyle = "#7d5226";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(48, 0);
    c.lineTo(42, 10);
    c.lineTo(6, 10);
    c.closePath();
    c.fill();
    c.fillStyle = "#b07a3e";
    c.fillRect(0, 0, 48, 2);
  });
  canvasTexture(scene, "water-top", TILE, TILE, (c) => {
    c.fillStyle = "#3f86b8";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#8fd0f0";
    c.fillRect(0, 0, 16, 2);
    c.fillRect(4, 2, 4, 1);
    c.fillStyle = "#336f99";
    c.fillRect(2, 8, 5, 1);
    c.fillRect(10, 12, 4, 1);
  });
  canvasTexture(scene, "water", TILE, TILE, (c) => {
    c.fillStyle = "#3f86b8";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#336f99";
    c.fillRect(2, 5, 5, 1);
    c.fillRect(9, 11, 4, 1);
  });
  canvasTexture(scene, "thorns", TILE, 8, (c) => {
    c.fillStyle = "#3d6b2a";
    c.fillRect(0, 4, 16, 4);
    c.fillStyle = "#6a4a2a";
    for (let x = 0; x < 16; x += 4) {
      c.beginPath();
      c.moveTo(x, 8);
      c.lineTo(x + 2, 0);
      c.lineTo(x + 4, 8);
      c.fill();
    }
  });
  canvasTexture(scene, "wave", TILE, TILE + 8, (c) => {
    c.fillStyle = "#5aa3d3";
    c.beginPath();
    c.moveTo(0, 24);
    c.quadraticCurveTo(2, 4, 12, 2);
    c.quadraticCurveTo(16, 2, 15, 7);
    c.quadraticCurveTo(10, 6, 12, 24);
    c.fill();
    c.fillStyle = "#e8f6ff";
    c.fillRect(8, 2, 6, 2);
    c.fillRect(13, 4, 2, 2);
  });
  canvasTexture(scene, "roof-hole", TILE, TILE, (c) => {
    c.fillStyle = "#2a1c12";
    c.fillRect(0, 0, 16, 16);
    c.fillStyle = "#b07a3e";
    c.fillRect(1, 6, 14, 3);
    c.fillStyle = "#efe6cf";
    c.fillRect(2, 5, 12, 2);
  });
  canvasTexture(scene, "spark", 3, 3, (c) => {
    c.fillStyle = "#fff6c8";
    c.fillRect(0, 0, 3, 3);
  });
  canvasTexture(scene, "rain", 1, 6, (c) => {
    c.fillStyle = "#c8dcf0";
    c.fillRect(0, 0, 1, 6);
  });
}
