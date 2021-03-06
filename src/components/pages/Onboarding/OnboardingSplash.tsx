import * as React from "react";
import { StyleSheet, View } from "react-native";

import { styles as sharedStyles } from "./styles";
import { Swiper } from "../../shared/Swiper";
import { Text } from "../../shared/elements";
import { fontSizes } from "../../../helpers/fonts";
import { palette, colors } from "../../../helpers/colors";

type OnboardingProps = {
  onSplashCompleted: () => void;
};

export class OnboardingSplash extends React.Component<OnboardingProps> {
  render() {
    return (
      <Swiper
        buttonTitle={"Join Now"}
        buttonOnPress={this.props.onSplashCompleted}
      >
        <View style={[styles.slide, { backgroundColor: colors.splash.purple }]}>
          <Text style={[sharedStyles.header, styles.header]}>
            SHARED PROSPERITY
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            Raha is a new currency founded on the belief that every person has
            value.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            It's free to join, and each person can mint 10 Raha every week as a
            basic income.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            If you are inactive for more than a year, your Raha is donated back
            to the network.
          </Text>
        </View>

        <View style={[styles.slide, { backgroundColor: colors.splash.blue }]}>
          <Text style={[sharedStyles.header, styles.header]}>GIVE</Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            You can tip others in Raha or trade it for goods and services.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            By default, 3% of each transaction is donated towards the basic
            income.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            By choosing to use and accept Raha, you are giving value to this
            more equal currency.
          </Text>
        </View>

        <View style={[styles.slide, { backgroundColor: colors.splash.red }]}>
          <Text style={[sharedStyles.header, styles.header]}>
            TRUSTED IDENTITY
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            To create a trusted network, Raha currently uses video-verified
            identity.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            As a new member, you must verify your identity by recording a short
            public selfie-video of yourself stating your name and intent to join
            Raha.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            An existing member must also record a video vouching for your
            identity.
          </Text>
        </View>

        <View style={[styles.slide, { backgroundColor: colors.splash.blue }]}>
          <Text style={[sharedStyles.header, styles.header]}>
            FIX OUR ECONOMY
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            Our ultimate goal is to make this currency valuable on a global
            scale and use it to end extreme poverty.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            To get there, we need a community of people who believe in and are
            willing to adopt a fairer currency.
          </Text>
          <Text style={[sharedStyles.paragraph, styles.paragraph]}>
            We're starting a movement, and we'd like you to be a part of it.
          </Text>
        </View>
      </Swiper>
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
    color: palette.white,
    ...fontSizes.xlarge
  },
  paragraph: {
    color: palette.white,
    ...fontSizes.large
  }
});
