import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import { generateUserToken } from '../utils/tokenGenerator';
import { e2eEncryption, E2EEncryption } from '../utils/e2eEncryption';
import { checkWhitelist, getTokenBalance } from '../utils/contractUtils';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [e2eEnabled, setE2eEnabled] = useState(false);
  const [e2eSupported, setE2eSupported] = useState(E2EEncryption.isSupported());
  const [publicKey, setPublicKey] = useState(null);
  const [keyFingerprint, setKeyFingerprint] = useState(null);
  const [e2eInitialized, setE2eInitialized] = useState(false);

  const initE2E = async (userId) => {
    if (!e2eSupported) return false;

    try {
      // Generate key pair in browser, never sent to server
      const { publicKeyJwk } = await e2eEncryption.initializeForUser(userId);
      const fp = await e2eEncryption.generateKeyFingerprint(publicKeyJwk);
      
      setPublicKey(publicKeyJwk);
      setKeyFingerprint(fp);
      setE2eEnabled(true);
      setE2eInitialized(true);
      return true;
    } catch (err) {
      console.error('e2e init failed:', err);
      return false;
    }
  };

  const login = async (username, userId) => {
    try {
      const usr = {
        id: userId || username.toLowerCase().replace(/\s+/g, '-'),
        name: username,
        image: `https://getstream.io/random_svg/?id=${userId || username}&name=${username}`,
      };

      const tkn = generateUserToken(usr.id);
      if (!tkn) throw new Error('Failed to generate user token');
      
      setUser(usr);
      setToken(tkn);
      setIsAuthenticated(true);
      await initE2E(usr.id);
      
      return { success: true };
    } catch (err) {
      console.error('login failed:', err);
      return { success: false, error: err.message };
    }
  };

  const loginWithMetamask = async (account, signature, message) => {
    try {
      // Verify signature matches claimed account
      const recovered = ethers.verifyMessage(message, signature);
      if (recovered.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Signature verification failed');
      }

      // Check contract whitelist and token balance
      let whitelisted = false;
      try {
        whitelisted = await checkWhitelist(account);
      } catch (err) {
        const msg = err.message;
        if (msg.includes('Contract cannot process')) throw new Error('WHITELIST_ERROR: Contract error. Check network settings in MetaMask.');
        if (msg.includes('Contract not found')) throw new Error('WHITELIST_ERROR: Contract error. Check network settings in MetaMask.');
        if (msg.includes('could not decode')) throw new Error('WHITELIST_ERROR: Contract error. Check network settings in MetaMask.');
        if (msg.includes('BAD_DATA')) throw new Error('WHITELIST_ERROR: Contract error. Check network settings in MetaMask.');
        if (msg.includes('network')) throw new Error('WHITELIST_ERROR: Network error. Check connection.');
        if (msg.includes('timeout')) throw new Error('WHITELIST_ERROR: Network error. Check connection.');
        if (msg.includes('execution reverted')) throw new Error('WHITELIST_ERROR: Contract rejected. Check network.');
        throw new Error('WHITELIST_ERROR: ' + msg);
      }
      
      if (!whitelisted) {
        throw new Error('WHITELIST_ERROR: Not in whitelist. Contact admin.');
      }

      const bal = await getTokenBalance(account);
      const balNum = parseFloat(bal);
      if (isNaN(balNum) || balNum <= 0) {
        throw new Error('TOKEN_ERROR: Insufficient CORP tokens');
      }

      const usr = {
        id: account.toLowerCase(),
        name: `${account.slice(0, 6)}...${account.slice(-4)}`,
        image: `https://getstream.io/random_svg/?id=${account}&name=${account}`,
        wallet_address: account,
        auth_type: 'metamask'
      };

      const tkn = generateUserToken(usr.id);
      if (!tkn) throw new Error('Failed to generate user token');
      
      setUser(usr);
      setToken(tkn);
      setIsAuthenticated(true);
      await initE2E(usr.id);
      
      return { success: true };
    } catch (err) {
      console.error('metamask login failed:', err);
      const errMsg = err.message;
      if (!errMsg.startsWith('TOKEN_ERROR:') && !errMsg.startsWith('WHITELIST_ERROR:')) {
        errMsg = 'TOKEN_ERROR: Failed to check balance. ' + errMsg;
      }
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    if (user && user.auth_type === 'metamask' && user.wallet_address) {
      localStorage.removeItem(`metamask_auth_${user.wallet_address.toLowerCase()}`);
    }
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setE2eEnabled(false); setE2eInitialized(false);
    setPublicKey(null);
    setKeyFingerprint(null);
    e2eEncryption.clearKeys();
  };


  const getSharedKeyWithUser = async (targetUserId, targetUserPublicKey) => {
    if (!e2eEnabled || !user) {
      throw new Error('E2E encryption not enabled');
    }

    const ourKeyPair = e2eEncryption.keyPairs.get(user.id);
    if (!ourKeyPair) {
      throw new Error('User key pair not found');
    }

    return await e2eEncryption.getSharedKey(
      targetUserId, 
      ourKeyPair.privateKey, 
      targetUserPublicKey
    );
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    loginWithMetamask,
    logout,
    e2eEnabled,
    e2eSupported,
    e2eInitialized,
    publicKey,
    keyFingerprint,
    getSharedKeyWithUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}