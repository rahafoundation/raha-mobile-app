/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProps } from "react-navigation";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RouteName } from "../shared/Navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { trustMember } from "../../store/actions/members";
import { getMemberById } from "../../store/selectors/members";
import { ActivityFeed } from "../shared/Activity/ActivityFeed";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button, Container, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import { VideoWithPlaceholder } from "../shared/VideoWithPlaceholder";
import { activitiesForMember } from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  member: Member;
  isOwnProfile: boolean;
  activities: Activity[];
};

type DispatchProps = {
  trust: (memberId: MemberId) => void;
};

type ProfileProps = StateProps & OwnProps & DispatchProps;

const Thumbnail: React.StatelessComponent<{ member: Member }> = props => (
  <View style={styles.thumbnail}>
    <VideoWithPlaceholder style={styles.video} uri={props.member.videoUri} />
    <Text style={styles.memberUsername}>@{props.member.get("username")}</Text>
  </View>
);

type StatsProps = NavigationScreenProps<NavParams> & {
  member: Member;
};
const Stats: React.StatelessComponent<StatsProps> = props => (
  <View style={styles.statsContainer}>
    <View style={styles.stat}>
      <Text style={styles.number}>
        ℝ{props.member.get("balance").toFixed(2)}
      </Text>
      <Text style={styles.numberLabel}>balance</Text>
    </View>
    <TouchableHighlight
      onPress={() => {
        props.navigation.push(RouteName.MemberListPage, {
          memberIds: Array.from(props.member.get("trustedBy")),
          title: "Trusted By"
        });
      }}
    >
      <View style={styles.stat}>
        <Text style={styles.number}>{props.member.get("trustedBy").size}</Text>
        <Text style={styles.numberLabel}>trusted by</Text>
      </View>
    </TouchableHighlight>
    <TouchableHighlight
      onPress={() =>
        props.navigation.push(RouteName.MemberListPage, {
          memberIds: Array.from(props.member.get("trusts")),
          title: "Trusted By"
        })
      }
    >
      <View style={styles.stat}>
        <Text style={styles.number}>{props.member.get("trusts").size}</Text>
        <Text style={styles.numberLabel}>trusts</Text>
      </View>
    </TouchableHighlight>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = ({
  activities,
  navigation,
  member,
  isOwnProfile,
  trust
}) => (
  <Container>
    <ActivityFeed
      activities={activities}
      header={
        <View style={styles.header}>
          <Thumbnail member={member} />
          <View style={styles.interactions}>
            <Stats navigation={navigation} member={member} />
            {!isOwnProfile && (
              <View style={styles.actions}>
                <Button
                  title="Trust"
                  onPress={() => trust(member.get("memberId"))}
                  //@ts-ignore Because Button does have a rounded property
                  rounded
                />
                <Button
                  title="Give"
                  onPress={() =>
                    navigation.navigate(RouteName.GivePage, {
                      toMember: member
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
    height: 100,
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
    width: "100%",
    height: "100%",
    aspectRatio: 1
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
  // NOTE: always should be present since this page is only showed when logged
  // in.
  const loggedInMemberId = getLoggedInFirebaseUserId(state) as MemberId;
  // TODO: provide loading state if logged in member isn't present
  const loggedInMember = getMemberById(state, loggedInMemberId);
  const member: Member = props.navigation.getParam("member", loggedInMember);
  const activities = activitiesForMember(state, member.get("memberId"));
  return {
    activities,
    member,
    isOwnProfile:
      !!loggedInMember &&
      loggedInMember.get("memberId") === member.get("memberId")
  };
};

export const Profile = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileView);
