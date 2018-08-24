import * as React from "react";
import {
  NavigationInjectedProps,
  withNavigation,
  NavigationScreenProp
} from "react-navigation";
import {
  TouchableOpacity,
  Text,
  TextStyle,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Linking
} from "react-native";
import { fonts } from "../../../helpers/fonts";
import { RouteName } from "../Navigation";
import { colors } from "../../../helpers/colors";

/**
 * Reference to another part of the app to redirect to.
 * TODO: make params more specific.
 */
export interface RouteDescriptor {
  name: RouteName;
  params: any;
}

/**
 * Types of destinations links can point to
 */
export enum LinkType {
  InApp,
  Website
}

/**
 * Destinations links can point to
 */
export type LinkDestination =
  | {
      type: LinkType.InApp;
      route: RouteDescriptor;
    }
  | {
      type: LinkType.Website;
      url: string;
    };

interface OwnProps {
  destination: LinkDestination;
  style?: StyleProp<TextStyle>;
}

type TextLinkProps = OwnProps & NavigationInjectedProps;

/**
 * Generate handler function for each link type
 */
function determineOnPress({ destination, navigation }: TextLinkProps) {
  switch (destination.type) {
    case LinkType.InApp:
      return () =>
        navigation.navigate(destination.route.name, destination.route.params);
    case LinkType.Website:
      return () => Linking.openURL(destination.url);
    default:
      console.error("Unexpected link type:", destination);
      return () => {};
  }
}

/**
 * A text-based link.
 *
 * TODO: move above link/route definitions to somewhere else, to support other
 * ways of linking content, like Buttons
 */
const TextLinkView: React.StatelessComponent<TextLinkProps> = props => {
  const { style, children } = props;
  return (
    <Text onPress={determineOnPress(props)} style={[styles.text, style]}>
      {children}
    </Text>
  );
};

/**
 * Link to another part of the app. Children must be those compatible with
 * react-native's builtin Text component, as any children are rendered in
 * a Text component.
 */
export const TextLink = withNavigation(TextLinkView);

const textStyle: TextStyle = {
  ...fonts.Lato.Bold,
  color: colors.link
};
const styles = StyleSheet.create({
  text: textStyle
});
