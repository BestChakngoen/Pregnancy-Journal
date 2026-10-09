import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const promptFont = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "Bumply - Pregnancy Tracker",
  description: "Web app for tracking pregnancy age and patient safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} font-sans antialiased`}>
      <body className="min-h-dvh flex flex-col items-center">
        {/* We use a max-w container to simulate mobile view on desktop */}
        <div className="w-full max-w-md bg-white/30 backdrop-blur-3xl min-h-dvh shadow-sm overflow-x-hidden relative">
          
          {/* High-Performance Animated Mesh Background (No CSS Filters) */}
          <div className="fixed inset-0 w-full max-w-md mx-auto pointer-events-none overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent opacity-80" />
          <div className="fixed inset-0 w-full max-w-md mx-auto pointer-events-none overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-transparent opacity-80 animate-blob" />
          
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
