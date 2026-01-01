import { ErrorCode } from '@shared/types';
import { Request, Response } from 'express';
import User from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: {
                    code: ErrorCode.CONFLICT,
                    message: 'Email already registered',
                },
            });
            return;
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            role: 'guest', // Default role
        });

        // Generate tokens
        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isLocked: user.isLocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                tokens,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred during registration',
            },
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid email or password',
                },
            });
            return;
        }

        // Check if account is locked
        if (user.isLocked) {
            res.status(403).json({
                success: false,
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Account is locked',
                },
            });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Invalid email or password',
                },
            });
            return;
        }

        // Generate tokens
        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isLocked: user.isLocked,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                tokens,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred during login',
            },
        });
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
    try {
        // In a stateless JWT system, logout is handled client-side by removing tokens
        // If using refresh token storage (Redis/DB), invalidate it here

        res.status(200).json({
            success: true,
            data: {
                message: 'Logged out successfully',
            },
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred during logout',
            },
        });
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Verify user still exists and is not locked
        const user = await User.findById(payload.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'User not found',
                },
            });
            return;
        }

        if (user.isLocked) {
            res.status(403).json({
                success: false,
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Account is locked',
                },
            });
            return;
        }

        // Generate new tokens
        const tokens = generateTokens({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            success: true,
            data: {
                tokens,
            },
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: {
                code: ErrorCode.UNAUTHORIZED,
                message: 'Invalid or expired refresh token',
            },
        });
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });

        // TODO: Implement email sending with reset token
        // For now, just log the reset request
        if (user) {
            console.log(`Password reset requested for user: ${user.email}`);
        }

        // Always return success to prevent email enumeration
        // In production, send actual reset email here
        res.status(200).json({
            success: true,
            data: {
                message: 'If the email exists, a password reset link has been sent',
            },
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred processing your request',
            },
        });
    }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (_req: Request, res: Response): Promise<void> => {
    try {
        // TODO: Implement token verification and password reset
        // For now, return not implemented
        res.status(501).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'Password reset functionality not yet implemented',
            },
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred resetting your password',
            },
        });
    }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'User not found',
                },
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isLocked: user.isLocked,
                    favorites: user.favorites,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred fetching user data',
            },
        });
    }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const { name, email } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'User not found',
                },
            });
            return;
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    error: {
                        code: ErrorCode.CONFLICT,
                        message: 'Email already registered',
                    },
                });
                return;
            }
            user.email = email;
        }

        if (name !== undefined) {
            user.name = name;
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isLocked: user.isLocked,
                    favorites: user.favorites,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred updating profile',
            },
        });
    }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Not authenticated',
                },
            });
            return;
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId).select('+password');

        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'User not found',
                },
            });
            return;
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                error: {
                    code: ErrorCode.UNAUTHORIZED,
                    message: 'Current password is incorrect',
                },
            });
            return;
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                message: 'Password changed successfully',
            },
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: 'An error occurred changing password',
            },
        });
    }
};
