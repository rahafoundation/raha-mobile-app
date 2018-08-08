import * as React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { Text } from "../shared/elements/Text";

export const Loading: React.StatelessComponent<{}> = () => (
  <View style={styles.container}>
    <Text>Loading</Text>
    <ActivityIndicator size="large" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
