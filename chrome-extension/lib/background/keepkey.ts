import { AssetValue } from '@pioneer-platform/helpers';
import { Chain, ChainToNetworkId, getChainEnumValue } from '@coinmasters/types';
import { getPaths } from "@pioneer-platform/pioneer-coins";
import { keepKeyApiKeyStorage } from '@chrome-extension-boilerplate/storage'; // Import both storages

interface KeepKeyWallet {
    type: string;
    icon: string;
    chains: string[];
    wallet: any;
    status: string;
    isConnected: boolean;
}

const getWalletByChain = async (keepkey: any, chain: any) => {
    if (!keepkey[chain]) return null;

    const walletMethods = keepkey[chain].walletMethods;
    const address = await walletMethods.getAddress();
    if (!address) return null;

    let balance = [];
    if (walletMethods.getPubkeys) {
        const pubkey = await walletMethods.getPubkeys();
        console.log('** pubkey: ', pubkey);
        const pubkeyBalance = await walletMethods.getBalance([pubkey]);
        console.log('pubkeyBalance: ', pubkeyBalance);
        const assetValue = AssetValue.fromChainOrSignature(
            chain,
            "0.001",
        );
        balance = [assetValue];
    } else {
        balance = await walletMethods.getBalance([{ address }]);
    }

    return { address, balance };
};

export const onStartKeepkey = async function () {
    try {
        const chains = ['ETH'];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');

        const walletKeepKey: KeepKeyWallet = {
            type: 'KEEPKEY',
            icon: '',
            chains,
            wallet: keepkeyWallet,
            status: 'offline',
            isConnected: false,
        };

        const allByCaip = chains.map((chainStr) => {
            const chain = getChainEnumValue(chainStr);
            if (chain) {
                return ChainToNetworkId[chain];
            }
            return undefined;
        });

        const paths = getPaths(allByCaip);
        const keepkey: any = {};

        function addChain({ info, keepkeySdk, chain, walletMethods, wallet }) {
            keepkey[chain] = {
                info,
                keepkeySdk,
                walletMethods,
                wallet,
            };
        }

        const keepkeyConfig = {
            apiKey: await keepKeyApiKeyStorage.getApiKey() || '123',
            pairingInfo: {
                name: "Wallet Connect",
                imageUrl: "https://assets-global.website-files.com/61e4755aed304a1902077c92/6580b382048a90097562ccf5_6580b21b381a5d791651cd35_WalletConnect-Homepage-p-800.png",
                basePath: 'http://localhost:1646/spec/swagger.json',
                url: 'http://localhost:1646',
            }
        };

        const covalentApiKey = 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q';
        const ethplorerApiKey = 'EK-xs8Hj-qG4HbLY-LoAu7';
        const utxoApiKey = 'B_s9XK926uwmQSGTDEcZB3vSAmt5t2';
        const input = {
            apis: {},
            rpcUrls: {},
            addChain,
            config: { keepkeyConfig, covalentApiKey, ethplorerApiKey, utxoApiKey },
        };

        // Step 1: Invoke the outer function with the input object
        const connectFunction = walletKeepKey.wallet.connect(input);

        // Step 2: Invoke the inner function with chains and paths
        const kkApikey = await connectFunction(chains, paths);
        console.log("kkApikey: ", kkApikey);
        await keepKeyApiKeyStorage.saveApiKey(kkApikey.keepkeyApiKey); // Save the API key using custom storage

        // got balances
        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];
            const walletData: any = await getWalletByChain(keepkey, chain);
            console.log("chain: ", chain);
            keepkey[chain].wallet.balance = walletData.balance;
        }

        return keepkey;
    } catch (e) {
        console.error(e);
        throw e;
    }
};
