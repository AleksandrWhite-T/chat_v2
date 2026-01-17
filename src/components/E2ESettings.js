import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import E2EStatus from './E2EStatus';
import './E2ESettings.css';

function E2ESettings({ isOpen, onClose }) {
  const { 
    user, 
    e2eEnabled, 
    e2eSupported, 
    publicKey, 
    keyFingerprint 
  } = useAuth();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPublicKey, setShowPublicKey] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    // Clipboard API might fail in some browsers or contexts
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy');
    });
  };

  const formatPublicKey = (key) => {
    if (!key) return '';
    return key.replace(/(.{64})/g, '$1\n');
  };

  return (
    <div className="e2e-settings-overlay">
      <div className="e2e-settings-modal">
        <div className="settings-header">
          <h2>🔐 End-to-End Encryption Settings</h2>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Encryption Status</h3>
            <E2EStatus />
          </div>

          {e2eEnabled && (
            <div className="settings-section">
              <h3>User Information</h3>
              <div className="user-info-grid">
                <div className="info-item">
                  <label>User:</label>
                  <span>{user?.name || user?.id}</span>
                </div>
                
                <div className="info-item">
                  <label>Key fingerprint:</label>
                  <div className="fingerprint-display">
                    <code>{keyFingerprint}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(keyFingerprint)}
                      title="Copy fingerprint"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="info-item">
                  <label>Key status:</label>
                  <span className="key-status">
                    {publicKey ? 'Keys initialized' : 'Keys not found'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="settings-section">
            <h3>How it works</h3>
            <div className="auto-enable-notice">
              <span className="info-icon">i</span>
              <strong>E2E encryption is always enabled</strong> when supported by your browser. Keys never leave your device.
            </div>
            <div className="security-explanation">
              <div className="explanation-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Automatic key generation</strong>
                  <p>When you log in, an ECDH P-256 key pair is generated on your device</p>
                </div>
              </div>
              
              <div className="explanation-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Public key exchange</strong>
                  <p>Public keys are sent to other users so they can encrypt messages</p>
                </div>
              </div>
              
              <div className="explanation-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Message encryption</strong>
                  <p>Each message is encrypted with AES-GCM on your device</p>
                </div>
              </div>
              
              <div className="explanation-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Secure delivery</strong>
                  <p>Only the recipient can decrypt the message with their private key</p>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3>
              Advanced settings
              <button 
                className="toggle-advanced"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'}
              </button>
            </h3>
            
            {showAdvanced && (
              <div className="advanced-settings">
                <div className="advanced-item">
                  <label>Browser support:</label>
                  <span className={`support-status ${e2eSupported ? 'supported' : 'not-supported'}`}>
                    {e2eSupported ? 'Supported' : 'Not supported'}
                  </span>
                </div>
                
                <div className="advanced-item">
                  <label>Key exchange algorithm:</label>
                  <span>ECDH P-256</span>
                </div>
                
                <div className="advanced-item">
                  <label>Encryption algorithm:</label>
                  <span>AES-GCM 256-bit</span>
                </div>
                
                <div className="advanced-item">
                  <label>Public key:</label>
                  <div className="public-key-section">
                    <button 
                      className="show-key-btn"
                      onClick={() => setShowPublicKey(!showPublicKey)}
                    >
                      {showPublicKey ? 'Hide key' : 'Show key'}
                    </button>
                    {showPublicKey && publicKey && (
                      <div className="public-key-display">
                        <textarea 
                          readOnly 
                          value={formatPublicKey(publicKey)}
                          className="key-textarea"
                        />
                        <button 
                          className="copy-key-btn"
                          onClick={() => copyToClipboard(publicKey)}
                        >
                          📋 Copy key
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!e2eSupported && (
            <div className="settings-section warning">
              <h3>Attention</h3>
              <div className="warning-content">
                <p>
                  Your browser does not support the Web Crypto API required for E2E encryption.
                  Update your browser or use a modern browser to enable encryption.
                </p>
                <div className="supported-browsers">
                  <strong>Supported browsers:</strong>
                  <ul>
                    <li>Chrome 37+</li>
                    <li>Firefox 34+</li>
                    <li>Safari 7+</li>
                    <li>Edge 12+</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="close-settings-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default E2ESettings;