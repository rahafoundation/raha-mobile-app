import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { Text, View, StyleSheet, BackHandler } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { OnboardingInvite } from "./OnboardingInvite";
import {
  getLoggedInFirebaseUser,
  getPrivateVideoInviteRef
} from "../../../store/selectors/authentication";
import DropdownAlert from "react-native-dropdownalert";
import { OnboardingCamera } from "./OnboardingCamera";
import { VideoPreview } from "../Camera/VideoPreview";

/**
 * Parent component for Onboarding flow.
 */

enum OnboardingStep {
  SPLASH,
  VERIFY_INVITE,
  CAMERA,
  VIDEO_PREVIEW,
  REQUEST_INVITE
}

type ReduxStateProps = {
  displayName: string | null;
  videoUploadRef?: firebase.storage.Reference;
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
  videoDownloadUrl?: string;
};

export class OnboardingView extends React.Component<
  OnboardingProps,
  OnboardingState
> {
  dropdown: any;

  state = {
    step: OnboardingStep.SPLASH,
    invitingMember: this.props.deeplinkInvitingMember,
    verifiedName: undefined,
    videoUri: undefined,
    videoDownloadUrl: undefined
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._handleBackPress);
  }

  _handleBackPress = () => {
    switch (this.state.step) {
      case OnboardingStep.VERIFY_INVITE: {
        this.setState({
          step: OnboardingStep.SPLASH
        });
        return true;
      }
      case OnboardingStep.CAMERA: {
        this.setState({
          step: OnboardingStep.VERIFY_INVITE
        });
        return true;
      }
      case OnboardingStep.VIDEO_PREVIEW: {
        this.setState({
          step: OnboardingStep.CAMERA
        });
        return true;
      }
      case OnboardingStep.REQUEST_INVITE: {
        this.setState({
          step: OnboardingStep.VIDEO_PREVIEW
        });
        return true;
      }
      case OnboardingStep.SPLASH:
      default:
        // Exit out of Onboarding flow.
        return false;
    }
  };

  _verifyFullName = () => {
    const verifiedFullName = this.state.verifiedName;
    if (!verifiedFullName) {
      this.dropdown.alertWithType(
        "error",
        "Error: Missing full name",
        "Need to verify full name before this step."
      );
      this.setState({
        step: OnboardingStep.VERIFY_INVITE
      });
    }
    return verifiedFullName;
  };

  _verifyInviter = () => {
    const invitingMemberName = this.state.invitingMember
      ? this.state.invitingMember.fullName
      : undefined;
    if (!invitingMemberName) {
      this.dropdown.alertWithType(
        "error",
        "Error: Missing inviter",
        "Need person to request invite from before this step."
      );
      this.setState({
        step: OnboardingStep.VERIFY_INVITE
      });
    }
    return invitingMemberName;
  };

  _verifyVideoUri = () => {
    const videoUri = this.state.videoUri;
    if (!videoUri) {
      this.dropdown.alertWithType(
        "error",
        "Error: Can't show video",
        "Invalid video. Please retake your video."
      );
      this.setState({
        step: OnboardingStep.CAMERA
      });
    }
    return videoUri;
  };

  _verifyVideoDownloadUrl = () => {
    const videoDownloadUrl = this.state.videoDownloadUrl;
    if (!videoDownloadUrl) {
      this.dropdown.alertWithType(
        "error",
        "Error: Could not upload video",
        "Invalid video. Please retry."
      );
      this.setState({
        step: OnboardingStep.VIDEO_PREVIEW
      });
    }
    return videoDownloadUrl;
  };

  _verifyVideoUploadRef = () => {
    const videoUploadRef = this.props.videoUploadRef;
    if (!videoUploadRef) {
      this.dropdown.alertWithType(
        "error",
        "Error: Upload",
        "Invalid video. Please retry."
      );
      this.setState({
        step: OnboardingStep.VIDEO_PREVIEW
      });
    }
    return videoUploadRef;
  };

  _renderOnboardingStep() {
    switch (this.state.step) {
      case OnboardingStep.SPLASH: {
        return (
          <OnboardingSplash
            onSplashCompleted={() => {
              this.setState({
                step: OnboardingStep.VERIFY_INVITE
              });
            }}
          />
        );
      }
      case OnboardingStep.VERIFY_INVITE: {
        return (
          <OnboardingInvite
            initialDisplayName={
              this.props.displayName ? this.props.displayName : undefined
            }
            onVerifiedNameAndInviter={(
              verifiedName: string,
              inviter: Member
            ) => {
              this.setState({
                verifiedName: verifiedName,
                invitingMember: inviter,
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      case OnboardingStep.CAMERA: {
        // Shouldn't happen, but if any required field is cleared or the onboarding
        // flow is screwed up, redirect to the correct step.
        const invitingMemberName = this._verifyFullName();
        const verifiedFullName = this._verifyInviter();
        if (!invitingMemberName || !verifiedFullName) {
          return <React.Fragment />;
        }
        return (
          <OnboardingCamera
            inviterFullName={invitingMemberName}
            verifiedFullName={verifiedFullName}
            onVideoRecorded={(videoUri: string) => {
              this.setState({
                videoUri: videoUri,
                step: OnboardingStep.VIDEO_PREVIEW
              });
            }}
          />
        );
      }
      case OnboardingStep.VIDEO_PREVIEW: {
        const videoUri = this._verifyVideoUri();
        const videoUploadRef = this._verifyVideoUploadRef();
        if (!videoUri || !videoUploadRef) {
          return <React.Fragment />;
        }
        return (
          <VideoPreview
            videoUri={videoUri}
            videoUploadRef={videoUploadRef}
            onVideoUploaded={(videoDownloadUrl: string) =>
              this.setState({
                videoDownloadUrl: videoDownloadUrl,
                step: OnboardingStep.CAMERA
              })
            }
            onRetakeClicked={() => {
              this.setState({ step: OnboardingStep.CAMERA });
            }}
            onVideoPlaybackError={(errorMessage: string) => {
              this.dropdown.alertWithType(
                "error",
                "Error: Video Playback",
                errorMessage
              );
              this.setState({
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
        {this._renderOnboardingStep()}
        <DropdownAlert ref={(ref: any) => (this.dropdown = ref)} />
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
  const firebaseUser = getLoggedInFirebaseUser(state);

  return {
    displayName: firebaseUser ? firebaseUser.displayName : null,
    videoUploadRef: getPrivateVideoInviteRef(state)
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
