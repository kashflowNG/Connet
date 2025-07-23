import { useQuery } from "@tanstack/react-query";
import { Check, Clock, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@shared/schema";

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: false, // Disable automatic fetching since we're using mock data for now
  });

  // Mock data for demonstration - replace with real data when backend is implemented
  const mockTransactions: Transaction[] = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Check className="w-3 h-3 text-white" />;
      case "pending":
        return <Clock className="w-3 h-3 text-white" />;
      case "failed":
        return <X className="w-3 h-3 text-white" />;
      default:
        return <Clock className="w-3 h-3 text-white" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "failed":
        return "bg-danger";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Transfer Complete";
      case "pending":
        return "Transfer Pending";
      case "failed":
        return "Transfer Failed";
      default:
        return "Unknown Status";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return num.toFixed(4);
  };

  const formatUSD = (amount: string) => {
    const num = parseFloat(amount);
    const usd = num * 2000; // Mock exchange rate
    return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const handleViewAllTransactions = () => {
    // TODO: Implement pagination or navigation to full transaction history
    console.log("View all transactions");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
        
        {mockTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRight className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
              <p className="text-gray-600">Your transaction history will appear here after you make your first transfer</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {(transactions || mockTransactions).map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${getStatusColor(transaction.status)} rounded-full flex items-center justify-center`}>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getStatusText(transaction.status)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTimeAgo(transaction.timestamp.toString())}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        -{formatAmount(transaction.amount)} ETH
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatUSD(transaction.amount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    TX: {transaction.transactionHash.slice(0, 6)}...{transaction.transactionHash.slice(-4)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="ghost"
                onClick={handleViewAllTransactions}
                className="w-full text-primary hover:text-blue-700 font-medium py-2"
              >
                View All Transactions
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
