import * as React from "react";
import { View, StyleSheet, TextStyle } from "react-native";
import { Text, Button, IndependentPageContainer } from "../../shared/elements";
import { fontSizes, fonts } from "../../../helpers/fonts";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export const VerifySplash: React.StatelessComponent<Props> = props => {
  return (
    <IndependentPageContainer>
      <View style={styles.container}>
        <View style={{ flex: 0 }}>
          <Text style={styles.back} onPress={props.onBack}>
            Back
          </Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.header}>Verify a friend</Text>
          <Text style={styles.paragraph}>
            Take a video of yourself verifying your friend's identity.
          </Text>
          <Text style={styles.paragraph}>
            Verification helps other members know who to trust, and people must
            be verified before they can mint their basic income.
          </Text>
          <Button
            style={styles.continue}
            title="Continue"
            onPress={props.onContinue}
          />
        </View>
      </View>
    </IndependentPageContainer>
  );
};

const headerStyle: TextStyle = {
  ...fontSizes.large,
  ...fonts.Lato.Bold,
  marginVertical: 15,
  textAlign: "center"
};
const paragraphStyle: TextStyle = {
  ...fontSizes.medium,
  marginVertical: 4,
  marginHorizontal: 40,
  textAlign: "center"
};

const styles = StyleSheet.create({
  container: {},
  body: {
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  header: headerStyle,
  paragraph: paragraphStyle,
  continue: {
    margin: 12
  },
  back: {
    marginLeft: 12
  }
});
