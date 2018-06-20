/**
 * The default react native SafeAreaView only works for iOS.
 * This component works for iOS and Android to prevent View from overlapping
 * with notifications bar or sensor area.
 * Support for passing through props is limited and will probably have
 * different effects on iOS/Android.
 */
import * as React from "react";
import {
  Text,
  View,
  SafeAreaView,
  ViewProps,
  Platform,
  StatusBar
} from "react-native";

export const IosAndroidSafeAreaView: React.StatelessComponent<
  ViewProps
> = props => {
  if (Platform.OS === "ios") {
    return <SafeAreaView {...props} />;
  }
  const { children, ...remaining } = props;
  return (
    <View {...remaining}>
      <View style={{ height: StatusBar.currentHeight }} />
      <View {...props} />
    </View>
  );
};
