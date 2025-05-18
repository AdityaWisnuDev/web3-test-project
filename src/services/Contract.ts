import { VaultAddress, MockUSDCAddress } from "./ContractAddress";
import { VaultAbi, MockUSDCAbi } from "./abi";

export const ValutContractConfig = {
    address: VaultAddress,
    abi: VaultAbi,
} as const

export const MockUSDCContractConfig = {
    address: MockUSDCAddress,
    abi: MockUSDCAbi,
} as const

