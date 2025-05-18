'use client';

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from 'react';
import { ValutContractConfig, MockUSDCContractConfig } from "@/services/Contract";
import { formatUnits } from "viem";
import { VaultAbi, MockUSDCAbi } from "@/services/abi";
import { waitForTransactionReceipt } from "wagmi/actions";

// Add these new interfaces after your existing mock data
interface Token {
  symbol: string;
  icon: string;
}

const mockTokens: Token[] = [
  { symbol: 'USDC', icon: '💰' },
  { symbol: 'ETH', icon: '⚡' },
  { symbol: 'BTC', icon: '₿' },
];

const useLoadingAnimation = (duration: number = 1500) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(loadingTimer);
  }, [duration]);

  return isLoading;
};

const LoadingStat = ({ label }: { label: string }) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="mt-2 h-6 bg-gray-600 rounded animate-pulse"></div>
    </div>
  );
};

const mockVaultData = {
  name: "TEST-USDC Vault",
  platform: "DefiVault",
  chain: "Sepolia",
  tvl: "$1,234,567",
  apy: "12.34%",
  daily: "0.032%",
  depositToken: "MOOBIFI-USDC LP",
  balance: "0.00",
  depositedBalance: "0.00",
  price: "$1.02",
};

const tvlValues = ['$1,234,567', '$1,234,890', '$1,235,100'];
const apyValues = ['12.34%', '12.45%', '12.56%'];
const dailyValues = ['0.032%', '0.033%', '0.034%'];
const priceValues = ['$1.02', '$1.03', '$1.04'];

const AnimatedStat = ({ label, values }: { label: string; values: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLoading = useLoadingAnimation(1500); // You can adjust the duration

  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % values.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isLoading, values.length]);

  if (isLoading) {
    return <LoadingStat label={label} />;
  }

  return (
    <div className="p-4 bg-gray-700 rounded-lg transition-all duration-300 hover:bg-gray-600">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className={`text-xl font-bold ${label === 'APY' || label === 'Daily' ? 'text-green-400' : ''}`}>
        {values[currentIndex]}
      </div>
    </div>
  );
};

const PercentageSlider = ({ onSelect }: { onSelect: (value: number) => void }) => {
  const [value, setValue] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    onSelect(newValue);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>0%</span>
        <span>{value}%</span>
        <span>100%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-blue-500"
      />
    </div>
  );
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({hash: hash});

  const { data: balanceUSDC } = useReadContract({
    ...MockUSDCContractConfig,
    functionName: 'balanceOf',
    args: [address],
  });


  const [isApproved, setIsApproved] = useState<true | false>(false);
  const [isDeposited, setIsDeposited] = useState<true | false>(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amountDeposit, setAmountDeposit] = useState(0);

  const [approveStatus, setApproveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [depositStatus, setDepositStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const USDCBalanceFormatted = formatUnits((balanceUSDC as bigint) || BigInt(0), 6);

  useEffect(() => {
    if (isApproved && approveStatus === 'success') {
      handleDeposit();
    }
  }, [isApproved, approveStatus]);

  useEffect(() => {
    if (hash && !isPending) {
      if (isLoading) {
        setApproveStatus('loading');
      }

      if (isSuccess) {
        setApproveStatus('success');
        setIsApproved(true);
      }

      if (isError) {
        setApproveStatus('error');
      }
    }
  }, [hash, isPending, isLoading, isSuccess, isError]);

  useEffect(() => {
    if (hash && !isPending && !isDeposited && isApproved && approveStatus === 'success') {
      console.log('Deposit transaction hash:', hash);
      
      if (isLoading) {
        setDepositStatus('loading');
      }

      if (isSuccess) {
        // setDepositStatus('success');
        setAmountDeposit(0);
      }

      if (isError) {
        setDepositStatus('error');
      }
    }
  }, [hash, isPending, isDeposited, isLoading, isSuccess, isError, isApproved, approveStatus]);

  const handleApprove = async () => {
    if (!isConnected) return;

    setApproveStatus('loading');
    try {
      await writeContract({
        // address: "0xB6Df7f56e1dFF4073FD557500719A37232fC3337",
        // abi: MockUSDCAbi,
        address: "0xc39b0Fb736409C50cCD9Da42248b507762B18cE8",
        abi: VaultAbi,
        functionName: 'approve',
        args: [address, BigInt(1)], // Replace with actual amount
      });
    } catch (error) {
      console.error('Error approving contract:', error);
      setApproveStatus('error');
      return;
    }
  }

  const handleDeposit = async () => {
    if (!isConnected || !isApproved) return;
    
    setDepositStatus('loading');
    try {
      writeContract({
        address: "0xc39b0Fb736409C50cCD9Da42248b507762B18cE8",
        abi: VaultAbi,
        functionName: 'deposit',
        args: [BigInt(1)],
      });
    } catch (error) {
      console.error('Deposit failed:', error);
      setDepositStatus('error');
    }
  };

  const handleWithdraw = () => {
    // Handle withdraw logic here
  };

  const LoadingSpinner = ({ label }: { label: string }) => {
    return (
      <div className="flex flex-row items-center justify-center p-4 gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-sm text-gray-400">{label}...</span>
      </div>
    );
  }

  const SuccessIcon = ({ label }: { label: string }) => {
    return (
      <div className="flex flex-row items-center justify-center p-4 gap-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-4 border-green-500 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="3" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    );
  };
  
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">DefiVault</div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 mt-8">
        {/* Vault Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
          <div>
            <h1 className="text-2xl font-bold">{mockVaultData.name}</h1>
            <div className="text-gray-400">
              {mockVaultData.platform} • {mockVaultData.chain}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Stats */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <AnimatedStat label="TVL" values={tvlValues} />
              <AnimatedStat label="APY" values={apyValues} />
              <AnimatedStat label="Daily" values={dailyValues} />
              <AnimatedStat label="Price" values={priceValues} />
            </div>
          </div>

          {/* Right Column - Deposit/Withdraw */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex gap-4 mb-6">
              <button 
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  activeTab === 'deposit' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('deposit')}
              >
                Deposit
              </button>
              <button 
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  activeTab === 'withdraw' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-gray-400 text-sm">Amount</div>
                  <div className="text-gray-400 text-sm">
                    Balance: {activeTab === 'deposit' ? USDCBalanceFormatted : mockVaultData.depositedBalance}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={amountDeposit}
                    className="flex-1 bg-gray-800 rounded px-3 py-2 text-white"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setAmountDeposit(0);
                        return;
                      }
                      // Convert to number and validate
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setAmountDeposit(numValue);
                      }
                    }}
                  />
                  <select className="bg-gray-800 rounded px-3 py-2">
                    {mockTokens.map((token) => (
                      <option key={token.symbol}>
                        {token.icon} {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <PercentageSlider 
                  onSelect={(percent) => {
                    const balance = parseFloat(USDCBalanceFormatted);
                    const calculatedAmount = (balance * percent) / 100;
                    const formattedAmount = parseFloat(calculatedAmount.toFixed(6));
                    setAmountDeposit(formattedAmount);
                  }} 
                />
              </div>

              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded transition-colors"
                // onClick={isApproved ? (activeTab === 'deposit' ? handleDeposit : handleWithdraw ) : handleApprove}
                onClick={handleApprove}
              >
                {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
              <div className="flex flex-col gap-2">
                {/* Approve status */}
                {approveStatus === 'loading' && <LoadingSpinner label="Approving" />}
                {approveStatus === 'success' && <SuccessIcon label="Approved" />}
                
                {/* Deposit status */}
                {depositStatus === 'loading' && <LoadingSpinner label="Depositing" />}
                {depositStatus === 'success' && <SuccessIcon label="Deposited" />}
                
                {/* Error states */}
                {(approveStatus === 'error' || depositStatus === 'error') && (
                  <div className="text-red-500 text-sm text-center">
                    Transaction failed. Please try again.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Strategy</h2>
          <p className="text-gray-400">
            Autocompounds MOOBIFI-USDC LP tokens from Velodrome rewards.
          </p>
        </div>
      </main>
    </div>
  );
}
