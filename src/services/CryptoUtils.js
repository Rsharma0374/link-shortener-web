import CryptoJS from "crypto-js";
const API_URL = import.meta.env.VITE_API_URL;


// Function to fetch and store AES key in sessionStorage
export async function initializeAESKey() {
    const storedKey = sessionStorage.getItem("AES_KEY");
    if (!storedKey) {
        try {
            

            const response = await fetch(`${API_URL}/gateway/key`, {
                // const response = await fetch("http://localhost:10008/gateway/key", {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              const res = await response.json();  
            if (res && res.sKey && res.sId) {
                sessionStorage.setItem("AES_KEY", res.sKey);
                sessionStorage.setItem("KEY_ID", res.sId);
            }


        } catch (error) {
            console.error("Error fetching AES key:", error);
        }
    }
}

// Function to get the AES key from sessionStorage
export function getAESKey() {
    return sessionStorage.getItem("AES_KEY");
}

// Encrypt data
export function encryptAES(plainText) {
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
export function decryptAES(encryptedText) {
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
            { ciphertext: ciphertext },
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