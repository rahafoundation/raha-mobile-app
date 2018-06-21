/**
 * Visual display of a Mint operation in the ActivityFeed.
 */
import * as React from "react";
import { Big } from "big.js";

import { MintOperation } from "../../../store/reducers/operations";
import { ActivityTemplate } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMembersByIds } from "../../../store/selectors/members";

type OwnProps = {
  operation: MintOperation;
  activityRef?: React.Ref<ActivityTemplate>;
};
type StateProps = {
  fromMember: Member;
};
type MintOperationActivityProps = OwnProps & StateProps;

export const MintOperationActivityView: React.StatelessComponent<
  MintOperationActivityProps
> = ({ operation, fromMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={"I just minted some Raha."}
      from={fromMember}
      timestamp={new Date(operation.created_at)}
      amount={new Big(operation.data.amount)}
      onRef={activityRef}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const fromMember = getMembersByIds(state, [
    ownProps.operation.creator_uid
  ])[0];
  if (!fromMember) {
    // TODO: log the following properly, properly handle cases when members are
    // missing instead of throwing uncaught error
    throw new Error(
      `Member missing: ${JSON.stringify({
        id: ownProps.operation.creator_uid,
        memberDoc: fromMember
      })}`
    );
  }
  return { fromMember };
};

export const MintOperationActivity = connect(mapStateToProps)(
  MintOperationActivityView
);
