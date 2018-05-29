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
      <React.Fragment>
        <Swiper>
          <View style={[styles.slide, { backgroundColor: "#C04DEE" }]}>
            <Text style={styles.header}>SHARED PROSPERITY</Text>
            <Text style={styles.text}>
              Raha is a new currency founded on the belief that every person has
              value.
            </Text>
            <Text style={styles.text}>
              It's free to join, and each person can mint Raha every week as a
              basic income.
            </Text>
          </View>

          <View style={[styles.slide, { backgroundColor: "#4AAFEE" }]}>
            <Text style={styles.header}>GIVE</Text>
            <Text style={styles.text}>
              You can tip others in Raha or trade it for goods and services.
            </Text>
            <Text style={styles.text}>
              By default, some of each transaction is donated towards the basic
              income.
            </Text>
            <Text style={styles.text}>
              By choosing to use and accept Raha, you are giving value to this
              more equal currency.
            </Text>
          </View>

          <View style={[styles.slide, { backgroundColor: "#FC515B" }]}>
            <Text style={styles.header}>TRUSTED IDENTITY</Text>
            <Text style={styles.text}>
              To create a trusted network, we are currently invite-only.
            </Text>
            <Text style={styles.text}>
              All new members must verify their identity by recording a video
              with the inviter which will be visible publicly.
            </Text>
          </View>

          <View style={[styles.slide, { backgroundColor: "#4AAFEE" }]}>
            <Text style={styles.header}>FIX OUR ECONOMY</Text>
            <Text style={styles.text}>
              Our ultimate goal is to make this currency valuable on a global
              scale and use it to end extreme poverty.
            </Text>
            <Text style={styles.text}>
              To get there, we need a community of people who believe in and are
              willing to adopt a fairer currency.
            </Text>
            <Text style={styles.text}>
              We're starting a movement, and we'd like you to be a part of it.
            </Text>
            <RoundedButton text="Join Now" onPress={() => console.log()} />
          </View>
        </Swiper>
      </React.Fragment>
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
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center"
  },
  button: {
    marginVertical: 8
  },
  text: {
    color: "#fff",
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  }
});
