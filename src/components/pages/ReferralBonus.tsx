import * as React from "react";
import { View, Text } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import {
  connect,
  MapStateToProps,
  MapDispatchToProps,
  MergeProps
} from "react-redux";

import { OperationId, MemberId } from "../../identifiers";
import { RahaState } from "../../store";
import { mintReferralBonus } from "../../store/actions/wallet";
import { Member } from "../../store/reducers/members";
import { getUnclaimedReferrals } from "../../store/selectors/me";
import { List, ListItem } from "react-native-elements";
import { getMembersByIds } from "../../store/selectors/members";
import { SafeAreaView } from "../../shared/SafeAreaView";

interface NavParams {
  unclaimedReferralIds: MemberId[];
}

type OwnProps = NavigationScreenProps<NavParams>;

type StateProps = { unclaimedReferralMembers: (Member | undefined)[] };

type DispatchProps = {
  mintReferralBonus: typeof mintReferralBonus;
};
type MergedProps = {
  mintReferralBonus: () => void;
};

type Props = OwnProps & StateProps & MergedProps;

const ReferralsComponent: React.StatelessComponent<Props> = props => {
  const unclaimed = props.unclaimedReferralMembers.map(
    member =>
      member && <ListItem key={member.memberId} title={member.fullName} />
  );
  console.log(unclaimed.length);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <List>{unclaimed}</List>
    </SafeAreaView>
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const unclaimedReferralIds = ownProps.navigation.getParam(
    "unclaimedReferralIds",
    []
  );
  const unclaimedReferralMembers = getMembersByIds(state, unclaimedReferralIds);
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
