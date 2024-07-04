/*
    Pioneer Wallet Browser Extension
    Background Script

            -Highlander

 */
import { toggleTheme } from '@lib/toggleTheme';
const TAG = ' | background | ';
console.log('content script loaded');

void toggleTheme();

const mockedAddress = '0x141D9959cAe3853b035000490C03991eB70Fc4aC';
const mockResponses = {
  eth_accounts: [mockedAddress],
  eth_requestAccounts: [mockedAddress],
  eth_chainId: '0x1',
  net_version: '1',
  eth_getBlockByNumber: {
    baseFeePerGas: '0x1',
  },
  eth_sign: '0xMockedSignature',
  personal_sign: '0xMockedPersonalSignature',
  eth_signTypedData: '0xMockedTypedDataSignature',
  eth_signTypedData_v3: '0xMockedTypedDataV3Signature',
  eth_signTypedData_v4: '0xMockedTypedDataV4Signature',
  eth_getEncryptionPublicKey: '0xMockedEncryptionPublicKey',
  eth_decrypt: '0xMockedDecryptionResult',
  eth_sendTransaction: '0xMockedTransactionHash',
  wallet_addEthereumChain: true,
  wallet_switchEthereumChain: true,
  wallet_watchAsset: true,
  wallet_requestPermissions: [{ parentCapability: 'eth_accounts' }],
  wallet_getPermissions: [{ parentCapability: 'eth_accounts' }],
};

// Listen for messages from the injected script
window.addEventListener('message', (event: MessageEvent) => {
  const tag = 'ETH_MOCK | window.addEventListener | ';
  console.log(tag, 'event:', event);
  if (event.source !== window || !event.data || event.data.type !== 'ETH_REQUEST') return;

  console.log(tag, 'Content script received ETH_REQUEST:', event.data);
  const { method, params } = event.data;
  console.log(tag, 'method:', method);
  console.log(tag, 'params:', params);

  handleEthereumRequest(method, params)
    .then(result => {
      window.postMessage({ type: 'ETH_RESPONSE', method, result }, '*');
    })
    .catch(error => {
      window.postMessage({ type: 'ETH_RESPONSE', method, error: error.message }, '*');
    });
});

async function handleEthereumRequest(method: string, params: any) {
  const tag = 'ETH_MOCK | handleEthereumRequest | ';
  console.log(tag, 'Handling method:', method);
  console.log(tag, 'With params:', params);

  if (Object.prototype.hasOwnProperty.call(mockResponses, method)) {
    console.log(tag, 'Mocking response for method:', method);
    return mockResponses[method];
  } else {
    console.log(tag, 'No mock response for method:', method);
    throw new Error(`Mock response for method ${method} not implemented`);
  }
}

//from rabby
const injectProviderScript = (isDefaultWallet: boolean) => {
  // the script element with src won't execute immediately
  // use inline script element instead!
  const container = document.head || document.documentElement;
  const ele = document.createElement('script');
  // in prevent of webpack optimized code do some magic(e.g. double/sigle quote wrap),
  // separate content assignment to two line
  // use AssetReplacePlugin to replace pageprovider content
  ele.setAttribute('src', chrome.runtime.getURL('injected.js'));
  container.insertBefore(ele, container.children[0]);
  container.removeChild(ele);
};
injectProviderScript(false);

// Inject MetaMask provider script early in the document lifecycle

// const script = document.createElement('script');
// script.src = chrome.runtime.getURL('injected.js');
// script.async = false;  // Ensure the script executes in order
// (document.head || document.documentElement).appendChild(script);
