import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, TextInput } from "react-native";
import { Text, Button } from "react-native-elements";
import { MemberSearchBar } from "../../shared/MemberSearchBar";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { RouteName } from "../../shared/Navigation";
import { getLoggedInFirebaseUser } from "../../../store/selectors/authentication";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type ReduxStateProps = {
  displayName: string | null;
};

type OwnProps = {
  deeplinkInvitingMember?: Member;
  navigation: any;
};

type OnboardingInviteProps = ReduxStateProps & OwnProps;

type OnboardingInviteState = {
  invitingMember?: Member;
  verifiedName?: string;
};

export class OnboardingInviteView extends React.Component<
  OnboardingInviteProps,
  OnboardingInviteState
> {
  state = {
    invitingMember: this.props.deeplinkInvitingMember,
    verifiedName: this.props.displayName ? this.props.displayName : undefined
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
            <Text>
              By pressing request, I agree that this is my real identity, my
              full name, and the only time I have joined Raha. I understand that
              creating duplicate or fake accounts may result in me and people I
              have invited losing access to our accounts.
            </Text>
            <Button
              title={`Request invite from ${
                this.state.invitingMember.fullName
              }`}
              onPress={() =>
                this.props.navigation.navigate(RouteName.OnboardingCamera, {
                  invitingMember: this.state.invitingMember,
                  verifiedName: this.state.verifiedName
                })
              }
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

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const firebaseUser = getLoggedInFirebaseUser(state);
  return {
    displayName: firebaseUser ? firebaseUser.displayName : null
  };
};
export const OnboardingInvite = connect(mapStateToProps)(OnboardingInviteView);
