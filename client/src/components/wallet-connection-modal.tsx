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

          <div className="space-y-3">
            {/* Show all available wallets with clean text-based styling */}
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                onClick={() => handleWalletOption(wallet.id)}
                className={`w-full justify-between h-auto p-6 border-2 transition-all duration-300 hover:shadow-xl group relative overflow-hidden
                  ${wallet.installed 
                    ? 'border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-500' 
                    : 'border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 hover:border-blue-400 hover:from-blue-50 hover:to-indigo-50'
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-bold text-lg text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                      {wallet.name}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                      {wallet.description}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {wallet.installed && (
                      <div className="flex items-center space-x-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Ready</span>
                      </div>
                    )}
                    
                    {wallet.deepLink || wallet.installUrl ? (
                      <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200 transition-colors">
                        <ExternalLink className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
                        <Wallet className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Subtle hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Button>
            ))}
            
            {/* Manual URL copy option for mobile */}
            {environment.isMobile && (
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={copyUrlToClipboard}
                  className="w-full justify-between h-auto p-6 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 hover:border-amber-300 hover:from-amber-100 hover:to-yellow-100 transition-all duration-300 hover:shadow-xl group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <div className="font-bold text-lg text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">
                        Copy URL
                      </div>
                      <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                        Manually open in any wallet browser
                      </div>
                    </div>
                    
                    <div className="bg-amber-100 p-2 rounded-full group-hover:bg-amber-200 transition-colors">
                      <Copy className="w-4 h-4 text-amber-600" />
                    </div>
                  </div>
                  
                  {/* Subtle hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Button>
              </div>
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