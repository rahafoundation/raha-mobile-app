import * as React from "react";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { signOut } from "../../store/actions/authentication";
import { View, StyleSheet, ScrollView } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { Text, Button } from "../shared/elements";
import { colors } from "../../helpers/colors";
import {
  getAncestorsArray,
  getValidMemberById
} from "../../store/selectors/members";
import { MemberThumbnail } from "../shared/MemberThumbnail";

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
  votingFor: Member;
};

type Props = DispatchProps & OwnProps & StateProps;

type State = {
  timeRemaining: string;
};

const Break: React.StatelessComponent<{}> = () => <View style={styles.break} />;

// TODO show when account will go inactive, total Raha outstanding,
// leaderboard, who you are voting for, etc.
// Eventually it could be AccountTab instead of ProfileTab.
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
    const sinceLastMintMilli =
      Date.now() - this.props.loggedInMember.lastMinted.getTime();
    return `${400 - Math.round(sinceLastMintMilli / MS_PER_DAY)} days`;
  }

  render() {
    const { signOut, trustedForRecovery, votingFor } = this.props;
    const { timeRemaining } = this.state;
    return (
      <ScrollView>
        <Text>
          After {<Text style={styles.timeRemaining}>{timeRemaining}</Text>}{" "}
          without activity your account balance will be donated.
        </Text>
        <Break />
        <Text>Your Raha Parliament vote goes to:</Text>
        <MemberThumbnail member={votingFor} />
        <Break />
        <Text>Trusted for account recovery:</Text>
        <MemberThumbnail member={trustedForRecovery} />
        <Break />
        <Button title="Sign Out" onPress={signOut} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  break: {
    backgroundColor: colors.border2,
    height: 5,
    marginTop: 2,
    marginBottom: 2
  },
  timeRemaining: {
    fontWeight: "800"
  }
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
  const trustedForRecovery = getValidMemberById(state, ancestorsArray[0]);
  // TODO need ability to change your vote.
  const votingFor = getValidMemberById(
    state,
    ancestorsArray[ancestorsArray.length - 1]
  );
  return { loggedInMember, trustedForRecovery, votingFor };
};

export const Account = connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountView);
