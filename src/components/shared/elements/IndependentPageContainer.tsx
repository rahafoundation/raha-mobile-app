import * as React from "react";
import { StyleSheet, ViewProps, StyleProp, View, Platform } from "react-native";

import { SafeAreaView } from "react-navigation";
import { colors } from "../../../helpers/colors";

interface IndependentPageContainerProps {
  containerStyle?: StyleProp<ViewProps>;
}

/**
 * Wrapper for a page that is intended to stand alone, for instance outside of a
 * react-navigator context, in order to keep content from overlapping with the
 * top and bottom screen status bars on iOS and Android.
 *
 * Allows you to style the full page container while restricting actual content
 * bounds so that you can do things like set the background color behind the iOS
 * status bar/iPhone X notch, but still contain the actual page contents within
 * reasonable bounds.
 *
 * This is not necessary when the page is within a react-navigation Navigator,
 * because those already restrict the content view to within proper bounds
 * (the header/footer elements are already placed properly). This is only for
 * pages that exist outside the context of react-navigation, like the
 * Onboarding flow.
 */
export const IndependentPageContainer: React.StatelessComponent<
  IndependentPageContainerProps
> = ({ containerStyle, children }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {Platform.OS === "ios" ? (
        <SafeAreaView
          forceInset={{
            top: "always",
            left: "always",
            bottom: "always",
            right: "always"
          }}
        >
          {children}
        </SafeAreaView>
      ) : (
        // Android doesn't allow overlapping with statusbar anyway, so no need
        // to use a SafeAreaView
        <View>{children}</View>
      )}
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
