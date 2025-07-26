
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Smartphone, Monitor, ExternalLink, Copy, Wallet, Download, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletDetector, type WalletOption } from "@/lib/wallet-detector";
import { Badge } from "@/components/ui/badge";

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
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  useEffect(() => {
    const env = WalletDetector.detectEnvironment();
    const options = WalletDetector.generateWalletOptions();
    setEnvironment(env);
    setWalletOptions(options);

    // Attempt auto-connection when modal opens
    if (isOpen && !error) {
      attemptAutoConnection();
    }
  }, [isOpen, error]);

  const attemptAutoConnection = async () => {
    setIsAutoConnecting(true);
    try {
      const success = await WalletDetector.attemptAutoConnect();
      if (success) {
        onConnect();
        return;
      }
    } catch (error) {
      console.log('Auto-connection failed:', error);
    } finally {
      setIsAutoConnecting(false);
    }
  };

  const handleWalletOption = async (optionId: string) => {
    setSelectedMethod(optionId);
    
    const option = walletOptions.find(w => w.id === optionId);
    if (!option) return;

    if ((optionId === 'metamask-extension' || option.installed) && option.installed) {
      // Direct connection for installed browser extension
      try {
        onConnect();
        // Mark successful connection for future auto-connect
        WalletDetector.markSuccessfulConnection();
      } catch (error) {
        console.error('Connection failed:', error);
      }
      return;
    }

    // For mobile wallets or uninstalled wallets
    if (option.deepLink) {
      try {
        await WalletDetector.openWalletApp(optionId);
        onClose(); // Close modal since user is being redirected
      } catch (error: any) {
        console.error('Failed to open wallet:', error);
      }
    } else if (option.installUrl) {
      // Open installation page for uninstalled wallets
      window.open(option.installUrl, '_blank');
    } else {
      // Fallback to direct connection attempt
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

  // Separate wallets by installation status and availability
  const installedWallets = walletOptions.filter(w => w.installed);
  const availableWallets = walletOptions.filter(w => w.available && !w.installed);
  const displayWallets = showAllWallets ? walletOptions : walletOptions.slice(0, 6);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {environment.isMobile ? <Smartphone className="w-8 h-8 text-blue-600" /> : <Monitor className="w-8 h-8 text-blue-600" />}
            </div>
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isAutoConnecting && (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Attempting automatic connection...</p>
            </div>
          )}

          {!isAutoConnecting && (
            <>
              <p className="text-gray-600 text-center text-sm">
                {environment.hasEthereum
                  ? `Wallet detected! Choose your preferred wallet to connect with.`
                  : environment.isMobile 
                    ? "Choose a wallet app to connect with:"
                    : "Connect with a Web3 wallet to access your cryptocurrencies:"
                }
              </p>

              {environment.detectedWallets.length > 0 && (
                <div className="text-center">
                  <p className="text-xs text-green-600 font-medium mb-2">
                    ✅ Detected: {environment.detectedWallets.join(', ')}
                  </p>
                </div>
              )}
            </>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {!isAutoConnecting && (
            <div className="space-y-2">
              {/* If wallet is detected, show quick connect button */}
              {environment.hasEthereum && installedWallets.length > 0 && (
                <div className="mb-4">
                  <Button
                    onClick={onConnect}
                    className="w-full h-auto p-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <div className="flex items-center space-x-3 w-full justify-center">
                      <CheckCircle className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">Quick Connect</div>
                        <div className="text-sm opacity-90">Use detected wallet</div>
                      </div>
                    </div>
                  </Button>
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500">Or choose a specific wallet below:</p>
                  </div>
                </div>
              )}
              
              {/* Installed Wallets Section */}
              {installedWallets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Installed Wallets ({installedWallets.length})
                  </h4>
                  {installedWallets.map((wallet) => (
                    <Button
                      key={wallet.id}
                      variant="outline"
                      onClick={() => handleWalletOption(wallet.id)}
                      className="w-full justify-start h-auto p-4 border-green-200 hover:border-green-300 hover:bg-green-50"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {wallet.name}
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              Ready
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">{wallet.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Available Wallets Section */}
              <div className="space-y-2">
                {installedWallets.length > 0 && (
                  <h4 className="text-sm font-medium text-gray-700 mt-4">
                    More Wallet Options
                  </h4>
                )}
                
                {displayWallets.filter(w => !w.installed).map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    onClick={() => handleWalletOption(wallet.id)}
                    className="w-full justify-start h-auto p-4 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {wallet.name}
                          {wallet.priority <= 3 && (
                            <Badge variant="outline" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{wallet.description}</div>
                      </div>
                      {wallet.deepLink ? (
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Download className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </Button>
                ))}

                {/* Show More/Less Button */}
                {walletOptions.length > 6 && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAllWallets(!showAllWallets)}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showAllWallets 
                      ? `Show Less (${walletOptions.length - 6} hidden)` 
                      : `Show All Wallets (+${walletOptions.length - 6} more)`
                    }
                  </Button>
                )}
                
                {/* Manual URL copy option for mobile */}
                {environment.isMobile && (
                  <Button
                    variant="outline"
                    onClick={copyUrlToClipboard}
                    className="w-full justify-start h-auto p-4 border-gray-200 hover:border-gray-300 mt-2"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <Copy className="w-6 h-6 text-gray-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">Copy URL</div>
                        <div className="text-sm text-gray-600">Open manually in any wallet browser</div>
                      </div>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center space-y-1">
              {environment.hasEthereum ? (
                <div>
                  <p className="font-medium text-green-600 mb-1">
                    ✅ Web3 wallet detected and ready!
                  </p>
                  <p>
                    {installedWallets.length} wallet{installedWallets.length !== 1 ? 's' : ''} installed, 
                    {availableWallets.length} more available
                  </p>
                </div>
              ) : (
                <>
                  <p>
                    {environment.isMobile 
                      ? "Tap a wallet to open the app, then return here to connect."
                      : "Choose a wallet to install or connect with"
                    }
                  </p>
                  <p>New to crypto? We recommend starting with MetaMask or Trust Wallet.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
