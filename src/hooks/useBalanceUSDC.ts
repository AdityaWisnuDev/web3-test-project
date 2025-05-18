import { useReadContract, useAccount } from "wagmi";
import { MockUSDCAbi } from "@/services/abi";

export const useBalanceUSDC = () => {
    const { address } = useAccount();

    const { data: balanceUSDC } = useReadContract({
        address: '0xB6Df7f56e1dFF4073FD557500719A37232fC3337',
        abi: MockUSDCAbi,
        functionName: 'balanceOf',
        args: [address],
    })

    return balanceUSDC
}
