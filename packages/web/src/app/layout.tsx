import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { SkipToContentLink } from "@/components/SkipToContentLink";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const plausibleSrc =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

export const metadata: Metadata = {
  title: "PMP Study Pro",
  description:
    "Comprehensive study platform for the 2026 PMP certification exam",
  keywords: [
    "PMP",
    "Project Management",
    "Certification",
    "Study",
    "Exam Prep",
  ],
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PMP Pro",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${roboto.className} font-sans antialiased bg-[#FFFBFE] text-[#1C1B1F]`}
      >
        {plausibleDomain ? (
          <Script
            src={plausibleSrc}
            data-domain={plausibleDomain}
            strategy="afterInteractive"
          />
        ) : null}
        <SkipToContentLink />
        <Providers>
          <div id="main-content" tabIndex={-1}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
