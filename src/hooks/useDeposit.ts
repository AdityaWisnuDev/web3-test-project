/*
import { BalanceManagerABI } from "@/lib/abis/BalanceManagerABI";
import { denormalize, valueToBigInt } from "@/lib/bignumber";
import { ADDRESS_BALANCE_MANAGER } from "@/lib/constants";
import { useWagmiConfig } from "@/lib/wagmi";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  waitForTransactionReceipt,
  writeContract,
} from "wagmi/actions";

type Status = "idle" | "loading" | "success" | "error";

export const useCancelOrder = () => {
  const [steps, setSteps] = useState<
    Array<{
      step: number;
      status: Status;
      error?: string;
    }>
  >([
    {
      step: 1,
      status: "idle",
    },
  ]);

  const [txHash, setTxHash] = useState<HexAddress | null>(null);

  const wagmiConfig = useWagmiConfig();

  const mutation = useMutation({
    mutationFn: async ({
      currency,
      amount,
      price,
      decimals,
      userAddress
    }: {
      currency: HexAddress;
      amount: string;
      price: string;
      decimals: number;
      userAddress?: HexAddress;
    }) => {
      try {
        setSteps([{ step: 1, status: "idle" }]);

        if (!price) {
          throw new Error("Invalid parameters");
        }

        const formattedAmount = valueToBigInt(denormalize(amount, decimals));

        setSteps((prev) =>
          prev.map((item) => {
            if (item.step === 1) {
              return { ...item, status: "loading" };
            }
            return item;
          })
        );

        let txHash;

        if (userAddress) {
          txHash = await writeContract(wagmiConfig, {
            address: ADDRESS_BALANCE_MANAGER,
            abi: BalanceManagerABI,
            functionName: 'deposit',
            args: [
              currency,
              formattedAmount,
              userAddress
            ] as const,
          });
        } else {
          txHash = await writeContract(wagmiConfig, {
            address: ADDRESS_BALANCE_MANAGER,
            abi: BalanceManagerABI,
            functionName: 'deposit',
            args: [
              currency,
              formattedAmount
            ] as const,
          });
        }

        setTxHash(txHash);

        const result = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
        });

        setSteps((prev) =>
          prev.map((item) => {
            if (item.step === 1) {
              return { ...item, status: "success" };
            }
            return item;
          })
        );

        return result;
      } catch (e) {
        console.error("Error", e);

        setSteps((prev) =>
          prev.map((step) => {
            if (step.status === "loading") {
              return { ...step, status: "error", error: (e as Error).message };
            }
            return step;
          })
        );

        throw e;
      }
    },
  });

  return { steps, mutation, txHash };
};
*/

export const useDeposit = () => {
    
}