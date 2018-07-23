/**
 * Visual display of a Mint operation in the ActivityFeed.
 */
import * as React from "react";
import { Big } from "big.js";

import {
  MintOperation,
  MintType
} from "@raha/api-shared/models/Operation";

import { ActivityTemplate, ActivityTemplateView } from "./ActivityTemplate";
import { MapStateToProps, connect } from "react-redux";
import { RahaState } from "../../../store";
import { Member } from "../../../store/reducers/members";
import {
  getMemberById,
  getMembersByIds
} from "../../../store/selectors/members";

type OwnProps = {
  operation: MintOperation;
  activityRef?: React.Ref<ActivityTemplateView>;
};
type StateProps = {
  fromMember: Member;
  referredMemberFullName?: string;
};
type MintOperationActivityProps = OwnProps & StateProps;

export const MintOperationActivityView: React.StatelessComponent<
  MintOperationActivityProps
> = ({ operation, fromMember, activityRef, referredMemberFullName }) => {
  let message;
  switch (operation.data.type) {
    case MintType.BASIC_INCOME:
      message = "I just minted some Raha.";
      break;
    case MintType.REFERRAL_BONUS:
      message = `I just minted some Raha for referring ${referredMemberFullName}.`;
      break;
    default:
      console.error(
        `This should never happen. mint type: ${(operation.data as any).type}`
      );
      return <React.Fragment />;
  }

  return (
    <ActivityTemplate
      message={message}
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
  const fromMember = getMemberById(state, ownProps.operation.creator_uid);
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
  if (ownProps.operation.data.type === MintType.REFERRAL_BONUS) {
    const referredMembers = getMembersByIds(state, [
      ownProps.operation.data.invited_member_id
    ]);
    const referredMember =
      referredMembers && referredMembers.length === 1
        ? referredMembers[0]
        : undefined;
    if (referredMember) {
      return {
        fromMember,
        referredMemberFullName: referredMember.fullName
      };
    }
  }
  return { fromMember };
};

export const MintOperationActivity = connect(mapStateToProps)(
  MintOperationActivityView
);
