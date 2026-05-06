import "./main.css";
import { Toaster } from 'react-hot-toast';
import CursorTrailer from "@/components/CursorTrailer";
import ClientSetup from "@/components/ClientSetup";

export const metadata = {
  title: "APEX ALPHA | Sovereign Elite Tier",
  description: "Institutional Grade Agentic Trading Terminal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-[100dvh] antialiased selection:bg-[#f0c040]/30 selection:text-white">
      <head>
        <meta name="google-adsense-account" content="ca-pub-3740887631837879" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3740887631837879" crossorigin="anonymous"></script>
      </head>
      <body className="min-h-full flex flex-col bg-[#020205] text-white selection:bg-[#f0c040]/30 overflow-hidden">
        <ClientSetup />
        <CursorTrailer />
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { 
              background: 'rgba(2, 2, 5, 0.8)', 
              color: '#f0c040', 
              border: '1px solid rgba(240, 192, 64, 0.3)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'JetBrains Mono, monospace',
              borderRadius: '2px',
              fontSize: '12px'
            } 
          }} 
        />
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}

