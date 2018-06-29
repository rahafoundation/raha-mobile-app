import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, TextInput } from "react-native";
import { MemberSearchBar } from "../../shared/MemberSearchBar";

import { Button, Text } from "../../shared/elements";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  deeplinkInvitingMember?: Member;
  onVerifiedNameAndInviter: (verifiedName: string, inviter: Member) => any;
  initialDisplayName?: string;
};

type OnboardingInviteProps = OwnProps;

type OnboardingInviteState = {
  invitingMember?: Member;
  verifiedName?: string;
};

export class OnboardingInvite extends React.Component<
  OnboardingInviteProps,
  OnboardingInviteState
> {
  state = {
    invitingMember: this.props.deeplinkInvitingMember,
    verifiedName: this.props.initialDisplayName
  };

  render() {
    return (
      <View style={styles.container}>
        <Text>Please confirm your full name:</Text>
        <TextInput
          placeholder="What's your full name?"
          onChangeText={text => this.setState({ verifiedName: text })}
          value={this.state.verifiedName}
        />

        <MemberSearchBar
          placeholderText="Who do you want to request an invite from?"
          onMemberSelected={member => {
            this.setState({
              invitingMember: member
            });
          }}
        />
        {this.state.invitingMember && (
          <React.Fragment>
            <Button
              title={`Request invite from ${
                this.state.invitingMember.fullName
              }`}
              onPress={() => {
                const verifiedName = this.state.verifiedName;
                const invitingMember = this.state.invitingMember;
                if (!verifiedName) {
                } else if (!invitingMember) {
                } else {
                  this.props.onVerifiedNameAndInviter(
                    verifiedName,
                    invitingMember
                  );
                }
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
    backgroundColor: "#fff"
  },
  searchBar: {
    width: "100%"
  }
});
