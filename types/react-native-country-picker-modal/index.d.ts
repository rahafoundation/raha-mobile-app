declare module "react-native-country-picker-modal" {
  import { StyleProp, ViewStyle } from "react-native";
  import * as React from "react";

  export type CountryCode = string;
  export type CallingCode = string;
  export type CurrencyCode = string;
  export type LanguageCode =
    | "deu"
    | "fra"
    | "hrv"
    | "ita"
    | "jpn"
    | "nld"
    | "por"
    | "rus"
    | "spa"
    | "svk"
    | "fin"
    | "zho"
    | "isr";

  export interface Country {
    cca2: CountryCode;
    callingCode: CallingCode;
    currency: CurrencyCode;
    flag: string; // data uri
    name: { [key in LanguageCode]: string };
  }
  export enum FlagType {
    FLAT = "flat",
    EMOJI = "emoji"
  }

  export interface CountryPickerProps {
    cca2: CountryCode;
    onChange: (value: Country) => void;

    styles?: StyleProp<ViewStyle>;
    showCallingCode?: boolean;
    onClose?: () => void;
    countryList?: CountryCode[];
    translation?: LanguageCode;
    closeable?: boolean;
    filterable?: boolean;
    excludeCountries?: CountryCode[];
    filterPlaceholder?: string;
    autoFocusFilter?: boolean;
    disabled?: boolean;
    filterPlaceholderTextColor?: string;
    closeButtonImage?: React.ReactNode;
    transparent?: boolean;
    animationType?: "slide" | "fade" | "none";
    flagType?: FlagType;
    hideAlphabetFilter?: boolean;
    renderFilter?: (
      args: {
        value: string;
        onChange: CountryPickerProps["onChange"];
        onClose: CountryPickerProps["onClose"];
      }
    ) => React.ReactNode;
  }
  export default class CountryPicker extends React.Component<
    CountryPickerProps
  > {}
  export function getAllCountries(): Country[];
}
