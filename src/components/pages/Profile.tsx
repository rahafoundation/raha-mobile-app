/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import {
  StyleSheet,
  TouchableHighlight,
  View,
  TextStyle,
  ViewStyle
} from "react-native";
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
import { Button, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import { VideoWithPlaceholder } from "../shared/VideoWithPlaceholder";
import { activitiesForMember } from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";
import {
  CurrencyType,
  CurrencyRole,
  Currency,
  currencySymbol
} from "../shared/elements/Currency";
import { fontSizes, fonts } from "../../helpers/fonts";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  loggedInMember?: Member;
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
    <VideoWithPlaceholder
      style={styles.profileVideo}
      uri={props.member.videoUri}
    />
  </View>
);

type StatsProps = NavigationScreenProps<NavParams> & {
  member: Member;
};
const Stats: React.StatelessComponent<StatsProps> = props => (
  <View style={styles.statsContainer}>
    <View>
      <Currency
        style={styles.statNumber}
        currencyValue={{
          value: props.member.get("balance"),
          currencyType: CurrencyType.Raha,
          role: CurrencyRole.None
        }}
      />
      <Text style={styles.statLabel}>balance</Text>
    </View>
    <TouchableHighlight
      onPress={() => {
        props.navigation.push(RouteName.MemberListPage, {
          memberIds: Array.from(props.member.get("trustedBy")),
          title: "Trusted By"
        });
      }}
    >
      <View>
        <Text style={styles.statNumber}>
          {props.member.get("trustedBy").size}
        </Text>
        <Text style={styles.statLabel}>trusted by</Text>
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
      <View>
        <Text style={styles.statNumber}>{props.member.get("trusts").size}</Text>
        <Text style={styles.statLabel}>trusts</Text>
      </View>
    </TouchableHighlight>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = ({
  activities,
  navigation,
  member,
  loggedInMember,
  isOwnProfile,
  trust
}) => {
  const alreadyTrusted =
    loggedInMember &&
    member.get("trustedBy").includes(loggedInMember.get("memberId"));
  const canVerify =
    // member is logged in
    loggedInMember &&
    // member is verified
    loggedInMember.get("isVerified") &&
    // current member hasn't already verified the target member
    !member.get("verifiedBy").includes(loggedInMember.get("memberId"));
  return (
    <View style={styles.body}>
      <ActivityFeed
        activities={activities}
        header={
          <View style={styles.header}>
            <Thumbnail member={member} />
            <View style={styles.headerDetails}>
              <Text style={styles.memberUsername}>
                @{member.get("username")}
              </Text>
              <Stats navigation={navigation} member={member} />
              {!!loggedInMember &&
                !isOwnProfile && (
                  <View style={styles.memberActions}>
                    <Button
                      // TODO: Come up with a solution for indicating action completed
                      // Changing the text on these buttons forces them off the side of small screens
                      title="Trust"
                      onPress={() => trust(member.get("memberId"))}
                      disabled={alreadyTrusted}
                    />
                    <Button
                      // TODO: Come up with a solution for indicating action completed
                      // Changing the text on these buttons forces them off the side of small screens
                      title="Verify"
                      onPress={() =>
                        navigation.navigate(RouteName.Verify, {
                          toMemberId: member.get("memberId")
                        })
                      }
                      disabled={!canVerify}
                    />
                    <Button
                      title={currencySymbol(CurrencyType.Raha)}
                      onPress={() =>
                        navigation.navigate(RouteName.GivePage, {
                          toMember: member
                        })
                      }
                    />
                  </View>
                )}
            </View>
          </View>
        }
      />
    </View>
  );
};

const bodyStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};

const headerStyle: ViewStyle = {
  backgroundColor: colors.darkAccent,
  padding: 20,

  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center"
};

const headerDetailsStyle: ViewStyle = {
  flexGrow: 1
};

const statNumberStyle: TextStyle = {
  ...fonts.Lato.Bold,
  ...fontSizes.large
};

const statLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};

const memberUsernameStyle: TextStyle = {
  ...fonts.Lato.Semibold,
  ...fontSizes.medium
};

const thumbnailStyle: ViewStyle = {
  flexGrow: 0,
  flexBasis: 120,

  flexDirection: "column",
  alignItems: "center",
  marginRight: 20
};

const detailsSpacer: ViewStyle = {
  marginTop: 15
};

const memberActionsStyle: ViewStyle = {
  ...detailsSpacer,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const statsContainerStyle: ViewStyle = {
  ...detailsSpacer,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const profileVideoStyle: ViewStyle = {
  width: "100%",
  aspectRatio: 1
};

const styles = StyleSheet.create({
  body: bodyStyle,
  header: headerStyle,
  thumbnail: thumbnailStyle,
  memberUsername: memberUsernameStyle,
  headerDetails: headerDetailsStyle,
  memberActions: memberActionsStyle,
  statsContainer: statsContainerStyle,
  profileVideo: profileVideoStyle,
  statNumber: statNumberStyle,
  statLabel: statLabelStyle
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
    loggedInMember,
    isOwnProfile:
      !!loggedInMember &&
      loggedInMember.get("memberId") === member.get("memberId")
  };
};

export const Profile = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileView);
