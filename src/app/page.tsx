"use client"

import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, DollarSign } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MockUSDCAbi, MockUSDCAddress, VaultAbi, VaultAddress } from '@/services/abi';

import LoadingSpinner from './components/LoadingSpinner';
import SuccessIcon from './components/SuccessIcon';

import { useBalanceUSDC } from '@/hooks/useBalanceUSDC';
import { useBalanceVault } from '@/hooks/useBalanceVault';


type TabType = 'deposit' | 'withdraw';

export default function Home() {
    const [activeTab, setActiveTab] = useState<TabType>('deposit');
    const [amount, setAmount] = useState<string>('');
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingApprove, setIsLoadingApprove] = useState<string>('');
    const [isLoadingDeposit, setIsLoadingDeposit] = useState<string>('');
    const [isLoadingWithdraw, setIsLoadingWithdraw] = useState<string>('');
    const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();

    let balanceUSDC = useBalanceUSDC();
    let balanceVault = useBalanceVault();

    const { data: USDCDecimals }: {data: number | undefined} = useReadContract({
        address: MockUSDCAddress,
        abi: MockUSDCAbi,
        functionName: 'decimals',
    });

    if (balanceUSDC && typeof balanceUSDC === 'bigint') {
        balanceUSDC = (Number(formatUnits(balanceUSDC, USDCDecimals || 6)));
    }

    const { data: vaultDecimals }: {data: number | undefined} = useReadContract({
        address: VaultAddress,
        abi: VaultAbi,
        functionName: 'decimals',
    });

    if (balanceVault && typeof balanceVault === 'bigint') {
        balanceVault = (Number(formatUnits(balanceVault, vaultDecimals || 18)));
    }
    
    
    const maxDeposit = Number(balanceUSDC);
    const maxWithdraw = Number(balanceVault);
    
    useEffect(() => {
        const maxValue = activeTab === 'deposit' ? maxDeposit : maxWithdraw;
        setAmount((sliderValue * maxValue / 100).toFixed(2));
    }, [sliderValue, activeTab, maxWithdraw]);
    
    useEffect(() => {
        setAmount('');
        setSliderValue(0);
        setIsLoadingApprove('');
        setIsLoadingDeposit('');
        setIsLoadingWithdraw('');
    }, [activeTab]);
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
        setAmount(value);
        const maxValue = activeTab === 'deposit' ? maxDeposit : maxWithdraw;
        const percentage = Math.min((parseFloat(value) || 0) * 100 / maxValue, 100);
        setSliderValue(percentage);
        }
    };
    
    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setSliderValue(parseFloat(e.target.value));
    };
    
    const handleQuickAmount = (percentage: number): void => {
        setSliderValue(percentage);
    };

    const [ step, setStep ] = useState<'idle' | 'approving' | 'approved' | 'depositing' | 'completed'>('idle');
    const { writeContract: writeApprove, isPending: isApprovePending } = useWriteContract()
    const { writeContract: writeDeposit, isPending: isDepositPending } = useWriteContract()
    const { writeContract: writeWithdraw, isPending: isWithdrawPending } = useWriteContract()

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    })

    const { address } = useAccount();

    const { data: allowance } = useReadContract({
        address: MockUSDCAddress,
        abi: MockUSDCAbi,
        functionName: 'allowance',
        args: [address, VaultAddress]
    })

    const depositAmount = parseUnits(amount, 6);

    const handleApprove = async () => {
        setIsLoadingApprove('loading');
        writeApprove(
            {
                address: MockUSDCAddress,
                abi: MockUSDCAbi,
                functionName: 'approve',
                args: [VaultAddress, parseUnits(amount, 6)],
            },
            {
                onSuccess(data) {
                    setApproveHash(data);
                    setStep('approved');
                    setIsLoadingApprove('success');
                },
                onError(err) {
                    console.error('Approval error:', err);
                    setStep('idle');
                    setIsLoadingApprove('');
                },
            }
        )
    }

    const depositFunction = async () => {
        setIsLoadingDeposit('loading');
        try {
            await writeDeposit(
                {
                    address: VaultAddress,
                    abi: VaultAbi,
                    functionName: 'deposit',
                    args: [parseUnits(amount, 6)],
                },
                {
                    onSuccess(data) {
                        setStep('completed');
                        setIsLoadingDeposit('success');
                    },
                    onError(err) {
                        console.error('Deposit error:', err);
                        setStep('idle');
                        setIsLoadingDeposit('');
                    },
                }
            );
        } catch (error) {
            console.error('Deposit execution error:', error);
            setStep('idle');
            setIsLoadingDeposit('');
        }
    };

    useEffect(() => {
        if (isApproveSuccess && step === 'approved') {
            depositFunction();
        }
    }, [isApproveSuccess, step]);
    
    
    const handleDeposit = async () => {
        if (Number(depositAmount) > Number(allowance)) {
            handleApprove();
        } else {
            depositFunction();
        }
    }

    const {data: USDCBalanceOfVault} = useReadContract({
        address: MockUSDCAddress,
        abi: MockUSDCAbi,
        functionName: 'balanceOf',
        args: [VaultAddress]
    });

    const {data: totalSupplyVault} = useReadContract({
        address: VaultAddress,
        abi: VaultAbi,
        functionName: 'totalSupply',
    });

    const sharePrice = Number(USDCBalanceOfVault) / Number(totalSupplyVault);
    const withdrawAmount = Number(parseUnits(amount, USDCDecimals || 6)) / sharePrice;
    
    const handleWithdraw = async () => {
        setIsLoadingWithdraw('loading');
        writeWithdraw(
            {
                address: VaultAddress,
                abi: VaultAbi,
                functionName: 'withdraw',
                args: [withdrawAmount.toFixed(0)]
            },
            {
                onSuccess(data) {
                    setIsLoadingWithdraw('success')
                },
                onError(err) {
                    console.error('Withdraw error:', err)
                }
            }
        )
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className='flex items-center justify-end fixed top-0 left-0 w-full border-b-2 py-4 px-8 backdrop-blur-md'>
                <ConnectButton />
            </div>
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Balance Display */}
                <div className="bg-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Your Balance</h2>
                        <Wallet size={24} />
                    </div>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold">
                            { activeTab === 'deposit' ? Number(balanceUSDC).toFixed(2) : Number(balanceVault).toFixed(2)}
                        </span>
                        <span className="ml-1 text-blue-200">USDT</span>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        activeTab === 'deposit' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-blue-500'
                        }`}
                        onClick={() => setActiveTab('deposit')}
                    >
                        <ArrowDownCircle size={18} />
                        Deposit
                    </button>
                    <button
                        className={`flex-1 py-4 px-6 font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        activeTab === 'withdraw' 
                            ? 'text-blue-600 border-b-2 border-blue-600' 
                            : 'text-gray-500 hover:text-blue-500'
                        }`}
                        onClick={() => setActiveTab('withdraw')}
                    >
                        <ArrowUpCircle size={18} />
                        Withdraw
                    </button>
                </div>
                
                {/* Form */}
                <div className="p-6">
                    {/* Amount Input */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                            />
                        </div>
                    </div>
                    
                    {/* Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">0%</span>
                            <span className="text-xs text-gray-500">100%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 mb-6">
                        {[25, 50, 75, 100].map((percent) => (
                            <button
                                key={percent}
                                onClick={() => handleQuickAmount(percent)}
                                className={`flex-1 py-2 text-sm border rounded-md transition-all duration-300 ${
                                sliderValue === percent
                                    ? 'bg-blue-100 border-blue-500 text-blue-600'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {percent}%
                            </button>
                        ))}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        onClick={
                            activeTab === 'deposit' ? handleDeposit : handleWithdraw
                        }
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] ${
                            isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                        ) : (
                            `${activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} Funds`
                        )}
                    </button>
                    <div className="flex flex-col gap-2">
                        {isLoadingApprove !== '' && (
                            isLoadingApprove == 'loading' ? (
                                <LoadingSpinner label="Approving" />
                            ) : (
                                <SuccessIcon label="Approved" />
                            )
                        )}

                        {isLoadingDeposit !== '' && (
                            isLoadingDeposit == 'loading' ? (
                                <LoadingSpinner label="Depositing" />
                            ) : (
                                <SuccessIcon label="Deposited" />
                            )
                        )}

                        {isLoadingWithdraw !== '' && (
                            isLoadingWithdraw == 'loading' ? (
                                <LoadingSpinner label="Withdrawing" />
                            ) : (
                                <SuccessIcon label="Withdrawed" />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}