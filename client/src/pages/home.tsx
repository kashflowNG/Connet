import { useState } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [allNetworksLoaded, setAllNetworksLoaded] = useState(false);
  const handleWalletConnect = async () => {
    setIsScanning(true);
    // Simulate wallet connection and network scanning
    setTimeout(() => {
      setIsConnected(true);
      setIsScanning(false);
      setTimeout(() => {
        setAllNetworksLoaded(true);
      }, 2000);
    }, 1000);
  };

  const handleTransfer = () => {
    alert("Transfer functionality will be implemented with Web3 integration");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        {/* Wallet Connect Button */}
        <button
          onClick={!isConnected ? handleWalletConnect : undefined}
          disabled={isScanning}
          style={{
            background: isConnected 
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            fontWeight: '600',
            padding: '1.5rem 3rem',
            fontSize: '1.125rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            opacity: isScanning ? 0.7 : 1,
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>👛</span>
          {isScanning ? "Connecting..." : isConnected ? "Wallet Connected" : "Connect Wallet"}
        </button>

        {/* Network Loading Indicator */}
        {isConnected && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#e5e7eb'
          }}>
            {!allNetworksLoaded ? (
              <>
                <div style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  border: '2px solid #3b82f6',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Scanning networks...</span>
              </>
            ) : (
              <>
                <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
                <span style={{ color: '#22c55e', fontWeight: '500' }}>All networks scanned</span>
              </>
            )}
          </div>
        )}

        {/* Transfer Button */}
        <button
          onClick={handleTransfer}
          disabled={!allNetworksLoaded}
          style={{
            background: allNetworksLoaded 
              ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
              : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: 'white',
            fontWeight: '600',
            padding: '1.5rem 3rem',
            fontSize: '1.125rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: allNetworksLoaded ? 'pointer' : 'not-allowed',
            opacity: allNetworksLoaded ? 1 : 0.5,
            transition: 'all 0.3s ease',
            boxShadow: allNetworksLoaded ? '0 0 20px rgba(220, 38, 38, 0.3)' : 'none'
          }}
        >
          Transfer All Funds
        </button>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
