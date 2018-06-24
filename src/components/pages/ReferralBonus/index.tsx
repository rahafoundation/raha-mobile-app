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

/**
 * TODO Ideas for the morning:
 * * Untrusted referrals have a "Trust" button instead of "Mint". This turns into "Mint" on trust action completion.
 * * Members don't disappear from the list after mint operations are completed. They remain in a "Minted!" state, so you can feel good about yourself.
 * * This also means we don't need to recalculate that state in this component, but can instead just take it in as props.
 */

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
    <FlatList
      data={members}
      keyExtractor={m => m.memberId}
      renderItem={m => (
        <ReferralThumbnail invitedMember={m.item} navigation={navigation} />
      )}
    />
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
