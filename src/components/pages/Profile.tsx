/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import Video from "react-native-video";

import { MemberId } from "@raha/api-shared/models/identifiers";

import { RouteName } from "../shared/Navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { trustMember } from "../../store/actions/members";
import { getMemberById } from "../../store/selectors/members";
import { ActivityFeed } from "../shared/ActivityFeed";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button, Container, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  member: Member;
  isOwnProfile: boolean;
};

type DispatchProps = {
  trust: (memberId: MemberId) => void;
};

type ProfileProps = StateProps & OwnProps & DispatchProps;

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
  <Container>
    <ActivityFeed
      header={
        <View style={styles.header}>
          <Thumbnail member={props.member} />
          <View style={styles.interactions}>
            <Stats navigation={props.navigation} member={props.member} />
            {!props.isOwnProfile && (
              <View style={styles.actions}>
                <Button
                  title="Trust"
                  onPress={() => props.trust(props.member.memberId)}
                  //@ts-ignore Because Button does have a rounded property
                  rounded
                />
                <Button
                  title="Give"
                  onPress={() =>
                    props.navigation.navigate(RouteName.Give, {
                      toMember: props.member
                    })
                  }
                  //@ts-ignore Because Button does have a rounded property
                  rounded
                />
              </View>
            )}
          </View>
        </View>
      }
      filter={operation =>
        operation.creator_uid === props.member.memberId ||
        ("to_uid" in operation.data &&
          operation.data.to_uid === props.member.memberId)
      }
    />
  </Container>
);

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    backgroundColor: colors.darkAccent,
    padding: 10,
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
    color: colors.lightAccent
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
    color: colors.bodyText,
    fontSize: 12
  }
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => {
  return {
    trust: (memberId: MemberId) => dispatch(trustMember(memberId))
  };
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const loggedInMemberId = getLoggedInFirebaseUserId(state);
  const loggedInMember =
    state.authentication.isLoggedIn && loggedInMemberId
      ? getMemberById(state, loggedInMemberId)
      : undefined;
  const member: Member = props.navigation.getParam("member", loggedInMember);
  return {
    member,
    isOwnProfile:
      !!loggedInMember && loggedInMember.memberId === member.memberId
  };
};

export const Profile = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileView);
