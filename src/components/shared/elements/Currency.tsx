import * as React from "react";
import { Big } from "big.js";
import { Text } from ".";
import { fonts } from "../../../helpers/fonts";
import { TextStyle, StyleProp } from "react-native";
import { colors } from "../../../helpers/colors";
import { Omit } from "../../../../types/omit";

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
  Transaction = "Transaction",
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
  style?: StyleProp<TextStyle>;
}

/**
 * Renders a currency value as a string. Doesn't require a Role.
 *
 * WARNING: this will only render correctly if using the Raha Bold font, as the
 * Raha currency character uses a special unicode glyph that only that font
 * currently supports. Will patch the other Raha fonts soon.
 */
export function currencyToString(currencyValue: Omit<CurrencyValue, "role">) {
  return `${currencySymbol(
    currencyValue.currencyType
  )}${currencyValue.value.round(2, 0).toFixed(2)}`;
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
        ...(style ? [style] : []),
        roleStyles(currencyValue.value)[currencyValue.role],
        fonts.Lato.Bold
      ]}
    >
      {currencySymbol(currencyValue.currencyType)}
      {currencyValue.value.round(2, 0).toFixed(2)}
    </Text>
  );
};

const roleStyles: (
  value: Big
) => { [key in CurrencyRole]: TextStyle } = value => ({
  [CurrencyRole.Donation]: {
    color: colors.currency.donation
  },
  [CurrencyRole.Transaction]: {
    color: value.lte(0) ? colors.currency.negative : colors.currency.positive
  },
  [CurrencyRole.None]: {}
});
