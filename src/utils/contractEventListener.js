import { createReadOnlyContract } from './contractUtils';

class ContractEventListener {
  constructor() {
    this.contract = null;
    this.listeners = new Map(); // messageId -> callback functions
    this.verifiedHashes = new Map(); // hash -> verification data
    this.isListening = false;
  }

  async initialize() {
    if (this.isListening) return;

    try {
      // Use read-only contract to listen for events without wallet
      const contract = await createReadOnlyContract();
      this.contract = contract;
      this.startListening();
    } catch (error) {
      console.error('event listener init failed:', error);
    }
  }

  startListening() {
    if (!this.contract || this.isListening) return;

    this.contract.on("MessageSent", (sender, recipient, timestamp, messageHash, event) => {
      console.log('MessageSent event:', {
        sender,
        recipient,
        timestamp: Number(timestamp),
        messageHash,
        blockNumber: event.blockNumber
      });

      const verificationData = {
        sender: sender.toLowerCase(),
        recipient: recipient.toLowerCase(),
        timestamp: Number(timestamp),
        messageHash,
        blockNumber: event.blockNumber,
        verifiedAt: Date.now()
      };

      this.verifiedHashes.set(messageHash, verificationData);

      this.notifyListeners(messageHash, verificationData);
    });

    this.isListening = true;
    console.log('Started listening to contract events');
  }

  stopListening() {
    if (this.contract && this.isListening) {
      this.contract.removeAllListeners("MessageSent");
      this.isListening = false;
      console.log('Stopped listening to contract events');
    }
  }

  watchForHash(messageId, expectedHash, callback, timeoutMs = 60000) {
    // Check cache first for instant verification
    if (this.verifiedHashes.has(expectedHash)) {
      const verificationData = this.verifiedHashes.get(expectedHash);
      callback({ verified: true, data: verificationData });
      return () => {};
    }

    if (!this.listeners.has(messageId)) {
      this.listeners.set(messageId, []);
    }
    
    const listenerData = { expectedHash, callback };
    this.listeners.get(messageId).push(listenerData);

    const timeoutId = setTimeout(() => {
      this.removeListener(messageId, listenerData);
      callback({ verified: false, timeout: true });
    }, timeoutMs);

    return () => {
      clearTimeout(timeoutId);
      this.removeListener(messageId, listenerData);
    };
  }

  removeListener(messageId, listenerData) {
    const messageListeners = this.listeners.get(messageId);
    if (messageListeners) {
      const index = messageListeners.indexOf(listenerData);
      if (index > -1) {
        messageListeners.splice(index, 1);
      }
      if (messageListeners.length === 0) {
        this.listeners.delete(messageId);
      }
    }
  }

  notifyListeners(messageHash, verificationData) {
    for (const [messageId, messageListeners] of this.listeners.entries()) {
      const matchingListeners = messageListeners.filter(
        listener => listener.expectedHash === messageHash
      );

      matchingListeners.forEach(listener => {
        listener.callback({ verified: true, data: verificationData });
        this.removeListener(messageId, listener);
      });
    }
  }

  getVerificationStatus(messageHash) {
    return this.verifiedHashes.get(messageHash) || null;
  }

  cleanup(maxAge = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    for (const [hash, data] of this.verifiedHashes.entries()) {
      if (now - data.verifiedAt > maxAge) {
        this.verifiedHashes.delete(hash);
      }
    }
  }
}

export const contractEventListener = new ContractEventListener();

if (typeof window !== 'undefined') {
  contractEventListener.initialize();
}

export default contractEventListener;