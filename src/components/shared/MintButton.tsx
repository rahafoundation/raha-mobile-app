import { Big } from "big.js";
import * as React from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { connect, MapStateToProps, MergeProps } from "react-redux";

import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { RahaState } from "../../store";
import { getLoggedInMember } from "../../store/selectors/authentication";
import {
  getMintableBasicIncomeAmount,
  getInvitedBonusMintableAmount
} from "../../store/selectors/me";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../store/selectors/apiCalls";
import { Member } from "../../store/reducers/members";
import { Text } from "./elements";
import { CurrencyRole, CurrencyType, CurrencyValue } from "./elements/Currency";
import { fontSizes } from "../../helpers/fonts";
import { MixedText } from "./elements/MixedText";
import { EnforcePermissionsButton } from "./elements/EnforcePermissionsButton";
import {
  OperationType,
  MintType
} from "@raha/api-shared/dist/models/Operation";
import { MintArgs } from "@raha/api/dist/me/mint";
import { mint } from "../../store/actions/wallet";
import { Config } from "@raha/api-shared/dist/helpers/Config";

interface OwnProps {
  style?: StyleProp<ViewStyle>;
}

interface StateProps {
  loggedInMember?: Member;
  mintableBasicIncome?: Big;
  mintableInvitedBonus?: Big;
  mintApiCallStatus?: ApiCallStatus;
}
interface DispatchProps {
  mint: typeof mint;
}
interface MergedProps {
  mint: () => void;
}
type Props = OwnProps & StateProps & MergedProps;

const MintButtonComponent: React.StatelessComponent<Props> = props => {
  const {
    mintableBasicIncome,
    mintableInvitedBonus,
    mintApiCallStatus,
    mint,
    loggedInMember
  } = props;

  var mintableAmount = Big(0);
  if (mintableBasicIncome) {
    mintableAmount = mintableAmount.plus(mintableBasicIncome);
  }
  if (mintableInvitedBonus) {
    mintableAmount = mintableAmount.plus(mintableInvitedBonus);
  }

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
      <EnforcePermissionsButton
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
              value: Config.UBI_WEEKLY_RATE,
              role: CurrencyRole.Transaction
            },
            "per week."
          ]}
        />
      </Text>
      <Text>
        <MixedText
          style={[fontSizes.small, { textAlign: "center" }]}
          content={[
            "You can only accumulate up to",
            {
              currencyType: CurrencyType.Raha,
              value: Config.MINT_CAP,
              role: CurrencyRole.None
            },
            "in basic income at a time."
          ]}
        />
      </Text>
      {mintableInvitedBonus && mintableInvitedBonus.gt(0) && (
        <Text>
          <MixedText
            style={[fontSizes.small, { textAlign: "center" }]}
            content={[
              "You have a bonus of",
              {
                currencyType: CurrencyType.Raha,
                value: mintableInvitedBonus,
                role: CurrencyRole.None
              },
              "for being invited!"
            ]}
          />
        </Text>
      )}
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
      mintableBasicIncome: getMintableBasicIncomeAmount(
        state,
        loggedInMember.get("memberId")
      ),
      mintableInvitedBonus: getInvitedBonusMintableAmount(
        state,
        loggedInMember
      ),
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
  const {
    loggedInMember,
    mintableBasicIncome,
    mintableInvitedBonus
  } = stateProps;
  var mintActions = [] as MintArgs[];
  if (mintableBasicIncome && mintableBasicIncome.gt(0)) {
    mintActions = mintActions.concat({
      type: MintType.BASIC_INCOME,
      amount: mintableBasicIncome
    });
  }

  if (mintableInvitedBonus && mintableInvitedBonus.gt(0)) {
    mintActions = mintActions.concat({
      type: MintType.INVITED_BONUS,
      amount: mintableInvitedBonus
    });
  }

  return {
    ...stateProps,
    mint: () =>
      loggedInMember
        ? dispatchProps.mint(loggedInMember.get("memberId"), mintActions)
        : {},
    ...ownProps
  };
};

export const MintButton = connect(
  mapStateToProps,
  { mint },
  mergeProps
)(MintButtonComponent);
