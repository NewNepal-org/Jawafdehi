import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Search } from "lucide-react";

export const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/favicon.png" 
            alt="Jawafdehi Logo" 
            className="h-10 w-10"
          />
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {t("header.title")}
            </span>
            <sup className="text-xs font-semibold text-red-600">Beta</sup>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.home")}
          </Link>
          <Link to="/entities" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.entities")}
          </Link>
          <Link to="/cases" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.cases")}
          </Link>
          <Link to="/information" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.information")}
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.about")}
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <LanguageToggle />
          <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
            <Link to="/cases">
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("nav.searchCases")}</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link to="/report">{t("header.reportCase")}</Link>
          </Button>
          <Button asChild>
            <Link to="/cases">{t("header.viewCases")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
