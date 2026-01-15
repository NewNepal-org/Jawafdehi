import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive
    ? "text-primary"
    : "text-foreground hover:text-primary"
  }`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-lg font-medium transition-colors py-2 ${isActive
    ? "text-primary"
    : "text-foreground hover:text-primary"
  }`;

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
        <nav className="hidden lg:flex items-center space-x-6">
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/cases" className={navLinkClass}>
            {t("nav.cases")}
          </NavLink>
          <NavLink to="/entities" className={navLinkClass}>
            {t("nav.entities")}
          </NavLink>
          <NavLink to="/information" className={navLinkClass}>
            {t("nav.information")}
          </NavLink>
          <NavLink to="/updates" className={navLinkClass}>
            {t("nav.updates")}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t("nav.about")}
          </NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-2">
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
        <div className="flex lg:hidden items-center space-x-2">
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
                <NavLink
                  to="/"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.home")}
                </NavLink>
                <NavLink
                  to="/cases"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.cases")}
                </NavLink>
                <NavLink
                  to="/entities"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.entities")}
                </NavLink>
                <NavLink
                  to="/information"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.information")}
                </NavLink>
                <NavLink
                  to="/updates"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.updates")}
                </NavLink>
                <NavLink
                  to="/about"
                  className={mobileNavLinkClass}
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.about")}
                </NavLink>
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
