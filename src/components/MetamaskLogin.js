import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAuth } from './AuthContext';
import './LoginForm.css';

function MetamaskLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWhitelistError, setIsWhitelistError] = useState(false);
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [account, setAccount] = useState(null);
  const [hasStoredAuth, setHasStoredAuth] = useState(false);
  const auth = useAuth();
  const loginWithMetamask = auth.loginWithMetamask;
  const login = auth.login;

  useEffect(() => {
    const hasEth = typeof window.ethereum !== 'undefined';
    setIsMetamaskInstalled(hasEth);
    
    if (window.ethereum) {
      window.ethereum.request({method: 'eth_accounts'})
        .then(accs => {
          if (accs.length > 0) {
            const acc = accs[0];
            setAccount(acc);
            
            // Signatures expire after 24h to balance security vs UX
            const storageKey = 'metamask_auth_' + acc.toLowerCase();
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const authData = JSON.parse(stored);
              const now = Date.now();
              const timeDiff = now - authData.timestamp;
              const dayMs = 24 * 60 * 60 * 1000;
              const valid = timeDiff < dayMs;
              setHasStoredAuth(valid);
              if (!valid) localStorage.removeItem(storageKey);
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const quickLogin = async () => {
    if (!account || !hasStoredAuth) return;

    setIsLoading(true);
    setError(''); setIsWhitelistError(false);

    const storageKey = 'metamask_auth_' + account.toLowerCase();
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    const authData = JSON.parse(stored);
    const result = await loginWithMetamask(authData.account, authData.signature, authData.message);
    
    if (!result.success) {
      localStorage.removeItem(storageKey);
      setHasStoredAuth(false);
      
      const err = result.error;
      if (err && err.includes('WHITELIST_ERROR:')) {
        const msg = err.replace('WHITELIST_ERROR: ', '');
        setError(msg);
        setIsWhitelistError(true);
      } else {
        setError(err || 'Auth expired. Sign again.');
        setIsWhitelistError(false);
      }
    }
    
    setIsLoading(false);
  };

  const connectMetamask = async () => {
    if (!isMetamaskInstalled) {
      setError('Metamask not installed');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsWhitelistError(false);

    try {
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      if (accounts.length === 0) throw new Error('No accounts found');

      const acc = accounts[0];
      setAccount(acc);

      const timestamp = Date.now();
      const msg = 'Login to SecureMessenger\nAddress: ' + acc + '\nTimestamp: ' + timestamp;
      const msgBytes = ethers.toUtf8Bytes(msg);
      const hexMsg = ethers.hexlify(msgBytes);
      const sig = await window.ethereum.request({
        method: 'personal_sign',
        params: [hexMsg, acc]
      });

      const result = await loginWithMetamask(acc, sig, msg);
      
      if (result.success) {
        const storageKey = 'metamask_auth_' + acc.toLowerCase();
        const authData = {
          account: acc,
          signature: sig,
          message: msg,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(authData));
        setHasStoredAuth(true);
      } else {
        const err = result.error;
        if (err && err.includes('WHITELIST_ERROR:')) {
          const msg2 = err.replace('WHITELIST_ERROR: ', '');
          setError(msg2);
          setIsWhitelistError(true);
        } else {
          setError(err || 'Login failed');
          setIsWhitelistError(false);
        }
      }
    } catch (err) {
      console.error('metamask error:', err);
      // 4001 = user clicked "reject" in metamask popup
      const code = err.code;
      if (code === 4001) {
        setError('User rejected request');
      } else if (code === -32002) {
        setError('Check Metamask - pending request');
      } else {
        setError(err.message || 'Failed to connect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async (userId, userName) => {
    setIsLoading(true);
    setError('');
    setIsWhitelistError(false);

    // TODO: remove test users before production deploy
    const result = await login(userName, userId);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>SecureMessenger</h1>
          <p>Connect with Metamask to start chatting securely</p>
        </div>

        {!isMetamaskInstalled ? (
          <div className="metamask-install">
            <div className="error-message">Metamask not installed</div>
            <p>Install Metamask extension:</p>
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="install-metamask-btn"
            >
              Install Metamask
            </a>
          </div>
        ) : (
          <div className="metamask-login">
            {account && (
              <div className="connected-account">
                <p>Connected Account:</p>
                <code className="account-address">
                  {account.slice(0, 6) + '...' + account.slice(-4)}
                </code>
                {hasStoredAuth && (
                  <div className="auth-status">
                    <span className="auth-indicator">OK</span>
                    <span>Previously authenticated</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className={'error-message ' + (isWhitelistError ? 'whitelist-error' : '')}>
                {error}
              </div>
            )}

            {account && hasStoredAuth ? (
              <div className="login-buttons">
                <button 
                  onClick={quickLogin}
                  className="login-button metamask-button quick-login"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : ' Quick Login'}
                </button>
                <button 
                  onClick={connectMetamask}
                  className="login-button metamask-button secondary"
                  disabled={isLoading}
                  title="Sign a new message if you're having issues"
                >
                  Sign New Message
                </button>
              </div>
            ) : (
              <button 
                onClick={connectMetamask}
                className="login-button metamask-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Connecting...'
                ) : account ? (
                  ' Sign Message & Login'
                ) : (
                  ' Connect Metamask'
                )}
              </button>
            )}
          </div>
        )}

        <div className="test-users-section" style={{ marginTop: '2rem', borderTop: '1px solid #e0e0e0', paddingTop: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>
            <small>Quick testing without MetaMask</small>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => handleTestUserLogin('aaa', 'Test User AAA')}
              className="login-button metamask-button secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              disabled={isLoading}
              title="Test user with pre-generated token"
            >
              🔑 User AAA
            </button>
            <button 
              onClick={() => handleTestUserLogin('bbb', 'Test User BBB')}
              className="login-button metamask-button secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              disabled={isLoading}
              title="Test user with pre-generated token"
            >
              🔑 User BBB
            </button>
            <button 
              onClick={() => handleTestUserLogin('ccc', 'Test User CCC')}
              className="login-button metamask-button secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              disabled={isLoading}
              title="Test user with pre-generated token"
            >
              🔑 User CCC
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MetamaskLogin;