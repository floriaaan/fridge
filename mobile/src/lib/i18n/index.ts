import { I18n } from "i18n-js";
import * as Localization from "expo-localization";
import en from "./en.json";
import fr from "./fr.json";

const i18n = new I18n({
  en,
  fr,
});

// Set the locale based on device settings
i18n.locale = Localization.getLocales()[0]?.languageCode ?? "en";
i18n.enableFallback = true;
i18n.defaultLocale = "en";

export { i18n };
