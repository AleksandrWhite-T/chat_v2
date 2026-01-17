import { ethers } from 'ethers';

export const CONTRACT_CONFIG = {
  ADDRESS: '0xA4dEC8E76dc65D90343C4d91DD8C4d187E46Cd85',
  OWNER_ADDRESS: '0xBEe0eCb78Ea888fDd859B3019DfCDeA53fa172D6',
  ABI: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "initialSupply",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "messageHash",
          "type": "bytes32"
        }
      ],
      "name": "MessageSent",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "addToWhiteList",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getAllMessages",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "hash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct CorporateMessenger.Message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getReceivedMessages",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "hash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct CorporateMessenger.Message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSentMessages",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "hash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct CorporateMessenger.Message[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isInWhiteList",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "removeFromWhiteList",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        }
      ],
      "name": "sendMessage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
    ,
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "messageHash",
          "type": "bytes32"
        }
      ],
      "name": "logMessageHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

export async function createReadOnlyContract() {
  try {
    // Try Metamask first if available
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
        return contract;
      } catch (metamaskError) {
        console.warn('metamask unavailable:', metamaskError.message);
      }
    }
    
    // Fallback to public RPC nodes
    const rpcUrls = [
      'https://polygon-rpc.com', // Polygon mainnet (priority)
      'https://rpc-mainnet.matic.network', // Polygon mainnet (alternative)
      'https://rpc-mainnet.maticvigil.com', // Polygon mainnet (reserve)
      'https://eth.llamarpc.com', // Ethereum mainnet
      'https://sepolia.gateway.tenderly.co', // Sepolia testnet
      'https://bsc-dataseed1.binance.org', // BSC mainnet
      'https://data-seed-prebsc-1-s1.binance.org:8545', // BSC testnet
      'https://arb1.arbitrum.io/rpc', // Arbitrum One
      'https://mainnet.optimism.io' // Optimism
    ];
    
    // Try each RPC until one works - some might be rate limited
    for (const rpcUrl of rpcUrls) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
        
        const code = await provider.getCode(CONTRACT_CONFIG.ADDRESS);
        if (code !== '0x') {
          return contract;
        }
      } catch (rpcError) {
        console.warn(`rpc ${rpcUrl} unavailable:`, rpcError.message);
        continue;
      }
    }
    
    throw new Error('Failed to create read-only contract: contract not found in any of the supported networks');
  } catch (error) {
    console.error('Error creating read-only contract:', error);
    throw error;
  }
}

export async function createWritableContract() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not connected');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const network = await provider.getNetwork();
    
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, signer);
    
    const signerAddress = await signer.getAddress();
    console.log('Contract signer address:', signerAddress);
    
    return contract;
  } catch (error) {
    console.error('writable contract failed:', error);
    
    if (error.code === 4001) {
      throw new Error('User rejected the request in MetaMask');
    } else if (error.code === -32002) {
      throw new Error('MetaMask is already processing a request. Check MetaMask.');
    } else if (error.message.includes('network')) {
      throw new Error('Network issue. Check your internet connection and MetaMask settings.');
    }
    
    throw error;
  }
}

export async function checkWhitelist(address) {
  try {
    const isValid = ethers.isAddress(address);
    if (!isValid) {
      throw new Error('Invalid Ethereum address');
    }

    let contract;
    let provider;
    let networkInfo = null;
    
    // Prefer Metamask provider if connected to correct network
    if (window.ethereum) {
      try {
        provider = new ethers.BrowserProvider(window.ethereum);
        networkInfo = await provider.getNetwork();
        contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
      } catch (metamaskError) {
        console.warn('metamask unavailable:', metamaskError.message);
        const rpcUrls = [
          'https://polygon-rpc.com',
          'https://rpc-mainnet.matic.network',
          'https://rpc-mainnet.maticvigil.com',
          'https://eth.llamarpc.com',
          'https://sepolia.gateway.tenderly.co',
          'https://bsc-dataseed1.binance.org',
          'https://data-seed-prebsc-1-s1.binance.org:8545',
          'https://arb1.arbitrum.io/rpc',
          'https://mainnet.optimism.io'
        ];
        
        for (let i = 0; i < rpcUrls.length; i++) {
          const rpcUrl = rpcUrls[i];
          try {
            provider = new ethers.JsonRpcProvider(rpcUrl);
            networkInfo = await provider.getNetwork();
            contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
            break;
          } catch (rpcError) {
            console.warn('rpc ' + rpcUrl + ' unavailable:', rpcError.message);
            continue;
          }
        }
        
        if (!contract) {
          throw new Error('Failed to connect to any RPC provider');
        }
      }
    } else {
      provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
      networkInfo = await provider.getNetwork();
      contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
    }

    try {
      const code = await provider.getCode(CONTRACT_CONFIG.ADDRESS);
      if (code === '0x') {
        throw new Error(`Contract not found at address ${CONTRACT_CONFIG.ADDRESS} in network ${networkInfo?.name || 'unknown'}. The contract may be deployed in a different network.`);
      }
      
      const contractName = await contract.name();
      const contractSymbol = await contract.symbol();
      const contractOwner = await contract.owner();
    } catch (basicError) {
      console.error('contract check failed:', basicError);
      
      if (basicError.message.includes('Contract not found')) {
        throw basicError;
      }
    }

    // 15s timeout because some RPC nodes are slow
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: exceeded waiting time for contract response')), 15000);
    });
    
    const whitelistPromise = contract.isInWhiteList(address);
    const isWhitelisted = await Promise.race([whitelistPromise, timeoutPromise]);
    
    return Boolean(isWhitelisted);
  } catch (error) {
    console.error('whitelist check failed:', error);
    console.error('error details:', {
      message: error.message,
      code: error.code,
      data: error.data,
      reason: error.reason,
      stack: error.stack
    });
    
    if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
      throw new Error(`Contract cannot process the request. The contract may be deployed in a different network or the ABI does not match the contract.`);
    } else if (error.message.includes('Contract not found')) {
      throw new Error(error.message);
    } else if (error.message.includes('network') || error.message.includes('Network Error')) {
      throw new Error('Network error. Check your internet connection and MetaMask settings.');
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Network response timeout exceeded. Please try again.');
    } else if (error.message.includes('execution reverted')) {
      throw new Error('Contract rejected the request. Check the contract address.');
    }
    
    throw new Error(`Whitelist check error: ${error.message}`);
  }
}

export async function getTokenBalance(address) {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    let contract;
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
      } catch (metamaskError) {
        console.warn('metamask unavailable:', metamaskError.message);
        const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
        contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
      }
    } else {
      const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth');
      contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, provider);
    }

    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    const formattedBalance = ethers.formatUnits(balance, decimals);
    return formattedBalance;
  } catch (error) {
    console.error('balance check failed:', error);
    console.error('error details:', {
      message: error.message,
      code: error.code,
      data: error.data,
      reason: error.reason
    });
    
    if (error.code === 'BAD_DATA' || error.message.includes('could not decode result data')) {
      throw new Error('Balance retrieval error: failed to decode contract data');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Check your internet connection.');
    }
    
    throw new Error(`Balance retrieval error: ${error.message}`);
  }
}

export async function sendMessageToContract(recipient, content) {
  try {
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    const contract = await createWritableContract();
    const tx = await contract.sendMessage(recipient, content.trim());
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('send message failed:', error);
    
    if (error.message.includes('Not authorized: you need CORP tokens')) {
      throw new Error('You do not have enough CORP tokens to send messages');
    } else if (error.message.includes('Not authorized: you are not in the white list')) {
      throw new Error('Your address is not in the whitelist');
    } else if (error.message.includes('Invalid recipient')) {
      throw new Error('Invalid recipient address');
    } else if (error.message.includes('Empty message')) {
      throw new Error('Message cannot be empty');
    }
    
    throw new Error(`Message sending error: ${error.message}`);
  }
}

export async function getReceivedMessages() {
  try {
    const contract = await createWritableContract();
    const messages = await contract.getReceivedMessages();
    
    const formattedMessages = messages.map(msg => ({
      sender: msg.sender,
      recipient: msg.recipient,
      content: msg.content,
      timestamp: Number(msg.timestamp),
      hash: msg.hash,
      date: new Date(Number(msg.timestamp) * 1000)
    }));
    
    return formattedMessages;
  } catch (error) {
    console.error('get messages failed:', error);
    throw new Error(`Message retrieval error: ${error.message}`);
  }
}

export async function getSentMessages() {
  try {
    const contract = await createWritableContract();
    const messages = await contract.getSentMessages();
    
    const formattedMessages = messages.map(msg => ({
      sender: msg.sender,
      recipient: msg.recipient,
      content: msg.content,
      timestamp: Number(msg.timestamp),
      hash: msg.hash,
      date: new Date(Number(msg.timestamp) * 1000)
    }));
    
    return formattedMessages;
  } catch (error) {
    console.error('get sent messages failed:', error);
    throw new Error(`Sent message retrieval error: ${error.message}`);
  }
}

export function calculateMessageHash(content) {
  try {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(content));
    return hash;
  } catch (error) {
    console.error('hash calc failed:', error);
    throw new Error(`Hash calculation error: ${error.message}`);
  }
}

export async function sendMessageHashToContract(recipient, messageHash) {
  try {
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    if (!messageHash || !messageHash.startsWith('0x')) {
      throw new Error('Invalid message hash');
    }

    const contract = await createWritableContract();
    
    const tempContent = `HASH_VERIFICATION:${messageHash}:${Date.now()}`;
    
    const tx = await contract.sendMessage(recipient, tempContent);
    
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      messageHash: messageHash
    };
  } catch (error) {
    console.error('send hash failed:', error);
    
    if (error.message.includes('Not authorized: you need CORP tokens')) {
      throw new Error('You do not have enough CORP tokens to send messages');
    } else if (error.message.includes('Not authorized: you are not in the white list')) {
      throw new Error('Your address is not in the whitelist');
    }
    
    throw new Error(`Hash sending error: ${error.message}`);
  }
}

export async function logMessageHashToContract(recipient, messageHash) {
  try {
    if (!ethers.isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    if (!messageHash || !messageHash.startsWith('0x') || messageHash.length !== 66) {
      throw new Error('Invalid bytes32 message hash');
    }

    const contract = await createWritableContract();

    const hasLogMethod = typeof contract.logMessageHash === 'function';
    if (hasLogMethod) {
      const tx = await contract.logMessageHash(recipient, messageHash);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        messageHash
      };
    }

    console.warn('logMessageHash unavailable, using fallback');
    return await sendMessageHashToContract(recipient, messageHash);
  } catch (error) {
    console.error('log hash failed:', error);
    throw new Error(`Hash writing error: ${error.message}`);
  }
}

export async function verifyMessageHash(content, senderAddress, timestamp) {
  try {
    const messageHash = calculateMessageHash(content);
    const contract = await createReadOnlyContract();
    
    try {
      const writableContract = await createWritableContract();
      const receivedMessages = await writableContract.getReceivedMessages();
      
      // Allow 5min timestamp drift for blockchain delays
      const matchingMessage = receivedMessages.find(msg => {
        const msgTimestamp = Number(msg.timestamp);
        const timeDiff = Math.abs(msgTimestamp - Math.floor(timestamp / 1000));
        
        return msg.sender.toLowerCase() === senderAddress.toLowerCase() && 
               timeDiff < 300 &&
               msg.hash === messageHash;
      });
      
      if (matchingMessage) {
        return true;
      } else {
        return false;
      }
    } catch (contractError) {
      console.warn('failed to get messages:', contractError.message);
      return false;
    }
  } catch (error) {
    console.error('hash check failed:', error);
    return false;
  }
}

export async function isContractOwner() {
  try {
    if (!window.ethereum) {
      return false;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const currentAddress = await signer.getAddress();
    
    const isOwner = currentAddress.toLowerCase() === CONTRACT_CONFIG.OWNER_ADDRESS.toLowerCase();
    return isOwner;
  } catch (error) {
    console.error('owner check failed:', error);
    return false;
  }
}

export async function addToWhitelist(userAddress) {
  try {
    if (!ethers.isAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
    }

    const hasOwnerRights = await isContractOwner();
    if (!hasOwnerRights) {
      throw new Error('Only the contract owner can add users to whitelist');
    }

    const contract = await createWritableContract();
    
    const isAlreadyWhitelisted = await contract.isInWhiteList(userAddress);
    if (isAlreadyWhitelisted) {
      throw new Error('User is already in whitelist');
    }
    
    const tx = await contract.addToWhiteList(userAddress);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      userAddress: userAddress
    };
  } catch (error) {
    console.error('add to whitelist failed:', error);
    
    if (error.message.includes('Only the owner')) {
      throw new Error('Only the contract owner can add users to whitelist');
    } else if (error.message.includes('User is already in the whitelist')) {
      throw new Error('User is already in whitelist');
    }
    
    throw new Error(`Whitelist addition error: ${error.message}`);
  }
}

export async function removeFromWhitelist(userAddress) {
  try {
    if (!ethers.isAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
    }

    const hasOwnerRights = await isContractOwner();
    if (!hasOwnerRights) {
      throw new Error('Only the contract owner can remove users from whitelist');
    }

    const contract = await createWritableContract();
    
    const isWhitelisted = await contract.isInWhiteList(userAddress);
    if (!isWhitelisted) {
      throw new Error('User is not in whitelist');
    }
    
    const tx = await contract.removeFromWhiteList(userAddress);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      userAddress: userAddress
    };
  } catch (error) {
    console.error('remove from whitelist failed:', error);
    
    if (error.message.includes('Only the owner')) {
      throw new Error('Only the contract owner can remove users from whitelist');
    } else if (error.message.includes('User is not in the whitelist')) {
      throw new Error('User is not in whitelist');
    }
    
    throw new Error(`Whitelist removal error: ${error.message}`);
  }
}

export async function mintTokens(userAddress, amount) {
  try {
    if (!ethers.isAddress(userAddress)) {
      throw new Error('Invalid Ethereum address');
    }

    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Token amount must be greater than zero');
    }

    const hasOwnerRights = await isContractOwner();
    if (!hasOwnerRights) {
      throw new Error('Only the contract owner can mint tokens');
    }

    const contract = await createWritableContract();
    
    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    const tx = await contract.mint(userAddress, amountInWei);
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      userAddress: userAddress,
      amount: amount
    };
  } catch (error) {
    console.error('mint tokens failed:', error);
    
    if (error.message.includes('Only the owner')) {
      throw new Error('Only the contract owner can mint tokens');
    }
    
    throw new Error(`Token minting error: ${error.message}`);
  }
}