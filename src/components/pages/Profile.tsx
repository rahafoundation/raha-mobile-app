/**
 * Show the users profile, such as their name, balance, and trust connections.
 * If it is your own profile, then there will be additional information such
 * as ability to Mint.
 */
import * as React from "react";
import { TouchableHighlight, View, TouchableOpacity } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import Icon from "react-native-vector-icons/FontAwesome5";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RouteName } from "../shared/Navigation";
import { Member } from "../../store/reducers/members";
import { RahaThunkDispatch, RahaState } from "../../store";
import { trustMember } from "../../store/actions/members";
import { getMemberById } from "../../store/selectors/members";
import { StoryFeed } from "../shared/StoryFeed";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button, Text } from "../shared/elements";
import { VideoWithPlaceholder } from "../shared/VideoWithPlaceholder";
import {
  CurrencyType,
  CurrencyRole,
  Currency,
  currencySymbol
} from "../shared/elements/Currency";
import { styles } from "./Profile.styles";
import {
  ApiCallStatusType,
  ApiCallStatus
} from "../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberName } from "../shared/MemberName";
import { activitiesInvolvingMembers } from "../../store/selectors/activities";
import { storiesForActivities } from "../../store/selectors/stories";
import { Story, StoryType } from "../../store/selectors/stories/types";
import { List } from "immutable";
import { FlaggedNotice } from "../shared/Cards/FlaggedNotice";
import { UnverifiedNotice } from "../shared/Cards/UnverifiedNotice";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { EnforcePermissionsButton } from "../shared/elements/EnforcePermissionsButton";
import { CardStyles } from "../shared/Cards/CardStyles";

interface NavParams {
  member: Member;
  pageReset?: () => void;
}
type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = {
  loggedInMember?: Member;
  member: Member;
  isOwnProfile: boolean;
  stories: List<Story>;
  verifiedThisMemberStories: List<Story>;
  trustApiCallStatus?: ApiCallStatus;
  verifyApiCallStatus?: ApiCallStatus;
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
  verifiedThisMemberStories: List<Story>;
};
const Stats: React.StatelessComponent<StatsProps> = ({
  member,
  verifiedThisMemberStories,
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
          navigation.push(RouteName.StoryListPage, {
            stories: verifiedThisMemberStories,
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

class ProfileView extends React.PureComponent<ProfileProps> {
  private storyFeed: StoryFeed | null = null;

  componentDidMount() {
    if (this.storyFeed) {
      this.props.navigation.setParams({
        pageReset: this.storyFeed.pageUp
      });
    }
  }

  trustButton() {
    const { loggedInMember, member, trust, trustApiCallStatus } = this.props;

    const alreadyTrusted =
      loggedInMember &&
      member.get("trustedBy").includes(loggedInMember.get("memberId"));
    const inProgressOrFinished =
      trustApiCallStatus &&
      trustApiCallStatus.status !== ApiCallStatusType.FAILURE;

    const trustTitle = alreadyTrusted
      ? "Trusted"
      : !inProgressOrFinished
        ? "Trust"
        : "Trusting";
    const disableTrustButton = alreadyTrusted || inProgressOrFinished;

    return (
      <EnforcePermissionsButton
        operationType={OperationType.TRUST}
        title={trustTitle}
        onPress={() => trust(member.get("memberId"))}
        disabled={disableTrustButton}
      />
    );
  }

  verifyButton() {
    const {
      navigation,
      loggedInMember,
      member,
      verifyApiCallStatus
    } = this.props;

    const alreadyVerified =
      loggedInMember &&
      member.get("verifiedBy").includes(loggedInMember.get("memberId"));
    const loggedInMemberCanVerify = loggedInMember;
    const inProgressOrFinished =
      verifyApiCallStatus &&
      verifyApiCallStatus.status !== ApiCallStatusType.FAILURE;

    const verifyTitle = alreadyVerified
      ? "Verified"
      : inProgressOrFinished
        ? "Verifying"
        : "Verify";
    const disableVerify =
      alreadyVerified || !loggedInMemberCanVerify || inProgressOrFinished;

    return (
      <EnforcePermissionsButton
        // TODO: Come up with a solution for indicating action completed
        // Changing the text on these buttons forces them off the side of small screens
        operationType={OperationType.VERIFY}
        title={verifyTitle}
        onPress={() =>
          navigation.navigate(RouteName.Verify, {
            toMemberId: member.get("memberId")
          })
        }
        disabled={disableVerify}
      />
    );
  }

  renderProfileIsFlaggedStatus() {
    const { member, isOwnProfile } = this.props;
    const fullName = member.get("fullName");
    const operationsFlaggingThisMember = member.get(
      "operationsFlaggingThisMember"
    );
    return operationsFlaggingThisMember.isEmpty() ? null : (
      <TouchableOpacity
        style={[CardStyles.card, CardStyles.error, styles.flaggedStatus]}
        onPress={() =>
          this.props.navigation.navigate(RouteName.FlagFeed, {
            member
          })
        }
      >
        <Icon name="flag" size={30} style={CardStyles.cardErrorIcon} />
        <View style={CardStyles.cardBody}>
          <Text>
            Members of the Raha community have raised issues with{" "}
            {isOwnProfile ? "your" : `${fullName}'s`} account.
          </Text>
          <Text style={CardStyles.cardBodyAction}>
            Tap this notice to view their concerns.
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      stories,
      navigation,
      member,
      loggedInMember,
      isOwnProfile,
      verifiedThisMemberStories
    } = this.props;

    return (
      <View style={styles.body}>
        <StoryFeed
          ref={ref => (this.storyFeed = ref)}
          stories={stories}
          header={
            <View style={styles.header}>
              {this.renderProfileIsFlaggedStatus()}
              {!isOwnProfile && (
                <FlaggedNotice
                  loggedInMember={loggedInMember}
                  restrictedFrom="interacting with other members of Raha"
                />
              )}
              <UnverifiedNotice loggedInMember={loggedInMember} />
              <View style={styles.headerProfile}>
                <Thumbnail member={member} />
                <View style={styles.headerDetails}>
                  <Text style={styles.memberName}>
                    <MemberName member={member} />
                  </Text>
                  <Text style={styles.memberUsername}>
                    @{member.get("username")}
                  </Text>
                  <Stats
                    navigation={navigation}
                    member={member}
                    verifiedThisMemberStories={verifiedThisMemberStories}
                  />
                </View>
              </View>
              {!!loggedInMember &&
                !isOwnProfile && (
                  <View style={styles.memberActions}>
                    {this.trustButton()}
                    {this.verifyButton()}
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
  }
}

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

  // Get the fresh state for the member - the member that was passed as a navigation
  // parameter may no longer be fresh.
  const member: Member = props.navigation.getParam("member", loggedInMember);
  const memberId = member.get("memberId");
  const freshMember = getMemberById(state, memberId, { throwIfMissing: true });

  const activities = activitiesInvolvingMembers(state, [memberId]);
  const stories = storiesForActivities(state, activities).reverse();
  const verifiedThisMemberStories = stories.filter(
    story =>
      story.storyData.type === StoryType.VERIFY_MEMBER &&
      story.storyData.activities.operations.data.to_uid === memberId
  );

  return {
    stories,
    verifiedThisMemberStories,
    member: freshMember,
    loggedInMember,
    isOwnProfile:
      !!loggedInMember && loggedInMember.get("memberId") === memberId,
    trustApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.TRUST_MEMBER,
      memberId
    ),
    verifyApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.VERIFY_MEMBER,
      memberId
    )
  };
};

export const Profile = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileView);
