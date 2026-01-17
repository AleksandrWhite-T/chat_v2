export class E2EEncryption {
  constructor() {
    this.keyPairs = new Map();
    this.sharedKeys = new Map();
    this.publicKeys = new Map();
  }

  async generateKeyPair() {
    // P-256 is faster than P-521 and sufficient for our use case
    const kp = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    );
    return kp;
  }

  async exportPublicKey(publicKey) {
    const jwk = await crypto.subtle.exportKey('jwk', publicKey);
    return JSON.stringify(jwk);
  }

  async importPublicKey(publicKeyJwk) {
    const jwk = JSON.parse(publicKeyJwk);
    const pubKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );
    return pubKey;
  }

  async deriveSharedKey(privateKey, publicKey) {
    const shared = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: publicKey },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    return shared;
  }

  async encryptMessage(message, sharedKey, additionalData) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const msgBuf = new TextEncoder().encode(message);
    
    const encBuf = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: this.normalizeAad(additionalData)
      },
      sharedKey,
      msgBuf
    );

    return {
      encryptedData: this.arrayBufferToBase64(encBuf),
      iv: this.arrayBufferToBase64(iv)
    };
  }
  async decryptMessage(encryptedData, iv, sharedKey, additionalData) {
    const encBuf = this.base64ToArrayBuffer(encryptedData);
    const ivBuf = this.base64ToArrayBuffer(iv);

    const decBuf = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuf,
        additionalData: this.normalizeAad(additionalData)
      },
      sharedKey,
      encBuf
    );

    return new TextDecoder().decode(decBuf);
  }

  async getSharedKey(userId, ourPrivateKey, theirPublicKeyJwk) {
    // Cache shared keys to avoid repeated ECDH operations
    if (this.sharedKeys.has(userId)) {
      const known = this.publicKeys.get(userId);
      if (known && known === theirPublicKeyJwk) {
        return this.sharedKeys.get(userId);
      }
    }

    const theirPub = await this.importPublicKey(theirPublicKeyJwk);
    const shared = await this.deriveSharedKey(ourPrivateKey, theirPub);
    
    this.sharedKeys.set(userId, shared);
    this.publicKeys.set(userId, theirPublicKeyJwk);
    
    return shared;
  }

  async initializeForUser(userId) {
    const kp = await this.generateKeyPair();
    const pubJwk = await this.exportPublicKey(kp.publicKey);
    this.keyPairs.set(userId, kp);
    
    return { keyPair: kp, publicKeyJwk: pubJwk };
  }

  static isSupported() {
    return !!(
      window.crypto &&
      window.crypto.subtle &&
      window.crypto.subtle.generateKey &&
      window.crypto.subtle.deriveKey &&
      window.crypto.subtle.encrypt &&
      window.crypto.subtle.decrypt
    );
  }

  async generateKeyFingerprint(publicKeyJwk) {
    // Short fingerprint for user verification - first 16 hex chars is enough
    const keyBuf = new TextEncoder().encode(publicKeyJwk);
    const hashBuf = await crypto.subtle.digest('SHA-256', keyBuf);
    const hashArr = new Uint8Array(hashBuf);
    let hex = '';
    for (let i = 0; i < hashArr.length; i++) {
      let byte = hashArr[i].toString(16);
      if (byte.length === 1) byte = '0' + byte;
      hex += byte;
    }
    return hex.substring(0, 16);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      bin += String.fromCharCode(bytes[i]);
    }
    return btoa(bin);
  }

  base64ToArrayBuffer(base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }

  clearKeys() {
    this.keyPairs.clear();
    this.sharedKeys.clear();
    this.publicKeys.clear();
  }

  isPublicKeyChanged(userId, newPublicKeyJwk) {
    const known = this.publicKeys.get(userId);
    return !!(known && newPublicKeyJwk && known !== newPublicKeyJwk);
  }

  normalizeAad(additionalData) {
    if (!additionalData) return undefined;
    if (additionalData instanceof ArrayBuffer) return additionalData;
    if (additionalData instanceof Uint8Array) return additionalData.buffer;
    if (typeof additionalData === 'string') {
      return new TextEncoder().encode(additionalData).buffer;
    }
    try {
      return new TextEncoder().encode(JSON.stringify(additionalData)).buffer;
    } catch (_) {
      return undefined;
    }
  }
}

export const e2eEncryption = new E2EEncryption();