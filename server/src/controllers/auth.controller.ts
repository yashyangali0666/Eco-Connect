import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { Role } from '@prisma/client';
import { fallbackStore } from '../services/fallbackStore.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);
    let user: any = null;
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      });

      if (existingUser) {
        sendError(res, 'An account with this email address already exists', 409);
        return;
      }

      user = await prisma.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email.toLowerCase(),
          phone: validatedData.phone || null,
          passwordHash,
          role: Role.USER,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      // Send welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to EcoCollect! 🌱',
          message: 'Your account is ready. Learn waste segregation guidelines and schedule your first pickup.',
          type: 'SUCCESS',
        },
      }).catch(() => {});
    } catch (dbErr: any) {
      console.warn('Notice: Database unavailable during registration, using fallback store:', dbErr?.message || dbErr);
      const existingInFallback = fallbackStore.findUserByEmail(validatedData.email);
      if (existingInFallback) {
        sendError(res, 'An account with this email address already exists', 409);
        return;
      }

      user = fallbackStore.createUser({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        role: 'USER',
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(
      res,
      { user, token },
      'Account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbErr: any) {
      console.warn('Notice: Database unavailable during login, using fallback store:', dbErr?.message || dbErr);
      user = fallbackStore.findUserByEmail(email);
    }

    // If not found in DB or DB unseeded, also check fallback store for demo & newly registered users
    if (!user) {
      user = fallbackStore.findUserByEmail(email);
    }

    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (user.isActive === false) {
      sendError(res, 'Your account has been deactivated. Please contact support.', 403);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    sendSuccess(res, { user: safeUser, token }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 401);
      return;
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
          staffProfile: true,
        },
      });
    } catch (dbErr) {
      user = fallbackStore.findUserById(req.user.id);
    }

    if (!user) {
      user = fallbackStore.findUserById(req.user.id);
    }

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 401);
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    let updatedUser: any = null;

    try {
      updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: validatedData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          updatedAt: true,
        },
      });
    } catch (dbErr) {
      const existing = fallbackStore.findUserById(req.user.id);
      if (existing) {
        if (validatedData.name) existing.name = validatedData.name;
        if (validatedData.phone !== undefined) existing.phone = validatedData.phone;
        if (validatedData.avatar !== undefined) existing.avatar = validatedData.avatar;
        updatedUser = existing;
      }
    }

    sendSuccess(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 401);
      return;
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
    } catch (dbErr) {
      user = fallbackStore.findUserById(req.user.id);
    }

    if (!user) {
      user = fallbackStore.findUserById(req.user.id);
    }

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Current password is incorrect', 400);
      return;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash },
      });
    } catch (dbErr) {
      user.passwordHash = newPasswordHash;
    }

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, null, 'Logged out successfully');
}
