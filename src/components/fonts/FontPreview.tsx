import { useEffect } from "react";

interface FontPreviewProps {
  fontFamily: string;
  className?: string;
  googleFontsUrl?: string;
}

export function FontPreview({ fontFamily, className, googleFontsUrl }: FontPreviewProps) {
  useEffect(() => {
    if (googleFontsUrl) {
      // Load Google Font dynamically
      const link = document.createElement('link');
      link.href = googleFontsUrl;
      link.rel = 'stylesheet';
      
      // Check if font is already loaded
      const existingLink = document.querySelector(`link[href="${googleFontsUrl}"]`);
      if (!existingLink) {
        document.head.appendChild(link);
      }
    }
  }, [googleFontsUrl]);

  return (
    <div className="bg-muted/50 rounded-md p-3 border">
      <p className="text-xs text-muted-foreground mb-2">Prévia:</p>
      <div 
        className={`text-lg ${className || ''}`}
        style={{ fontFamily }}
      >
        Texto de exemplo para gravação
      </div>
      <div 
        className={`text-sm mt-1 ${className || ''}`}
        style={{ fontFamily }}
      >
        ABCDEFGHijklmnop 123456789
      </div>
    </div>
  );
}