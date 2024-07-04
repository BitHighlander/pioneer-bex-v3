import { toggleTheme } from '@lib/toggleTheme';

console.log('content script loaded');

void toggleTheme();

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
