/**
 * Raha actions are defined as those which result in an operation
 * being created in the Raha history.
 *
 * This button behaves like any other button except that it disables itself if
 * the member cannot perform the specified operation due to their current
 * verified status and flagged status.
 */

import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

import { ButtonProps, Button } from "./Button";
import { RahaState } from "../../../store";
import { getLoggedInMemberId } from "../../../store/selectors/authentication";
import { canCreateOperation } from "../../../store/selectors/abilities";

type OwnProps = ButtonProps & {
  operationType: OperationType;
};

interface StateProps {
  canCreateOperation: boolean;
}

type Props = OwnProps & StateProps;

const EnforcePermissionsButtonComponent: React.StatelessComponent<
  Props
> = props => {
  const disabled = props.disabled || !props.canCreateOperation;
  return <Button {...props} disabled={disabled} />;
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const loggedInMemberId = getLoggedInMemberId(state);
  return {
    canCreateOperation: canCreateOperation(
      state,
      ownProps.operationType,
      loggedInMemberId
    )
  };
};

export const EnforcePermissionsButton = connect(mapStateToProps)(
  EnforcePermissionsButtonComponent
);
