import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Smartphone, Monitor, ExternalLink, Copy, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletDetector, type WalletOption } from "@/lib/wallet-detector";
import { WALLET_CONFIGS } from "./wallet-icons";

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  error?: string;
}

export default function WalletConnectionModal({ 
  isOpen, 
  onClose, 
  onConnect, 
  error 
}: WalletConnectionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [walletOptions, setWalletOptions] = useState<WalletOption[]>([]);
  const [environment, setEnvironment] = useState<any>(null);

  useEffect(() => {
    const updateWalletOptions = () => {
      const env = WalletDetector.detectEnvironment();
      const baseOptions = WalletDetector.generateWalletOptions();

      // Combine with icon configs
      const fullOptions = baseOptions.map(option => ({
        ...option,
        icon: WALLET_CONFIGS[option.id as keyof typeof WALLET_CONFIGS]?.icon || (() => <Wallet size={24} />),
        color: WALLET_CONFIGS[option.id as keyof typeof WALLET_CONFIGS]?.color || '#666666',
      }));

      setEnvironment(env);
      setWalletOptions(fullOptions);
    };

    // Initial detection
    updateWalletOptions();

    // Re-check wallet status when window regains focus (user returns from wallet app)
    const handleFocus = () => {
      setTimeout(updateWalletOptions, 500); // Small delay to let wallet inject
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleWalletOption = async (optionId: string) => {
    setSelectedMethod(optionId);

    const option = walletOptions.find(w => w.id === optionId);
    if (!option) return;

    // Handle WalletConnect specially
    if (optionId === 'walletconnect') {
      onConnect();
      return;
    }

    // If wallet is already installed/connected, attempt direct connection
    if (option.installed) {
      onConnect();
      return;
    }

    // Handle mobile deep links
    if (environment?.isMobile && option.deepLink) {
      try {
        WalletDetector.openWalletApp(optionId);
        onClose(); // Close modal since user is being redirected
      } catch (error: any) {
        console.error('Failed to open wallet:', error);
      }
      return;
    }

    // Handle desktop installations
    if (option.installUrl && !option.installed) {
      window.open(option.installUrl, '_blank');
      return;
    }

    // Default connection attempt for any remaining cases
    onConnect();
  };

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard! Open your wallet app and paste this URL in the browser section.');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URL copied! Open your wallet app and paste this URL in the browser section.');
    }
  };

  if (!environment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            Choose Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 text-center text-sm">
            Select from {walletOptions.length}+ supported wallets to securely connect and access your cryptocurrency portfolio.
          </p>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {/* Show all available wallets with sleek text-only styling */}
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="ghost"
                onClick={() => handleWalletOption(wallet.id)}
                className={`w-full h-auto p-0 border-0 transition-all duration-500 group relative overflow-hidden rounded-xl
                  ${wallet.installed 
                    ? 'hover:scale-[1.02] hover:shadow-2xl' 
                    : 'hover:scale-[1.01] hover:shadow-xl'
                  }`}
              >
                <div className={`w-full p-6 rounded-xl transition-all duration-500 relative z-10
                  ${wallet.installed 
                    ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-emerald-300/50' 
                    : 'bg-gradient-to-br from-slate-800 via-gray-800 to-zinc-800 text-white hover:from-slate-700 hover:via-gray-700 hover:to-zinc-700 shadow-lg hover:shadow-slate-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <div className={`font-bold text-xl mb-2 transition-all duration-300 group-hover:tracking-wider
                        ${wallet.installed ? 'text-white' : 'text-white'}`}>
                        {wallet.name}
                      </div>
                      <div className={`text-sm transition-all duration-300 opacity-80 group-hover:opacity-100
                        ${wallet.installed ? 'text-emerald-100' : 'text-gray-300'}`}>
                        {wallet.description}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {wallet.installed && (
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-white/30">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                          <span className="tracking-wide">READY</span>
                        </div>
                      )}

                      {!wallet.installed && (wallet.deepLink || wallet.installUrl) && (
                        <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 shadow-lg">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cool animated background effects */}
                <div className={`absolute inset-0 rounded-xl transition-all duration-700 opacity-0 group-hover:opacity-100
                  ${wallet.installed 
                    ? 'bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20' 
                    : 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20'
                  }`}></div>

                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl"></div>
              </Button>
            ))}

            {/* Manual URL copy option for mobile */}
            {environment.isMobile && (
              <Button
                  variant="ghost"
                  onClick={copyUrlToClipboard}
                  className="w-full h-auto p-0 border-0 transition-all duration-500 group relative overflow-hidden rounded-xl hover:scale-[1.01] hover:shadow-xl mt-4"
                >
                  <div className="w-full p-6 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 text-white shadow-lg hover:shadow-orange-300/50 transition-all duration-500 relative z-10">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <div className="font-bold text-xl mb-2 text-white transition-all duration-300 group-hover:tracking-wider">
                          Copy URL
                        </div>
                        <div className="text-sm text-orange-100 opacity-80 group-hover:opacity-100 transition-all duration-300">
                          Manually open in any wallet browser
                        </div>
                      </div>

                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 shadow-lg">
                        <Copy className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Cool animated background effects */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl"></div>
                </Button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center space-y-2">
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Connection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Multi-Network</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>DeFi Ready</span>
                </div>
              </div>
              <p>
                {environment.isMobile 
                  ? "Select any wallet to securely connect your crypto portfolio"
                  : "Choose your preferred wallet to access all supported networks"
                }
              </p>
              <p className="text-gray-400">
                New to crypto? We recommend MetaMask or Coinbase Wallet for beginners.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}