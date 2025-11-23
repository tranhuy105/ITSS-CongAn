import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../LanguageToggle';

export const Footer = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-muted/30 mt-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        © {currentYear} Vietnamese Food Discovery Platform. {t('footer.rights')}.
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <LanguageToggle />
                    </div>
                </div>
            </div>
        </footer>
    );
};
