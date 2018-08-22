import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, Dimensions } from "react-native";

import { Button, Text, TextInput, Container } from "../../shared/elements";
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
      <Container style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
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
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  },
  container: {
    backgroundColor: colors.darkBackground,
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
