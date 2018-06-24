/**
 * A list element for members invited by the user and for whom the
 * user has not already claimed their referral bonus.
 *
 * If the member has not yet trusted the member, then
 * they are prompted to do so. Otherwise, they can mint
 * their referral bonus.
 */

import { Big } from "big.js";
import * as React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { NavigationScreenProps } from "react-navigation";
import { connect, MergeProps, MapStateToProps } from "react-redux";

import { ApiEndpoint } from "../../../api";
import {
  getInitialsForName,
  getMemberColor
} from "../../../helpers/memberDisplay";
import { RahaState } from "../../../store";
import { trustMember } from "../../../store/actions/members";
import { mintReferralBonus } from "../../../store/actions/wallet";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { RouteName } from "../../shared/Navigation";
import { ReferralBonusNavParams } from ".";

const REFERRAL_BONUS = new Big(60);

type OwnProps = NavigationScreenProps<ReferralBonusNavParams> & {
  invitedMember: Member;
};

type StateProps = {
  trustApiCallStatus?: ApiCallStatus;
  mintBonusApiCallStatus?: ApiCallStatus;
};

type DispatchProps = {
  mintReferralBonus: typeof mintReferralBonus;
  trustMember: typeof trustMember;
};

type MergedProps = {
  mintReferralBonus: () => void;
  trustMember: () => void;
};

type Props = OwnProps & StateProps & MergedProps;

const ReferralThumbnailComponent: React.StatelessComponent<Props> = ({
  invitedMember,
  navigation,
  trustApiCallStatus,
  mintBonusApiCallStatus,
  mintReferralBonus
}) => {
  const isTrusting =
    !!trustApiCallStatus &&
    trustApiCallStatus.status === ApiCallStatusType.STARTED;
  const isMinting =
    !!mintBonusApiCallStatus &&
    mintBonusApiCallStatus.status === ApiCallStatusType.STARTED;

  const actionButton = invitedMember.inviteConfirmed ? (
    <Button
      onPress={mintReferralBonus}
      loading={isMinting}
      disabled={isMinting}
      title={`Mint +ℝ${REFERRAL_BONUS.toString()}`}
      buttonStyle={styles.mintButton}
      //@ts-ignore Because Button does have a rounded property
      rounded
    />
  ) : (
    <Button
      onPress={trustMember}
      loading={isTrusting}
      disabled={isTrusting}
      title="Trust"
      buttonStyle={styles.trustButton}
      //@ts-ignore Because Button does have a rounded property
      rounded
    />
  );

  const message = invitedMember.inviteConfirmed
    ? `You invited ${invitedMember.fullName}!`
    : `You must trust ${invitedMember.fullName} before minting your bonus!`;

  return (
    <TouchableOpacity
      style={styles.row}
      delayPressIn={20}
      onPress={() =>
        navigation.push(RouteName.Profile, { member: invitedMember })
      }
    >
      <Text
        style={[
          styles.memberIcon,
          {
            backgroundColor: getMemberColor(invitedMember)
          }
        ]}
      >
        {getInitialsForName(invitedMember.fullName)}
      </Text>
      <View style={styles.messageView}>
        <Text style={styles.messageText} numberOfLines={3} ellipsizeMode="tail">
          {message}
        </Text>
      </View>
      <View style={styles.actionView}>
        {!!mintBonusApiCallStatus &&
        mintBonusApiCallStatus.status === ApiCallStatusType.SUCCESS ? (
          <Text style={styles.actionText}>
            Minted +ℝ{REFERRAL_BONUS.toString()}
          </Text>
        ) : (
          actionButton
        )}
      </View>
    </TouchableOpacity>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  return {
    trustApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpoint.TRUST_MEMBER,
      ownProps.invitedMember.memberId
    ),
    mintBonusApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpoint.MINT,
      ownProps.invitedMember.memberId
    )
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
    mintReferralBonus: () =>
      dispatchProps.mintReferralBonus(
        REFERRAL_BONUS,
        ownProps.invitedMember.memberId
      ),
    trustMember: () =>
      dispatchProps.trustMember(ownProps.invitedMember.memberId),
    ...ownProps
  };
};

export const ReferralThumbnail = connect(
  mapStateToProps,
  { mintReferralBonus, trustMember },
  mergeProps
)(ReferralThumbnailComponent);

const styles = StyleSheet.create({
  row: {
    height: 75,
    flex: 1,
    flexDirection: "row"
  },
  memberIcon: {
    fontSize: 30,
    textAlign: "center",
    textAlignVertical: "center",
    height: 75,
    width: 75
  },
  messageView: {
    flex: 1,
    alignSelf: "center"
  },
  messageText: {
    flex: 0,
    margin: 8
  },
  actionView: {
    width: 150,
    alignSelf: "center"
  },
  actionText: {
    color: "#4CAF50",
    alignSelf: "center"
  },
  mintButton: {
    flex: 0,
    backgroundColor: "#4CAF50"
  },
  trustButton: {
    flex: 0,
    backgroundColor: "#03A9F4"
  }
});
