import { Big } from "big.js";
import * as React from "react";
import { StyleProp, ViewStyle, View } from "react-native";

import { Text } from "./elements";
import { CurrencyRole, CurrencyType, CurrencyValue } from "./elements/Currency";
import { fontSizes } from "../../helpers/fonts";
import { MixedText } from "./elements/MixedText";
import { EnforcePermissionsButton } from "./elements/EnforcePermissionsButton";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { Config } from "@raha/api-shared/dist/helpers/Config";

type Props = {
  mintInProgress: boolean;
  displayAmount: Big;
  mintableInvitedBonus?: Big;
  style?: StyleProp<ViewStyle>;
  mint: () => void;
};

export const MintButton: React.StatelessComponent<Props> = props => {
  const { mintInProgress, displayAmount, mintableInvitedBonus, mint } = props;

  const mintText = mintInProgress ? "Minting" : "Mint";

  const mintValue: CurrencyValue | undefined = displayAmount.gt(0)
    ? {
        value: displayAmount,
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
        disabled={mintInProgress}
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
            "You can have at most",
            {
              currencyType: CurrencyType.Raha,
              value: Config.MINT_CAP,
              role: CurrencyRole.None
            },
            "of pending basic income."
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
