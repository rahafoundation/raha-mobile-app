import * as React from "react";
import { Big } from "big.js";
import { Text } from "./elements";
import { fonts } from "../../helpers/fonts";
import { StyleSheet, TextStyle } from "react-native";
import { colors } from "../../helpers/colors";

/**
 * Currencies to display in the app. As of now, the only valid currency to
 * display is Raha, but can be expanded to display other values.
 */
export enum CurrencyType {
  Raha = "Raha"
}

/**
 * Role that a sum of money is used for. Used to visually distinguish
 * money used for different purposes in-app.
 */
export enum CurrencyRole {
  Positive = "Positive",
  Negative = "Negative",
  None = "None", // just a plain number
  Donation = "Donation"
}

/**
 * A sum of money, in a specified currency for a given usage.
 */
export interface CurrencyValue {
  currencyType: CurrencyType;
  role: CurrencyRole;
  value: Big;
}

export function currencySymbol(currency: CurrencyType) {
  switch (currency) {
    case CurrencyType.Raha:
      // patched Lato font puts Raha currency symbol at 0xE0E0 (equivalent to
      // this code point)
      return String.fromCodePoint(57568);
    default:
      console.error("Invalid currency to render");
      return "";
  }
}

interface CurrencyProps {
  currencyValue: CurrencyValue;
  style?: TextStyle;
}

export const Currency: React.StatelessComponent<CurrencyProps> = ({
  currencyValue,
  style
}) => {
  return (
    // DANGER: For now, only bold weight has the Raha currency symbol patched
    // onto it. so don't change this!
    // TODO: the rounding function ought to be standardized somewhere. Copied
    // from API.
    <Text
      style={[
        fonts.Lato.Bold,
        roleStylesheet[currencyValue.role],
        ...(style ? [style] : [])
      ]}
    >
      {currencySymbol(currencyValue.currencyType)}
      {currencyValue.value.round(2, 0).toFixed(2)}
    </Text>
  );
};

const roleStyles: { [key in CurrencyRole]: TextStyle } = {
  [CurrencyRole.Donation]: {
    color: colors.donation
  },
  [CurrencyRole.Positive]: {
    color: colors.positive
  },
  [CurrencyRole.Negative]: {
    color: colors.positive
  },
  [CurrencyRole.None]: {}
};
const roleStylesheet = StyleSheet.create(roleStyles);
