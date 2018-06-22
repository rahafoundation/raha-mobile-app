/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import {
  connect,
  MapDispatchToProps,
  MapStateToProps,
  MergeProps
} from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import Video from "react-native-video";

import { RouteName } from "../shared/Navigation";
import { Member } from "../../store/reducers/members";
import { signOut } from "../../store/actions/authentication";
import { RahaThunkDispatch, RahaState } from "../../store";
import { trustMember } from "../../store/actions/members";
import { getMembersByIds } from "../../store/selectors/members";
import { MemberId } from "../../identifiers";
import { mint } from "../../store/actions/wallet";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Button } from "../shared/Button";
import { getLoggedInMemberId } from "../../store/selectors/authentication";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  member: Member;
  isOwnProfile: boolean;
};

type DispatchProps = {
  signOut: () => void;
  mint: () => void;
  trust: (memberId: MemberId) => void;
};

type MergedDispatchProps = Pick<DispatchProps, "mint" | "signOut"> & {
  trust: () => void;
};

type MergedProps = StateProps & OwnProps & MergedDispatchProps;

type ProfileProps = MergedProps;

const Actions: React.StatelessComponent<
  { isOwnProfile: boolean } & MergedDispatchProps
> = props =>
  props.isOwnProfile ? (
    <View style={styles.actions}>
      <Button text="Mint" onPress={props.mint} backgroundColor="#2196F3" />
      <Button
        text="Log Out"
        onPress={props.signOut}
        backgroundColor="#2196F3"
      />
    </View>
  ) : (
    <Button text="Trust" onPress={props.trust} />
  );

const Thumbnail: React.StatelessComponent<{ member: Member }> = props => (
  <View style={styles.thumbnail}>
    <Video
      source={{ uri: props.member.videoUri }}
      volume={1.0}
      muted
      resizeMode={"cover"}
      repeat
      style={styles.video}
    />
    <Text style={styles.memberUsername}>@{props.member.username}</Text>
  </View>
);

type StatsProps = NavigationScreenProps<NavParams> & {
  member: Member;
};
const Stats: React.StatelessComponent<StatsProps> = props => (
  <View style={styles.statsContainer}>
    <View style={styles.stat}>
      <Text style={styles.number}>ℝ{props.member.balance.toFixed(2)}</Text>
      <Text style={styles.numberLabel}>balance</Text>
    </View>
    <TouchableHighlight
      onPress={() => {
        props.navigation.push(RouteName.MemberList, {
          memberIds: Array.from(props.member.trustedBy),
          title: "Trusted By"
        });
      }}
    >
      <View style={styles.stat}>
        <Text style={styles.number}>{props.member.trustedBy.size}</Text>
        <Text style={styles.numberLabel}>trusted by</Text>
      </View>
    </TouchableHighlight>
    <TouchableHighlight
      onPress={() =>
        props.navigation.push(RouteName.MemberList, {
          memberIds: Array.from(props.member.trusts),
          title: "Trusted By"
        })
      }
    >
      <View style={styles.stat}>
        <Text style={styles.number}>{props.member.trusts.size}</Text>
        <Text style={styles.numberLabel}>trusts</Text>
      </View>
    </TouchableHighlight>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = props => (
  <View style={styles.container}>
    <ActivityFeed
      header={
        <View style={styles.header}>
          <Thumbnail member={props.member} />
          <View style={styles.interactions}>
            <Stats navigation={props.navigation} member={props.member} />
            <Actions
              isOwnProfile={props.isOwnProfile}
              mint={props.mint}
              trust={props.trust}
              signOut={props.signOut}
            />
          </View>
        </View>
      }
      filter={operation =>
        operation.creator_uid === props.member.memberId ||
        ("to_uid" in operation.data &&
          operation.data.to_uid === props.member.memberId)
      }
    />
  </View>
);

const styles = StyleSheet.create({
  container: {},
  header: {
    marginBottom: 20,
    backgroundColor: "#efefef",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#bbb",
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  thumbnail: {
    flexGrow: 0,
    flexBasis: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  memberUsername: {
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    color: "#666"
  },
  interactions: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "stretch",
    alignSelf: "stretch",
    marginTop: 20
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 20
  },
  statsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 25
  },
  stat: {
    alignItems: "center",
    justifyContent: "center"
  },
  video: {
    width: "70%",
    aspectRatio: 3 / 4
  },
  number: {
    fontWeight: "bold",
    fontSize: 16
  },
  numberLabel: {
    color: "#666",
    fontSize: 12
  }
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => {
  return {
    mint: () => dispatch(mint()),
    trust: (memberId: MemberId) => dispatch(trustMember(memberId)),
    signOut: () => dispatch(signOut())
  };
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const loggedInMemberId = getLoggedInMemberId(state);
  const loggedInMember =
    state.authentication.isLoggedIn && loggedInMemberId
      ? getMembersByIds(state, [loggedInMemberId])[0]
      : undefined;
  const member: Member = props.navigation.getParam("member", loggedInMember);
  return {
    member,
    isOwnProfile:
      !!loggedInMember && loggedInMember.memberId === member.memberId
  };
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    trust: () => dispatchProps.trust(stateProps.member.memberId),
    signOut: dispatchProps.signOut,
    mint: dispatchProps.mint,
    ...ownProps
  };
};

export const Profile = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ProfileView);
