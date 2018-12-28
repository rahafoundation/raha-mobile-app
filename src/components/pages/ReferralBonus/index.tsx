/**
 * A component that displays all invited members for which the logged-in
 * member has not already minted a referral bonus.
 */

import * as React from "react";
import { FlatList, View } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../../store";
import { mintReferralBonus } from "../../../store/actions/wallet";
import { Member } from "../../../store/reducers/members";
import { getMembersByIds } from "../../../store/selectors/members";
import { ReferralThumbnail } from "./ReferralThumbnail";
import { UnclaimedReferral } from "../../../store/selectors/me";

export interface ReferralBonusNavParams {
  unclaimedReferrals: UnclaimedReferral[];
}

type OwnProps = NavigationScreenProps<ReferralBonusNavParams>;

type StateProps = { unclaimedReferrals: UnclaimedReferral[] };

type DispatchProps = {
  mintReferralBonus: typeof mintReferralBonus;
};
type MergedProps = {
  mintReferralBonus: () => void;
};

type Props = OwnProps & StateProps & MergedProps;

const ReferralsComponent: React.StatelessComponent<Props> = ({
  unclaimedReferrals,
  navigation
}) => {
  return (
    <View>
      <FlatList
        data={unclaimedReferrals}
        keyExtractor={m => m.memberId}
        renderItem={m => (
          <ReferralThumbnail
            invitedMemberId={m.item.memberId}
            referralBonus={m.item.referralBonus}
            navigation={navigation}
          />
        )}
      />
    </View>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const unclaimedReferrals = ownProps.navigation
    .getParam("unclaimedReferrals", [])
    .filter(x => x) as UnclaimedReferral[];
  return {
    unclaimedReferrals
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
    mintReferralBonus: () => null,
    ...ownProps
  };
};

export const ReferralBonus = connect(
  mapStateToProps,
  { mintReferralBonus },
  mergeProps
)(ReferralsComponent);
