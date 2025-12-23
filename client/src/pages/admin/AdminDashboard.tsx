import { AdminLayout } from '@/components/admin/AdminLayout';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChartAreaInteractive,
} from '@/components/ui/chart-area-interactive';
import { ChartPie } from '@/components/ui/chart-pie';
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalyticsOverview } from '@/services/adminAnalyticsService';

function makeChartConfig(keys: string[], labels: Record<string, string>) {
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];
  const cfg: Record<string, { label: string; color: string }> = {};
  keys.forEach((k, i) => {
    cfg[k] = { label: labels[k] ?? k, color: colors[i % colors.length] };
  });
  return cfg;
}

function normalizeKey(k: string) {
  return (k || 'unknown').toString().trim().toLowerCase().replace(/\s+/g, '_');
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analytics-overview', 90],
    queryFn: () => getAdminAnalyticsOverview({ days: 90 }),
    staleTime: 60 * 1000,
  });

  const timeseries = data?.timeseries ?? [];
  const seriesUsersRestaurants = timeseries.map((d) => ({
    date: d.date,
    users: d.users,
    restaurants: d.restaurants,
  }));
  const seriesDishesReviews = timeseries.map((d) => ({
    date: d.date,
    dishes: d.dishes,
    reviews: d.reviews,
  }));

  const usersRestaurantsConfig = makeChartConfig(['users', 'restaurants'], {
    users: t('admin.dashboardCharts.legend.series.usersNew'),
    restaurants: t('admin.dashboardCharts.legend.series.restaurantsNew'),
  });

  const dishesReviewsConfig = makeChartConfig(['dishes', 'reviews'], {
    dishes: t('admin.dashboardCharts.legend.series.dishesNew'),
    reviews: t('admin.dashboardCharts.legend.series.reviewsNew'),
  });

  const roleLabelMap: Record<string, string> = {
    admin: t('admin.dashboardCharts.legend.roles.admin'),
    guest: t('admin.dashboardCharts.legend.roles.guest'),
    unknown: t('admin.dashboardCharts.legend.roles.unknown'),
  };
  const userRoles = (data?.userRoles ?? []).map((x) => ({
    key: normalizeKey(x.key),
    value: x.value,
  }));
  const userRolesConfig = makeChartConfig(
    userRoles.map((x) => x.key),
    Object.fromEntries(userRoles.map((x) => [x.key, roleLabelMap[x.key] ?? x.key]))
  );

  const ratingLabelMap: Record<string, string> = {
    '1': t('admin.dashboardCharts.legend.ratings.1'),
    '2': t('admin.dashboardCharts.legend.ratings.2'),
    '3': t('admin.dashboardCharts.legend.ratings.3'),
    '4': t('admin.dashboardCharts.legend.ratings.4'),
    '5': t('admin.dashboardCharts.legend.ratings.5'),
  };
  const reviewRatings = (data?.reviewRatings ?? [])
    .filter((x) => ['1', '2', '3', '4', '5'].includes(String(x.key)))
    .map((x) => ({
      key: String(x.key), // giữ nguyên "1".."5"
      value: x.value,
    }));
  const reviewRatingsConfig = makeChartConfig(
    reviewRatings.map((x) => x.key),
    Object.fromEntries(reviewRatings.map((x) => [x.key, ratingLabelMap[x.key] ?? x.key]))
  );

  const dishCategoriesRaw = data?.dishCategories ?? [];
  const dishCategories = dishCategoriesRaw.map((x) => ({
    key: normalizeKey(x.key),
    value: x.value,
  }));
  const dishCategoryLabels = Object.fromEntries(
    dishCategories.map((x, idx) => [x.key, t('admin.dashboardCharts.legend.categoryIndex', { index: idx + 1 })])
  );
  const dishCategoriesConfig = makeChartConfig(
    dishCategories.map((x) => x.key),
    dishCategoryLabels
  );

  return (
    <AdminLayout title={t('admin.dashboard')}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('admin.welcomeMessage')}</h2>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('admin.dashboardDescription')}</p>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">{t('admin.dashboardCharts.loading')}</p>
            </CardContent>
          </Card>
        ) : isError ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{t('admin.dashboardCharts.loadError')}</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartAreaInteractive
            title={t('admin.dashboardCharts.area.usersRestaurants.title')}
            description={t('admin.dashboardCharts.area.usersRestaurants.description')}
            data={seriesUsersRestaurants}
            config={usersRestaurantsConfig}
            seriesKeys={['users', 'restaurants']}
          />

          <ChartAreaInteractive
            title={t('admin.dashboardCharts.area.dishesReviews.title')}
            description={t('admin.dashboardCharts.area.dishesReviews.description')}
            data={seriesDishesReviews}
            config={dishesReviewsConfig}
            seriesKeys={['dishes', 'reviews']}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <ChartPie
            title={t('admin.dashboardCharts.pie.userRoles.title')}
            description={t('admin.dashboardCharts.pie.userRoles.description')}
            data={userRoles}
            config={userRolesConfig}
          />

          <ChartPie
            title={t('admin.dashboardCharts.pie.reviewRatings.title')}
            description={t('admin.dashboardCharts.pie.reviewRatings.description')}
            data={reviewRatings}
            config={reviewRatingsConfig}
          />

          <ChartPie
            title={t('admin.dashboardCharts.pie.dishCategories.title')}
            description={t('admin.dashboardCharts.pie.dishCategories.description')}
            data={dishCategories}
            config={dishCategoriesConfig}
          />
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 shadow-sm">
        <LanguageToggle />
      </div>
    </AdminLayout>
  );
};
