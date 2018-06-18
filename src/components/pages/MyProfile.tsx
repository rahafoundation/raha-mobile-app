import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import { Video } from "expo";
import { Profile } from "./Profile";
import { RahaState } from "../../store";
import { getMembersByIds } from "../../store/selectors/members";
import { Member } from "../../store/reducers/members";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  member?: Member;
};

type DispatchProps = {
  mint: () => void;
};

type MyProfileProps = OwnProps & StateProps & DispatchProps;

class MyProfileView extends React.Component<MyProfileProps> {
  render() {
    if (!this.props.member) {
      return <Text>Loading</Text>;
    }
    return <Profile member={this.props.member} />;
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const firebaseUser = state.authentication.firebaseUser;
  const isLoggedIn =
    state.authentication.isLoaded && !!state.authentication.firebaseUser;
  const member = firebaseUser
    ? getMembersByIds(state, [firebaseUser.uid])[0]
    : undefined;
  return {
    member
  };
};

function mint() {
  return null; // TODO
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => ({
  mint: () => dispatch(mint())
});

export const MyProfile = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyProfileView);
