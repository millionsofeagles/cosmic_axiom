import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Use environment variable for encryption key, or generate one
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Ensure key is proper length
const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();

export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}

// Log warning if using default key
if (!process.env.API_KEY_ENCRYPTION_KEY) {
  console.warn('WARNING: Using generated encryption key. Set API_KEY_ENCRYPTION_KEY in .env for production!');
}