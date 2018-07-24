import * as React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { signOut } from "../../store/actions/authentication";
import { View, TouchableHighlight, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { Text, Button } from "../shared/elements";
import { colors } from "../../helpers/colors";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type DispatchProps = {
  signOut: () => void;
};

type StateProps = {
  loggedInMember: Member;
};

type Props = DispatchProps & OwnProps;

// TODO show when account will go inactive, total Raha outstanding,
// leaderboard, who you are voting for, etc.
// Eventually it could be AccountTab instead of ProfileTab.
const AccountView: React.StatelessComponent<Props> = props => (
  <View style={styles.container}>
    <Button title="Sign Out" onPress={props.signOut} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lightBackground
  },
  bar: {
    width: "100%",
    height: 30
  },
  barText: {
    fontSize: 20
  }
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
  signOut: () => dispatch(signOut())
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw Error("Cannot show Account, not logged in");
  }
  return { loggedInMember };
};

export const Account = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountView);
