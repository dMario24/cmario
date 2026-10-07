import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "따라오너라 — 마르코 복음 여행",
  description: "젊은 마르코가 되어 예수님을 따라 걷는 가톨릭 마르코 복음 2D 플랫포머",
  appleWebApp: { capable: true, title: "따라오너라", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/180" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1e1b33",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
