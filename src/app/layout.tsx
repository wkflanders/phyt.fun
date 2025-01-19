import type { Metadata } from "next";
import Providers from "@/context/Providers";
import "./globals.css";

import localFont from "next/font/local";

const inconsolata = localFont({
  src: [
    { path: "/fonts/Inconsolata-Black.ttf", weight: "900", style: "normal" },
    { path: "/fonts/Inconsolata-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "/fonts/Inconsolata-Bold.ttf", weight: "700", style: "normal" },
    { path: "/fonts/Inconsolata-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/Inconsolata-Medium.ttf", weight: "500", style: "normal" },
    { path: "/fonts/Inconsolata-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/Inconsolata-Light.ttf", weight: "300", style: "normal" },
    { path: "/fonts/Inconsolata-ExtraLight.ttf", weight: "200", style: "normal" },
  ]
});

const inter = localFont({
  src: [
    { path: "/fonts/Inter-Black.ttf", weight: "900", style: "normal" },
    { path: "/fonts/Inter-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "/fonts/Inter-Bold.ttf", weight: "700", style: "normal" },
    { path: "/fonts/Inter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "/fonts/Inter-Medium.ttf", weight: "500", style: "normal" },
    { path: "/fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "/fonts/Inter-Light.ttf", weight: "300", style: "normal" },
    { path: "/fonts/Inter-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "/fonts/Inter-Thin.ttf", weight: "100", style: "normal" },
  ]
});

export const metadata: Metadata = {
  title: "Phyt.fun",
  description: "The Fitness Trading Card Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inconsolata.className} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
