import * as Phaser from "phaser";
import { generateTextures, TILE } from "./art";
import { touchInput } from "./input";
import type { Level } from "./levels";

export const VIEW_W = 400;
export const VIEW_H = 224;

const SPEED = 125;
const JUMP = 335;
const COYOTE_MS = 110;
const JUMP_BUFFER_MS = 130;
const BOAT_RANGE = TILE * 4;
const BOAT_SPEED = 38;

export type Counts = { light: number; bread: number; fish: number; palm: number };

export type GameEvent =
  | { type: "counts"; counts: Counts }
  | { type: "say"; text: string }
  | { type: "clear"; counts: Counts };

type SceneData = { level: Level; emit: (e: GameEvent) => void };

type Body = Phaser.Physics.Arcade.Body;
type ArcadeImage = Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

const ITEM_KIND: Record<string, keyof Counts> = { "*": "light", b: "bread", f: "fish", p: "palm" };
const ITEM_TEXTURE: Record<keyof Counts, string> = {
  light: "light",
  bread: "bread",
  fish: "fish",
  palm: "palm",
};
const ITEM_NAME: Record<keyof Counts, string> = { light: "빛", bread: "빵", fish: "물고기", palm: "종려가지" };

function makeOneWay(body: Body | Phaser.Physics.Arcade.StaticBody) {
  body.checkCollision.down = false;
  body.checkCollision.left = false;
  body.checkCollision.right = false;
}

export class StageScene extends Phaser.Scene {
  private level!: Level;
  private emit!: (e: GameEvent) => void;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private respawn = new Phaser.Math.Vector2();
  private counts: Counts = { light: 0, bread: 0, fish: 0, palm: 0 };
  private boats: { img: ArcadeImage; minX: number; maxX: number }[] = [];
  private hills: Phaser.GameObjects.TileSprite[] = [];
  private rain?: Phaser.GameObjects.Particles.ParticleEmitter;
  private worldH = 0;

  private keys!: Record<"left" | "right" | "a" | "d" | "up" | "w" | "space", Phaser.Input.Keyboard.Key>;
  private lastGrounded = -Infinity;
  private jumpQueuedAt = -Infinity;
  private prevJump = false;
  private facingLeft = false;
  private wind = 0;
  private cleared = false;
  private hintAt = -Infinity;
  private respawnHintShown = false;

  constructor() {
    super("stage");
  }

  init(data: SceneData) {
    this.level = data.level;
    this.emit = data.emit;
  }

  create() {
    const { level } = this;
    generateTextures(this, level.stone);

    const rows = level.map;
    const cols = Math.max(...rows.map((r) => r.length));
    const worldW = cols * TILE;
    this.worldH = rows.length * TILE;

    this.physics.world.setBounds(0, 0, worldW, this.worldH);
    this.physics.world.setBoundsCollision(true, true, false, false);

    this.drawBackground();

    const solids = this.physics.add.staticGroup();
    const planks = this.physics.add.staticGroup();
    const hazards = this.physics.add.staticGroup();
    const items = this.physics.add.staticGroup();
    const lamps = this.physics.add.staticGroup();
    const npcs = this.physics.add.staticGroup();
    const waves = this.physics.add.group({ allowGravity: false, immovable: true });
    const boats = this.physics.add.group({ allowGravity: false, immovable: true });

    const hasRoofGoal = rows.some((r) => r.includes("O"));
    const at = (r: number, c: number) => rows[r]?.[c] ?? ".";
    let npcIndex = 0;
    let goal: Phaser.GameObjects.Zone | undefined;
    let jesus: Phaser.GameObjects.Image | undefined;

    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        const x = c * TILE;
        const y = r * TILE;
        const cx = x + TILE / 2;
        const bottom = y + TILE;

        switch (ch) {
          case "#":
            solids.create(cx, y + TILE / 2, at(r - 1, c) === "#" ? "ground" : "ground-top");
            break;
          case "R":
            solids.create(cx, y + TILE / 2, "stone");
            break;
          case "K":
            solids.create(cx, y + TILE / 2, "hull");
            break;
          case "=": {
            const p = planks.create(cx, y + 3, "plank") as Phaser.Physics.Arcade.Image;
            makeOneWay(p.body as Phaser.Physics.Arcade.StaticBody);
            break;
          }
          case "~": {
            const top = at(r - 1, c) !== "~";
            this.add.image(cx, y + TILE / 2, top ? "water-top" : "water").setAlpha(0.88).setDepth(5);
            if (top) hazards.add(this.staticZone(cx, y + 10, TILE, 12));
            break;
          }
          case "^":
            this.add.image(cx, bottom - 4, "thorns");
            hazards.add(this.staticZone(cx, bottom - 3, 12, 6));
            break;
          case "W": {
            const w = waves.create(cx, bottom + 6, "wave") as ArcadeImage;
            w.setDepth(6);
            w.body.setSize(12, 18);
            w.body.moves = false;
            this.tweens.add({
              targets: w,
              y: w.y - 30,
              duration: 1100,
              delay: (c * 137) % 900,
              ease: "Sine.easeInOut",
              yoyo: true,
              repeat: -1,
            });
            break;
          }
          case "B": {
            const b = boats.create(x, y, "boat").setOrigin(0, 0) as ArcadeImage;
            b.body.setSize(TILE * 3, 6).setOffset(0, 0);
            makeOneWay(b.body);
            b.setVelocityX(BOAT_SPEED);
            this.boats.push({ img: b, minX: x, maxX: x + BOAT_RANGE });
            break;
          }
          case "*":
          case "b":
          case "f":
          case "p": {
            const kind = ITEM_KIND[ch];
            const it = items.create(cx, y + TILE / 2, ITEM_TEXTURE[kind]) as Phaser.Physics.Arcade.Image;
            it.setData("kind", kind);
            this.tweens.add({ targets: it, y: it.y - 2, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            break;
          }
          case "C": {
            const lamp = lamps.create(cx, bottom, "lamp-off") as Phaser.Physics.Arcade.Image;
            lamp.setOrigin(0.5, 1).refreshBody();
            break;
          }
          case "N": {
            const npc = npcs.create(cx, bottom, `npc-${npcIndex % 4}`) as Phaser.Physics.Arcade.Image;
            npc.setOrigin(0.5, 1).refreshBody();
            npc.setData("line", level.npcLines[npcIndex] ?? "");
            npc.setFlipX(npcIndex % 2 === 1);
            npcIndex++;
            break;
          }
          case "M": {
            const variant = (c * 7 + r) % 4;
            this.add
              .image(cx, bottom, `npc-${variant}`)
              .setOrigin(0.5, 1)
              .setFlipX(c % 2 === 0)
              .setAlpha(0.95);
            break;
          }
          case "D": {
            const dove = this.add.image(cx, y + TILE / 2, "dove").setDepth(3);
            this.tweens.add({ targets: dove, x: dove.x + 40, y: dove.y + 10, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            this.add.particles(0, 0, "spark", {
              follow: dove,
              lifespan: 900,
              frequency: 160,
              speedY: { min: 10, max: 30 },
              alpha: { start: 0.8, end: 0 },
            });
            break;
          }
          case "O":
            this.add.image(cx, y + TILE / 2, "roof-hole");
            goal = this.add.zone(cx, y + 4, TILE - 2, 10);
            break;
          case "J":
            jesus = this.placeJesus(cx, bottom);
            if (!hasRoofGoal) goal = this.add.zone(cx, bottom - 12, 24, 24);
            break;
          case "P":
            this.respawn.set(cx, bottom);
            break;
        }
      }
    });

    // ── 마르코 ──
    this.player = this.physics.add.sprite(this.respawn.x, this.respawn.y, "mark-idle");
    this.player.setOrigin(0.5, 1).setDepth(10);
    this.player.body.setSize(8, 14).setOffset(2, 2);
    this.player.body.setMaxVelocityY(520);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, solids);
    this.physics.add.collider(this.player, planks);
    this.physics.add.collider(this.player, boats);
    this.physics.add.overlap(this.player, hazards, () => this.respawnPlayer());
    this.physics.add.overlap(this.player, waves, () => this.respawnPlayer());

    this.physics.add.overlap(this.player, items, (_p, obj) => {
      const it = obj as Phaser.Physics.Arcade.Image;
      const kind = it.getData("kind") as keyof Counts;
      (it.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      this.counts[kind]++;
      this.emit({ type: "counts", counts: { ...this.counts } });
      this.burst(it.x, it.y, 8);
      this.tweens.killTweensOf(it);
      this.tweens.add({ targets: it, y: it.y - 14, alpha: 0, scale: 1.6, duration: 260, onComplete: () => it.destroy() });
    });

    this.physics.add.overlap(this.player, lamps, (_p, obj) => {
      const lamp = obj as Phaser.Physics.Arcade.Image;
      if (lamp.getData("lit")) return;
      lamp.setData("lit", true).setTexture("lamp-on");
      this.respawn.set(lamp.x, lamp.y);
      this.burst(lamp.x, lamp.y - 14, 10);
    });

    this.physics.add.overlap(this.player, npcs, (_p, obj) => {
      const npc = obj as Phaser.Physics.Arcade.Image;
      if (npc.getData("said")) return;
      npc.setData("said", true);
      const line = npc.getData("line") as string;
      if (line) this.emit({ type: "say", text: line });
    });

    if (goal) {
      this.physics.add.existing(goal, true);
      this.physics.add.overlap(this.player, goal, () => this.reachGoal(jesus));
    }

    // ── 카메라 ──
    const cam = this.cameras.main;
    cam.setBounds(0, 0, worldW, this.worldH);
    cam.startFollow(this.player, true, 0.12, 0.12);
    cam.setDeadzone(40, 40);

    // ── 키보드 ──
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = this.input.keyboard!.addKeys({
      left: K.LEFT,
      right: K.RIGHT,
      a: K.A,
      d: K.D,
      up: K.UP,
      w: K.W,
      space: K.SPACE,
    }) as typeof this.keys;

    if (level.weather === "storm") this.startStorm();
    this.emit({ type: "counts", counts: { ...this.counts } });
  }

  private staticZone(x: number, y: number, w: number, h: number) {
    const z = this.add.zone(x, y, w, h);
    this.physics.add.existing(z, true);
    return z;
  }

  private placeJesus(x: number, bottom: number) {
    const pose = this.level.jesusPose ?? "stand";
    if (pose === "donkey") {
      return this.add.image(x, bottom, "jesus-donkey").setOrigin(0.5, 1).setFlipX(true).setDepth(4);
    }
    if (pose === "sleep") {
      const j = this.add.image(x, bottom - 4, "jesus").setAngle(-90).setDepth(4);
      const zz = this.add.text(x + 6, bottom - 22, "z", { fontFamily: "monospace", fontSize: "10px", color: "#e8f0ff" });
      this.tweens.add({ targets: zz, y: zz.y - 10, alpha: 0, duration: 1600, repeat: -1 });
      return j;
    }
    const j = this.add.image(x, bottom, "jesus").setOrigin(0.5, 1).setDepth(4);
    this.tweens.add({ targets: j, alpha: 0.85, duration: 1400, yoyo: true, repeat: -1 });
    return j;
  }

  private drawBackground() {
    const [top, bottomColor] = this.level.sky;
    const sky = this.textures.createCanvas("sky", 4, VIEW_H)!;
    const ctx = sky.getContext();
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, VIEW_H);
    sky.refresh();
    this.add.image(0, 0, "sky").setOrigin(0).setDisplaySize(VIEW_W, VIEW_H).setScrollFactor(0).setDepth(-20);

    if (this.level.weather === "dusk") {
      this.add.circle(VIEW_W * 0.75, 70, 22, 0xfff1c2, 0.9).setScrollFactor(0).setDepth(-19);
    } else if (this.level.weather === "clear") {
      this.add.circle(VIEW_W * 0.82, 40, 14, 0xfffbe8, 0.95).setScrollFactor(0).setDepth(-19);
    }

    this.level.hills.forEach((color, i) => {
      const key = `hills-${i}`;
      const w = 256;
      const h = 90 - i * 20;
      const tex = this.textures.createCanvas(key, w, h)!;
      const c = tex.getContext();
      c.fillStyle = color;
      c.beginPath();
      c.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) {
        const t = (x / w) * Math.PI * 2;
        const y = h * 0.45 + Math.sin(t * (i + 1)) * h * 0.18 + Math.sin(t * 3 + i) * h * 0.08;
        c.lineTo(x, y);
      }
      c.lineTo(w, h);
      c.closePath();
      c.fill();
      tex.refresh();
      const ts = this.add
        .tileSprite(0, VIEW_H - h - 8 + i * 6, VIEW_W, h, key)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(-18 + i);
      ts.setData("factor", 0.15 + i * 0.2);
      this.hills.push(ts);
    });
  }

  private startStorm() {
    this.rain = this.add
      .particles(0, -10, "rain", {
        x: { min: 0, max: VIEW_W + 120 },
        speedY: { min: 320, max: 400 },
        speedX: { min: -90, max: -60 },
        rotate: 12,
        lifespan: 800,
        frequency: 10,
        quantity: 2,
        alpha: 0.55,
      })
      .setScrollFactor(0)
      .setDepth(20);

    let announced = false;
    this.time.addEvent({
      delay: 5200,
      loop: true,
      callback: () => {
        if (this.cleared) return;
        this.wind = -55;
        this.cameras.main.flash(120, 220, 230, 255, false);
        if (!announced) {
          announced = true;
          this.emit({ type: "say", text: "휘이잉— 거센 맞바람이 불어요! 발을 단단히 디뎌요." });
        }
        this.time.delayedCall(1600, () => (this.wind = 0));
      },
    });
  }

  private burst(x: number, y: number, n: number) {
    const p = this.add.particles(x, y, "spark", {
      speed: { min: 30, max: 90 },
      lifespan: 500,
      alpha: { start: 1, end: 0 },
      scale: { start: 1, end: 0.3 },
      emitting: false,
    });
    p.setDepth(15);
    p.explode(n);
    this.time.delayedCall(700, () => p.destroy());
  }

  private respawnPlayer() {
    if (this.cleared) return;
    this.player.body.reset(this.respawn.x, this.respawn.y);
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(180, 255, 250, 235, false);
    this.tweens.add({ targets: this.player, alpha: 0.3, duration: 90, yoyo: true, repeat: 3 });
    if (!this.respawnHintShown) {
      this.respawnHintShown = true;
      this.emit({ type: "say", text: "괜찮아요! 마지막으로 밝힌 등불에서 다시 시작해요." });
    }
  }

  private reachGoal(jesus?: Phaser.GameObjects.Image) {
    if (this.cleared) return;
    const need = this.level.requires;
    if (need) {
      const missing = (Object.keys(need) as (keyof typeof need)[])
        .filter((k) => this.counts[k] < (need[k] ?? 0))
        .map((k) => `${ITEM_NAME[k]} ${this.counts[k]}/${need[k]}`);
      if (missing.length) {
        if (this.time.now - this.hintAt > 3000) {
          this.hintAt = this.time.now;
          this.emit({ type: "say", text: `아직 모으지 못했어요 — ${missing.join(", ")}` });
        }
        return;
      }
    }

    this.cleared = true;
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.player.setTexture("mark-idle");
    if (jesus) this.player.setFlipX(jesus.x < this.player.x);
    this.wind = 0;
    if (this.rain) {
      this.rain.stop();
      this.tweens.add({ targets: this.hills, alpha: 0.6, duration: 1200 });
    }
    const fx = jesus ?? this.player;
    this.burst(fx.x, fx.y - 16, 30);
    this.cameras.main.flash(500, 255, 244, 200, false);
    this.time.delayedCall(1300, () => this.emit({ type: "clear", counts: { ...this.counts } }));
  }

  update(time: number) {
    if (!this.player) return;
    const body = this.player.body;

    for (const b of this.boats) {
      if (b.img.x >= b.maxX) b.img.setVelocityX(-BOAT_SPEED);
      else if (b.img.x <= b.minX) b.img.setVelocityX(BOAT_SPEED);
    }

    const scrollX = this.cameras.main.scrollX;
    for (const h of this.hills) h.tilePositionX = scrollX * (h.getData("factor") as number);

    if (this.cleared) {
      this.player.setVelocity(0, 0);
      return;
    }

    if (this.player.y > this.worldH + 32) {
      this.respawnPlayer();
      return;
    }

    const k = this.keys;
    const left = k.left.isDown || k.a.isDown || touchInput.left;
    const right = k.right.isDown || k.d.isDown || touchInput.right;
    const jumpHeld = k.up.isDown || k.w.isDown || k.space.isDown || touchInput.jump;

    const grounded = body.blocked.down || body.touching.down;
    if (grounded) this.lastGrounded = time;
    if (jumpHeld && !this.prevJump) this.jumpQueuedAt = time;
    this.prevJump = jumpHeld;

    const dir = (right ? 1 : 0) - (left ? 1 : 0);
    if (dir !== 0) this.facingLeft = dir < 0;
    const target = dir * SPEED + this.wind;
    const vx = Phaser.Math.Linear(body.velocity.x, target, grounded ? 0.3 : 0.12);
    this.player.setVelocityX(Math.abs(vx) < 2 ? 0 : vx);

    if (time - this.jumpQueuedAt < JUMP_BUFFER_MS && time - this.lastGrounded < COYOTE_MS) {
      this.player.setVelocityY(-JUMP);
      this.jumpQueuedAt = -Infinity;
      this.lastGrounded = -Infinity;
    }
    if (!jumpHeld && body.velocity.y < -140) this.player.setVelocityY(body.velocity.y * 0.6);

    this.player.setFlipX(this.facingLeft);
    if (!grounded) this.player.setTexture("mark-jump");
    else if (dir !== 0) this.player.setTexture(Math.floor(time / 130) % 2 ? "mark-walk1" : "mark-walk2");
    else this.player.setTexture("mark-idle");
  }
}
