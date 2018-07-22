import { Big } from "big.js";
import * as React from "react";
import { StyleSheet } from "react-native";

import { Member } from "../../../store/reducers/members";
import { Button, Container, Text } from "../../shared/elements";
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
    <Container style={styles.container}>
      <Text style={styles.message}>
        You sent{" "}
        <Text style={styles.amount}>{props.amount.toString()} Raha</Text> to{" "}
        <Text style={styles.name}>{props.toMember.fullName}</Text> for{" "}
        <Text style={styles.memo}>"{props.memo ? `${props.memo}` : ""}".</Text>
      </Text>
      <Button title="Give again" onPress={() => props.onResetCallback()} />
    </Container>
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
    ...fonts.OpenSans.Italic
  },
  name: {
    ...fonts.Vollkorn.SemiBold
  },
  amount: {
    color: colors.positive
  }
});
