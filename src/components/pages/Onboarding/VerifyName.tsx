import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, Dimensions } from "react-native";

import {
  Button,
  Text,
  TextInput,
  IndependentPageContainer
} from "../../shared/elements";
import { colors } from "../../../helpers/colors";

/**
 * Page that confirms user's full name
 */

type OwnProps = {
  initialDisplayName?: string;
  onVerifiedName: (verifiedName: string) => any;
  onBack: () => any;
};

type VerifyNameProps = OwnProps;

type VerifyNameState = {
  invitingMember?: Member;
  verifiedName?: string;
};

export class VerifyName extends React.Component<
  VerifyNameProps,
  VerifyNameState
> {
  state = {
    verifiedName: this.props.initialDisplayName
  };

  render() {
    return (
      <IndependentPageContainer containerStyle={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.body}>
          <View style={styles.card}>
            <Text style={{ fontSize: 18 }}>Please confirm your full name:</Text>
            <TextInput
              placeholder="What's your full name?"
              onChangeText={text => this.setState({ verifiedName: text })}
              value={this.state.verifiedName}
            />
            <Button
              title={`Confirm`}
              disabled={
                this.state.verifiedName === undefined ||
                this.state.verifiedName.length === 0
              }
              onPress={() => {
                const verifiedName = this.state.verifiedName;
                if (verifiedName) {
                  this.props.onVerifiedName(verifiedName.trim());
                }
              }}
            />
          </View>
        </View>
      </IndependentPageContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {

    flexDirection: "column",
    justifyContent: "flex-start", // so that back button stays pushed to top
    backgroundColor: colors.darkBackground
  },
  back: {
    marginLeft: 12,
    marginTop: 12
  },
  body: {
    // make the body take up all remaining space
    flexBasis: "100%",
    flexShrink: 1,

    // center children in screen

    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.pageBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  }
});
