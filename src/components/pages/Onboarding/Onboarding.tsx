import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, BackHandler } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { SelectInviter } from "./SelectInviter";
import { VerifyName } from "./VerifyName";
import {
  getLoggedInFirebaseUser,
  getPrivateVideoInviteRef,
  getInviteVideoRef
} from "../../../store/selectors/authentication";
import DropdownAlert from "react-native-dropdownalert";
import { OnboardingCamera } from "./OnboardingCamera";
import { VideoPreview } from "../Camera/VideoPreview";
import { OnboardingRequestInvite } from "./OnboardingRequestInvite";
import { NavigationScreenProps } from "react-navigation";
import { getMemberByUsername } from "../../../store/selectors/members";

/**
 * Parent component for Onboarding flow.
 */

enum OnboardingStep {
  SPLASH,
  SELECT_INVITER,
  VERIFY_NAME,
  CAMERA,
  VIDEO_PREVIEW,
  REQUEST_INVITE
}

interface OnboardingParams {
  videoToken?: string;
  inviterUsername?: string;
}

type ReduxStateProps = {
  displayName: string | null;
  videoUploadRef?: firebase.storage.Reference;
  deeplinkInvitingMember?: Member;
  deeplinkVideoDownloadUrl?: string;
};

type OwnProps = NavigationScreenProps<OnboardingParams>;

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
  steps: OnboardingStep[];

  constructor(props: OnboardingProps) {
    super(props);
    this.steps = [];
    this.state = {
      step: OnboardingStep.SPLASH,
      invitingMember: this.props.deeplinkInvitingMember,
      videoDownloadUrl: this.props.deeplinkVideoDownloadUrl
    };
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentDidUpdate(prevProps: OnboardingProps, prevState: OnboardingState) {
    // Track forward changes in steps so we can handle backpresses.
    if (prevState && this.state.step > prevState.step) {
      this.steps.push(prevState.step);
    }
  }

  _handleBackPress = () => {
    const previousStep = this.steps.pop();
    if (previousStep === undefined) {
      // Exit out of Onboarding flow.
      return false;
    } else {
      this.setState({
        step: previousStep
      });
      return true;
    }
  };

  _checkValidDeeplink = () => {
    const inviterUsername = this.props.navigation.getParam("inviterUsername");
    if (inviterUsername && !this.props.deeplinkInvitingMember) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Invalid inviter in deeplink"
      );
      return;
    }

    const videoToken = this.props.navigation.getParam("videoToken");
    if (videoToken && !this.props.deeplinkVideoDownloadUrl) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Invalid video token in deeplink"
      );
      return;
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
        step: OnboardingStep.VERIFY_NAME
      });
    }
    return verifiedFullName;
  };

  _verifyInviter = () => {
    const invitingMember = this.state.invitingMember
      ? this.state.invitingMember
      : undefined;
    if (!invitingMember) {
      this.dropdown.alertWithType(
        "error",
        "Error: Missing inviter",
        "Need person to request invite from before this step."
      );
      this.setState({
        step: OnboardingStep.SELECT_INVITER
      });
    }
    return invitingMember;
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
        "Invalid video storage. Please retry."
      );
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
                step: this.props.deeplinkInvitingMember
                  ? OnboardingStep.VERIFY_NAME
                  : OnboardingStep.SELECT_INVITER
              });
            }}
          />
        );
      }
      case OnboardingStep.SELECT_INVITER: {
        return (
          <SelectInviter
            onSelectedInviter={(inviter: Member) => {
              this.setState({
                invitingMember: inviter,
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
            onVerifiedName={(verifiedName: string) => {
              this.setState({
                verifiedName: verifiedName,
                step: this.props.deeplinkVideoDownloadUrl
                  ? OnboardingStep.REQUEST_INVITE
                  : OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      case OnboardingStep.CAMERA: {
        // Shouldn't happen, but if any required field is cleared or the onboarding
        // flow is screwed up, redirect to the correct step.
        const verifiedFullName = this._verifyFullName();
        const inviter = this._verifyInviter();
        if (!inviter || !verifiedFullName) {
          return <React.Fragment />;
        }
        return (
          <OnboardingCamera
            inviterFullName={inviter.fullName}
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
                step: OnboardingStep.VERIFY_NAME
              })
            }
            onRetakeClicked={() => {
              this.setState({ step: OnboardingStep.CAMERA });
            }}
            onError={(errorType: string, errorMessage: string) => {
              this.dropdown.alertWithType("error", errorType, errorMessage);
              this.setState({
                step: OnboardingStep.CAMERA
              });
            }}
          />
        );
      }
      case OnboardingStep.REQUEST_INVITE: {
        const fullName = this._verifyFullName();
        const invitingMember = this._verifyInviter();
        const videoDownloadUrl = this._verifyVideoDownloadUrl();
        if (!invitingMember || !fullName || !videoDownloadUrl) {
          return <React.Fragment />;
        }
        return (
          <OnboardingRequestInvite
            verifiedName={fullName}
            invitingMember={invitingMember}
            videoDownloadUrl={videoDownloadUrl}
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

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const firebaseUser = getLoggedInFirebaseUser(state);
  const inviterUsername = ownProps.navigation.getParam("inviterUsername");
  const invitingMember = inviterUsername
    ? getMemberByUsername(state, inviterUsername)
    : undefined;
  const videoToken = ownProps.navigation.getParam("videoToken");
  const videoDownloadUrl = videoToken
    ? getInviteVideoRef(videoToken).toString()
    : undefined;
  return {
    displayName: firebaseUser ? firebaseUser.displayName : null,
    videoUploadRef: getPrivateVideoInviteRef(state),
    deeplinkInvitingMember: invitingMember,
    deeplinkVideoDownloadUrl: videoDownloadUrl
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
