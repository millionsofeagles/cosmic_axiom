import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY

const privateKey = fs.readFileSync("src/keys/"+process.env.JWT_PRIVATE_KEY_PATH, 'utf8');
const publicKey = fs.readFileSync("src/keys/"+process.env.JWT_PUBLIC_KEY_PATH, 'utf8');

export function generateToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        privateKey,
        { expiresIn: TOKEN_EXPIRY }
    );
}

export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, publicKey);

        // Check if the token exists and has not been revoked
        const dbToken = await prisma.token.findUnique({ where: { token } });

        if (!dbToken) return null;
        if (dbToken.revokedAt) return null;

        // Optional: enforce DB expiration too
        const now = new Date();
        if (dbToken.expiresAt < now) return null;

        return decoded; // still valid
    } catch (err) {
        return null;
    }
}
export function decodeToken(token) {
    return jwt.decode(token); // does not verify signature!
}
