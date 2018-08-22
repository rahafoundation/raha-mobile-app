import * as React from "react";
import { View, StyleSheet } from "react-native";

import { Text, Button, Container } from "../../shared/elements";
import { VideoWithPlaceholder } from "../../shared/VideoWithPlaceholder";
import { getAuthRestrictedVideoRef } from "../../../store/selectors/authentication";
import { Loading } from "../../shared/Loading";

interface Props {
  onConfirm: () => void;
  onRetake: () => void;
  onBack: () => void;
  toVerifyMemberFullName: string;
  inviteVideoToken: string;
}

enum ConfirmSteps {
  VerifyIsTogether,
  Retake,
  ConfirmVideo
}

interface State {
  step: ConfirmSteps;
  videoUrl?: string;
}

export class ConfirmExistingVerificationVideo extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { step: ConfirmSteps.VerifyIsTogether };
    this.getVideoUrl();
  }

  async getVideoUrl() {
    const videoUrl = await getAuthRestrictedVideoRef(
      this.props.inviteVideoToken
    ).getDownloadURL();
    this.setState({
      videoUrl
    });
  }

  _renderVerifyStep() {
    switch (this.state.step) {
      case ConfirmSteps.VerifyIsTogether:
        return (
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
        );
      case ConfirmSteps.Retake:
        return (
          <React.Fragment>
            <Text style={styles.text}>
              Please take a new video containing yourself where you verify{" "}
              <Text style={styles.name}>
                {this.props.toVerifyMemberFullName}
              </Text>
              's identity.
            </Text>
            <View style={styles.actionRow}>
              <Button
                style={styles.button}
                title="Okay"
                onPress={this.props.onRetake}
              />
            </View>
          </React.Fragment>
        );
      case ConfirmSteps.ConfirmVideo:
        return (
          <React.Fragment>
            <Text style={styles.text}>
              Verification helps other members know who to trust, and every
              member must be verified before they can claim their basic income.
            </Text>
            <Text style={styles.text}>
              Would you like to use the above video to verify{" "}
              <Text style={styles.name}>
                {this.props.toVerifyMemberFullName}
              </Text>
              's identity?
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
        );
      default:
        console.error("Invalid step", this.state.step);
        return <React.Fragment />;
    }
  }

  render() {
    return (
      <Container style={styles.container}>
        <View style={styles.padding} />
        <Text style={styles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <View style={styles.video}>
          {this.state.videoUrl ? (
            <VideoWithPlaceholder uri={this.state.videoUrl} />
          ) : (
            <Loading />
          )}
        </View>
        {this._renderVerifyStep()}
        <View style={styles.padding} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  padding: {
    flexGrow: 1
  },
  video: {
    aspectRatio: 1,
    maxHeight: 250
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
  },
  name: {
    fontWeight: "bold"
  }
});
