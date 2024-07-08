(function () {
  const TAG = ' | InjectedScript | ';
  const VERSION = '1.0.1';
  console.log('**** Pioneer Injection script ****: ', VERSION);

  async function ethereumRequest(method, params = []) {
    let tag = TAG + ' | ethereumRequest | ';
    try {
      console.log(tag, 'method:', method);
      console.log(tag, 'params:', params);

      return await new Promise((resolve, reject) => {
        // Send the request to the content script
        window.postMessage({ type: 'ETH_REQUEST', method, params, tag: TAG }, '*');

        // Listen for the response from the content script
        function handleMessage(event) {
          // console.log(tag, 'event:', event);
          // console.log(tag, 'event.data:', event.data);
          // console.log(tag, 'event.data.type:', event.data.type);
          // console.log(tag, 'event.data.result:', event.data.result);
          if (event.data.result) resolve(event.data.result);
        }

        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error(tag, `Error in ${TAG}:`, error);
      throw error;
    }
  }

  function sendRequestAsync(payload, callback) {
    const tag = TAG + ' | sendRequestAsync | ';
    console.log(tag, 'ethereum.sendAsync called with:', payload);
    ethereumRequest(payload.method, payload.params).then(
      result => callback(null, { id: payload.id, jsonrpc: '2.0', result }),
      error => callback(error),
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
      chainId: '0x1', // Ensure chainId is correctly set
      networkVersion: '1', // Ensure networkVersion is correctly set
    };

    const handler = {
      get: function (target, prop, receiver) {
        console.log(tag, `Proxy get handler: ${prop}`);
        return Reflect.get(target, prop, receiver);
      },
      set: function (target, prop, value) {
        console.log(tag, `Proxy set handler: ${prop} = ${value}`);
        return Reflect.set(target, prop, value);
      },
    };

    const proxyEthereum = new Proxy(ethereum, handler);

    const info = {
      uuid: '350670db-19fa-4704-a166-e52e178b59d2',
      name: 'Pioneer Wallet',
      icon: 'https://pioneers.dev/coins/pioneerMan.png',
      rdns: 'dev.pioneers',
    };

    const announceEvent = new CustomEvent('eip6963:announceProvider', {
      detail: Object.freeze({ info, provider: proxyEthereum }),
    });

    function announceProvider() {
      window.dispatchEvent(announceEvent);
    }

    window.addEventListener('eip6963:requestProvider', () => {
      announceProvider();
    });

    announceProvider();

    Object.defineProperty(window, 'ethereum', {
      value: proxyEthereum,
      writable: false,
      configurable: true,
    });
    console.log(tag, 'window.ethereum has been mounted');
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    mountEthereum();
  } else {
    document.addEventListener('DOMContentLoaded', mountEthereum);
  }
})();
