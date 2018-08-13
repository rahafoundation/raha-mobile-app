/**
 * Renders the proper Activity for a given Operation.
 */

import * as React from "react";
import { View } from "react-native";

import {
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";

import { GiveOperationActivity } from "./GiveOperationActivity";
import { MintOperationActivity } from "./MintOperationActivity";
import { RequestInviteOperationActivity } from "./RequestInviteOperationActivity";
import { TrustOperationActivity } from "./TrustOperationActivity";
import { ActivityTemplateView } from "./ActivityTemplate";
import { CreateMemberOperationActivity } from "./CreateMemberOperationActivity";
import { VerifyOperationActivity } from "./VerifyOperationActivity";
import { RequestVerificationOperationActivity } from "./RequestVerificationOperationActivity";
import { Activity } from "..";

type ActivityItemProps = {
  activity: Activity;
  // Used to get a handle to the underlying ActivityTemplate component this
  // outputs
  activityRef?: React.Ref<ActivityTemplateView>;
};

export const ActivityItem: React.StatelessComponent<ActivityItemProps> = ({
  activity,
  activityRef
}) => {
  switch (activity.op_code) {
    case OperationType.CREATE_MEMBER:
      return (
        <CreateMemberOperationActivity
          operation={activity}
          activityRef={activityRef}
        />
      );
    case OperationType.REQUEST_VERIFICATION:
      return (
        <RequestVerificationOperationActivity
          operation={activity}
          activityRef={activityRef}
        />
      );
    case OperationType.VERIFY:
      return (
        <VerifyOperationActivity
          operation={activity}
          activityRef={activityRef}
        />
      );
    case OperationType.GIVE:
      return (
        <GiveOperationActivity operation={activity} activityRef={activityRef} />
      );
    case OperationType.MINT:
      return (
        <MintOperationActivity operation={activity} activityRef={activityRef} />
      );
    case OperationType.REQUEST_INVITE:
      return (
        <RequestInviteOperationActivity
          operation={activity}
          activityRef={activityRef}
        />
      );
    case OperationType.TRUST:
      return (
        <TrustOperationActivity
          operation={activity}
          activityRef={activityRef}
        />
      );
    default:
      // Shouldn't happen. Type assertion is because TypeScript also thinks this
      // should never happen.
      // TODO: ensure this error gets sent somewhere
      console.error(
        new Error(
          `Invalid operation: Unrecognized opcode "${
            (activity as Operation).op_code
          }". Operation: ${JSON.stringify(activity)}`
        )
      );
      return <View />;
  }
};
