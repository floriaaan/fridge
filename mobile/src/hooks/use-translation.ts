import { i18n } from "@/lib/i18n";

export function useTranslation() {
  const t = (key: string, options?: Record<string, unknown>) => {
    return i18n.t(key, options);
  };

  return { t, i18n };
}
