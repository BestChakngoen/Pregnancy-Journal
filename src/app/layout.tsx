import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";
import { Toaster } from "react-hot-toast";
import PopupAlert from "@/components/ui/PopupAlert";
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
      <body className="min-h-svh bg-slate-50 overflow-x-hidden">
        <ExternalBrowserRedirect />
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
        
        {/* กล่องเลื่อนของหน้าหลักบนจอสัมผัส: ให้แถบที่อยู่/แท็บของเบราว์เซอร์มือถือค้างแสดง ไม่ยุบตอนเลื่อน (ดู src/css/scroller.css; หน้าอื่น = ไม่มีผล) */}
        <div data-scroller>
          <div className="min-h-svh flex flex-col md:flex-row">
            {/* Main Content Area - scales to max-w-7xl on desktop */}
            <div className="flex-1 w-full max-w-md md:max-w-7xl phone-landscape:max-w-4xl mx-auto bg-white/30 isolate min-h-svh shadow-sm relative transition-all duration-300 flex flex-col" data-main>
          
              {/* Full-width mesh background */}
              <div className="fixed inset-0 w-full pointer-events-none overflow-hidden -z-10 print:hidden bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent opacity-80" />
              <div className="fixed inset-0 w-full pointer-events-none overflow-hidden -z-10 print:hidden bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-200/40 via-transparent to-transparent opacity-80 animate-blob" />
          
              <div className="flex-1 w-full flex flex-col">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
