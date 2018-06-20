import { Big } from "big.js";
import * as React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

import { Member } from "../../../store/reducers/members";

type OwnProps = {
  toMember: Member;
  amount: Big;
  memo?: string;
};

export const Success: React.StatelessComponent<OwnProps> = props => {
  return (
    <View style={styles.container}>
      <Text>
        You sent {props.amount} Raha to {props.toMember.fullName}
        {props.memo ? ` ${props.memo}` : ""}.
      </Text>
      {/* <Button title="Give again" onPress={() => null} /> */}
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
