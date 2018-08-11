/**
 * Visual display of a RequestVerification operation in the ActivityFeed.
 */
import * as React from "react";

import { RequestVerificationOperation } from "@raha/api-shared/dist/models/Operation";

import { ActivityTemplate, ActivityTemplateView } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member, GENESIS_MEMBER } from "../../../store/reducers/members";
import { getMemberById } from "../../../store/selectors/members";

type OwnProps = {
  operation: RequestVerificationOperation;
  activityRef?: React.Ref<ActivityTemplateView>;
};
type StateProps = {
  fromMember: Member;
  toMember: Member | typeof GENESIS_MEMBER;
};
type RequestVerificationOperationActivityProps = OwnProps & StateProps;

const RequestVerificationOperationActivityView: React.StatelessComponent<
  RequestVerificationOperationActivityProps
> = ({ operation, fromMember, toMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={`${fromMember.get(
        "fullName"
      )} requested that you verify their identity!`}
      from={fromMember}
      to={toMember === GENESIS_MEMBER ? undefined : toMember}
      timestamp={new Date(operation.created_at)}
      onRef={activityRef}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const requesterId = ownProps.operation.creator_uid;
  const requestedId = ownProps.operation.data.to_uid;
  const fromMember = getMemberById(state, requesterId);
  const toMember = requestedId
    ? getMemberById(state, requestedId)
    : GENESIS_MEMBER;

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

export const RequestVerificationOperationActivity = connect(mapStateToProps)(
  RequestVerificationOperationActivityView
);
