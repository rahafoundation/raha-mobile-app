import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet } from "react-native";

import { Button, Text, TextInput } from "../../shared/elements";

/**
 * Page that confirms user's full name
 */

type OwnProps = {
  initialDisplayName?: string;
  onVerifiedName: (verifiedName: string) => any;
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
      <View style={styles.container}>
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 12
  },
  searchBar: {
    width: "100%"
  }
});
