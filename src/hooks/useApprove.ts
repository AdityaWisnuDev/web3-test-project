import { useAccount, useWaitForTransactionReceipt, useWriteContract, createConfig } from "wagmi";
import { writeContract } from "wagmi/actions";
import { VaultAbi } from "@/services/abi";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useWagmiConfig } from "@/lib/wagmi";
import { Hash } from "viem";

type Status = "idle" | "loading" | "success" | "error";

export const useApprove = () => {
    const Address = '0xc39b0Fb736409C50cCD9Da42248b507762B18cE8';

    const [ steps, setSteps ] = useState<Status>("idle");
    const [ txHash, setTxHash ] = useState<Hash | null>(null);
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt();

    const mutation = useMutation({
        mutationFn: async ({amount} : {amount: number}) => {
            try {
                setSteps("idle");

                if (!amount) {
                    throw new Error("Invalid Params");
                }

                let txHash;

                txHash = await writeContract({
                    address: Address,
                    abi: VaultAbi,
                    functionName: 'approve',
                    args: [address, BigInt(1)],
                });

                // setTxHash(txHash);

            } catch (error) {
                
            }
        }
    })

    return { steps, mutation };
}