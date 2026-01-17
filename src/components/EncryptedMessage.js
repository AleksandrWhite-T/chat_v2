import React, { useState, useEffect } from 'react';
import { MessageSimple } from 'stream-chat-react';
import { useAuth } from './AuthContext';
import { e2eEncryption } from '../utils/e2eEncryption';
import { verifyMessageHash } from '../utils/contractUtils';
import { showHashVerificationNotification } from '../utils/notificationSystem';

function EncryptedMessage(props) {
  const message = props.message;
  const client = props.client;
  
  const auth = useAuth();
  const e2eEnabled = auth.e2eEnabled;
  const user = auth.user;
  const getSharedKeyWithUser = auth.getSharedKeyWithUser;
  
  const [decryptedText, setDecryptedText] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isHashVerified, setIsHashVerified] = useState(false);
  const [isVerifyingHash, setIsVerifyingHash] = useState(false);
  const [keyChanged, setKeyChanged] = useState(false);
  const [keyChangeInfo, setKeyChangeInfo] = useState(null);

  if (!message) {
    return <MessageSimple {...props} />;
  }

  useEffect(() => {
    setDecryptedText(null);
    setIsEncrypted(false);
    setDecryptionError(null);
    setIsHashVerified(false);
    setIsVerifyingHash(false);
    setKeyChanged(false);
    setKeyChangeInfo(null);
    
    const hasEncData = message.encrypted_data;
    const msgUserId = message.user ? message.user.id : null;
    const currentUserId = user ? user.id : null;
    const isOtherUser = msgUserId !== currentUserId;
    
    if (e2eEnabled && hasEncData && isOtherUser) {
      setIsEncrypted(true);
      decryptMessage();
    } else if (hasEncData) {
      setIsEncrypted(true);
    }

    const senderWallet = message.user ? message.user.wallet_address : null;
    const userAuthType = user ? user.auth_type : null;
    
    if (senderWallet && isOtherUser && userAuthType === 'metamask' && !hasEncData) {
      verifyHashWithText(message.text);
    }
  }, [message, e2eEnabled, user]);

  const verifyHashWithText = async (messageText) => {
    try {
      setIsVerifyingHash(true);
      
      if (!messageText) {
        console.warn('no message text for hash verification');
        return;
      }

      const senderAddress = message.user.wallet_address;
      const createdAt = message.created_at;
      let timestamp;
      if (createdAt) {
        const date = new Date(createdAt);
        timestamp = date.getTime();
      } else {
        timestamp = Date.now();
      }
      
      let isVerified = await verifyMessageHash(messageText, senderAddress, timestamp);
      setIsHashVerified(isVerified);
      
      if (isVerified) {
        showHashVerificationNotification(
          'recipient', 
          messageText, 
          null,
          null,
          { sender: senderAddress, timestamp }
        );
      }
    } catch (error) {
      console.error('hash verification failed:', error);
      setIsHashVerified(false);
    } finally {
      setIsVerifyingHash(false);
    }
  };

  const decryptMessage = async () => {
    if (!message.encrypted_data || !message.sender_public_key || !message.encryption_iv) {
      return;
    }

    setIsDecrypting(true);
    setDecryptionError(null);

    try {
      // Key rotation detection - warn if sender changed their key (possible MITM)
      const changed = e2eEncryption.isPublicKeyChanged(message.user.id, message.sender_public_key);
      if (changed) {
        setKeyChanged(true);
        try {
          const previousJwk = e2eEncryption.publicKeys.get(message.user.id);
          const newJwk = message.sender_public_key;
          const prevFp = previousJwk ? await e2eEncryption.generateKeyFingerprint(previousJwk) : null;
          const newFp = await e2eEncryption.generateKeyFingerprint(newJwk);
          setKeyChangeInfo({ prevFp, newFp });
        } catch (_) {}
      }

      const sharedKey = await getSharedKeyWithUser(
        message.user.id, 
        message.sender_public_key
      );

      const decrypted = await e2eEncryption.decryptMessage(
        message.encrypted_data,
        message.encryption_iv,
        sharedKey,
        message.aad_context
      );

      setDecryptedText(decrypted);
      setIsEncrypted(true);
      
      // Slight delay to avoid race condition with message render
      if (message.user?.wallet_address && user?.auth_type === 'metamask') {
        setTimeout(() => verifyHashWithText(decrypted), 100);
      }
    } catch (error) {
      console.error('decrypt failed:', error);
      setDecryptionError('Failed to decrypt message');
    } finally {
      setIsDecrypting(false);
    }
  };

  const displayMessage = {
    ...message,
    text: decryptedText || message.text || ''
  };

  if (decryptionError) {
    return (
      <div className="encrypted-message-error">
        <div className="error-content">
          <span className="error-icon"></span>
          <div className="error-text">
            <div className="error-title">Decryption error</div>
            <div className="error-message">{decryptionError}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isDecrypting) {
    return (
      <div className="encrypted-message-decrypting">
        <div className="decrypting-content">
          <span className="decrypting-icon"></span>
          <span className="decrypting-text">Decrypting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`encrypted-message-wrapper ${isEncrypted ? 'encrypted' : 'unencrypted'} ${isHashVerified ? 'hash-verified' : ''}`}>
      {isEncrypted && (
        <div className="encryption-indicator">
          <span className="encryption-icon"></span>
          <span className="encryption-text">Encrypted (E2E)</span>
        </div>
      )}

      {keyChanged && (
        <div className="key-change-warning">
          <span className="warning-icon"></span>
          <span className="warning-text">
            Sender&apos;s public key has changed{keyChangeInfo?.newFp ? ` (new fingerprint: ${keyChangeInfo.newFp}` : ''}{keyChangeInfo?.prevFp ? `, previous: ${keyChangeInfo.prevFp}` : ''}{keyChangeInfo?.newFp ? ')' : ''}.
          </span>
        </div>
      )}
      
      {message.user?.wallet_address && message.user?.id !== user?.id && user?.auth_type === 'metamask' && (
        <div className="hash-verification-status">
          {isVerifyingHash ? (
            <div className="hash-verifying">
              <span className="verifying-icon">🔍</span>
              <span className="verifying-text">Verifying hash...</span>
            </div>
          ) : isHashVerified ? (
            <div className="hash-verified">
              <span className="metamask-icon"></span>
              <span className="verified-text">Verified by smart contract</span>
            </div>
          ) : (
            <div className="hash-not-verified">
              <span className="not-verified-icon">⚠️</span>
              <span className="not-verified-text">Hash not found in contract</span>
            </div>
          )}
        </div>
      )}
      
      <MessageSimple {...props} message={displayMessage} />
      
      {e2eEnabled && !isEncrypted && message.user?.id !== user?.id && (
        <div className="unencrypted-warning">
          <span className="warning-icon"></span>
          <span className="warning-text">Not encrypted</span>
        </div>
      )}
    </div>
  );
}

// Hook for encrypting outgoing messages
export function useMessageEncryption() {
  const { e2eEnabled, e2eInitialized, user, publicKey, getSharedKeyWithUser } = useAuth();

  const buildAadForChannel = (senderId, recipientId, channel) => {
    try {
      const channelId = channel?.id || channel?.data?.id || '';
      const channelType = channel?.type || 'messaging';
      return `${channelType}:${channelId}:${senderId}->${recipientId}`;
    } catch (_) {
      return undefined;
    }
  };

  const encryptMessageForChannel = async (messageText, channel) => {
    if (!e2eEnabled || !e2eInitialized || !messageText || !user) {
      return { text: messageText };
    }

    try {
      // Only DMs are encrypted - group channels would need different key distribution
      if (channel.data?.is_dm) {
        const otherUserId = Object.keys(channel.state.members || {})
          .find(id => id !== user.id);
        
        if (!otherUserId) {
          console.warn('other user not found in DM');
          return { text: messageText };
        }

        const otherUser = channel.state.members[otherUserId]?.user;
        const otherUserPublicKey = otherUser?.public_key;

        if (!otherUserPublicKey) {
          console.warn('other user has no public key');
          return { text: messageText };
        }

        const sharedKey = await getSharedKeyWithUser(otherUserId, otherUserPublicKey);
        const aad = buildAadForChannel(user.id, otherUserId, channel);
        const { encryptedData, iv } = await e2eEncryption.encryptMessage(messageText, sharedKey, aad);

        return {
          text: '[Encrypted message]',
          encrypted_data: encryptedData,
          encryption_iv: iv,
          sender_public_key: publicKey,
          encrypted: true,
          aad_context: aad
        };
      } else {
        return { text: messageText };
      }
    } catch (error) {
      console.error('encrypt failed:', error);
      return { text: messageText }; // Fallback to unencrypted
    }
  };

  return {
    encryptMessageForChannel,
    isEncryptionEnabled: e2eEnabled
  };
}

export default EncryptedMessage;