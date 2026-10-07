import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "따라오너라 — 마르코 복음 여행",
    short_name: "따라오너라",
    description: "젊은 마르코가 되어 예수님을 따라 걷는 마르코 복음 2D 플랫포머",
    lang: "ko",
    start_url: "/",
    display: "fullscreen",
    orientation: "any",
    background_color: "#1e1b33",
    theme_color: "#1e1b33",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
