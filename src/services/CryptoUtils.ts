import CryptoJS from 'crypto-js';


// Function to get the AES key from sessionStorage
export function getAESKey() {
    return sessionStorage.getItem("AES_KEY");
}

export function encryptAES(plainText: string) {
    const secretKey = getAESKey();

    if (!secretKey) {
        throw new Error("AES key is not initialized.");
    }

    const key = CryptoJS.enc.Base64.parse(secretKey);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    const combined = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(combined);
}

// Decrypt data
export function decryptAES(encryptedText: string) {
    try {
        // Make sure encryptedText is a string
        if (typeof encryptedText !== 'string') {
            throw new Error('Encrypted text must be a string');
        }

        const secretKey = getAESKey();
        if (!secretKey) {
            throw new Error("AES key is not initialized.");
        }

        // Make sure the key is a string before parsing
        if (typeof secretKey !== 'string') {
            throw new Error('Secret key must be a string');
        }

        const key = CryptoJS.enc.Base64.parse(secretKey);
        const combined = CryptoJS.enc.Base64.parse(encryptedText);

        // Extract IV (first 16 bytes)
        const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
        
        // Extract ciphertext (remaining bytes)
        const ciphertext = CryptoJS.lib.WordArray.create(
            combined.words.slice(4),
            combined.sigBytes - 16
        );

        // Perform AES decryption
        const decrypted = CryptoJS.AES.decrypt(
            CryptoJS.lib.CipherParams.create({
                ciphertext: ciphertext
            }),
            key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        const result = decrypted.toString(CryptoJS.enc.Utf8);
        if (!result) {
            throw new Error('Decryption failed - invalid result');
        }

        return result;
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}