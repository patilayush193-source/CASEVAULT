import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Module augmentation to add `user` to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'casevault-dev-secret-change-in-production';

export function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
