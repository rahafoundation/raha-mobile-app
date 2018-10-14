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
import { OperationType } from "@raha/api-shared/dist/models/Operation";

import {
  getInitialsForName,
  getMemberColor
} from "../../../helpers/memberDisplay";
import { RahaState } from "../../../store";
import { mintReferralBonus } from "../../../store/actions/wallet";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";
import { Member } from "../../../store/reducers/members";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { RouteName } from "../../shared/Navigation";
import { Text } from "../../shared/elements";
import { ReferralBonusNavParams } from ".";
import {
  CurrencyRole,
  CurrencyType,
  Currency,
  CurrencyValue
} from "../../shared/elements/Currency";
import { MemberThumbnail } from "../../shared/MemberThumbnail";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { Loading } from "../../shared/Loading";
import { fonts } from "../../../helpers/fonts";
import { REFERRAL_BONUS } from "../../../store/selectors/me";
import { EnforcePermissionsButton } from "../../shared/elements/EnforcePermissionsButton";

const REFERRAL_BONUS_VALUE: CurrencyValue = {
  currencyType: CurrencyType.Raha,
  value: new Big(REFERRAL_BONUS),
  role: CurrencyRole.None
};

type OwnProps = NavigationScreenProps<ReferralBonusNavParams> & {
  loggedInMember?: Member;
  invitedMember: Member;
};

type StateProps = {
  mintBonusApiCallStatus?: ApiCallStatus;
};

type DispatchProps = {
  mintReferralBonus: typeof mintReferralBonus;
};

type MergedProps = {
  mintReferralBonus: () => void;
};

type Props = OwnProps & StateProps & MergedProps;

const ReferralThumbnailComponent: React.StatelessComponent<Props> = ({
  loggedInMember,
  invitedMember,
  navigation,
  mintBonusApiCallStatus,
  mintReferralBonus
}) => {
  if (!loggedInMember) {
    return <Loading />;
  }

  const isMinting =
    !!mintBonusApiCallStatus &&
    mintBonusApiCallStatus.status === ApiCallStatusType.STARTED;

  const canMintReferralBonus = invitedMember
    .get("verifiedBy")
    .includes(loggedInMember.get("memberId"));

  const actionButton = canMintReferralBonus ? (
    <EnforcePermissionsButton
      operationType={OperationType.MINT}
      onPress={mintReferralBonus}
      disabled={isMinting}
      title={["Mint", REFERRAL_BONUS_VALUE]}
    />
  ) : null;

  const message = canMintReferralBonus ? (
    <Text>
      You invited{" "}
      <Text style={fonts.Lato.Bold}>{invitedMember.get("fullName")}</Text>!
    </Text>
  ) : (
    <Text>
      You must verify{" "}
      <Text style={fonts.Lato.Bold}>{invitedMember.get("fullName")}</Text>{" "}
      before minting your bonus.
    </Text>
  );

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
          <Text>
            Minted <Currency currencyValue={REFERRAL_BONUS_VALUE} />
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
    loggedInMember: getLoggedInMember(state),
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
    ...ownProps
  };
};

export const ReferralThumbnail = connect(
  mapStateToProps,
  { mintReferralBonus },
  mergeProps
)(ReferralThumbnailComponent);

const rowStyle: ViewStyle = {
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
