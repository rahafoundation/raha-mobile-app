/**
 * The default react native SafeAreaView only works for iOS.
 * This component works for iOS and Android to prevent View from overlapping
 * with notifications bar or sensor area.
 * Support for passing through props is limited and will probably have
 * different effects on iOS/Android.
 */
import * as React from "react";
import {
  View,
  SafeAreaView as SafeAreaViewIosOnly,
  ViewProps,
  Platform,
  StatusBar
} from "react-native";

export const SafeAreaView: React.StatelessComponent<ViewProps> = props => {
  if (Platform.OS === "ios") {
    return <SafeAreaViewIosOnly {...props} />;
  }
  const { children, ...remaining } = props;
  return (
    <View style={{ paddingTop: 100, paddingBottom: 100 }} {...remaining}>
      <View {...props} />
    </View>
  );
};
