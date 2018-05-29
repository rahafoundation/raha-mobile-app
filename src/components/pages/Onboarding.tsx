import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import RoundedButton from "../shared/RoundedButton";
import Swiper from "../shared/Swiper";

type OnboardingProps = {
  navigation: any;
};

export default class Onboarding extends React.Component<OnboardingProps> {
  render() {
    return (
      <View style={[styles.slide, { backgroundColor: "#C04DEE" }]}>
        <Text style={styles.header}>Give Raha</Text>
        <Text style={styles.text}>
          By using Raha, you are supporting basic income for everyone.
        </Text>
        <RoundedButton text="Next" onPress={() => console.log("hello")} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginVertical: 15
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginHorizontal: 40,
    textAlign: "center"
  }
});
