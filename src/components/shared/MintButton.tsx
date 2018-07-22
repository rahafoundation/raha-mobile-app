import { Big } from "big.js";
import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";
import { MemberId } from "@raha/api/dist/shared/models/identifiers";

import { RahaState } from "../../store";
import { mintBasicIncome } from "../../store/actions/wallet";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { getMintableAmount } from "../../store/selectors/me";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";

import { Button } from "../shared/elements";

interface OwnProps {}
interface StateProps {
  loggedInMemberId?: MemberId;
  mintableAmount?: Big;
  mintApiCallStatus?: ApiCallStatus;
}
interface DispatchProps {
  mintBasicIncome: typeof mintBasicIncome;
}
interface MergedProps {
  mint: () => void;
}
type Props = OwnProps & StateProps & MergedProps;

const MintButtonComponent: React.StatelessComponent<Props> = props => {
  const { mintableAmount, mintApiCallStatus, mint } = props;
  const mintableAmountText = mintableAmount ? mintableAmount.toString() : "0";
  const buttonDisabled =
    (mintableAmount && mintableAmount.lte(0)) ||
    (mintApiCallStatus &&
      mintApiCallStatus.status === ApiCallStatusType.STARTED);
  const buttonText = `Mint${
    mintableAmount && mintableAmount.lte(0) ? "" : ` +ℝ${mintableAmountText}`
  }`;
  return <Button title={buttonText} onPress={mint} />;
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const loggedInMember = getLoggedInMember(state);
  if (loggedInMember) {
    return {
      loggedInMemberId: loggedInMember.memberId,
      mintableAmount: getMintableAmount(state, loggedInMember.memberId),
      mintApiCallStatus: getStatusOfApiCall(
        state,
        ApiEndpointName.MINT,
        loggedInMember.memberId
      )
    };
  }
  return {};
};

const mergeProps: MergeProps<
  StateProps,
  DispatchProps,
  OwnProps,
  MergedProps
> = (stateProps, dispatchProps, ownProps) => {
  const { loggedInMemberId, mintableAmount } = stateProps;
  return {
    ...stateProps,
    mint: () =>
      loggedInMemberId
        ? dispatchProps.mintBasicIncome(loggedInMemberId, mintableAmount)
        : {},
    ...ownProps
  };
};

export const MintButton = connect(
  mapStateToProps,
  { mintBasicIncome },
  mergeProps
)(MintButtonComponent);
