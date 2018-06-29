import * as React from "react";
import { ViewStyle, StyleSheet, ViewProps } from "react-native";

import { SafeAreaView } from "../SafeAreaView";

export const Container: React.StatelessComponent<ViewProps> = props => {
  return <SafeAreaView {...props} style={[styles.container, props.style]} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1
  }
});
