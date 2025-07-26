
import { useState, useEffect } from "react";

export default function PageLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* Animated Ethereum Logo */}
        <div className="relative mb-6">
          <div className="animate-spin">
            <img 
              src="/images/ethereum-logo.svg" 
              alt="Ethereum" 
              className="w-16 h-16 mx-auto opacity-80"
            />
          </div>
          {/* Pulsing ring around logo */}
          <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-primary/30 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-20 h-20 mx-auto -m-2 border border-primary/20 rounded-full animate-pulse"></div>
        </div>
        
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Ethereum Foundation
        </h2>
        <p className="text-muted-foreground">Loading validator rewards{dots}</p>
      </div>
    </div>
  );
}
