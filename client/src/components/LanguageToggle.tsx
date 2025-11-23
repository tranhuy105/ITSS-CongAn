import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="inline-flex rounded-md border border-input bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => changeLanguage('ja')}
        className={`rounded-r-none border-r ${i18n.language === 'ja'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent'
          }`}
      >
        <Languages className="w-4 h-4 mr-1" />
        日本語
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => changeLanguage('vi')}
        className={`rounded-l-none ${i18n.language === 'vi'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-accent'
          }`}
      >
        <Languages className="w-4 h-4 mr-1" />
        Tiếng Việt
      </Button>
    </div>
  );
};
