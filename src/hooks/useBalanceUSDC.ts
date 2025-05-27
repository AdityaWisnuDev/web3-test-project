import { useReadContract, useAccount } from "wagmi";
import { MockUSDCAbi, MockUSDCAddress } from "@/services/abi";

export const useBalanceUSDC = () => {
    const { address } = useAccount();

    const { data: balanceUSDC } = useReadContract({
        address: MockUSDCAddress,
        abi: MockUSDCAbi,
        functionName: 'balanceOf',
        args: [address],
    })

    return balanceUSDC;
}
