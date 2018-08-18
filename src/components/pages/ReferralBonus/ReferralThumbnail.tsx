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
import { TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, MergeProps, MapStateToProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

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
import { Button, Text } from "../../shared/elements";
import { ReferralBonusNavParams } from ".";
import { CurrencyRole, CurrencyType } from "../../shared/Currency";
import { MemberThumbnail } from "../../shared/MemberThumbnail";

const REFERRAL_BONUS = new Big(60);
const REFERRAL_BONUS_VALUE = {
  currencyType: CurrencyType.Raha,
  value: REFERRAL_BONUS,
  role: CurrencyRole.None
};

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

  const actionButton = invitedMember.get("inviteConfirmed") ? (
    <Button
      onPress={mintReferralBonus}
      disabled={isMinting}
      title={["Mint", REFERRAL_BONUS_VALUE]}
    />
  ) : (
    <Button onPress={trustMember} disabled={isTrusting} title="Trust" />
  );

  const message = invitedMember.get("inviteConfirmed")
    ? `You invited ${invitedMember.get("fullName")}!`
    : `You must trust ${invitedMember.get(
        "fullName"
      )} before minting your bonus.`;

  return (
    <TouchableOpacity
      style={styles.row}
      delayPressIn={20}
      onPress={() =>
        navigation.push(RouteName.ProfilePage, { member: invitedMember })
      }
    >
      <MemberThumbnail style={styles.thumbnail} member={invitedMember} />
      <View style={styles.rowMessage}>
        <Text numberOfLines={3} ellipsizeMode="tail">
          {message}
        </Text>
      </View>
      <View>
        {!!mintBonusApiCallStatus &&
        mintBonusApiCallStatus.status === ApiCallStatusType.SUCCESS ? (
          <Text
            compoundContent={{
              content: ["Minted", REFERRAL_BONUS_VALUE]
            }}
          />
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
      ApiEndpointName.TRUST_MEMBER,
      ownProps.invitedMember.get("memberId")
    ),
    mintBonusApiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.MINT,
      ownProps.invitedMember.get("memberId")
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
        ownProps.invitedMember.get("memberId")
      ),
    trustMember: () =>
      dispatchProps.trustMember(ownProps.invitedMember.get("memberId")),
    ...ownProps
  };
};

export const ReferralThumbnail = connect(
  mapStateToProps,
  { mintReferralBonus, trustMember },
  mergeProps
)(ReferralThumbnailComponent);

const rowStyle: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  marginHorizontal: 12,
  marginTop: 12,
  alignItems: "center"
};

const rowSpacer: ViewStyle = {
  marginRight: 12
};

const thumbnailStyle: ViewStyle = {
  ...rowSpacer
};

const rowMessageStyle: ViewStyle = {
  ...rowSpacer,
  flexBasis: "100%",
  flexGrow: 0,
  flexShrink: 1
};

const styles = StyleSheet.create({
  row: rowStyle,
  rowMessage: rowMessageStyle,
  thumbnail: thumbnailStyle
});
