import { Coins } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center ethereum-gradient-subtle">
      <div className="text-center">
        <div className="animate-spin mb-4 ethereum-pulse">
          <Coins className="w-12 h-12 text-primary mx-auto ethereum-glow" />
        </div>
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 ethereum-float">
          Loading DeFi Platform
        </h2>
        <p className="text-muted-foreground">Preparing your crypto dashboard...</p>
      </div>
    </div>
  );
}