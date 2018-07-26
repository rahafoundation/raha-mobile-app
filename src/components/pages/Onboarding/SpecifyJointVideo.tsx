import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

import { Text, Button } from "../../shared/elements";
import { colors } from "../../../helpers/colors";

/**
 * Page that confirms who the user is trying to get an invite from and their full name.
 */

type OwnProps = {
  verifiedFullName: string;
  inviterFullName: string;
  onYes: () => any;
  onNo: () => any;
  onBack: () => any;
};

type SpecifyJointVideoProps = OwnProps;

export class SpecifyJointVideo extends React.Component<SpecifyJointVideoProps> {
  public render() {
    return (
      <View style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.card}>
          <Text style={{ fontSize: 18 }}>
            Are you,{" "}
            <Text style={{ fontWeight: "bold" }}>
              {this.props.verifiedFullName}
            </Text>, and your inviter,{" "}
            <Text style={{ fontWeight: "bold" }}>
              {this.props.inviterFullName}
            </Text>, taking a joint video to verify your identity?
          </Text>
          <View>
            <Button
              title="Yes"
              onPress={() => {
                this.props.onYes();
              }}
              style={styles.button}
            />
            <Button
              title="No"
              onPress={() => {
                this.props.onNo();
              }}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  },
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: colors.lightBackground,
    width: Dimensions.get("window").width - 24,
    padding: 12,
    borderRadius: 12
  },
  button: {
    marginTop: 6
  }
});
