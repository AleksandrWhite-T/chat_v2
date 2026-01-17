import React, { useState } from 'react';
import { MessageInput } from 'stream-chat-react';
import { useAuth } from './AuthContext';
import { useMessageEncryption } from './EncryptedMessage';
import E2EStatus from './E2EStatus';
import { calculateMessageHash, logMessageHashToContract } from '../utils/contractUtils';
import { showHashVerificationNotification } from '../utils/notificationSystem';

function EncryptedMessageInput({ channel, ...props }) {
  const auth = useAuth();
  const e2eEnabled = auth.e2eEnabled;
  const e2eInitialized = auth.e2eInitialized;
  const user = auth.user;
  
  const encryption = useMessageEncryption();
  const encryptMessageForChannel = encryption.encryptMessageForChannel;
  
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSendingHash, setIsSendingHash] = useState(false);

  const handleSubmit = async (message) => {
    const text = message.text;
    if (!text || !text.trim()) {
      return;
    }

    setIsEncrypting(true);

    try {
      // Encrypt before sending, fallback to plaintext if encryption fails
      let processedMessage = await encryptMessageForChannel(message.text, channel);
      
      const msgData = {};
      Object.keys(message).forEach(key => {
        msgData[key] = message[key];
      });
      Object.keys(processedMessage).forEach(key => {
        msgData[key] = processedMessage[key];
      });
      msgData.user_id = user ? user.id : null;
      
      await channel.sendMessage(msgData);

      const userAuthType = user ? user.auth_type : null;
      const channelData = channel ? channel.data : null;
      const isDm = channelData ? channelData.is_dm : false;
      
      if (userAuthType === 'metamask' && isDm) {
        await sendHashToContract(message.text, channel);
      }
    } catch (error) {
      console.error('send message failed:', error);
    } finally {
      setIsEncrypting(false);
    }
  };


  const sendHashToContract = async (originalText, channel) => {
    try {
      setIsSendingHash(true);
      
      // Find the other person in DM - TODO: optimize this lookup
      const members = channel.state.members || {};
      const memberIds = Object.keys(members);
      let otherUserId = null;
      
      for (let i = 0; i < memberIds.length; i++) {
        const id = memberIds[i];
        if (id !== user.id) {
          otherUserId = id;
          break;
        }
      }
      
      if (!otherUserId) {
        console.warn('recipient not found');
        return;
      }

      const otherMember = channel.state.members[otherUserId];
      const otherUser = otherMember ? otherMember.user : null;
      const recipientAddress = otherUser ? otherUser.wallet_address : null;

      if (!recipientAddress) {
        console.warn('recipient has no metamask address');
        return;
      }
      
      let messageHash = calculateMessageHash(originalText);
      
      // Fire and forget - don't block message send on blockchain write
      logMessageHashToContract(recipientAddress, messageHash)
        .then(result => {
          showHashVerificationNotification('sender', originalText, messageHash, result.transactionHash);
        })
        .catch(error => {
          console.error('hash send failed:', error.message);
          
          const errMsg = error.message;
          if (errMsg.includes('user rejected') || errMsg.includes('User denied')) {
            console.warn('user cancelled transaction');
          } else if (errMsg.includes('insufficient funds')) {
            console.warn('insufficient gas');
          } else if (errMsg.includes('whitelist') || errMsg.includes('CORP tokens')) {
            console.warn('not authorized');
          }
        });
        
    } catch (error) {
      console.error('send hash error:', error);
    } finally {
      setIsSendingHash(false);
    }
  };

  return (
    <div className="encrypted-message-input-wrapper">
      <div className="message-input-header">
        <E2EStatus compact={true} />
        {isEncrypting && (
          <div className="encrypting-indicator">
            <span className="encrypting-icon"></span>
            <span className="encrypting-text">Sending message...</span>
          </div>
        )}
        {isSendingHash && (
          <div className="hash-sending-indicator">
            <span className="hash-icon"></span>
            <span className="hash-text">Sending hash to contract...</span>
          </div>
        )}
      </div>

      <MessageInput
        {...props}
        overrideSubmitHandler={handleSubmit}
        disabled={isEncrypting || isSendingHash}
        placeholder={
          e2eEnabled && e2eInitialized
            ? "Type an encrypted message..." 
            : "Type a message..."
        }
      />

      {channel?.data?.is_dm && (
        <div className="dm-security-info">
          {e2eEnabled && e2eInitialized ? (
            <div className="security-info enabled">
              <span className="security-icon"></span>
              <span className="security-text">
                Direct messages are protected with end-to-end encryption
              </span>
            </div>
          ) : (
            <div className="security-info disabled">
              <span className="security-icon"></span>
              <span className="security-text">
              {!e2eEnabled 
                  ? "E2E encryption is disabled. Enable it in settings to protect messages"
                  : "Messages are sent without E2E encryption"
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EncryptedMessageInput;