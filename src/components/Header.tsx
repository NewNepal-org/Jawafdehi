import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Search, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.home")}
          </Link>
          <Link to="/updates" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.updates")}
          </Link>
          <Link to="/cases" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.cases")}
          </Link>
          <Link to="/entities" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.entities")}
          </Link>
          <Link to="/information" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.information")}
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            {t("nav.about")}
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <LanguageToggle />
          <Button variant="ghost" size="icon" asChild>
            <Link to="/cases">
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("nav.searchCases")}</span>
            </Link>
          </Button>
          <Button asChild variant="destructive">
            <Link to="/report">{t("header.reportCase")}</Link>
          </Button>
          <Button asChild>
            <Link to="/cases">{t("header.viewCases")}</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          <LanguageToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t("nav.menu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  to="/"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/updates"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.updates")}
                </Link>
                <Link
                  to="/cases"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.cases")}
                </Link>
                <Link
                  to="/entities"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.entities")}
                </Link>
                <Link
                  to="/information"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.information")}
                </Link>
                <Link
                  to="/about"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.about")}
                </Link>
                <div className="pt-4 space-y-3 border-t border-border">
                  <Button asChild variant="destructive" className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/report">{t("header.reportCase")}</Link>
                  </Button>
                  <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                    <Link to="/cases">{t("header.viewCases")}</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
