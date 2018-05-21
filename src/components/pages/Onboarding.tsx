import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

type OnboardingProps = {
  navigation: any;
};

export default class Onboarding extends React.Component<OnboardingProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text>This is the onboardibng page.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
