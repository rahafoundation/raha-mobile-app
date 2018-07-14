import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, TextInput } from "react-native";
import { MemberSearchBar } from "../../shared/MemberSearchBar";

import { Button, Text } from "../../shared/elements";

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
    const verifiedName = this.state.verifiedName;
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18 }}>Please confirm your full name:</Text>
        <TextInput
          placeholder="What's your full name?"
          onChangeText={text => this.setState({ verifiedName: text })}
          value={this.state.verifiedName}
        />

        {verifiedName && (
          <React.Fragment>
            <Button
              title={`Confirm`}
              onPress={() => {
                this.props.onVerifiedName(verifiedName);
              }}
            />
          </React.Fragment>
        )}
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
