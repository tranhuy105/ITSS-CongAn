import { ChefHat } from 'lucide-react';
import { ReactNode } from 'react';
import { LanguageToggle } from './LanguageToggle';

interface AuthLayoutProps {
    title: string;
    children: ReactNode;
}

export const AuthLayout = ({ title, children }: AuthLayoutProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                            <ChefHat className="w-8 h-8" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">Vietnamese Food Discovery Platform</p>
                    </div>
                    <LanguageToggle />
                </div>
                <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                    {children}
                </div>
            </div>
        </div>
    );
};
