import { Coins } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Coins className="w-12 h-12 text-primary mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading DeFi Platform</h2>
        <p className="text-gray-600">Preparing your crypto dashboard...</p>
      </div>
    </div>
  );
}