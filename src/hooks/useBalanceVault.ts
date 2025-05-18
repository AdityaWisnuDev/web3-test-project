import { useAccount, useReadContract } from "wagmi"
import { VaultAbi } from "@/services/abi";

export const useBalanceVault = () => {
    const { address } = useAccount();

    const { data: balanceVault } = useReadContract({
        address: '0xc39b0Fb736409C50cCD9Da42248b507762B18cE8',
        abi: VaultAbi,
        functionName: 'balanceOf',
        args: [address]
    })

    return balanceVault
}