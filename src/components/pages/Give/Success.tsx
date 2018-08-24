import { Big } from "big.js";
import * as React from "react";
import { StyleSheet, View } from "react-native";

import { Member } from "../../../store/reducers/members";
import { Button, Text } from "../../shared/elements";
import { colors, palette } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";

type OwnProps = {
  toMember: Member;
  amount: Big;
  memo?: string;
  onResetCallback: () => void;
};

export const Success: React.StatelessComponent<OwnProps> = props => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        You sent{" "}
        <Text style={styles.amount}>{props.amount.toString()} Raha</Text> to{" "}
        <Text style={styles.name}>{props.toMember.get("fullName")}</Text> for{" "}
        <Text style={styles.memo}>
          "{props.memo ? `${props.memo}` : ""}
          ".
        </Text>
      </Text>
      <Button title="Give again" onPress={() => props.onResetCallback()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    margin: 12,
    color: colors.bodyText
  },
  memo: {
    color: palette.mediumGray,
    ...fonts.Lato.Italic
  },
  name: {
    ...fonts.Lato.Semibold
  },
  amount: {
    color: colors.currency.positive
  }
});
