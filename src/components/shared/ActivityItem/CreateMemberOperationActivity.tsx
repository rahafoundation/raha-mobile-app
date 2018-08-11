/**
 * Visual display of a CreateMember operation in the ActivityFeed.
 */
import * as React from "react";

import { CreateMemberOperation } from "@raha/api-shared/dist/models/Operation";

import { ActivityTemplate, ActivityTemplateView } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import { getMemberById } from "../../../store/selectors/members";

type OwnProps = {
  operation: CreateMemberOperation;
  activityRef?: React.Ref<ActivityTemplateView>;
};
type StateProps = {
  createdMember: Member;
};
type CreateMemberOperationActivityProps = OwnProps & StateProps;

const CreateMemberOperationActivityView: React.StatelessComponent<
  CreateMemberOperationActivityProps
> = ({ operation, createdMember, activityRef }) => {
  return (
    <ActivityTemplate
      message={`${createdMember.get("fullName")} just joined Raha!`}
      from={createdMember}
      timestamp={new Date(operation.created_at)}
      videoUri={createdMember.videoUri}
      onRef={activityRef}
    />
  );
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const creatorId = ownProps.operation.creator_uid;
  const createdMember = getMemberById(state, creatorId);

  if (!createdMember) {
    // TODO: log the following properly, properly handle cases when members are
    // missing instead of throwing uncaught error
    throw new Error(
      `Member missing: ${JSON.stringify({
        fromMember: {
          id: ownProps.operation.creator_uid,
          memberDoc: createdMember
        }
      })}`
    );
  }
  return { createdMember };
};

export const CreateMemberOperationActivity = connect(mapStateToProps)(
  CreateMemberOperationActivityView
);
