/**
 * Raha actions are defined as those which result in an operation
 * being created in the Raha history.
 *
 * This button behaves like any other button except that it disables itself if
 * the member cannot perform the specified operation due to their current
 * verified status and flagged status.
 */

import * as React from "react";
import { ButtonProps, Button } from "./Button";
import { connect, MapStateToProps } from "react-redux";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { canCreateOperation } from "../../../store/selectors/me";

type OwnProps = ButtonProps & {
  operationType: OperationType;
};

interface StateProps {
  canCreateOperation: boolean;
}

type Props = OwnProps & StateProps;

const CreateRahaOperationButtonComponent: React.StatelessComponent<
  Props
> = props => {
  const disabled = props.disabled || !props.canCreateOperation;
  return <Button {...props} disabled={disabled} />;
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const loggedInMember = getLoggedInMember(state);
  const loggedInMemberId = loggedInMember
    ? loggedInMember.get("memberId")
    : undefined;
  return {
    loggedInMemberId,
    canCreateOperation: canCreateOperation(
      state,
      ownProps.operationType,
      loggedInMemberId
    )
  };
};

export const CreateRahaOperationButton = connect(mapStateToProps)(
  CreateRahaOperationButtonComponent
);
