import React, { useState, useEffect, useRef } from 'react';
import { MessageSimple } from 'stream-chat-react';
import { useAuth } from './AuthContext';
import { calculateMessageHash } from '../utils/contractUtils';
import { contractEventListener } from '../utils/contractEventListener';
import { showHashVerificationNotification } from '../utils/notificationSystem';

function VerifiedMessage(props) {
  const { message } = props;
  const { user } = useAuth();
  const [isHashVerified, setIsHashVerified] = useState(false);
  const [isVerifyingHash, setIsVerifyingHash] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [isWaitingForBlockchain, setIsWaitingForBlockchain] = useState(false);
  const cleanupRef = useRef(null);

  if (!message) {
    return <MessageSimple {...props} />;
  }

  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setIsHashVerified(false);
    setIsVerifyingHash(false);
    setVerificationData(null);
    setIsWaitingForBlockchain(false);

    if (message.user?.wallet_address &&
        message.user?.id !== user?.id &&
        user?.auth_type === 'metamask') {
      startReactiveVerification();
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [message, user]);

  const startReactiveVerification = async () => {
    try {
      const messageText = message.text;
      if (!messageText) {
        console.warn('no message text for verification');
        return;
      }

      const expectedHash = calculateMessageHash(messageText);

      // Check cache first to avoid waiting for blockchain event
      const existingVerification = contractEventListener.getVerificationStatus(expectedHash);
      if (existingVerification) {
        setIsHashVerified(true);
        setVerificationData(existingVerification);
        return;
      }

      setIsWaitingForBlockchain(true);

      // Wait up to 60s for blockchain confirmation
      cleanupRef.current = contractEventListener.watchForHash(
        message.id, 
        expectedHash, 
        (result) => {
          setIsWaitingForBlockchain(false);
          
          if (result.verified) {
            setIsHashVerified(true);
            setVerificationData(result.data);
            
            showHashVerificationNotification(
              'recipient', 
              messageText, 
              expectedHash, 
              null,
              result.data
            );
          } else if (result.timeout) {
            setIsHashVerified(false);
          }
        },
        60000
      );

    } catch (error) {
      console.error('verification failed:', error);
      setIsWaitingForBlockchain(false);
      setIsHashVerified(false);
    }
  };

  const formatVerificationText = () => {
    if (!verificationData) return "Verified by smart contract";
    
    const blockText = verificationData.blockNumber ? ` (block #${verificationData.blockNumber})` : '';
    return `Verified by smart contract${blockText}`;
  };

  return (
    <div className={`verified-message-wrapper ${isHashVerified ? 'hash-verified' : ''}`}>
      {((message.user?.wallet_address && message.user?.id !== user?.id && user?.auth_type === 'metamask') ||
        (isVerifyingHash || isHashVerified || isWaitingForBlockchain)) && (
        <div className="hash-verification-status">
          {isWaitingForBlockchain ? (
            <div className="hash-waiting">
              <span className="waiting-icon">⏳</span>
              <span className="waiting-text">Waiting for blockchain confirmation...</span>
            </div>
          ) : isVerifyingHash ? (
            <div className="hash-verifying">
              <span className="verifying-icon">🔍</span>
              <span className="verifying-text">Checking hash...</span>
            </div>
          ) : isHashVerified ? (
            <div className="hash-verified">
              <span className="metamask-icon"></span>
              <span className="verified-text">{formatVerificationText()}</span>
            </div>
          ) : (
            <div className="hash-not-verified">
              <span className="not-verified-icon"></span>
              <span className="not-verified-text">Verification failed</span>
            </div>
          )}
        </div>
      )}
      
      <MessageSimple {...props} />
    </div>
  );
}

export default VerifiedMessage;