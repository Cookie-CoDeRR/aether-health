import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "AETHER — Health Navigator",
  description:
    "AI-powered healthcare navigation prototype with Signal Design System. Symptom triage, specialist routing, report analysis, and medicine lookup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Load Newsreader (serif heading), IBM Plex Sans (body UI), IBM Plex Mono (tabular metrics) */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}

