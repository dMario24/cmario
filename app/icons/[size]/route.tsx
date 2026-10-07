import { ImageResponse } from "next/og";

const SIZES = [180, 192, 512];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

/** PWA·홈 화면 아이콘: 해 질 녘 언덕 위의 작은 십자가와 길 */
export async function GET(_req: Request, ctx: RouteContext<"/icons/[size]">) {
  const { size: raw } = await ctx.params;
  const size = SIZES.includes(Number(raw)) ? Number(raw) : 192;
  const u = size / 64;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(180deg, #1e1b33 0%, #7b4a5e 55%, #f3b76a 100%)",
        }}
      >
        <div style={{ position: "absolute", left: 22 * u, top: 18 * u, width: 20 * u, height: 20 * u, borderRadius: 999, background: "#ffe9a8" }} />
        <div style={{ position: "absolute", left: 30 * u, top: 10 * u, width: 4 * u, height: 26 * u, background: "#5a3a1a" }} />
        <div style={{ position: "absolute", left: 23 * u, top: 17 * u, width: 18 * u, height: 4 * u, background: "#5a3a1a" }} />
        <div style={{ position: "absolute", left: -8 * u, top: 40 * u, width: 80 * u, height: 40 * u, borderRadius: "50%", background: "#a8a368" }} />
        <div style={{ position: "absolute", left: 28 * u, top: 42 * u, width: 8 * u, height: 22 * u, background: "#e3cfa4" }} />
      </div>
    ),
    { width: size, height: size },
  );
}
