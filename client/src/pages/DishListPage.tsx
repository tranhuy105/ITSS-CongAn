import { DishCard, DishCardSkeleton } from '@/components/DishCard'; //
import { FilterSidebar } from '@/components/FilterSidebar'; //
import { AppLayout } from '@/components/layout/AppLayout'; //
import { Button } from '@/components/ui/button'; //
import { Card, CardContent } from '@/components/ui/card'; //
import { getDishes } from '@/services/dishService'; //
import { useInfiniteQuery } from '@tanstack/react-query';
import { ChefHat, SlidersHorizontal, X, Star, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; //
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input'; //

export const DishListPage = () => {
  // Đã đổi tên
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('-updatedAt');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const language = i18n.language as 'ja' | 'vi';
  const dishLimit = 12;

  // --- Infinite Query cho Load More ---
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: [
        'dishesList',
        selectedCategory,
        selectedRegion,
        localSearchQuery,
        sortBy,
        minRating,
        maxRating,
        minPrice,
        maxPrice,
      ],
      queryFn: ({ pageParam = 1 }) =>
        getDishes({
          page: pageParam,
          limit: dishLimit,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          region: selectedRegion === 'All' ? undefined : selectedRegion,
          search: localSearchQuery || undefined,
          sortBy: sortBy,
          minRating: minRating ? parseFloat(minRating) : undefined,
          maxRating: maxRating ? parseFloat(maxRating) : undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
      staleTime: 60 * 1000,
    });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Lấy search query từ URL (nếu có từ Header)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setLocalSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const allDishes = data?.pages.flatMap((page) => page.dishes) || [];
  const totalDishes = data?.pages[0]?.pagination.total || 0;

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedRegion('All');
    setLocalSearchQuery('');
    setSortBy('-updatedAt');
    setMinRating('');
    setMaxRating('');
    setMinPrice('');
    setMaxPrice('');
    setShowMobileFilters(false);
  };

  const handleNumberInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value.replace(/[^0-9.]/g, ''));
  };

  const isFiltered =
    selectedCategory !== 'All' ||
    selectedRegion !== 'All' ||
    localSearchQuery ||
    sortBy !== '-updatedAt' ||
    minRating ||
    maxRating ||
    minPrice ||
    maxPrice;

  return (
    <AppLayout>
      {/* Mobile Filter Button */}
      <div className="lg:hidden sticky top-16 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {t('home.filters.title')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Danh sách Món Ăn</h1>

        <div className="flex gap-6">
          {/* Desktop Sidebar (Filters) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                {t('home.filters.title')}
              </h2>

              {/* Local Search Input */}
              <div className="space-y-2">
                <Input
                  placeholder="Tìm theo tên món ăn..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                />
              </div>

              {/* Sorting */}
              <div className="pt-4 border-t space-y-2">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                  Sắp xếp
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9 border rounded-md p-2 text-sm bg-background"
                >
                  <option value="-updatedAt">Mới nhất (Mặc định)</option>
                  <option value="-averageRating">Đánh giá (Cao nhất)</option>
                  <option value="averageRating">Đánh giá (Thấp nhất)</option>
                  <option value="cookingTime">Thời gian nấu (Tăng dần)</option>
                  <option value="-cookingTime">Thời gian nấu (Giảm dần)</option>
                  <option value="price">Giá (Tăng dần)</option> {/* <<< BỔ SUNG */}
                  <option value="-price">Giá (Giảm dần)</option> {/* <<< BỔ SUNG */}
                </select>
              </div>

              {/* Price Filter */}
              <div className="pt-4 border-t space-y-2">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  Giá (VNĐ) <DollarSign className="w-3 h-3" />
                </h3>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Từ"
                    value={minPrice}
                    onChange={(e) => handleNumberInputChange(setMinPrice, e.target.value)}
                    className="w-1/2 h-9 text-sm"
                  />
                  -
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="Đến"
                    value={maxPrice}
                    onChange={(e) => handleNumberInputChange(setMaxPrice, e.target.value)}
                    className="w-1/2 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="pt-4 border-t space-y-2">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  Đánh giá <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </h3>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="Từ 0"
                    value={minRating}
                    onChange={(e) => handleNumberInputChange(setMinRating, e.target.value)}
                    className="w-1/2 h-9 text-sm"
                  />
                  -
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="Đến 5"
                    value={maxRating}
                    onChange={(e) => handleNumberInputChange(setMaxRating, e.target.value)}
                    className="w-1/2 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Category & Region Filter */}
              <FilterSidebar
                selectedCategory={selectedCategory}
                selectedRegion={selectedRegion}
                onCategoryChange={(cat) => {
                  setSelectedCategory(cat);
                }}
                onRegionChange={(reg) => {
                  setSelectedRegion(reg);
                }}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-card border-r shadow-xl overflow-y-auto">
                <div className="p-4 space-y-4">
                  {/* ... (Header và Local Search Input Mobile) */}
                  <Input
                    placeholder="Tìm theo tên món ăn..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                  />

                  {/* Sorting Mobile */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                      Sắp xếp
                    </h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-9 border rounded-md p-2 text-sm bg-background"
                    >
                      <option value="-updatedAt">Mới nhất (Mặc định)</option>
                      <option value="-averageRating">Đánh giá (Cao nhất)</option>
                      <option value="averageRating">Đánh giá (Thấp nhất)</option>
                      <option value="cookingTime">Thời gian nấu (Tăng dần)</option>
                      <option value="-cookingTime">Thời gian nấu (Giảm dần)</option>
                      <option value="price">Giá (Tăng dần)</option> {/* <<< BỔ SUNG */}
                      <option value="-price">Giá (Giảm dần)</option> {/* <<< BỔ SUNG */}
                    </select>
                  </div>

                  {/* Price Filter Mobile <<< BỔ SUNG */}
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      Giá (VNĐ) <DollarSign className="w-3 h-3" />
                    </h3>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="Từ"
                        value={minPrice}
                        onChange={(e) => handleNumberInputChange(setMinPrice, e.target.value)}
                        className="w-1/2 h-9 text-sm"
                      />
                      -
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="Đến"
                        value={maxPrice}
                        onChange={(e) => handleNumberInputChange(setMaxPrice, e.target.value)}
                        className="w-1/2 h-9 text-sm"
                      />
                    </div>
                  </div>
                  {/* END Price Filter Mobile */}

                  {/* Rating Filter Mobile */}
                  <div className="pt-4 border-t space-y-2">
                    <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      Đánh giá <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </h3>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Từ 0"
                        value={minRating}
                        onChange={(e) => handleNumberInputChange(setMinRating, e.target.value)}
                        className="w-1/2 h-9 text-sm"
                      />
                      -
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Đến 5"
                        value={maxRating}
                        onChange={(e) => handleNumberInputChange(setMaxRating, e.target.value)}
                        className="w-1/2 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    selectedRegion={selectedRegion}
                    onCategoryChange={(cat) => {
                      setSelectedCategory(cat);
                    }}
                    onRegionChange={(reg) => {
                      setSelectedRegion(reg);
                    }}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dishes Grid */}
          <main className="flex-1 min-w-0">
            {isError && (
              <Card className="border-destructive/50 bg-destructive/5 mb-6">
                <CardContent className="p-6">
                  <p className="text-destructive">{t('home.error.loadFailed')}</p>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <DishCardSkeleton key={i} />
                ))}
              </div>
            ) : allDishes.length === 0 ? (
              <Card>
                <CardContent className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <ChefHat className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('home.noDishes.title')}</h3>
                  <p className="text-muted-foreground">{t('home.noDishes.subtitle')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('home.showing')}{' '}
                    <span className="font-semibold text-foreground">{allDishes.length}</span>{' '}
                    {t('home.of')}{' '}
                    <span className="font-semibold text-foreground">{totalDishes}</span>{' '}
                    {t('home.dishes')}
                  </p>

                  {(isFiltered || totalDishes > allDishes.length) && (
                    <Button
                      variant="link"
                      onClick={handleClearFilters}
                      className="text-sm p-0 h-auto"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t('home.filters.clear')}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {allDishes.map((dish: any) => (
                    <DishCard
                      key={dish._id}
                      id={dish._id}
                      name={dish.name}
                      description={dish.description}
                      images={dish.images}
                      averageRating={dish.averageRating}
                      reviewCount={dish.reviewCount}
                      cookingTime={dish.cookingTime}
                      category={dish.category}
                      region={dish.region}
                      price={dish.price}
                      language={language}
                    />
                  ))}
                </div>

                {/* Load More Button (Xem thêm) */}
                {hasNextPage && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      size="lg"
                    >
                      {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
};
