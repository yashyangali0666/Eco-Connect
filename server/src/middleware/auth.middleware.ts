import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import prisma from '../prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = verifyToken(token);
    } catch (err) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or deactivated',
      });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles`,
      });
      return;
    }

    next();
  };
}
