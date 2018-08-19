import { Big } from "big.js";
import * as React from "react";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../../store";
import { mintBasicIncome } from "../../store/actions/wallet";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { getMintableAmount } from "../../store/selectors/me";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";

import { Button } from "./elements";
import { CurrencyRole, CurrencyType, CurrencyValue } from "./elements/Currency";

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
  const buttonDisabled =
    (mintableAmount && mintableAmount.lte(0)) ||
    (mintApiCallStatus &&
      mintApiCallStatus.status === ApiCallStatusType.STARTED);
  const mintValue: CurrencyValue | undefined = mintableAmount
    ? {
        value: mintableAmount,
        role: CurrencyRole.None,
        currencyType: CurrencyType.Raha
      }
    : undefined;
  return (
    <Button
      title={["Mint", ...(mintValue ? [mintValue] : [])]}
      onPress={mint}
      disabled={buttonDisabled}
    />
  );
};

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (loggedInMember) {
    return {
      loggedInMemberId: loggedInMember.get("memberId"),
      mintableAmount: getMintableAmount(state, loggedInMember.get("memberId")),
      mintApiCallStatus: getStatusOfApiCall(
        state,
        ApiEndpointName.MINT,
        loggedInMember.get("memberId")
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
