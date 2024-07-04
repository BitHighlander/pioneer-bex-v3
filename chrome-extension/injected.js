(function () {
  const TAG = ' | InjectedScript | ';
  const VERSION = '1.0.1';
  console.log('**** Pioneer Injection script ****: ', VERSION);
  const mockedAddress = '0x1241D9959cAe3853b035000490C03991eB70Fc4aC';
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

  function ethereumRequest(method, params = []) {
    const tag = TAG + ' | ethereumRequest | ';
    console.log(tag, 'ethereum.request called with:', method, params);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockResponses[method] !== undefined) {
          resolve(mockResponses[method]);
        } else {
          reject(new Error(`Method ${method} not supported`));
        }
      }, 100);
    });
  }

  function sendRequestAsync(payload, callback) {
    const tag = TAG + ' | sendRequestAsync | ';
    console.log(tag, 'ethereum.sendAsync called with:', payload);
    ethereumRequest(payload.method, payload.params).then(
        result => callback(null, { id: payload.id, jsonrpc: '2.0', result }),
        error => callback(error)
    );
  }

  function sendRequestSync(payload) {
    const tag = TAG + ' | sendRequestSync | ';
    console.log(tag, 'ethereum.sendSync called with:', payload);
    return {
      id: payload.id,
      jsonrpc: '2.0',
      result: ethereumRequest(payload.method, payload.params),
    };
  }

  function mountEthereum() {
    const tag = TAG + ' | mountEthereum | ';
    const ethereum = {
      isMetaMask: true,
      request: async ({ method, params }) => {
        console.log(tag, 'ethereum.request called with:', method, params);
        return ethereumRequest(method, params);
      },
      send: (payload, callback) => {
        if (callback) {
          sendRequestAsync(payload, callback);
        } else {
          return sendRequestSync(payload);
        }
      },
      sendAsync: (payload, callback) => {
        sendRequestAsync(payload, callback);
      },
      on: (event, handler) => {
        console.log(tag, `event registered: ${event}`);
        window.addEventListener(event, handler);
      },
      removeListener: (event, handler) => {
        console.log(tag, `event unregistered: ${event}`);
        window.removeEventListener(event, handler);
      },
    };
    Object.defineProperty(window, 'ethereum', {
      value: ethereum,
      writable: false,
      configurable: true,
    });
    console.log(tag, 'window.ethereum has been mounted');
  }

  function ensureEthereum() {
    const tag = TAG + ' | ensureEthereum | ';
    if (window.ethereum && !window.ethereum.isMetaMask) {
      console.log(tag, 'window.ethereum already exists. Replacing it...');
      delete window.ethereum;
      mountEthereum();
    } else if (!window.ethereum) {
      mountEthereum();
    }
  }

  // Initial check
  ensureEthereum();

  // Use MutationObserver to watch for changes to window.ethereum
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'subtree') {
        ensureEthereum();
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Also use an interval as a fallback
  setInterval(() => {
    ensureEthereum();
  }, 1000);
})();
