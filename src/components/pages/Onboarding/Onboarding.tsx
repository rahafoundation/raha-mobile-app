import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { Text, View, StyleSheet } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { VerifyName } from "./VerifyName";
import { ChooseInviter } from "./ChooseInviter";
import { OnboardingCamera } from "./OnboardingCamera";
import { VideoPreview } from "./VideoPreview";

/**
 * Parent component for Onboarding flow.
 */

enum OnboardingStep {
  SPLASH,
  CHOOSE_INVITER,
  VERIFY_NAME,
  CAMERA,
  VIDEO_PREVIEW,
  REQUEST_INVITE
}

type ReduxStateProps = {
  displayName: string | null;
};

type OwnProps = {
  deeplinkInvitingMember?: Member;
  navigation: any;
};

type OnboardingProps = ReduxStateProps & OwnProps;

type OnboardingState = {
  step: OnboardingStep;
  invitingMember?: Member;
  verifiedName?: string;
  videoUri?: string;
  errorMessage?: string;
};

export class OnboardingView extends React.Component<
  OnboardingProps,
  OnboardingState
> {
  state = {
    step: OnboardingStep.SPLASH,
    invitingMember: this.props.deeplinkInvitingMember,
    verifiedName: undefined,
    videoUri: undefined,
    errorMessage: undefined
  };

  renderOnboardingStep() {
    switch (this.state.step) {
      case OnboardingStep.SPLASH: {
        return (
          <OnboardingSplash
            onSplashCompleted={() => {
              this.setState({
                step: OnboardingStep.VERIFY_NAME
              });
            }}
          />
        );
      }
      case OnboardingStep.VERIFY_NAME: {
        return (
          <VerifyName
            initialDisplayName={
              this.props.displayName ? this.props.displayName : undefined
            }
            onVerifiedName={name => {
              this.setState({
                verifiedName: name,
                step: OnboardingStep.CHOOSE_INVITER
              });
            }}
          />
        );
      }
      case OnboardingStep.CHOOSE_INVITER: {
        return (
          <ChooseInviter
            onInviterSelected={member => {
              this.setState({
                invitingMember: member,
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      case OnboardingStep.CAMERA: {
        // Shouldn't happen, but if any required field is cleared or the onboarding
        // flow is screwed up, redirect to the correct step.
        const verifiedFullName = this.state.verifiedName;
        if (!verifiedFullName) {
          this.setState({
            errorMessage: "Need a verified name.",
            step: OnboardingStep.VERIFY_NAME
          });
          break;
        }
        const invitingMemberName = this.state.invitingMember
          ? this.state.invitingMember.fullName
          : undefined;
        if (!invitingMemberName) {
          this.setState({
            errorMessage: "Need to choose an inviter.",
            step: OnboardingStep.CHOOSE_INVITER
          });
          break;
        }

        return (
          <OnboardingCamera
            inviterFullName={invitingMemberName}
            verifiedFullName={verifiedFullName}
            onVideoRecorded={videoUri => {
              this.setState({
                videoUri: videoUri,
                step: OnboardingStep.VIDEO_PREVIEW
              });
            }}
          />
        );
      }
      case OnboardingStep.VIDEO_PREVIEW: {
        const videoUri = this.state.videoUri;
        if (!videoUri) {
          this.setState({
            errorMessage: "Invalid video. Please try again.",
            step: OnboardingStep.CAMERA
          });
          break;
        }
        return (
          <VideoPreview
            videoUri={videoUri}
            retakeVideo={(errorMessage?: string) => {
              this.setState({
                errorMessage: errorMessage,
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      default:
    }
    return undefined;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.errorMessage && <Text>{this.state.errorMessage}</Text>}
        {this.renderOnboardingStep()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddd"
  }
});

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    displayName: firebaseUser ? firebaseUser.displayName : null
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
