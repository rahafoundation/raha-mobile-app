import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-elements";
import { MemberSearchBar } from "../../shared/MemberSearchBar";
import { RouteName } from "../../../../App";

/**
 *
 */

type ReduxStateProps = {};

type OwnProps = {
  deeplinkInvitingMember?: Member;
  navigation: any;
};

type OnboardingInviteProps = ReduxStateProps & OwnProps;

type OnboardingInviteState = {
  invitingMember?: Member;
};

export class OnboardingInvite extends React.Component<
  OnboardingInviteProps,
  OnboardingInviteState
> {
  state = {
    invitingMember: this.props.deeplinkInvitingMember
  };

  renderInviter() {
    if (this.state.invitingMember) {
      return (
        <React.Fragment>
          <Text>
            You are requesting an invite from{" "}
            {this.state.invitingMember.fullName}!
          </Text>
          <Button
            title="Confirm"
            onPress={() =>
              this.props.navigation.navigate(RouteName.OnboardingCamera)
            }
          />
        </React.Fragment>
      );
    } else {
      return (
        <Text>
          Raha is currently invite-only and you'll be recording a video with
          your inviter on the next screen. Who is inviting you?
        </Text>
      );
    }
  }

  renderNoInviter() {
    return (
      <View style={styles.container}>
        <MemberSearchBar
          placeholderText="Who are you requesting an invite from?"
          onMemberSelected={member => {
            this.setState({
              invitingMember: member
            });
          }}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <MemberSearchBar
          placeholderText="Who are you requesting an invite from?"
          onMemberSelected={member => {
            this.setState({
              invitingMember: member
            });
          }}
        />
        {this.state.invitingMember && (
          <Button
            title={`Request invite from ${this.state.invitingMember.fullName}`}
            onPress={() =>
              this.props.navigation.navigate(RouteName.OnboardingCamera)
            }
          />
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
