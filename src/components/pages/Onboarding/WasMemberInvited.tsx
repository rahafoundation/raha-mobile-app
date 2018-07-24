import * as React from "react";
import { View, StyleSheet } from "react-native";

import { Text, Button } from "../../shared/elements";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  verifiedFullName: string;
  onYes: () => any;
  onNo: () => any;
};

type WasMemberInvitedProps = OwnProps;

export class WasMemberInvited extends React.Component<WasMemberInvitedProps> {
  public render() {
    return (
      <View style={styles.container}>
        <Text>
          Were you, <Text>{this.props.verifiedFullName}</Text> invited by an
          existing and verified member of Raha?
        </Text>
        <Text>(Answer no if you are uncertain)</Text>
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
