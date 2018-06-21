import { Big } from "big.js";
import * as React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

import { Member } from "../../../store/reducers/members";

type OwnProps = {
  toMember: Member;
  amount: Big;
  memo?: string;
  onResetCallback: () => void;
};

export const Success: React.StatelessComponent<OwnProps> = props => {
  return (
    <View style={styles.container}>
      <Text>
        You sent {props.amount.toString()} Raha to {props.toMember.fullName}
        {props.memo ? ` ${props.memo}` : ""}.
      </Text>
      <Button title="Give again" onPress={() => props.onResetCallback()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
