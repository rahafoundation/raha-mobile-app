import { Big } from "big.js";
import * as React from "react";
import { StyleSheet } from "react-native";

import { Member } from "../../../store/reducers/members";

import { Button } from "../../display/Button";
import { Container } from "../../display/Container";
import { Text } from "../../display/Text";

type OwnProps = {
  toMember: Member;
  amount: Big;
  memo?: string;
  onResetCallback: () => void;
};

export const Success: React.StatelessComponent<OwnProps> = props => {
  return (
    <Container style={styles.container}>
      <Text>
        You sent {props.amount.toString()} Raha to {props.toMember.fullName}
        {props.memo ? ` ${props.memo}` : ""}.
      </Text>
      <Button title="Give again" onPress={() => props.onResetCallback()} />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  }
});
