// src/utils/onStartApp.tsx
import { usePioneer } from '@coinmasters/pioneer-react';
import { WalletOption, availableChainsByWallet } from '@coinmasters/types';

export const useOnStartApp = () => {
  const { onStart } = usePioneer();

  const onStartApp = async () => {
    try {
      const walletsVerbose = [];

      const pioneerSetup: any = {
        appName: 'Pioneer',
        appIcon: 'https://pioneers.dev/coins/pioneerMan.png',
      };

      const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
      const walletKeepKey = {
        type: WalletOption.KEEPKEY,
        icon: 'https://pioneers.dev/coins/keepkey.png',
        chains: availableChainsByWallet[WalletOption.KEEPKEY],
        wallet: keepkeyWallet,
        status: 'offline',
        isConnected: false,
      };
      // Push the keepkey wallet to the wallets array
      walletsVerbose.push(walletKeepKey);

      // Call onStart with the populated walletsVerbose array and pioneerSetup object
      onStart(walletsVerbose, pioneerSetup);
    } catch (e) {
      console.error('Failed to start app!', e);
    }
  };

  return onStartApp;
};
