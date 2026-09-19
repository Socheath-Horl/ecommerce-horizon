import { eq } from 'drizzle-orm';
import { type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '@/db/index';
import { users } from '@/db/schema';
import { verify_access_token } from '@/utils/oidc';

export const require_auth: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' },
    });
    return;
  }
  try {
    const claims = await verify_access_token(token);
    req.user = {
      id: String(claims.sub ?? ''),
      email: String(claims.email ?? ''),
      name: String(claims.name ?? ''),
    };
    next();
  } catch {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' },
    });
  }
};

export function require_role(...allowed_roles: string[]): RequestHandler {
  return async (req, res, next) => {
    if (!req.user?.id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authenticate first' },
      });
      return;
    }
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    if (!user || !allowed_roles.includes(user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient role' },
      });
      return;
    }
    next();
  };
}