import * as React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { signOut } from "../../store/actions/authentication";
import { View, StyleSheet, ScrollView, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { Text, Button } from "../shared/elements";
import {
  getAncestorsArray,
  getValidMemberById
} from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";
import { fonts } from "../../helpers/fonts";
import { RouteName } from "../shared/Navigation";
import { MemberName } from "../shared/MemberName";

const DAYS_TILL_INACTIVITY = 400;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type DispatchProps = {
  signOut: () => void;
};

type StateProps = {
  loggedInMember: Member;
  trustedForRecovery: Member;
  votingDirectlyFor: Member;
};

type Props = DispatchProps & OwnProps & StateProps;

type State = {
  timeRemaining: string;
};

// TODO show total Raha outstanding and total donated.
// Eventually it could be AccountTab instead of ProfileTab.
// At that point might want to migrate leaderboards and contact us here.
class AccountView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      timeRemaining: this.getTimeRemaining()
    };
  }

  private getTimeRemaining() {
    // TODO make a RED countdown with finer granularity than 1 day
    // if you're within a month of being marked inactive, call
    // updateTimeRemaining on setInterval.
    const sinceLastOperationMilli =
      Date.now() - this.props.loggedInMember.get("lastOpCreatedAt").getTime();
    return `${DAYS_TILL_INACTIVITY -
      Math.round(sinceLastOperationMilli / MS_PER_DAY)} days`;
  }

  render() {
    const {
      navigation,
      signOut,
      trustedForRecovery,
      votingDirectlyFor
    } = this.props;
    const { timeRemaining } = this.state;
    return (
      <ScrollView>
        <View style={styles.row}>
          <Text>
            After {<Text style={fonts.Lato.Bold}>{timeRemaining}</Text>} without
            minting or giving Raha your account balance will be donated.
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Your Raha Parliament vote goes to:</Text>
        </View>
        <View style={styles.memberRow}>
          <MemberThumbnail
            style={styles.memberThumbnail}
            member={votingDirectlyFor}
          />
          <MemberName member={votingDirectlyFor} />
        </View>

        <View style={styles.row}>
          <Text>Trusted for account recovery:</Text>
        </View>

        <View style={styles.memberRow}>
          <MemberThumbnail
            style={styles.memberThumbnail}
            member={trustedForRecovery}
          />
          <MemberName member={trustedForRecovery} />
        </View>

        <Button
          title="View pending invites and flag fake accounts"
          onPress={() => navigation.navigate(RouteName.PendingInvitesPage)}
          style={styles.row}
        />
        <Button style={styles.row} title="Sign Out" onPress={signOut} />
      </ScrollView>
    );
  }
}

const rowStyle: ViewStyle = {
  marginTop: 12,
  marginHorizontal: 12
};

const memberRowStyle: ViewStyle = {
  ...rowStyle,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start"
};

const memberThumbnailStyle: ViewStyle = {
  marginRight: 8
};

const styles = StyleSheet.create({
  row: rowStyle,
  memberRow: memberRowStyle,
  memberThumbnail: memberThumbnailStyle
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
  signOut: () => dispatch(signOut())
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    throw Error("Cannot show Account, not logged in");
  }
  const ancestorsArray = getAncestorsArray(
    loggedInMember,
    state.members.byMemberId
  );
  // TODO this should be a set of people you have explicitly trusted to help recover your account
  const trustedForRecoveryIndex = ancestorsArray.length > 1 ? 1 : 0;
  const trustedForRecovery = getValidMemberById(
    state,
    ancestorsArray[trustedForRecoveryIndex]
  );
  // TODO need ability to change your vote, and to view who
  // your vote finally ends up with assuming the member
  // you are directly voting keeps their current preference (and ideally the full chain)
  const votingDirectlyFor = trustedForRecovery;
  // const finalVoteIsfor = getValidMemberById(
  //   state,
  //   ancestorsArray[ancestorsArray.length - 1]
  // );
  return { loggedInMember, trustedForRecovery, votingDirectlyFor };
};

export const Account = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountView);
