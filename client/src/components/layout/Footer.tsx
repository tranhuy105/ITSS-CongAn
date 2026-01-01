import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">{t('footer.brand')}</div>
          <div className="text-sm text-muted-foreground">
            {t('footer.rights')} {t('footer.brand')}
          </div>
        </div>
      </div>
    </footer>
  );
};
