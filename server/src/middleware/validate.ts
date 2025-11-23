import { ErrorCode } from '@shared/types';
import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

/**
 * Middleware to validate request body against a Zod schema
 */
export const validate = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: ErrorCode.VALIDATION_ERROR,
                        message: 'Validation failed',
                        details: error.issues.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: {
                    code: ErrorCode.INTERNAL_ERROR,
                    message: 'An error occurred during validation',
                },
            });
        }
    };
};
