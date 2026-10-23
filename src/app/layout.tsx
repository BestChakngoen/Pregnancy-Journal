import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { Toaster } from "react-hot-toast";
import PopupAlert from "@/components/ui/PopupAlert";
import PortraitLockOverlay from "@/components/ui/PortraitLockOverlay";
import ExternalBrowserRedirect from "@/components/ui/ExternalBrowserRedirect";

const promptFont = Prompt({
  variable: "--font-prompt",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "MomSafe - Pregnancy Tracker",
  description: "Web app for tracking pregnancy age and patient safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${promptFont.variable} font-sans antialiased`}>
      <body className="min-h-dvh flex flex-col md:flex-row bg-slate-50 overflow-x-hidden">
        <ExternalBrowserRedirect />
        <PortraitLockOverlay />
        <PopupAlert />
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              color: '#334155',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '20px',
              padding: '16px',
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            },
          }}
        />
        <BottomNav />
        
        {/* Main Content Area - scales to max-w-7xl on desktop */}
        <div className="flex-1 w-full max-w-md md:max-w-7xl mx-auto bg-white/30 backdrop-blur-3xl min-h-dvh shadow-sm relative transition-all duration-300 md:ml-64 flex flex-col">
          
          {/* Full-width mesh background */}
          <div className="fixed inset-0 w-full pointer-events-none overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent opacity-80" />
          <div className="fixed inset-0 w-full pointer-events-none overflow-hidden -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-transparent opacity-80 animate-blob" />
          
          <div className="flex-1 w-full flex flex-col pb-20 md:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
