import * as React from "react";
import { View, StyleSheet } from "react-native";

import { Text, Button } from "../../shared/elements";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  verifiedFullName: string;
  inviterFullName: string;
  onYes: () => any;
  onNo: () => any;
};

type SpecifyJointVideoProps = OwnProps;

export class SpecifyJointVideo extends React.Component<SpecifyJointVideoProps> {
  public render() {
    return (
      <View style={styles.container}>
        <Text>
          Are you, <Text>{this.props.verifiedFullName}</Text> and your inviter,{" "}
          <Text>{this.props.inviterFullName}</Text> taking a joint video to
          verify your identity?
        </Text>
        <View>
          <Button
            title="Yes"
            onPress={() => {
              this.props.onYes();
            }}
          />
          <Button
            title="No"
            onPress={() => {
              this.props.onNo();
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center"
  }
});
