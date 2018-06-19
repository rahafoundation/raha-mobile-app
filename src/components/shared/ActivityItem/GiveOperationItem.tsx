import * as React from "react";
import { Big } from "big.js";

import { GiveOperation } from "../../../store/reducers/operations";
import { ActivityTemplate } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMembersByIds } from "../../../store/selectors/members";

type OwnProps = {
  operation: GiveOperation;
  activityRef?: React.Ref<ActivityTemplate>;
};
type StateProps = {
  toMember: Member;
  fromMember: Member;
};
type GiveOperationItemProps = OwnProps & StateProps;

export const GiveOperationItemView: React.StatelessComponent<
  GiveOperationItemProps
> = ({ operation, fromMember, toMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={`I just gave you Raha for: ${operation.data.memo} `}
      from={fromMember}
      to={toMember}
      timestamp={new Date(operation.created_at)}
      amount={new Big(operation.data.amount)}
      donationAmount={new Big(operation.data.donation_amount)}
      ref={activityRef}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const [fromMember, toMember] = [
    getMembersByIds(state, [ownProps.operation.creator_uid])[0],
    getMembersByIds(state, [ownProps.operation.data.to_uid])[0]
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

export const GiveOperationItem = connect(mapStateToProps)(
  GiveOperationItemView
);
