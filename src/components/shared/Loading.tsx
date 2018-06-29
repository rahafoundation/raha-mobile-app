import * as React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { Text } from "../display/Text";

const LoadingIndicator: React.StatelessComponent<{}> = () => (
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
