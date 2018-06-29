/**
 * A component that displays all invited members for which the logged-in
 * member has not already minted a referral bonus.
 */

import * as React from "react";
import { FlatList } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { RahaState } from "../../../store";
import { mintReferralBonus } from "../../../store/actions/wallet";
import { Member } from "../../../store/reducers/members";
import { getUnclaimedReferrals } from "../../../store/selectors/me";
import { getMembersByIds } from "../../../store/selectors/members";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { ReferralThumbnail } from "./ReferralThumbnail";
import { MemberId } from "../../../identifiers";
import { Container } from "../../shared/elements";

export interface ReferralBonusNavParams {
  unclaimedReferralIds: (MemberId | undefined)[];
}

type OwnProps = NavigationScreenProps<ReferralBonusNavParams>;

type StateProps = { unclaimedReferralMembers: (Member | undefined)[] };

type DispatchProps = {
  mintReferralBonus: typeof mintReferralBonus;
};
type MergedProps = {
  mintReferralBonus: () => void;
};

type Props = OwnProps & StateProps & MergedProps;

const ReferralsComponent: React.StatelessComponent<Props> = ({
  unclaimedReferralMembers,
  navigation
}) => {
  const members = unclaimedReferralMembers.filter(m => m) as Member[];
  return (
    <Container>
      <FlatList
        data={members}
        keyExtractor={m => m.memberId}
        renderItem={m => (
          <ReferralThumbnail invitedMember={m.item} navigation={navigation} />
        )}
      />
    </Container>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const unclaimedReferralIds = ownProps.navigation
    .getParam("unclaimedReferralIds", [])
    .filter(x => x) as MemberId[];
  const unclaimedReferralMembers = unclaimedReferralIds
    ? getMembersByIds(state, unclaimedReferralIds)
    : [];
  return {
    unclaimedReferralMembers
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
