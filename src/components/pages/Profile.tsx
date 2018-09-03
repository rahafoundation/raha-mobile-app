/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { TouchableHighlight, View } from "react-native";
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
import { VideoWithPlaceholder } from "../shared/VideoWithPlaceholder";
import {
  activitiesForMember,
  convertOperationsToActivities
} from "../../store/selectors/activities";
import { Activity } from "../../store/selectors/activities/types";
import {
  CurrencyType,
  CurrencyRole,
  Currency,
  currencySymbol
} from "../shared/elements/Currency";
import { styles } from "./Profile.styles";
import { operationsForMember } from "../../store/selectors/operations";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

interface NavParams {
  member: Member;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  loggedInMember?: Member;
  member: Member;
  isOwnProfile: boolean;
  activities: Activity[];
  verifiedActivities: Activity[];
};

type DispatchProps = {
  trust: (memberId: MemberId) => void;
};

type ProfileProps = StateProps & OwnProps & DispatchProps;

const Thumbnail: React.StatelessComponent<{ member: Member }> = props => (
  <View style={styles.thumbnail}>
    <VideoWithPlaceholder
      style={styles.profileVideo}
      videoUri={props.member.videoUri}
      placeholderUri={`${props.member.videoUri}.thumb.jpg`}
    />
  </View>
);

type StatsProps = NavigationScreenProps<NavParams> & {
  member: Member;
  verifiedActivities: Activity[];
};
const Stats: React.StatelessComponent<StatsProps> = ({
  member,
  verifiedActivities,
  navigation
}) => (
  <View>
    <View style={styles.statsContainer}>
      <View>
        <Currency
          style={styles.statNumber}
          currencyValue={{
            value: member.get("balance"),
            currencyType: CurrencyType.Raha,
            role: CurrencyRole.None
          }}
        />
        <Text style={styles.statLabel}>balance</Text>
      </View>
      <TouchableHighlight
        onPress={() => {
          navigation.push(RouteName.MemberListPage, {
            memberIds: Array.from(member.get("trustedBy")),
            title: "Trusted By"
          });
        }}
      >
        <View>
          <Text style={[styles.statNumber, styles.floatRight]}>
            {member.get("trustedBy").size}
          </Text>
          <Text style={styles.statLabel}>trusted by</Text>
        </View>
      </TouchableHighlight>
    </View>
    <View style={styles.statsContainer}>
      <TouchableHighlight
        onPress={() =>
          navigation.push(RouteName.ActivityListPage, {
            activities: verifiedActivities,
            title: "Verified By"
          })
        }
      >
        <View>
          <Text style={styles.statNumber}>{member.get("verifiedBy").size}</Text>
          <Text style={styles.statLabel}>verified by</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={() =>
          navigation.push(RouteName.MemberListPage, {
            memberIds: Array.from(member.get("trusts")),
            title: "Trusted By"
          })
        }
      >
        <View>
          <Text style={[styles.statNumber, styles.floatRight]}>
            {member.get("trusts").size}
          </Text>
          <Text style={styles.statLabel}>trusts</Text>
        </View>
      </TouchableHighlight>
    </View>
  </View>
);

const ProfileView: React.StatelessComponent<ProfileProps> = ({
  activities,
  verifiedActivities,
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
            <View style={styles.headerProfile}>
              <Thumbnail member={member} />
              <View style={styles.headerDetails}>
                <Text style={styles.memberUsername}>
                  @{member.get("username")}
                </Text>
                <Stats
                  navigation={navigation}
                  member={member}
                  verifiedActivities={verifiedActivities}
                />
              </View>
            </View>
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
        }
      />
    </View>
  );
};

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
  const verifiedActivities: Activity[] = convertOperationsToActivities(
    state,
    operationsForMember(state.operations, member.get("memberId")).filter(
      op =>
        op.op_code === OperationType.VERIFY &&
        op.data.to_uid === member.get("memberId")
    )
  );
  return {
    activities,
    verifiedActivities,
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
