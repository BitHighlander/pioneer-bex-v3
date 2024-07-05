import 'webextension-polyfill';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';
import packageJson from '../../package.json'; // Adjust the path as needed
import { onStartKeepkey } from './keepkey';
import { handleEthereumRequest } from './methods';
import { JsonRpcProvider } from 'ethers';
const TAG = " | background | ";
console.log('background script loaded');
console.log('Version:', packageJson.version);

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

const EIP155_CHAINS = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://eth.llamarpc.com',
    namespace: 'eip155',
  },
};
const provider = new JsonRpcProvider(EIP155_CHAINS['eip155:1'].rpc);

//Begin KK
let ADDRESS = '';
let KEEPKEY_SDK: any = '';
const onStart = async function () {
  const tag = TAG + ' | onStart | ';
  try {
    console.log(tag, 'Starting...');
    // Connecting to KeepKey
    const keepkey = await onStartKeepkey();
    console.log(tag, 'keepkey: ', keepkey);
    const address = keepkey.ETH.wallet.address;
    console.log(tag, 'address: ', address);

    // Set addresses
    ADDRESS = address;
    console.log(tag, '**** keepkey: ', keepkey);
    KEEPKEY_SDK = keepkey.ETH.keepkeySdk;
    console.log(tag, 'keepkeySdk: ', KEEPKEY_SDK);
  } catch (e) {
    console.error(tag, 'e: ', e);
  }
};
onStart();

// async function handleEthereumRequest(method, params) {
//   const tag = 'ETH_MOCK | handleEthereumRequest | ';
//
//   // const mockedAddress = '0x141D9959cAe3853b035000490C03991eB70Fc4aC';
//   const mockResponses = {
//     eth_accounts: [ADDRESS],
//     eth_requestAccounts: [ADDRESS],
//     eth_chainId: '0x1',
//     net_version: '1',
//     eth_getBlockByNumber: {
//       baseFeePerGas: '0x1',
//     },
//     eth_sign: '0xMockedSignature',
//     personal_sign: '0xMockedPersonalSignature',
//     eth_signTypedData: '0xMockedTypedDataSignature',
//     eth_signTypedData_v3: '0xMockedTypedDataV3Signature',
//     eth_signTypedData_v4: '0xMockedTypedDataV4Signature',
//     eth_getEncryptionPublicKey: '0xMockedEncryptionPublicKey',
//     eth_decrypt: '0xMockedDecryptionResult',
//     eth_sendTransaction: '0xMockedTransactionHash',
//     wallet_addEthereumChain: true,
//     wallet_switchEthereumChain: true,
//     wallet_watchAsset: true,
//     wallet_requestPermissions: [{ parentCapability: 'eth_accounts' }],
//     wallet_getPermissions: [{ parentCapability: 'eth_accounts' }],
//   };
//
//
//   console.log(tag, 'ADDRESS:', ADDRESS);
//   console.log(tag, 'Handling method:', method);
//   console.log(tag, 'With params:', params);
//
//   if (Object.prototype.hasOwnProperty.call(mockResponses, method)) {
//     console.log(tag, 'Mocking response for method:', method);
//     return mockResponses[method];
//   } else {
//     console.log(tag, 'No mock response for method:', method);
//     throw new Error(`Mock response for method ${method} not implemented`);
//   }
// }

console.log('background loaded');
console.log("Edit 'chrome-extension/lib/background/index.ts' and save to reload.");



// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tag = 'ETH_MOCK | chrome.runtime.onMessage | ';
  console.log(tag, 'message:', message);

  if (message.type === 'ETH_REQUEST') {
    console.log(tag, 'Background script received ETH_REQUEST:', message);
    const { method, params } = message;
    console.log(tag, 'method:', method);
    console.log(tag, 'params:', params);
    console.log(tag, 'ADDRESS:', ADDRESS);
    // console.log(tag, 'KEEPKEY_SDK:', KEEPKEY_SDK);

    handleEthereumRequest(method, params, provider, KEEPKEY_SDK, ADDRESS)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ error: error.message });
        });

    return true; // Indicates that the response is asynchronous
  }
});



