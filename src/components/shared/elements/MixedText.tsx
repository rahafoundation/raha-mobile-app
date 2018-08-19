/**
 * A wrapper around the native Text component to apply our own styles.
 */

import * as React from "react";
import { TextProps, TextStyle, StyleSheet, StyleProp } from "react-native";

import { Text } from "./Text";
import { fonts, fontSizes } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";
import { Currency, CurrencyValue } from "./Currency";

export type MixedContent = (string | CurrencyValue)[];

function renderMixedContent(
  compoundContent: {
    textTransform?: (text: string) => string;
    content: MixedContent;
  },
  textStyle: StyleProp<TextStyle>
) {}

/**
 * Special Text element that lets you render arrays of multiple types of special
 * text values.
 */
export const MixedText: React.StatelessComponent<
  TextProps & {
    children: MixedContent;
    textTransform?: (text: string) => string;
  }
> = props => {
  const { children, textTransform, ...rest } = props;

  const transformed = textTransform
    ? children.map(
        c => (textTransform && typeof c === "string" ? textTransform(c) : c)
      )
    : children;
  return (
    <Text {...rest}>
      {transformed
        // Render each piece of the description
        .map((piece, idx) => {
          const key = `content-${idx}`;
          if (typeof piece === "string") {
            return (
              <Text style={props.style} key={key}>
                {piece}
              </Text>
            );
          }
          if ("currencyType" in piece) {
            return (
              <Currency style={props.style} key={key} currencyValue={piece} />
            );
          }
          console.error(
            "Unexpected value in compoundContent:",
            piece,
            ". Omitting."
          );
          return undefined;
        })
        // remove undefined pieces (i.e. errors)
        .filter(x => !!x)
        // Put spaces between each component
        .reduce(
          (memo, nextComponent, idx) => [
            ...memo,
            <Text style={props.style} key={`spacing-${idx}`}>
              {" "}
            </Text>,
            nextComponent
          ],
          [] as React.ReactNode[]
        )}
    </Text>
  );
};
