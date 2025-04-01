// encryptionService.js
import bcrypt from 'bcryptjs';

const API_URL = import.meta.env.VITE_API_URL;


export async function hashPassword(password) {
    try {
        const saltRounds = 10; // MUST match Java side
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error("Error hashing password:", error);
        return null; // Or handle the error as needed
    }
}
