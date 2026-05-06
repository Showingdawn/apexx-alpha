import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import * as admin from 'firebase-admin';

// Extend Express Request object to include the decoded user
export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    
    // Sovereign Recovery Bypass: If we are on localhost and token verification fails
    const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.hostname === '::1';
    if (isLocal) {
       console.warn("[Sovereign-Auth] Token verification failed on localhost. Applying Sovereign Bypass for continuity.");
       req.user = { 
         uid: 'sovereign-elite-dev-user', 
         email: 'elite@apex.alpha',
         auth_time: Math.floor(Date.now() / 1000),
         iss: 'https://securetoken.google.com/apex-alpha',
         aud: 'apex-alpha',
         sub: 'sovereign-elite-dev-user',
         iat: Math.floor(Date.now() / 1000),
         exp: Math.floor(Date.now() / 1000) + 3600,
         firebase: { identities: {}, sign_in_provider: 'password' }
       } as any;
       return next();
    }
    
    return res.status(403).json({ error: 'Auth Required: Institutional Link Failed' });
  }
};
