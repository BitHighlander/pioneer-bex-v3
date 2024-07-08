/*
    Pioneer Wallet Browser Extension
    Background Script

            -Highlander

 */
import { toggleTheme } from '@lib/toggleTheme';
const TAG = ' | content | ';
console.log('content script loaded');

void toggleTheme();

// Listen for messages from the web page
window.addEventListener('message', event => {
  if (event.source !== window || !event.data || event.data.type !== 'ETH_REQUEST') return;

  const { method, params } = event.data;

  // Forward the request to the background script
  chrome.runtime.sendMessage({ type: 'ETH_REQUEST', method, params }, response => {
    // Send the response back to the web page
    window.postMessage({ type: 'ETH_RESPONSE', method, result: response }, '*');
  });
});

// Inject the provider script early in the document lifecycle
const injectProviderScript = () => {
  const container = document.head || document.documentElement;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  container.insertBefore(script, container.children[0]);
  script.onload = () => script.remove();
};
injectProviderScript();

//from rabby
// const injectProviderScript = (isDefaultWallet: boolean) => {
//   // the script element with src won't execute immediately
//   // use inline script element instead!
//   const container = document.head || document.documentElement;
//   const ele = document.createElement('script');
//   // in prevent of webpack optimized code do some magic(e.g. double/sigle quote wrap),
//   // separate content assignment to two line
//   // use AssetReplacePlugin to replace pageprovider content
//   ele.setAttribute('src', chrome.runtime.getURL('injected.js'));
//   container.insertBefore(ele, container.children[0]);
//   container.removeChild(ele);
// };
// injectProviderScript(false);

// Inject MetaMask provider script early in the document lifecycle

// const script = document.createElement('script');
// script.src = chrome.runtime.getURL('injected.js');
// script.async = false;  // Ensure the script executes in order
// (document.head || document.documentElement).appendChild(script);
