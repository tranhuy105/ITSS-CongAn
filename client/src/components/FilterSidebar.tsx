import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterSidebarProps {
    selectedCategory: string;
    selectedRegion: string;
    onCategoryChange: (category: string) => void;
    onRegionChange: (region: string) => void;
    onClearFilters: () => void;
}

const categories = [
    { key: 'all', value: 'All' },
    { key: 'pho', value: 'Phở' },
    { key: 'banh', value: 'Bánh' },
    { key: 'com', value: 'Cơm' },
    { key: 'bun', value: 'Bún' },
    { key: 'goi', value: 'Gỏi' },
    { key: 'che', value: 'Chè' },
];

const regions = [
    { key: 'all', value: 'All' },
    { key: 'north', value: 'Miền Bắc' },
    { key: 'central', value: 'Miền Trung' },
    { key: 'south', value: 'Miền Nam' },
];

export const FilterSidebar = ({
    selectedCategory,
    selectedRegion,
    onCategoryChange,
    onRegionChange,
    onClearFilters,
}: FilterSidebarProps) => {
    const { t } = useTranslation();

    const hasActiveFilters = selectedCategory !== 'All' || selectedRegion !== 'All';

    return (
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Category Filter */}
            <div>
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    {t('home.filters.category')}
                </h3>
                <div className="space-y-1">
                    {categories.map((category) => (
                        <button
                            key={category.key}
                            onClick={() => onCategoryChange(category.value)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${selectedCategory === category.value
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-accent'
                                }`}
                        >
                            {t(`home.filters.categories.${category.key}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Region Filter */}
            <div className="pt-4 border-t">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    {t('home.filters.region')}
                </h3>
                <div className="space-y-1">
                    {regions.map((region) => (
                        <button
                            key={region.key}
                            onClick={() => onRegionChange(region.value)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${selectedRegion === region.value
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-accent'
                                }`}
                        >
                            {t(`home.filters.regions.${region.key}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full" onClick={onClearFilters}>
                        <X className="w-3 h-3 mr-2" />
                        {t('home.filters.clear')}
                    </Button>
                </div>
            )}
        </div>
    );
};
