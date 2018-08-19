/**
 * A wrapper around the native Text component to apply our own styles.
 */

import * as React from "react";

import { Text, TextProps } from "./Text";
import { Currency, CurrencyValue } from "./Currency";

export type MixedContent = string | (string | CurrencyValue)[];

export interface MixedTextProps extends TextProps {
  children?: undefined;
  content: MixedContent;
  textTransform?: (text: string) => string;
}

/**
 * Special Text element that lets you render arrays of multiple types of special
 * text values.
 */
export const MixedText: React.StatelessComponent<MixedTextProps> = props => {
  const { content, textTransform, ...rest } = props;
  const arrayContent = typeof content === "string" ? [content] : content;

  const transformed = textTransform
    ? arrayContent.map(
        c => (textTransform && typeof c === "string" ? textTransform(c) : c)
      )
    : arrayContent;
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
