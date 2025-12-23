import { ErrorCode } from '@shared/types';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * Validate a route param is a valid MongoDB ObjectId.
 * Returns 400 instead of letting Mongoose throw CastError downstream.
 */
export const validateObjectIdParam =
  (paramName: string = 'id') =>
  (req: Request, res: Response, next: NextFunction): void => {
    const raw = req.params?.[paramName];
    const value = String(raw ?? '');

    if (!mongoose.isValidObjectId(value)) {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.BAD_REQUEST,
          message: `Invalid ${paramName}`,
        },
      });
      return;
    }

    next();
  };


