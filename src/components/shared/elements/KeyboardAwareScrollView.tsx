import * as React from "react";
import {
  KeyboardAwareScrollView as KeyboardAwareScrollViewLibrary,
  KeyboardAwareScrollViewProps
} from "react-native-keyboard-aware-scroll-view";
import { Platform } from "react-native";

/**
 * KeyboardAwareScrollView that passes through all provided properties like the
 * original component, but also sets sensible defaults for our project.
 *
 * On Android, behavior is different than iOS regarding how the container
 * scales; Hence, there are platform differences in the props provided by
 * default.
 */
export const KeyboardAwareScrollView: React.StatelessComponent<
  KeyboardAwareScrollViewProps
> = props => {
  const platformProps: Partial<KeyboardAwareScrollViewProps> =
    Platform.OS === "android" ? { contentContainerStyle: { flexGrow: 1 } } : {};
  return (
    <KeyboardAwareScrollViewLibrary
      enableAutomaticScroll
      bounces={false}
      enableOnAndroid
      {...platformProps}
      {...props}
    />
  );
};
