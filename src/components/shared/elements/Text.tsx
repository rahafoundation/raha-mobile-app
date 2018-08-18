/**
 * A wrapper around the native Text component to apply our own styles.
 */

import * as React from "react";
import {
  Text as NativeText,
  TextProps,
  TextStyle,
  StyleSheet,
  StyleProp
} from "react-native";

import { fonts, fontSizes } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";
import { Currency, CurrencyValue } from "../Currency";

export type CompoundContent = (string | CurrencyValue)[];

function renderCompoundContent(
  compoundContent: {
    textTransform?: (text: string) => string;
    content: CompoundContent;
  },
  textStyle: StyleProp<TextStyle>
) {
  const { content, textTransform } = compoundContent;
  const transformed = textTransform
    ? compoundContent.content.map(
        c => (typeof c === "string" ? textTransform(c) : c)
      )
    : content;
  return (
    transformed
      // Render each piece of the description
      .map((piece, idx) => {
        const key = `content-${idx}`;
        if (typeof piece === "string") {
          return (
            <NativeText style={textStyle} key={key}>
              {piece}
            </NativeText>
          );
        }
        if ("currencyType" in piece) {
          return <Currency style={textStyle} key={key} currencyValue={piece} />;
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
          <NativeText style={textStyle} key={`spacing-${idx}`}>
            {" "}
          </NativeText>,
          nextComponent
        ],
        [] as React.ReactNode[]
      )
  );
}

/**
 * General purpose text component for the app. Includes a special
 * compoundContent key that lets you seamlessly render currency values alongside
 * other text.
 */
export const Text: React.StatelessComponent<
  TextProps & {
    compoundContent?: {
      textTransform?: (text: string) => string;
      content: CompoundContent;
    };
  }
> = props => {
  const { children, compoundContent, ...rest } = props;
  const textStyle: StyleProp<TextStyle> = [styles.text, props.style];
  const renderedChildren = compoundContent
    ? renderCompoundContent(compoundContent, textStyle)
    : children;
  return (
    <NativeText {...rest} style={textStyle}>
      {renderedChildren}
    </NativeText>
  );
};

const textStyle: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium,
  color: colors.bodyText
};
const styles = StyleSheet.create({
  text: textStyle
});
