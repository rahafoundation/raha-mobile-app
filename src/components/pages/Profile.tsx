/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { connect, MapDispatchToProps, MergeProps } from "react-redux";
import { Video } from "expo";

import { Member } from "../../store/reducers/members";
import { signOut } from "../../store/actions/authentication";
import { RahaThunkDispatch } from "../../store";
import { trustMember } from "../../store/actions/members";
import { MemberId } from "../../identifiers";
import { mint } from "../../store/actions/wallet";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Button } from "../shared/Button";

type OwnProps = {
  member: Member;
  isOwnProfile: boolean;
};

type StateProps = {};

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
      isMuted={true}
      usePoster={true}
      resizeMode={Video.RESIZE_MODE_COVER}
      shouldPlay
      isLooping
      // @ts-ignore Expo typing for Video is missing `style`
      style={styles.video}
    />
    <Text style={styles.memberName}>{props.member.fullName}</Text>
    <Text style={styles.memberUsername}>@{props.member.username}</Text>
  </View>
);

const Stats: React.StatelessComponent<{ member: Member }> = props => (
  <View style={styles.statsContainer}>
    <View style={styles.stat}>
      <Text style={styles.number}>ℝ{props.member.balance.toFixed(2)}</Text>
      <Text style={styles.statLabel}>{"balance"}</Text>
    </View>
    <View style={styles.stat}>
      <Text style={styles.number}>{props.member.trustedBy.size}</Text>
      <Text style={styles.statLabel}>{"trusted by"}</Text>
    </View>
    <View style={styles.stat}>
      <Text style={styles.number}>{props.member.trusts.size}</Text>
      <Text style={styles.statLabel}>{"trusts"}</Text>
    </View>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = props => (
  <View style={styles.container}>
    <ActivityFeed
      header={
        <View style={styles.header}>
          <Thumbnail member={props.member} />
          <View style={styles.interactions}>
            <Stats member={props.member} />
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
  memberName: {
    fontWeight: "600",
    fontSize: 18,
    marginVertical: 5,
    textAlign: "center"
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
  statLabel: {
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

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    trust: () => dispatchProps.trust(ownProps.member.memberId),
    signOut: dispatchProps.signOut,
    mint: dispatchProps.mint,
    ...ownProps
  };
};

export const Profile = connect(
  undefined,
  mapDispatchToProps
)(ProfileView);
