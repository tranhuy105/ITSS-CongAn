import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ChefHat, Heart, LogOut, Search, User, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LanguageToggle } from '../LanguageToggle'; //
import { cn } from '@/lib/utils'; //

// Nav Item Component
const NavItem = ({
  to,
  label,
  currentPath,
}: {
  to: string;
  label: string;
  currentPath: string;
}) => {
  const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary border-b-2 py-2 -mb-2',
        isActive ? 'border-primary text-primary' : 'border-transparent text-foreground/70'
      )}
    >
      {label}
    </Link>
  );
};

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth(); //
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); //
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    await logout(); //
    navigate('/', { replace: true });
    window.location.reload();
  };

  const handleSearch = (query: string) => {
    const currentPath = location.pathname;

    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else if (currentPath === '/') {
      navigate('/');
    } else {
      navigate(currentPath);
    }
  };

  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0 mr-6"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold leading-tight">VnFoodDiscovery</h1>
              <p className="text-xs text-muted-foreground">{t('nav.platform')}</p>
            </div>
          </button>

          {/* Navigation Links (NEW) */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            <NavItem to="/" label={t('nav.home')} currentPath={currentPath} />
            <NavItem to="/dishes" label={t('nav.dishes')} currentPath={currentPath} />
            <NavItem to="/restaurants" label={t('nav.restaurants')} currentPath={currentPath} />
          </nav>

          {/* Search Bar - Desktop */}
          {!showSearch && (
            <div className="hidden md:block flex-1 max-w-xl">
              <SearchBar onSearch={handleSearch} placeholder={t('home.search.placeholder')} />
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Language Toggle (MOVED) */}
            <div className="hidden md:block">
              <LanguageToggle />
            </div>

            {isAuthenticated ? (
              <>
                {/* Mobile Search Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden rounded-full"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </Button>

                {/* Favorites Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-9 px-3 gap-1"
                  onClick={() => navigate('/favorites')}
                  title={t('favorites.title')}
                >
                  <Heart className="w-5 h-5 shrink-0" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {t('favorites.title')}
                  </span>
                </Button>

                {/* User Info (Keep it simple) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80"
                  onClick={() => navigate('/profile')}
                  title={t('profile.title')}
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </Button>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full"
                  title={t('common.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                {/* Mobile Search Toggle*/}
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setShowSearch(!showSearch)}
                >
                  {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t('common.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">{t('auth.registerButton')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <SearchBar
              onSearch={(query) => {
                handleSearch(query);
                if (query.trim()) {
                  setShowSearch(false);
                }
              }}
              placeholder={t('home.search.placeholder')}
            />
          </div>
        )}

        {/* Mobile Nav Links */}
        <nav className="lg:hidden flex items-center justify-around gap-2 pb-2 pt-1 border-t">
          <NavItem to="/" label={t('nav.home')} currentPath={currentPath} />
          <NavItem to="/dishes" label={t('nav.dishes')} currentPath={currentPath} />
          <NavItem to="/restaurants" label={t('nav.restaurants')} currentPath={currentPath} />
        </nav>
      </div>
    </header>
  );
};
