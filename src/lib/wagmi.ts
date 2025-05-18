'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  okxWallet,
  rabbyWallet,
  rainbowWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';

export function useWagmiConfig() {
  const projectId = '9bd28133815f481b0322face1ddcdc15';
//   if (!projectId) {
//     const providerErrMessage =
//       'To connect to all Wallets you need to provide a NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID env variable';
//     throw new Error(providerErrMessage);
//   }

  return useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [okxWallet, rabbyWallet, metaMaskWallet, trustWallet],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet],
        },
      ],
      {
        appName: 'Connectors',
        projectId,
      },
    );

    const wagmiConfig = createConfig({
      chains: [arbitrumSepolia],
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_TESTNET)
      },
    });

    return wagmiConfig;
  }, [projectId]);
}