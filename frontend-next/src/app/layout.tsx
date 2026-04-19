import type { Metadata } from "next";
import "./index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Scout - AI Candidate Screening",
  description: "Scout uses Gemini AI to screen hundreds of candidates in seconds and surface your perfect shortlist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}