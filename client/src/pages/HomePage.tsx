import { DishCard, DishCardSkeleton } from '@/components/DishCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getDishes } from '@/services/dishService';
import { useQuery } from '@tanstack/react-query';
import { ChefHat, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

export const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get search query from URL
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dishes', selectedCategory, selectedRegion, searchQuery, page],
    queryFn: () =>
      getDishes({
        page,
        limit: 12,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        region: selectedRegion === 'All' ? undefined : selectedRegion,
        search: searchQuery || undefined,
      }),
  });

  const language = i18n.language as 'ja' | 'vi';

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedRegion('All');
    setPage(1);
  };

  return (
    <AppLayout>
      {/* Hero Section with Background */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/placeholder.jpg"
            alt="Vietnamese Food"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">{t('home.hero.subtitle')}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl font-bold">{data?.pagination.total || 0}</span>
                </div>
                <span className="text-white/90">Dishes</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
                <span className="text-white/90">Authentic</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <span className="text-white/90">Locations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg p-4">
              <FilterSidebar
                selectedCategory={selectedCategory}
                selectedRegion={selectedRegion}
                onCategoryChange={(cat) => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                onRegionChange={(reg) => {
                  setSelectedRegion(reg);
                  setPage(1);
                }}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background border-r shadow-xl overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">{t('home.filters.title')}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    selectedRegion={selectedRegion}
                    onCategoryChange={(cat) => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                    onRegionChange={(reg) => {
                      setSelectedRegion(reg);
                      setPage(1);
                    }}
                    onClearFilters={handleClearFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dishes Grid */}
          <main className="flex-1 min-w-0">
            {error && (
              <Card className="border-destructive/50 bg-destructive/5 mb-6">
                <CardContent className="p-6">
                  <p className="text-destructive">{t('home.error.loadFailed')}</p>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <DishCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.dishes.length === 0 ? (
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
                    <span className="font-semibold text-foreground">{data?.dishes.length}</span>{' '}
                    {t('home.of')}{' '}
                    <span className="font-semibold text-foreground">{data?.pagination.total}</span>{' '}
                    {t('home.dishes')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {data?.dishes.map((dish: any) => (
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
                      language={language}
                    />
                  ))}
                </div>

                {data && data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm font-medium">
                        {t('common.page')} {page}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('common.of')} {data.pagination.totalPages}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      {t('common.next')}
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
