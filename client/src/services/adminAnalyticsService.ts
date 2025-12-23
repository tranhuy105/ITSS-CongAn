import api from './api';

export type AdminAnalyticsOverviewResponse = {
  range: { days: number; start: string; end: string };
  timeseries: Array<{
    date: string; // YYYY-MM-DD
    users: number;
    restaurants: number;
    dishes: number;
    reviews: number;
  }>;
  userRoles: Array<{ key: string; value: number }>;
  reviewRatings: Array<{ key: string; value: number }>;
  dishCategories: Array<{ key: string; value: number }>;
};

export const getAdminAnalyticsOverview = async (params: { days?: number } = {}) => {
  const response = await api.get('/admin/analytics/overview', { params });
  return response.data.data as AdminAnalyticsOverviewResponse;
};


