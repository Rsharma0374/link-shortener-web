import bcrypt from 'bcryptjs';


export async function hashPassword(password: string) {
    try {
      const saltRounds = 10; // MUST match Java side
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      console.error("Error hashing password:", error);
      return null; // Or handle the error as needed
    }
  }
