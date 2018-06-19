/**
 * Renders the proper Activity for a given Operation.
 */

import * as React from "react";
import { View, StyleSheet } from "react-native";

import { OperationType, Operation } from "../../../store/reducers/operations";
import { GiveOperationActivity } from "./GiveOperationActivity";
import { MintOperationActivity } from "./MintOperationActivity";
import { RequestInviteOperationActivity } from "./RequestInviteOperationActivity";
import { TrustOperationActivity } from "./TrustOperationActivity";
import { ActivityTemplate } from "./ActivityTemplate";

type ActivityItemProps = {
  operation: Operation;
  // Used to get a handle to the underlying ActivityTemplate component this
  // outputs
  activityRef?: React.Ref<ActivityTemplate>;
};

export const ActivityItem: React.StatelessComponent<ActivityItemProps> = ({
  operation,
  activityRef
}) => {
  switch (operation.op_code) {
    case OperationType.GIVE:
      return (
        <GiveOperationActivity
          operation={operation}
          activityRef={activityRef}
        />
      );
    case OperationType.MINT:
      return (
        <MintOperationActivity
          operation={operation}
          activityRef={activityRef}
        />
      );
    case OperationType.REQUEST_INVITE:
      return (
        <RequestInviteOperationActivity
          operation={operation}
          activityRef={activityRef}
        />
      );
    case OperationType.TRUST:
      return (
        <TrustOperationActivity
          operation={operation}
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
            (operation as Operation).op_code
          }". Operation: ${JSON.stringify(operation)}`
        )
      );
      return <View />;
  }
};