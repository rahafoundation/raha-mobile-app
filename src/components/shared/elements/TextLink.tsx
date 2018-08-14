import * as React from "react";
import { RouteDescriptor } from "../../../store/selectors/activities/types";
import { NavigationInjectedProps, withNavigation } from "react-navigation";
import {
  TouchableOpacity,
  Text,
  TextStyle,
  StyleSheet,
  ViewStyle,
  StyleProp
} from "react-native";
import { fonts } from "../../../helpers/fonts";

type OwnProps = {
  destination: RouteDescriptor;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

type TextLinkProps = OwnProps & NavigationInjectedProps;

const TextLinkView: React.StatelessComponent<TextLinkProps> = ({
  children,
  destination,
  navigation,
  style,
  textStyle
}) => {
  return (
    <TouchableOpacity
      delayPressIn={20}
      onPress={() =>
        navigation.navigate(destination.routeName, destination.params)
      }
      style={style}
    >
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
};

/**
 * Link to another part of the app. Children must be those compatible with
 * react-native's builtin Text component, as any children are rendered in
 * a Text component.
 */
export const TextLink = withNavigation(TextLinkView);

const textStyle: TextStyle = fonts.Lato.Bold;
const styles = StyleSheet.create({
  text: textStyle
});
