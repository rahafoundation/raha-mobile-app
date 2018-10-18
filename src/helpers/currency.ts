import { NativeModules, Platform } from "react-native";
import numeral from "numeral";
import "numeral/locales";

let locale: string;
let languageCode: string;

export function init() {
  if (locale) {
    console.log("YOLO", "already initalized locale");
    return;
  }

  try {
    // Full Locale (en-US)
    locale = (Platform.OS === "ios"
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier
    ).replace("_", "-");

    // Language Code ISO 639-1 (en)
    languageCode = locale.split("-")[0];
    console.log("YOLO", "set " + locale);
  } catch (e) {
    console.warn("Could not parse locale. ", e);
    return;
  }

  _setLocale(locale) || _setLocale(languageCode);
}

function _setLocale(locale: string) {
  try {
    numeral.locale(locale);
    return true;
  } catch (e) {
    return false;
  }
}

export function toLocaleCurrency(value: string) {
  init();
  return numeral(value).format("0.00");
}
