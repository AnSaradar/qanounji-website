import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qanounji - قانونجي | Your Smart Legal Assistant",
  description: "AI-powered legal assistant for Syrian and Arab laws. Get instant legal consultations with advanced AI technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
