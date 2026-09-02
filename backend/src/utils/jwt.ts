import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../types/index';

export interface JwtPayloadData {
  userId: string;
  email: string;
  role: UserRole;
}

export function generateToken(payload: JwtPayloadData): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): JwtPayloadData {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayloadData;
}
