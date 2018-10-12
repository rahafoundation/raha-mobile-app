import { Big } from "big.js";
import * as React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { RahaState } from "../../store";
import { mintBasicIncome } from "../../store/actions/wallet";
import { getLoggedInMember } from "../../store/selectors/authentication";
import {
  getMintableAmount,
  RAHA_MINT_WEEKLY_RATE
} from "../../store/selectors/me";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";
import { Member } from "../../store/reducers/members";
import { Button, Text } from "./elements";
import { CurrencyRole, CurrencyType, CurrencyValue } from "./elements/Currency";
import { fontSizes } from "../../helpers/fonts";
import { MixedText } from "./elements/MixedText";
import { CreateRahaOperationButton } from "./elements/CreateRahaOperationButton";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

interface OwnProps {
  style?: StyleProp<ViewStyle>;
}

interface StateProps {
  loggedInMember?: Member;
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
  const { mintableAmount, mintApiCallStatus, mint, loggedInMember } = props;

  const mintInProgress =
    mintApiCallStatus && mintApiCallStatus.status === ApiCallStatusType.STARTED;
  const canMint =
    // member is logged in
    loggedInMember &&
    // member has been verified
    loggedInMember.get("isVerified") &&
    // member has raha to mint
    (mintableAmount && mintableAmount.gt(0)) &&
    // api call hasn't started or is failed
    !mintInProgress;

  const mintText = mintInProgress ? "Minting" : "Mint";

  const mintValue: CurrencyValue | undefined = mintableAmount
    ? {
        value: mintableAmount,
        role: CurrencyRole.None,
        currencyType: CurrencyType.Raha
      }
    : undefined;
  return (
    <View>
      <CreateRahaOperationButton
        operationType={OperationType.MINT}
        style={props.style}
        title={[mintText, ...(mintValue ? [mintValue] : [])]}
        onPress={mint}
        disabled={!canMint}
      />
      <Text style={{ marginTop: 4 }}>
        <MixedText
          style={[fontSizes.small, { textAlign: "center" }]}
          content={[
            "Current mint rate is",
            {
              currencyType: CurrencyType.Raha,
              value: new Big(RAHA_MINT_WEEKLY_RATE),
              role: CurrencyRole.Transaction
            },
            "per week."
          ]}
        />
      </Text>
    </View>
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
      loggedInMember: loggedInMember,
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
  const { loggedInMember, mintableAmount } = stateProps;
  return {
    ...stateProps,
    mint: () =>
      loggedInMember
        ? dispatchProps.mintBasicIncome(
            loggedInMember.get("memberId"),
            mintableAmount
          )
        : {},
    ...ownProps
  };
};

export const MintButton = connect(
  mapStateToProps,
  { mintBasicIncome },
  mergeProps
)(MintButtonComponent);
