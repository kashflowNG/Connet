import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/hooks/use-web3";

interface TransactionModalProps {
  txHash: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionModal({ txHash, isOpen, onClose }: TransactionModalProps) {
  const { getTransactionStatus } = useWeb3();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [blockNumber, setBlockNumber] = useState<string | undefined>();
  const [gasUsed, setGasUsed] = useState<string | undefined>();

  useEffect(() => {
    if (!txHash || !isOpen) return;

    const checkStatus = async () => {
      const result = await getTransactionStatus(txHash);
      if (result) {
        setStatus(result.status);
        setBlockNumber(result.blockNumber);
        setGasUsed(result.gasUsed);
      }
    };

    // Check immediately
    checkStatus();

    // Poll for status updates if still pending
    const interval = setInterval(() => {
      if (status === 'pending') {
        checkStatus();
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [txHash, isOpen, status, getTransactionStatus]);

  const getEtherscanUrl = (hash: string) => {
    // TODO: Detect network and use appropriate explorer
    return `https://etherscan.io/tx/${hash}`;
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return {
          title: "Processing Transaction",
          description: "Please wait while your transaction is being confirmed on the blockchain.",
          color: "text-blue-600"
        };
      case 'confirmed':
        return {
          title: "Transaction Confirmed",
          description: "Your transaction has been successfully confirmed on the blockchain.",
          color: "text-green-600"
        };
      case 'failed':
        return {
          title: "Transaction Failed",
          description: "Your transaction failed to process. Please try again.",
          color: "text-red-600"
        };
      default:
        return {
          title: "Processing Transaction",
          description: "Please wait while your transaction is being processed.",
          color: "text-blue-600"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              status === 'pending' ? 'bg-blue-100' :
              status === 'confirmed' ? 'bg-green-100' :
              'bg-red-100'
            }`}>
              {status === 'pending' ? (
                <Loader2 className={`w-8 h-8 animate-spin ${statusInfo.color}`} />
              ) : status === 'confirmed' ? (
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <X className="w-8 h-8 text-red-600" />
              )}
            </div>
            <span className={statusInfo.color}>{statusInfo.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            {statusInfo.description}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Transaction Hash</div>
            <div className="text-sm font-mono text-gray-900 break-all">
              {txHash}
            </div>
          </div>

          {blockNumber && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Block Number</div>
              <div className="text-sm font-mono text-gray-900">
                {blockNumber}
              </div>
            </div>
          )}

          {gasUsed && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Gas Used</div>
              <div className="text-sm font-mono text-gray-900">
                {parseInt(gasUsed).toLocaleString()}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.open(getEtherscanUrl(txHash), '_blank')}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Etherscan</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
