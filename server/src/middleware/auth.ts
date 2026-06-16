import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types.js';
import { supabaseAdmin } from '../lib/supabase.js';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      accessToken?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = header.slice(7);
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !authData.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, email, role, name')
    .eq('id', authData.user.id)
    .single();

  if (userError || !user) {
    return res.status(401).json({ error: 'User profile not found' });
  }

  req.user = user as AuthUser;
  req.accessToken = token;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

export function requireClient(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'client') {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
}
