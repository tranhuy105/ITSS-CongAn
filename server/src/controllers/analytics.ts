import { ErrorCode } from '@shared/types';
import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';

/**
 * GET /api/admin/analytics/overview?days=90
 * Dashboard analytics (Admin)
 */
export const getAdminAnalyticsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days } = req.query;
    const parsedDays = days ? parseInt(days as string) : 90;

    const data = await analyticsService.getAdminAnalyticsOverview(parsedDays);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get admin analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch analytics overview' },
    });
  }
};


