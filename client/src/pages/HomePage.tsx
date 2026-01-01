import { DishCard } from '@/components/DishCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDishes } from '@/services/dishService';
import { getRestaurants } from '@/services/restaurantService';
import { useQuery } from '@tanstack/react-query';
import { ChefHat, Store, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';

// Số lượng items hiển thị ban đầu và số items load thêm mỗi lần
const HOME_LIMIT = 4;

type FeedItem = { _id: string; [key: string]: unknown };
type FeedResponse = {
  dishes?: FeedItem[];
  restaurants?: FeedItem[];
  pagination?: { total?: number };
};
type FetchFn = (params: Record<string, unknown>) => Promise<FeedResponse>;

// Component cho một khối Feed (Dishes hoặc Restaurants)
const FeedSection = ({
  title,
  linkTo,
  queryKey,
  fetchFn,
  CardComponent,
  NoItemsComponent,
  isFetchingGlobalSearch,
  language,
}: {
  title: string;
  linkTo: string;
  queryKey: string;
  fetchFn: FetchFn;
  CardComponent: React.ElementType;
  NoItemsComponent: React.ElementType;
  isFetchingGlobalSearch: boolean;
  language: 'ja' | 'vi';
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [allItems, setAllItems] = useState<FeedItem[]>([]); // Lưu TẤT CẢ items
  const [displayLimit, setDisplayLimit] = useState(HOME_LIMIT); // Số items hiển thị
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch TẤT CẢ data một lần duy nhất (không phân trang)
  const { data, isLoading } = useQuery<FeedResponse>({
    queryKey: [queryKey, search],
    queryFn: () =>
      fetchFn({
        page: 1,
        limit: 9999, // Load tất cả (hoặc số lớn đủ để lấy hết)
        search: search || undefined,
        sortBy: '-updatedAt',
      }),
    staleTime: 60 * 1000,
  });

  // Cập nhật allItems khi data thay đổi
  useEffect(() => {
    if (data) {
      const items = data.dishes ?? data.restaurants ?? [];
      setAllItems(items);
      console.log(`[${queryKey}] Loaded ${items.length} total items`);
    }
  }, [data, queryKey]);

  // Reset displayLimit khi search thay đổi
  useEffect(() => {
    console.log('Search changed:', search);
    setDisplayLimit(HOME_LIMIT);
  }, [search]);

  const total = allItems.length;
  const displayedItems = allItems.slice(0, displayLimit);
  const hasMore = displayLimit < total;
  const showCollapse = displayLimit > HOME_LIMIT;

  const DisplayCard = CardComponent as React.ElementType;

  // Xử lý khi bấm Xem thêm - Tăng displayLimit lên 4 items
  const handleLoadMore = () => {
    const newLimit = displayLimit + HOME_LIMIT;
    setDisplayLimit(newLimit);
    console.log(`[${queryKey}] Showing ${Math.min(newLimit, total)} / ${total} items`);

    // Scroll đến items mới sau khi render
    setTimeout(() => {
      if (containerRef.current) {
        const children = containerRef.current.children;
        const targetIndex = displayLimit; // Item đầu tiên của batch mới
        if (children[targetIndex]) {
          children[targetIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, 100);
  };

  // Xử lý thu gọn - Reset về 4 items ban đầu
  const handleCollapse = () => {
    setDisplayLimit(HOME_LIMIT);
    console.log(`[${queryKey}] Collapsed to ${HOME_LIMIT} items`);

    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  // Xử lý hiển thị tất cả
  const handleShowAll = () => {
    setDisplayLimit(total);
    console.log(`[${queryKey}] Showing all ${total} items`);

    setTimeout(() => {
      if (containerRef.current) {
        const lastChild = containerRef.current.lastElementChild;
        if (lastChild) {
          lastChild.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, 100);
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-xl font-bold">
          {title} ({total})
        </CardTitle>
        <Link
          to={linkTo}
          className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
        >
          {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading || isFetchingGlobalSearch ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: HOME_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <NoItemsComponent search={search} />
        ) : (
          <>
            {/* Grid container - Hiển thị items theo displayLimit */}
            <div
              ref={containerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayedItems.map((item, index) => (
                <div
                  key={item._id}
                  className="transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    animation: 'fadeIn 0.5s ease-in-out',
                    animationDelay: `${Math.min(index * 50, 300)}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <DisplayCard
                    id={item._id}
                    language={language}
                    name={item.name}
                    description={item.description}
                    images={item.images}
                    averageRating={item.averageRating}
                    reviewCount={item.reviewCount}
                    cookingTime={item.cookingTime}
                    category={item.category}
                    region={item.region}
                    address={item.address}
                    phone={item.phone}
                    dishes={item.dishes}
                    minPrice={item.minPrice}
                    maxPrice={item.maxPrice}
                  />
                </div>
              ))}
            </div>

            {/* Button group - Xem thêm và Thu gọn */}
            <div className="flex justify-center gap-4 mt-8">
              {/* Button Xem thêm 4 items */}
              {hasMore && displayLimit < total && (
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:shadow-md group"
                >
                  <ChevronDown className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                  {t('common.loadMore', { target: title })} (+{Math.min(HOME_LIMIT, total - displayLimit)})
                </Button>
              )}

              {/* Button Hiển thị tất cả */}
              {/* {hasMore && displayLimit + HOME_LIMIT < total && (
                <Button
                  onClick={handleShowAll}
                  variant="ghost"
                  size="sm"
                  className="px-6 py-6 text-sm text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  {t('common.showAll', { count: total })}
                </Button>
              )} */}

              {/* Button Thu gọn */}
              {showCollapse && (
                <Button
                  onClick={handleCollapse}
                  variant="ghost"
                  size="lg"
                  className="px-8 py-6 text-base text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:shadow-md group"
                >
                  <ChevronUp className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform duration-300" />
                  {t('common.collapse')}
                </Button>
              )}
            </div>

            {/* Thông báo đang hiển thị bao nhiêu items */}
            {/* {displayedItems.length > 0 && (
              <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                  {displayLimit >= total
                    ? t('home.messages.showingAll', { count: total, title })
                    : `Đang hiển thị ${displayedItems.length} / ${total} ${title.toLowerCase()}`}
                </p>
              </div>
            )} */}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// No Items component for Dish
const NoDishes = ({ search }: { search: string }) => {
  const { t } = useTranslation();
  return (
    <div className="p-12 text-center text-muted-foreground">
      <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold mb-3">{t('home.noDishes.title')}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {search
          ? t('home.noDishes.searchNoResults', { search })
          : t('home.noDishes.subtitle')}
      </p>
    </div>
  );
};

// No Items component for Restaurant
const NoRestaurants = ({ search }: { search: string }) => {
  const { t } = useTranslation();
  return (
    <div className="p-12 text-center text-muted-foreground">
      <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 className="text-xl font-semibold mb-3">{t('restaurants.noRestaurants.title')}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        {search
          ? t('restaurants.noRestaurants.searchNoResults', { search })
          : t('restaurants.noRestaurants.subtitle')}
      </p>
    </div>
  );
};

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const [isFetchingGlobalSearch, setIsFetchingGlobalSearch] = useState(false);
  useEffect(() => {
    if (search) {
      setIsFetchingGlobalSearch(true);
      const timer = setTimeout(() => setIsFetchingGlobalSearch(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsFetchingGlobalSearch(false);
    }
  }, [search]);

  const language = i18n.language as 'ja' | 'vi';

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-16 mb-8 border-b">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-primary">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
        </section>

        <h2 className="text-2xl font-bold mb-6">{t('home.latestHeading')}</h2>

        {search && (
          <div className="mb-6 p-4 border rounded-lg bg-primary/5">
            <p className="text-sm font-medium">
              {t('home.searchingFor')}{' '}
              <span className="font-bold text-primary">"{search}"</span>
            </p>
          </div>
        )}

        {/* Dishes Section */}
        <FeedSection
          title={t('home.sections.newDishes')}
          linkTo="/dishes"
          queryKey="homepageDishes"
          fetchFn={getDishes}
          CardComponent={DishCard}
          NoItemsComponent={NoDishes}
          isFetchingGlobalSearch={isFetchingGlobalSearch}
          language={language}
        />

        {/* Restaurants Section */}
        <FeedSection
          title={t('home.sections.newRestaurants')}
          linkTo="/restaurants"
          queryKey="homepageRestaurants"
          fetchFn={getRestaurants}
          CardComponent={RestaurantCard}
          NoItemsComponent={NoRestaurants}
          isFetchingGlobalSearch={isFetchingGlobalSearch}
          language={language}
        />
      </div>
    </AppLayout>
  );
};
