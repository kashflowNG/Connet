import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Smartphone, Monitor, ExternalLink, Copy, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletDetector, type WalletOption } from "@/lib/wallet-detector";

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
    const env = WalletDetector.detectEnvironment();
    const options = WalletDetector.generateWalletOptions();
    setEnvironment(env);
    setWalletOptions(options.filter(option => option.available));
  }, []);

  const handleWalletOption = async (optionId: string) => {
    setSelectedMethod(optionId);
    
    const option = walletOptions.find(w => w.id === optionId);
    if (!option) return;

    if (optionId === 'metamask-extension' && option.installed) {
      // Direct connection for installed browser extension
      onConnect();
      return;
    }

    // For mobile wallets, just redirect - the connection will be attempted when they return
    if (environment?.isMobile && option.deepLink) {
      try {
        WalletDetector.openWalletApp(optionId);
        onClose(); // Close modal since user is being redirected
      } catch (error: any) {
        console.error('Failed to open wallet:', error);
      }
    } else {
      // For desktop or direct connections
      onConnect();
    }
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {environment.isMobile ? <Smartphone className="w-8 h-8 text-blue-600" /> : <Monitor className="w-8 h-8 text-blue-600" />}
            </div>
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 text-center text-sm">
            {environment.hasEthereum
              ? "Wallet detected! Click Connect to access your cryptocurrencies."
              : environment.isMobile 
                ? "Choose a wallet app to connect with:"
                : "Connect with a Web3 wallet to access your cryptocurrencies:"
            }
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
            {/* If wallet is detected, show connect button prominently */}
            {environment.hasEthereum && (
              <Button
                onClick={onConnect}
                className="w-full h-auto p-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <div className="flex items-center space-x-3 w-full justify-center">
                  <Wallet className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Connect Wallet</div>
                    <div className="text-sm opacity-90">Wallet ready to connect</div>
                  </div>
                </div>
              </Button>
            )}
            
            {/* Show wallet options if no wallet detected */}
            {!environment.hasEthereum && walletOptions.map((wallet) => (
              <Button
                key={wallet.id}
                variant="outline"
                onClick={() => handleWalletOption(wallet.id)}
                className="w-full justify-start h-auto p-4 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 flex items-center">
                      {wallet.name}
                      {wallet.installed && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Installed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{wallet.description}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Button>
            ))}
            
            {/* Manual URL copy option for mobile when no wallet detected */}
            {environment.isMobile && !environment.hasEthereum && (
              <Button
                variant="outline"
                onClick={copyUrlToClipboard}
                className="w-full justify-start h-auto p-4 border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-center space-x-3 w-full">
                  <Copy className="w-6 h-6 text-gray-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Copy URL</div>
                    <div className="text-sm text-gray-600">Copy this app's URL to open in any wallet</div>
                  </div>
                </div>
              </Button>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center space-y-1">
              {environment.hasEthereum ? (
                <p className="font-medium text-green-600">
                  Wallet detected and ready to connect!
                </p>
              ) : (
                <>
                  <p>
                    {environment.isMobile 
                      ? "Tap a wallet option to open the app, then return here to connect."
                      : "Make sure you have a Web3 wallet installed in your browser"
                    }
                  </p>
                  <p>New to crypto wallets? We recommend starting with MetaMask.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}