import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface ConnectionStatusProps {
  isConnecting: boolean;
  isConnected: boolean;
  showAutoConnectIndicator?: boolean;
}

export default function ConnectionStatus({ 
  isConnecting, 
  isConnected, 
  showAutoConnectIndicator 
}: ConnectionStatusProps) {
  const [autoConnectAttempt, setAutoConnectAttempt] = useState<any>(null);

  useEffect(() => {
    // Ultra-fast connection check - no async imports
    const attempt = localStorage.getItem('wallet-connection-attempt');
    if (attempt) {
      try {
        const parsed = JSON.parse(attempt);
        if (Date.now() - parsed.timestamp < 300000) {
          setAutoConnectAttempt(parsed);
        } else {
          localStorage.removeItem('wallet-connection-attempt');
        }
      } catch (error) {
        localStorage.removeItem('wallet-connection-attempt');
      }
    }
    
    // No periodic checking for performance
  }, []);

  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 text-sm">
          Wallet connected successfully
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnecting) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        <AlertDescription className="text-blue-800 text-sm">
          Connecting to wallet...
        </AlertDescription>
      </Alert>
    );
  }

  if (autoConnectAttempt && showAutoConnectIndicator) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 text-sm">
          Waiting for wallet connection. Return from your wallet app to connect automatically.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}