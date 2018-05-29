import * as React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

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
