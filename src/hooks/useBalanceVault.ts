import { useAccount, useReadContract } from "wagmi"
import { MockUSDCAbi, MockUSDCAddress, VaultAbi, VaultAddress } from "@/services/abi";

export const useBalanceVault = () => {
    const { address } = useAccount();

    const { data: balanceVault } = useReadContract({
        address: VaultAddress,
        abi: VaultAbi,
        functionName: 'balanceOf',
        args: [address]
    })

    const {data: USDCBalanceOfVault} = useReadContract({
        address: MockUSDCAddress,
        abi: MockUSDCAbi,
        functionName: 'balanceOf',
        args: [VaultAddress]
    });
    //Total supply ke vault
    const {data: totalSupplyVault} = useReadContract({
        address: VaultAddress,
        abi: VaultAbi,
        functionName: 'totalSupply',
    });

    const sharePrice = Number(USDCBalanceOfVault) / Number(totalSupplyVault);
    const balance = Number(balanceVault) * sharePrice / 1e6;

    return balance;
}