/**
 * When used at the top level, produces a view that doesn't overlap with iOS
 * and Android status and navigation bars.
 */
import * as React from "react";
import { View, ViewProps, Platform } from "react-native";

import { SafeAreaView as SafeAreaViewIosOnly } from "react-navigation";

export const SafeAreaView: React.StatelessComponent<{}> = ({ children }) => {
  // iOS
  if (Platform.OS === "ios") {
    return (
      <SafeAreaViewIosOnly
        forceInset={{
          top: "always",
          left: "always",
          bottom: "always",
          right: "always"
        }}
      >
        {children}
      </SafeAreaViewIosOnly>
    );
  }

  // Android
  return <View>{children}</View>;
};
