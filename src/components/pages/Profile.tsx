/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MergeProps } from "react-redux";

import { Video } from "expo";
import { Member } from "../../store/reducers/members";
import { signOut } from "../../store/actions/authentication";
import { RahaThunkDispatch } from "../../store";
import { trustMember } from "../../store/actions/members";
import { MemberId } from "../../identifiers";
import { mint } from "../../store/actions/wallet";

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
    <View>
      <Button title="Mint" onPress={props.mint} />
      <Button title="Log Out" onPress={props.signOut} />
    </View>
  ) : (
    <Button title="Trust" onPress={props.trust} />
  );

const Thumbnail: React.StatelessComponent<{ member: Member }> = props => (
  <View style={{ flex: 1 }}>
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
    <Text style={{ flex: 1 }}>{`${props.member.fullName}`}</Text>
  </View>
);

const Stats: React.StatelessComponent<{ member: Member }> = props => (
  <View style={styles.statsContainer}>
    <View style={styles.stat}>
      <Text style={styles.number}>{props.member.balance.toString()}</Text>
      <Text>{"balance"}</Text>
    </View>
    <View style={styles.stat}>
      <Text style={styles.number}>{props.member.trustedBy.size}</Text>
      <Text>{"trusted by"}</Text>
    </View>
    <View style={styles.stat}>
      <Text style={styles.number}>{props.member.trusts.size}</Text>
      <Text>{"trusts"}</Text>
    </View>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = props => (
  <View style={styles.container}>
    <View style={{ flex: 1, width: "100%", flexDirection: "row" }}>
      <Thumbnail member={props.member} />
      <View style={{ flex: 3 }}>
        <Stats member={props.member} />
        <Actions
          isOwnProfile={props.isOwnProfile}
          mint={props.mint}
          trust={props.trust}
          signOut={props.signOut}
        />
      </View>
    </View>
    <View style={{ flex: 3, backgroundColor: "red", width: "100%" }}>
      <Text>TODO feed specific to this user</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  },
  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  statsContainer: {
    flexDirection: "row"
  },
  video: {
    flex: 4,
    width: "100%",
    aspectRatio: 3 / 4
  },
  number: {
    fontWeight: "bold"
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
