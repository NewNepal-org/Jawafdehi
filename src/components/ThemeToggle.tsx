import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = t(isDark ? "themeToggle.switchToLight" : "themeToggle.switchToDark");

  if (!mounted) {
    const placeholderLabel = t("themeToggle.toggleTheme");

    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label={placeholderLabel}
        title={placeholderLabel}
        className="rounded-full border border-border/70"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className="rounded-full border border-border/70"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
