/**
 * Visual display of a Give operation in the ActivityFeed.
 */
import * as React from "react";
import { Big } from "big.js";

import { GiveOperation } from "@raha/api-shared/dist/models/Operation";

import { ActivityTemplate, ActivityTemplateView } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../../store";
import { Member } from "../../../../store/reducers/members";
import { getMemberById } from "../../../../store/selectors/members";

type OwnProps = {
  operation: GiveOperation;
  activityRef?: React.Ref<ActivityTemplateView>;
};
type StateProps = {
  toMember: Member;
  fromMember: Member;
};
type GiveActivityProps = OwnProps & StateProps;

const GiveActivityView: React.StatelessComponent<GiveActivityProps> = ({
  operation,
  fromMember,
  toMember,
  activityRef
}) => {
  return (
    <ActivityTemplate
      message={`I just gave you Raha for: ${operation.data.memo} `}
      from={fromMember}
      to={toMember}
      timestamp={new Date(operation.created_at)}
      amount={new Big(operation.data.amount)}
      donationAmount={new Big(operation.data.donation_amount)}
      onRef={activityRef}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const [fromMember, toMember] = [
    getMemberById(state, ownProps.operation.creator_uid),
    getMemberById(state, ownProps.operation.data.to_uid)
  ];
  if (!fromMember || !toMember) {
    // TODO: log the following properly, properly handle cases when members are
    // missing instead of throwing uncaught error
    throw new Error(
      `Member missing: ${JSON.stringify({
        fromMember: {
          id: ownProps.operation.creator_uid,
          memberDoc: fromMember
        },
        toMember: { id: ownProps.operation.data.to_uid, memberDoc: toMember }
      })}`
    );
  }
  return { fromMember, toMember };
};

export const GiveActivity = connect(mapStateToProps)(GiveActivityView);
