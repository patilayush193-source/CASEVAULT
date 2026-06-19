import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db';
import type { AuthResponse, ApiResponse, User } from '@casevault/types';

const JWT_SECRET: string =
  process.env.JWT_SECRET || 'casevault-dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const BCRYPT_ROUNDS = 12;

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface DbUser {
  id: string;
  email: string;
  password: string;
  created_at: number;
}

function generateAccessToken(user: Pick<User, 'id' | 'email'>): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

function generateRefreshToken(user: Pick<User, 'id' | 'email'>): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    path: '/',
    httpOnly: true,
    secure: false, // dev mode — set true in production
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
}

export function register(req: Request, res: Response): void {
  try {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors
        .map((e) => e.message)
        .join(', ');
      res.status(400).json({ error: errorMessage } satisfies ApiResponse<never>);
      return;
    }

    const { email, password } = parsed.data;

    // Check for existing user
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email) as DbUser | undefined;

    if (existing) {
      res.status(409).json({ error: 'Email already registered' } satisfies ApiResponse<never>);
      return;
    }

    const hashedPassword = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    const insertStmt = db.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?) RETURNING id, email'
    );
    const newUser = insertStmt.get(email, hashedPassword) as Pick<User, 'id' | 'email'>;

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    setRefreshCookie(res, refreshToken);

    const response: ApiResponse<AuthResponse> = {
      data: {
        user: { id: newUser.id, email: newUser.email },
        accessToken,
      },
    };

    res.status(201).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function login(req: Request, res: Response): void {
  try {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors
        .map((e) => e.message)
        .join(', ');
      res.status(400).json({ error: errorMessage } satisfies ApiResponse<never>);
      return;
    }

    const { email, password } = parsed.data;

    const user = db
      .prepare('SELECT id, email, password FROM users WHERE email = ?')
      .get(email) as DbUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' } satisfies ApiResponse<never>);
      return;
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' } satisfies ApiResponse<never>);
      return;
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    setRefreshCookie(res, refreshToken);

    const response: ApiResponse<AuthResponse> = {
      data: {
        user: { id: user.id, email: user.email },
        accessToken,
      },
    };

    res.status(200).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

interface RefreshPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function refresh(req: Request, res: Response): void {
  try {
    const token: string | undefined = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    let decoded: RefreshPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as RefreshPayload;
    } catch {
      res.status(401).json({ error: 'Unauthorized' } satisfies ApiResponse<never>);
      return;
    }

    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
    });

    const response: ApiResponse<{ accessToken: string }> = {
      data: { accessToken },
    };

    res.status(200).json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}

export function logout(_req: Request, res: Response): void {
  try {
    res.clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });

    res.status(200).json({ data: { message: 'Logged out' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message } satisfies ApiResponse<never>);
  }
}
