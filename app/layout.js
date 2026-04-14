import "./main.css";
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: "APEX ALPHA: New Gen",
  description: "Next-Generation Agentic Trading Interface",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050505] text-[#eaecef]">
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { 
              background: '#0a0a0a', 
              color: '#D4AF37', 
              border: '1px solid #1a1a1a',
              fontFamily: 'JetBrains Mono, monospace'
            } 
          }} 
        />
        {children}
      </body>
    </html>
  );
}

