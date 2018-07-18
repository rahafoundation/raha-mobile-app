/**
 * Visual display of a Trust operation in the ActivityFeed.
 */
import * as React from "react";

import { TrustOperation } from "@raha/api/dist/shared/models/Operation";

import { ActivityTemplate, ActivityTemplateView } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMemberById } from "../../../store/selectors/members";

type OwnProps = {
  operation: TrustOperation;
  activityRef?: React.Ref<ActivityTemplateView>;
};
type StateProps = {
  fromMember: Member;
  toMember: Member;
};
type TrustOperationActivityProps = OwnProps & StateProps;

export const TrustOperationActivityView: React.StatelessComponent<
  TrustOperationActivityProps
> = ({ operation, fromMember, toMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={"I have trusted you."}
      from={fromMember}
      to={toMember}
      timestamp={new Date(operation.created_at)}
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

export const TrustOperationActivity = connect(mapStateToProps)(
  TrustOperationActivityView
);
