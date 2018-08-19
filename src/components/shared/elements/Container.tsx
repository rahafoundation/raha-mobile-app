import * as React from "react";
import { ViewStyle, StyleSheet, ViewProps } from "react-native";

import { SafeAreaView } from "../SafeAreaView";
import { colors } from "../../../helpers/colors";

export const Container: React.StatelessComponent<ViewProps> = props => {
  return <SafeAreaView {...props} style={[styles.container, props.style]} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pageBackground,
    flex: 1
  }
});
