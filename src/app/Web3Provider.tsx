"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  Chain,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const customNetworkc: Chain = {
    id: 421614,
    name: 'Arbitrum Sepolia',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://sepolia-rollup.arbitrum.io/rpc'],
        }
    },
    blockExplorers: {
        default: {
            name: 'Sepolia Arbiscan io',
            url: 'https://sepolia.arbiscan.io/',
        }
    }
}

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '9bd28133815f481b0322face1ddcdc15',
  chains: [customNetworkc, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
});

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};