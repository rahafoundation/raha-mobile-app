import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../shared/elements";
import { VideoWithPlaceholder } from "../../shared/VideoWithPlaceholder";

interface Props {
  onConfirm: () => void;
  onRetake: () => void;
  onBack: () => void;
  toVerifyMemberFullName: string;
  videoUri: string;
}

enum ConfirmSteps {
  VerifyIsTogether,
  Retake,
  ConfirmVideo
}

interface State {
  step: ConfirmSteps;
}

export class ConfirmExistingVerificationVideo extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { step: ConfirmSteps.VerifyIsTogether };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <VideoWithPlaceholder uri={this.props.videoUri} />
        {this.state.step === ConfirmSteps.VerifyIsTogether && (
          <React.Fragment>
            <Text style={styles.text}>
              Does the above video contain you inviting{" "}
              {this.props.toVerifyMemberFullName} to Raha?
            </Text>
            <View style={styles.actionRow}>
              <Button
                style={styles.button}
                title="No"
                onPress={() => this.setState({ step: ConfirmSteps.Retake })}
              />
              <Button
                style={styles.button}
                title="Yes"
                onPress={() =>
                  this.setState({ step: ConfirmSteps.ConfirmVideo })
                }
              />
            </View>
          </React.Fragment>
        )}
        {this.state.step === ConfirmSteps.Retake && (
          <React.Fragment>
            <Text>
              Please take a new video containing yourself where you verify{" "}
              {this.props.toVerifyMemberFullName}'s identity.
            </Text>
            <View style={styles.actionRow}>
              <Button
                style={styles.button}
                title="Okay"
                onPress={this.props.onRetake}
              />
            </View>
          </React.Fragment>
        )}
        {this.state.step === ConfirmSteps.ConfirmVideo && (
          <React.Fragment>
            <Text style={styles.text}>
              Would you like to use the above video to verify ${
                this.props.toVerifyMemberFullName
              }'s identity?
            </Text>
            <Text style={styles.text}>
              Verification helps other members know who to trust, and people
              must be verified before they can claim their basic income.
            </Text>
            <View style={styles.actionRow}>
              <Button
                style={styles.button}
                title="Retake"
                onPress={this.props.onRetake}
              />
              <Button
                style={styles.button}
                title="Yes"
                onPress={this.props.onConfirm}
              />
            </View>
          </React.Fragment>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  button: {
    margin: 12
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  }
});
