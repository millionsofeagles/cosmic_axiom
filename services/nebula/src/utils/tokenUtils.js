import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const privateKeyPath = path.join(__dirname, '..', 'keys', process.env.JWT_PRIVATE_KEY);
const publicKeyPath = path.join(__dirname, '..', 'keys', process.env.JWT_PUBLIC_KEY);

let privateKey, publicKey;

try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
} catch (error) {
    console.error('Error loading JWT keys:', error.message);
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, publicKey, { algorithm: 'RS256' });
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
};