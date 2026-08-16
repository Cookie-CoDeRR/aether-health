import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "Aether Health — Patient Care & Navigation Portal",
  description:
    "A calming, accessible, patient-first healthcare experience with AI symptom triage, verified doctor consultations, and lab report insights.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAF9] text-[#1E293B] antialiased selection:bg-[#E6F4F1] selection:text-[#134E48]">
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </body>
    </html>
  );
}
