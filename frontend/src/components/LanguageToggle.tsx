import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/lib/i18n';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full gap-2 px-3 hover:bg-accent">
          <Globe className="h-4 w-4" />
          <span className="text-base leading-none">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 animate-scale-in">
        {LANGUAGES.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`cursor-pointer gap-3 ${i18n.language === lang.code ? 'bg-accent text-primary' : ''}`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
