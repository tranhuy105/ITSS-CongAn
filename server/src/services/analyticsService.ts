import { Dish, Restaurant, Review, User } from '@/models';

type DayString = `${number}-${number}-${number}`;

function toDayStringUTC(d: Date): DayString {
  return d.toISOString().slice(0, 10) as DayString;
}

function addDaysUTC(d: Date, days: number) {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function endOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

async function aggregateCountByDay(params: {
  model: any;
  start: Date;
  end: Date;
  extraMatch?: Record<string, any>;
}) {
  const { model, start, end, extraMatch = {} } = params;
  const rows: Array<{ _id: DayString; count: number }> = await model
    .aggregate([
      {
        $match: {
          ...extraMatch,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])
    .exec();

  return new Map(rows.map((r) => [r._id, r.count]));
}

export type AdminAnalyticsOverview = {
  range: { days: number; start: string; end: string };
  timeseries: Array<{
    date: DayString;
    users: number;
    restaurants: number;
    dishes: number;
    reviews: number;
  }>;
  userRoles: Array<{ key: string; value: number }>;
  reviewRatings: Array<{ key: string; value: number }>;
  dishCategories: Array<{ key: string; value: number }>;
};

export async function getAdminAnalyticsOverview(days: number): Promise<AdminAnalyticsOverview> {
  const safeDays = Number.isFinite(days) ? Math.max(7, Math.min(365, Math.floor(days))) : 90;

  const now = new Date();
  const end = endOfDayUTC(now);
  const start = startOfDayUTC(addDaysUTC(end, -safeDays + 1));

  const [usersByDay, restaurantsByDay, dishesByDay, reviewsByDay] = await Promise.all([
    aggregateCountByDay({ model: User, start, end }),
    aggregateCountByDay({ model: Restaurant, start, end, extraMatch: { deletedAt: null } }),
    aggregateCountByDay({ model: Dish, start, end, extraMatch: { deletedAt: null } }),
    aggregateCountByDay({ model: Review, start, end, extraMatch: { deletedAt: null } }),
  ]);

  const timeseries: AdminAnalyticsOverview['timeseries'] = [];
  for (let d = start; d <= end; d = addDaysUTC(d, 1)) {
    const key = toDayStringUTC(d);
    timeseries.push({
      date: key,
      users: usersByDay.get(key) ?? 0,
      restaurants: restaurantsByDay.get(key) ?? 0,
      dishes: dishesByDay.get(key) ?? 0,
      reviews: reviewsByDay.get(key) ?? 0,
    });
  }

  const [userRolesAgg, reviewRatingsAgg, dishCategoriesAgg] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', value: { $sum: 1 } } }, { $sort: { _id: 1 } }]).exec(),
    Review.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$rating', value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).exec(),
    Dish.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 5 },
    ]).exec(),
  ]);

  const userRoles = (userRolesAgg ?? []).map((r: any) => ({
    key: String(r._id ?? 'unknown'),
    value: Number(r.value ?? 0),
  }));

  // đảm bảo luôn có đủ 1..5 để pie chart ổn định
  const ratingMap = new Map<string, number>(
    (reviewRatingsAgg ?? []).map((r: any) => [String(r._id), Number(r.value ?? 0)])
  );
  const reviewRatings = ['1', '2', '3', '4', '5'].map((k) => ({
    key: k,
    value: ratingMap.get(k) ?? 0,
  }));

  const dishCategories = (dishCategoriesAgg ?? []).map((r: any) => ({
    key: String(r._id ?? 'unknown'),
    value: Number(r.value ?? 0),
  }));

  return {
    range: { days: safeDays, start: start.toISOString(), end: end.toISOString() },
    timeseries,
    userRoles,
    reviewRatings,
    dishCategories,
  };
}


