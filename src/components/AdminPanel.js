import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  isContractOwner, 
  addToWhitelist, 
  removeFromWhitelist, 
  checkWhitelist,
  mintTokens,
  getTokenBalance 
} from '../utils/contractUtils';
import TestHashNotification from './TestHashNotification';
import './AdminPanel.css';

function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('whitelist');

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const [addressToAdd, setAddressToAdd] = useState('');
  const [addressToRemove, setAddressToRemove] = useState('');
  const [addressToCheck, setAddressToCheck] = useState('');
  const [whitelistStatus, setWhitelistStatus] = useState(null);
  
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [balanceAddress, setBalanceAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(null);
  
  const [operationLoading, setOperationLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkOwnerRights();
  }, [user, isAuthenticated]);

  const checkOwnerRights = async () => {
    if (!isAuthenticated || !user) {
      setIsOwner(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ownerStatus = await isContractOwner();
      setIsOwner(ownerStatus);
    } catch (error) {
      console.error('Error checking owner rights:', error);
      setIsOwner(false);
      setMessage({ type: 'error', text: 'Failed to check admin permissions' });
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAddToWhitelist = async () => {
    if (!addressToAdd.trim()) {
      showMessage('error', 'Enter address to add');
      return;
    }

    try {
      setOperationLoading(true);
      // Transaction will prompt Metamask - user might need to wait
      const result = await addToWhitelist(addressToAdd.trim());
      
      if (result.success) {
        showMessage('success', `Address ${addressToAdd} successfully added to whitelist. Transaction: ${result.transactionHash}`);
        setAddressToAdd('');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRemoveFromWhitelist = async () => {
    if (!addressToRemove.trim()) {
      showMessage('error', 'Enter address to remove');
      return;
    }

    try {
      setOperationLoading(true);
      const result = await removeFromWhitelist(addressToRemove.trim());
      
      if (result.success) {
        showMessage('success', `Address ${addressToRemove} successfully removed from whitelist. Transaction: ${result.transactionHash}`);
        setAddressToRemove('');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCheckWhitelist = async () => {
    if (!addressToCheck.trim()) {
      showMessage('error', 'Enter address to check');
      return;
    }

    try {
      setOperationLoading(true);
      const isWhitelisted = await checkWhitelist(addressToCheck.trim());
      setWhitelistStatus({
        address: addressToCheck.trim(),
        isWhitelisted
      });
      
      const status = isWhitelisted ? 'is' : 'is not';
      showMessage('info', `Address ${status} in whitelist`);
    } catch (error) {
      showMessage('error', error.message);
      setWhitelistStatus(null);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!mintAddress.trim() || !mintAmount.trim()) {
      showMessage('error', 'Enter address and token amount');
      return;
    }
  
    if (parseFloat(mintAmount) <= 0) {
      showMessage('error', 'Token amount must be greater than zero');
      return;
    }

    try {
      setOperationLoading(true);
      // Minting costs gas - make sure owner has enough ETH
      const result = await mintTokens(mintAddress.trim(), mintAmount);
      
      if (result.success) {
        showMessage('success', `${mintAmount} CORP tokens successfully minted for ${mintAddress}. Transaction: ${result.transactionHash}`);
        setMintAddress('');
        setMintAmount('');
      }
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    if (!balanceAddress.trim()) {
      showMessage('error', 'Enter address to check balance');
      return;
    }

    try {
      setOperationLoading(true);
      const balance = await getTokenBalance(balanceAddress.trim());
      setTokenBalance({
        address: balanceAddress.trim(),
        balance
      });
      
      showMessage('info', `Balance: ${balance} CORP tokens`);
    } catch (error) {
      showMessage('error', error.message);
      setTokenBalance(null);
    } finally {
      setOperationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-panel loading">
        <div className="loading-spinner">Loading...</div>
        <p>Checking admin permissions...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-panel error">
        <div className="error-icon">!</div>
        <h2>Access denied</h2>
        <p>You must be logged in to access the admin panel.</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="admin-panel error">
        <div className="error-icon">👑</div>
        <h2>Insufficient permissions</h2>
        <p>Only the smart contract owner can use the admin panel.</p>
        <p className="address-info">
          Your address: <code title={user.wallet_address}>{formatAddress(user.wallet_address)}</code>
        </p>
        <p className="address-info">
          Owner address: <code title="0xBEe0eCb78Ea888fDd859B3019DfCDeA53fa172D6">{formatAddress('0xBEe0eCb78Ea888fDd859B3019DfCDeA53fa172D6')}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p className="admin-info">
          Welcome, contract owner! <code title={user.wallet_address}>{formatAddress(user.wallet_address)}</code>
        </p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' && '✅'}
            {message.type === 'error' && 'ERROR: '}
            {message.type === 'info' && 'INFO: '}
          </span>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'whitelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('whitelist')}
        >
          📋 Whitelist Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          🪙 Token Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          🧪 Testing
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'whitelist' && (
          <div className="whitelist-management">
            <div className="admin-section">
              <h3>➕ Add to Whitelist</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="0x... (Ethereum address)"
                  value={addressToAdd}
                  onChange={(e) => setAddressToAdd(e.target.value)}
                  disabled={operationLoading}
                />
                <button 
                  onClick={handleAddToWhitelist}
                  disabled={operationLoading}
                  className="action-button add"
                >
                  {operationLoading ? '⏳' : '➕'} Add
                </button>
              </div>
            </div>

            <div className="admin-section">
              <h3>➖ Remove from Whitelist</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="0x... (Ethereum address)"
                  value={addressToRemove}
                  onChange={(e) => setAddressToRemove(e.target.value)}
                  disabled={operationLoading}
                />
                <button 
                  onClick={handleRemoveFromWhitelist}
                  disabled={operationLoading}
                  className="action-button remove"
                >
                  {operationLoading ? '⏳' : '➖'} Remove
                </button>
              </div>
            </div>

            <div className="admin-section">
              <h3>🔍 Check Whitelist</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="0x... (Ethereum address)"
                  value={addressToCheck}
                  onChange={(e) => setAddressToCheck(e.target.value)}
                  disabled={operationLoading}
                />
                <button 
                  onClick={handleCheckWhitelist}
                  disabled={operationLoading}
                  className="action-button check"
                >
                  {operationLoading ? '⏳' : '🔍'} Check
                </button>
              </div>
              
              {whitelistStatus && (
                <div className={`status-result ${whitelistStatus.isWhitelisted ? 'whitelisted' : 'not-whitelisted'}`}>
                  <span className="status-icon">
                    {whitelistStatus.isWhitelisted ? 'YES' : 'NO'}
                  </span>
                  Address <code title={whitelistStatus.address}>{formatAddress(whitelistStatus.address)}</code> 
                  {whitelistStatus.isWhitelisted ? ' is' : ' is not'} in whitelist
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="token-management">
            <div className="admin-section">
              <h3>🪙 Mint Tokens</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="0x... (Recipient Ethereum address)"
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  disabled={operationLoading}
                />
                <input
                  type="number"
                  placeholder="Amount of CORP tokens"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  disabled={operationLoading}
                  min="0"
                  step="0.01"
                />
                <button 
                  onClick={handleMintTokens}
                  disabled={operationLoading}
                  className="action-button mint"
                >
                  {operationLoading ? '⏳' : '🪙'} Mint
                </button>
              </div>
            </div>

            <div className="admin-section">
              <h3>💰 Check Balance</h3>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="0x... (Ethereum address)"
                  value={balanceAddress}
                  onChange={(e) => setBalanceAddress(e.target.value)}
                  disabled={operationLoading}
                />
                <button 
                  onClick={handleCheckBalance}
                  disabled={operationLoading}
                  className="action-button check"
                >
                  {operationLoading ? '⏳' : '💰'} Check
                </button>
              </div>
              
              {tokenBalance && (
                <div className="balance-result">
                  <span className="balance-icon">💰</span>
                  Balance <code title={tokenBalance.address}>{formatAddress(tokenBalance.address)}</code>: 
                  <strong>{tokenBalance.balance} CORP</strong>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'testing' && (
          <div className="testing-section">
            <div className="admin-section">
              <h3>🧪 Function Testing</h3>
              <p className="section-description">
                Here you can test various application functions.
              </p>
              
              <div className="test-component">
                <TestHashNotification />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-footer">
        <p className="contract-info">
          Contract: <code title="0xA4dEC8E76dc65D90343C4d91DD8C4d187E46Cd85">{formatAddress('0xA4dEC8E76dc65D90343C4d91DD8C4d187E46Cd85')}</code>
        </p>
        <p className="warning">
          WARNING: All operations are irreversible. Make sure addresses are correct before executing actions.
        </p>
      </div>
    </div>
  );
}

export default AdminPanel;
