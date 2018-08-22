import * as React from "react";
import { StyleSheet, ViewProps, StyleProp, View } from "react-native";

import { SafeAreaView } from "../SafeAreaView";
import { colors } from "../../../helpers/colors";

interface PageContainerProps {
  style?: StyleProp<ViewProps>;
}

/**
 * Full-screen container element whose contents are rendered without overlapping
 * with the status bar, as defined by the SafeAreaView component.
 *
 * Allows you to style the full page container so that you can do things like
 * set the background color behind the iOS status bar/iPhone X notch.
 *
 * This is not necessary when the page is within a react-navigation Navigator,
 * because those already restrict the content view to within proper bounds
 * (the header/footer elements are already placed properly). This is only for
 * pages that exist outside the context of react-navigation, like the
 * Onboarding flow.
 */
export const PageContainer: React.StatelessComponent<PageContainerProps> = ({
  style,
  children
}) => {
  return (
    <View style={[styles.container, style]}>
      <SafeAreaView>{children}</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    minWidth: "100%",
    backgroundColor: colors.pageBackground
  }
});
