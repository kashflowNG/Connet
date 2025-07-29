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
            {/* Show all available wallets with professional styling */}
            {walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                onClick={() => handleWalletOption(wallet.id)}
                className={`w-full justify-start h-auto p-4 border-2 transition-all duration-200 hover:shadow-lg
                  ${wallet.installed 
                    ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                style={{
                  borderColor: wallet.installed ? '#10B981' : undefined,
                }}
              >
                <div className="flex items-center space-x-4 w-full">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: `${wallet.color}15` }}
                  >
                    <wallet.icon size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 flex items-center">
                      {wallet.name}
                      {wallet.installed && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                          ✓ Installed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{wallet.description}</div>
                  </div>
                  {wallet.deepLink || wallet.installUrl ? (
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  ) : (
                    <div className="w-4 h-4" /> // Placeholder for alignment
                  )}
                </div>
              </Button>
            ))}
            
            {/* Manual URL copy option for mobile */}
            {environment.isMobile && (
              <div className="pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={copyUrlToClipboard}
                  className="w-full justify-start h-auto p-4 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">Copy URL</div>
                      <div className="text-sm text-gray-600 mt-1">Manually open in any wallet browser</div>
                    </div>
                  </div>
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