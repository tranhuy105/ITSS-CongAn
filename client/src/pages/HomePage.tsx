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

const HOME_LIMIT = 4;

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
  fetchFn: (params: any) => Promise<any>;
  CardComponent: React.ElementType;
  NoItemsComponent: React.ElementType;
  isFetchingGlobalSearch: boolean;
  language: 'ja' | 'vi';
}) => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKey, search, page],
    queryFn: () =>
      fetchFn({
        page,
        limit: HOME_LIMIT,
        search: search || undefined,
        sortBy: '-updatedAt',
      }),
    staleTime: 60 * 1000,
  });

  // Cập nhật items khi data thay đổi
  useEffect(() => {
    console.log('Data received:', data); // Debug
    if (data) {
      const newItems = (data?.dishes || data?.restaurants || []) as any[];
      console.log('New items:', newItems.length); // Debug

      if (page === 1) {
        setItems(newItems);
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((item) => item._id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item._id));
          return [...prev, ...uniqueNewItems];
        });
      }
    } else {
      // QUAN TRỌNG: Reset items khi data là undefined
      console.log('Data is undefined, resetting items');
      setItems([]);
    }
  }, [data, page]);

  // Reset page và items khi search thay đổi
  useEffect(() => {
    console.log('Search changed:', search);
    setPage(1);
    setIsExpanded(false);
  }, [search]);

  const total = data?.pagination?.total || 0;
  const isLastPage = items.length >= total;
  const showLoadMore = !isLastPage && total > HOME_LIMIT;
  const showCollapse = items.length > HOME_LIMIT && isExpanded;

  const DisplayCard = CardComponent as React.ElementType;

  // Items để hiển thị - SỬA: Sử dụng displayedItems thay vì items
  const displayedItems = isExpanded ? items : items.slice(0, HOME_LIMIT);

  // Xử lý khi bấm Xem thêm
  const handleLoadMore = () => {
    if (page === 1 && !isExpanded) {
      setIsExpanded(true);
    }

    const nextPage = page + 1;
    setPage(nextPage);

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

  // Xử lý thu gọn
  const handleCollapse = () => {
    setIsExpanded(false);
    setPage(1);

    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  // Xử lý mở rộng
  const handleExpand = () => {
    setIsExpanded(true);

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

  // Animation class cho items - SỬA: Dùng displayedItems.length thay vì items.length
  const getItemAnimationClass = (index: number) => {
    if (!isExpanded && index >= HOME_LIMIT) {
      return 'opacity-0 max-h-0 overflow-hidden';
    }
    return 'opacity-100 max-h-[500px] transition-all duration-500 ease-in-out';
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
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading || isFetchingGlobalSearch ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: HOME_LIMIT }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <NoItemsComponent search={search} />
        ) : (
          <>
            {/* Grid container với ref - SỬA: Dùng displayedItems thay vì items */}
            <div
              ref={containerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {displayedItems.map(
                (
                  item: any,
                  index: number // SỬA: displayedItems
                ) => (
                  <div
                    key={item._id}
                    className={`${getItemAnimationClass(index)} transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
                    style={{
                      transitionDelay: isExpanded ? `${Math.min(index * 50, 300)}ms` : '0ms',
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
                    />
                  </div>
                )
              )}

              {/* Hiển thị skeleton khi đang tải thêm */}
              {isFetching &&
                page > 1 &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="opacity-0 animate-fadeIn"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <Skeleton className="h-64 rounded-lg" />
                  </div>
                ))}
            </div>

            {/* Button group - Xem thêm và Thu gọn */}
            <div className="flex justify-center gap-4 mt-8">
              {/* Button Xem thêm */}
              {showLoadMore && !isFetching && (
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:shadow-md group"
                >
                  <ChevronDown className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                  Xem thêm {title.toLowerCase()}
                </Button>
              )}

              {/* Button Thu gọn */}
              {showCollapse && !isFetching && (
                <Button
                  onClick={handleCollapse}
                  variant="ghost"
                  size="lg"
                  className="px-8 py-6 text-base text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:shadow-md group"
                >
                  <ChevronUp className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform duration-300" />
                  Thu gọn
                </Button>
              )}

              {/* Button Mở rộng */}
              {!isExpanded && items.length > HOME_LIMIT && !isFetching && (
                <Button
                  onClick={handleExpand}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:shadow-md group"
                >
                  <ChevronDown className="w-5 h-5 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                  Hiển thị tất cả ({items.length})
                </Button>
              )}
            </div>

            {/* Loading indicator khi đang tải thêm */}
            {isFetching && page > 1 && (
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-muted-foreground">Đang tải thêm...</p>
                </div>
              </div>
            )}

            {/* Thông báo đã tải hết */}
            {isLastPage && items.length > 0 && (
              <div className="text-center mt-6">
                <p className="text-muted-foreground text-sm">
                  Đã hiển thị tất cả {items.length} {title.toLowerCase()}
                </p>
              </div>
            )}
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
          ? `Không tìm thấy món ăn nào cho "${search}". Hãy thử từ khóa khác.`
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
          ? `Không tìm thấy nhà hàng nào cho "${search}". Hãy thử từ khóa khác.`
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

        <h2 className="text-2xl font-bold mb-6">Món Ăn & Nhà Hàng Mới Nhất</h2>

        {search && (
          <div className="mb-6 p-4 border rounded-lg bg-primary/5">
            <p className="text-sm font-medium">
              Đang tìm kiếm cho: <span className="font-bold text-primary">"{search}"</span>
            </p>
          </div>
        )}

        {/* Dishes Section */}
        <FeedSection
          title="Món Ăn Mới"
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
          title="Nhà Hàng Mới"
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
