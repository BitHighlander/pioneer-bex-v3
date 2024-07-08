import { JsonRpcProvider } from 'ethers';

export const handleEthereumRequest = async (
  method: string,
  params: any[],
  provider: JsonRpcProvider,
  KEEPKEY_SDK: any,
  ADDRESS: string,
): Promise<any> => {
  const tag = 'ETH_MOCK | handleEthereumRequest | ';
  console.log(tag, 'method:', method);
  console.log(tag, 'params:', params);

  try {
    switch (method) {
      case 'eth_chainId':
        console.log(tag, 'Returning eth_chainId:', '0x1');
        return '0x1';
      case 'net_version':
        console.log(tag, 'Returning net_version:', '1');
        return '1';
      case 'eth_getBlockByNumber':
        console.log(tag, 'Calling eth_getBlockByNumber with:', params);
        return await provider.getBlock(params[0]);
      case 'eth_blockNumber':
        console.log(tag, 'Calling eth_blockNumber');
        return await provider.getBlockNumber();
      case 'eth_getBalance':
        console.log(tag, 'Calling eth_getBalance with:', params);
        return await provider.getBalance(params[0], params[1]);
      case 'eth_getTransactionReceipt':
        console.log(tag, 'Calling eth_getTransactionReceipt with:', params);
        return await provider.getTransactionReceipt(params[0]);
      case 'eth_getTransactionByHash':
        console.log(tag, 'Calling eth_getTransactionByHash with:', params);
        return await provider.getTransaction(params[0]);
      case 'eth_call':
        console.log(tag, 'Calling eth_call with:', params);
        return await provider.call(params[0]);
      case 'eth_estimateGas':
        console.log(tag, 'Calling eth_estimateGas with:', params);
        return await provider.estimateGas(params[0]);
      case 'eth_gasPrice':
        console.log(tag, 'Calling eth_gasPrice');
        return await provider.getGasPrice();
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain':
      case 'wallet_watchAsset':
        console.log(tag, method + ' Returning true');
        // TODO: Implement network change handling if needed
        return true;
      case 'wallet_getPermissions':
      case 'wallet_requestPermissions':
        return [{ parentCapability: 'eth_accounts' }];
      case 'eth_accounts':
        console.log(tag, 'Returning eth_accounts:', [ADDRESS]);
        return [ADDRESS];
      case 'eth_requestAccounts':
        console.log(tag, 'Returning eth_requestAccounts:', [ADDRESS]);
        return [ADDRESS];
      case 'eth_sign':
        console.log(tag, 'Calling signMessage with:', params[1]);
        return await signMessage(params[1], KEEPKEY_SDK);
      case 'eth_sendTransaction':
        console.log(tag, 'Calling sendTransaction with:', params[0]);
        return sendTransaction(params, provider, KEEPKEY_SDK, ADDRESS);
      case 'eth_signTransaction':
        console.log(tag, 'Calling signTransaction with:', params[0]);
        return await signTransaction(params[0], provider, KEEPKEY_SDK);
      case 'eth_sendRawTransaction':
        console.log(tag, 'Calling broadcastTransaction with:', params[0], 'and chainId 1');
        return await broadcastTransaction(params[0], '1', provider); // Assuming chainId is 1
      case 'eth_signTypedData':
        // eslint-disable-next-line no-case-declarations
        const typedData = {
          types: { Message: params[0].map(param => ({ name: param.name, type: param.type })) },
          primaryType: 'Message',
          domain: {},
          message: params[0].reduce((msg, param) => {
            msg[param.name] = param.value;
            return msg;
          }, {}),
        };
        //TODO does ADDRESS = params[0]?
        return await signTypedData(typedData, KEEPKEY_SDK, ADDRESS);
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4':
        /*
                params[0] = address
                params[1] = typedData (as string)
                 */
        console.log(tag, 'Calling signTypedData_v* with:', params[1]);
        //TODO does ADDRESS = params[0]?
        return await signTypedData(params[1], KEEPKEY_SDK, ADDRESS);
      default:
        console.log(tag, `Method ${method} not supported`);
        throw new Error(`Method ${method} not supported`);
    }
  } catch (error) {
    console.error(tag, `Error processing method ${method}:`, error);
    throw error;
  }
};

const signMessage = async (message: any, KEEPKEY_SDK: any) => {
  try {
    console.log('signMessage: ', message);
    console.log('KEEPKEY_SDK.ETH.walletMethods: ', KEEPKEY_SDK.ETH.walletMethods);

    const address = KEEPKEY_SDK.ETH.wallet.address;
    const messageFormatted = `0x${Buffer.from(
      Uint8Array.from(typeof message === 'string' ? new TextEncoder().encode(message) : message),
    ).toString('hex')}`;
    return KEEPKEY_SDK.eth.ethSign({ address, message: messageFormatted });
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const signTransaction = async (transaction: any, provider: JsonRpcProvider, KEEPKEY_SDK: any) => {
  const tag = ' | signTransaction | ';
  try {
    console.log(tag, '**** transaction: ', transaction);

    if (!transaction.from) throw Error('invalid tx missing from');
    if (!transaction.to) throw Error('invalid tx missing to');
    if (!transaction.chainId) throw Error('invalid tx missing chainId');

    const nonce = await provider.getTransactionCount(transaction.from, 'pending');
    transaction.nonce = `0x${nonce.toString(16)}`;

    const feeData = await provider.getFeeData();
    console.log('feeData: ', feeData);
    transaction.gasPrice = `0x${BigInt(feeData.gasPrice || '0').toString(16)}`;
    transaction.maxFeePerGas = `0x${BigInt(feeData.maxFeePerGas || '0').toString(16)}`;
    transaction.maxPriorityFeePerGas = `0x${BigInt(feeData.maxPriorityFeePerGas || '0').toString(16)}`;

    try {
      const estimatedGas = await provider.estimateGas({
        from: transaction.from,
        to: transaction.to,
        data: transaction.data,
      });
      console.log('estimatedGas: ', estimatedGas);
      transaction.gas = `0x${estimatedGas.toString(16)}`;
    } catch (e) {
      transaction.gas = `0x${BigInt('1000000').toString(16)}`;
    }

    const input: any = {
      from: transaction.from,
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      data: transaction.data || '0x',
      nonce: transaction.nonce,
      gasLimit: transaction.gas,
      gas: transaction.gas,
      value: transaction.value || '0x0',
      to: transaction.to,
      chainId: `0x${transaction.chainId.toString(16)}`,
      gasPrice: transaction.gasPrice,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
    };

    console.log(`${tag} Final input: `, input);
    console.log(`${tag} KEEPKEY_SDK: `, KEEPKEY_SDK);
    const output = await KEEPKEY_SDK.eth.ethSignTransaction(input);
    console.log(`${tag} Transaction output: `, output);

    return output.serialized;
  } catch (e) {
    console.error(`${tag} Error: `, e);
    throw e;
  }
};

const isAddress = (address: string) => {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address);
};

export function getSignTypedDataParamsData(params: string[]) {
  const data = params.filter(p => !isAddress(p))[0];

  if (typeof data === 'string') {
    return JSON.parse(data);
  }

  return data;
}

const signTypedData = async (params: any, KEEPKEY_SDK: any, ADDRESS: string) => {
  const tag = ' | signTypedData | ';
  try {
    console.log(tag, '**** params: ', params);
    console.log(tag, '**** params: ', typeof params);
    if (typeof params === 'string') params = JSON.parse(params);

    const payload = {
      address: ADDRESS,
      addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
      typedData: params,
    };
    console.log(tag, '**** payload: ', payload);

    const signedMessage = await KEEPKEY_SDK.eth.ethSignTypedData(payload);
    console.log(tag, '**** signedMessage: ', signedMessage);
    return signedMessage;
  } catch (e) {
    console.error(`${tag} Error: `, e);
    throw e;
  }
};

const broadcastTransaction = async (signedTx: string, networkId: string, provider: JsonRpcProvider) => {
  try {
    const receipt = await provider.send('eth_sendRawTransaction', [signedTx]);
    console.log('Transaction receipt:', receipt);

    return receipt;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const sendTransaction = async (transaction: any, provider: JsonRpcProvider, KEEPKEY_SDK: any, ADDRESS: string) => {
  const tag = ' | sendTransaction | ';
  try {
    // chrome.runtime.sendMessage({ action: 'openPopup', request: transaction }, (response: any) => {
    //     console.log('Popup open response: ', response);
    //     console.log('response:', response);
    // });
    //
    // const waitForUserDecision = () => {
    //     return new Promise<{ decision: string }>((resolve, reject) => {
    //         const listener = (message: any, sender: any, sendResponse: any) => {
    //             if (message.action === 'responsePopup') {
    //                 console.log(tag, '****** RESPONSE FROM POPUP ******');
    //                 console.log(tag, 'Decision:', message.decision);
    //                 chrome.runtime.onMessage.removeListener(listener);
    //                 resolve(message);
    //             }
    //             return false;
    //         };
    //         chrome.runtime.onMessage.addListener(listener);
    //     });
    // };
    //
    // const userResponse = await waitForUserDecision();

    const userResponse = { decision: 'accept' };

    if (userResponse.decision === 'accept') {
      console.log(tag, 'User accepted the request');
      console.log(tag, 'transaction:', transaction);
      const params = transaction[0];
      const chainId = '0x1';
      params.chainId = chainId;
      params.from = ADDRESS;
      const signedTx = await signTransaction(params, provider, KEEPKEY_SDK);
      console.log(tag, 'signedTx:', signedTx);

      //TODO broadcast transaction

      const result = '0x1234567890abcdef';
      return result;
    } else if (userResponse.decision === 'reject') {
      console.log(tag, 'User rejected the request');
      throw new Error('User rejected the transaction');
    }
  } catch (e) {
    console.error(e);
  }
};
