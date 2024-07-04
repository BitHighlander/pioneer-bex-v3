import { toggleTheme } from '@lib/toggleTheme';

console.log('content script loaded');

void toggleTheme();

// Inject MetaMask provider
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);
