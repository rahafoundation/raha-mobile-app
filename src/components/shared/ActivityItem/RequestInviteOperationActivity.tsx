/**
 * Visual display of a RequestInvite operation in the ActivityFeed.
 */
import * as React from "react";

import { RequestInviteOperation } from "../../../store/reducers/operations";
import { ActivityTemplate } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMembersByIds } from "../../../store/selectors/members";

type OwnProps = {
  operation: RequestInviteOperation;
  activityRef?: React.Ref<ActivityTemplate>;
};
type StateProps = {
  fromMember: Member;
  toMember: Member;
};
type RequestInviteOperationActivityProps = OwnProps & StateProps;

export const RequestInviteOperationActivityView: React.StatelessComponent<
  RequestInviteOperationActivityProps
> = ({ operation, fromMember, toMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={`Your friend just joined Raha!`}
      from={fromMember}
      to={toMember}
      timestamp={new Date(operation.created_at)}
      videoUri={fromMember.videoUri}
      onRef={activityRef}
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

export const RequestInviteOperationActivity = connect(mapStateToProps)(
  RequestInviteOperationActivityView
);
