import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, BackHandler } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import DropdownAlert from "react-native-dropdownalert";
import { NavigationScreenProps } from "react-navigation";
import { RNFirebase } from "react-native-firebase";

import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { VerifyName } from "./VerifyName";
import {
  getLoggedInFirebaseUser,
  getPrivateVideoInviteRef,
  getInviteVideoRef
} from "../../../store/selectors/authentication";
import { OnboardingCamera } from "./OnboardingCamera";
import { VideoPreview } from "../Camera/VideoPreview";
import { OnboardingCreateAccount } from "./OnboardingCreateAccount";
import { getMemberByUsername } from "../../../store/selectors/members";
import { Text } from "../../shared/elements";
import { LogIn } from "../LogIn";
import { RouteName } from "../../shared/Navigation";
import { Loading } from "../../shared/Loading";

/**
 * Parent component for Onboarding flow.
 */
enum OnboardingStep {
  SPLASH,
  VERIFY_NAME,

  CAMERA,
  VIDEO_PREVIEW,

  CREATE_ACCOUNT
}

interface OnboardingParams {
  t?: string; // video token
  r?: string; // referrer username
  j?: string; // isJointVideo
}

type ReduxStateProps = {
  displayName: string | null;
  videoUploadRef?: RNFirebase.storage.Reference;
  isLoggedIn: boolean;
  deeplinkVideoToken?: string;
  deeplinkInvitingMember?: Member;
  isJointVideo: boolean;
};

type OwnProps = NavigationScreenProps<OnboardingParams>;

type OnboardingProps = ReduxStateProps & OwnProps;

type OnboardingState = {
  step: OnboardingStep;
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
  deeplinkInitialized: boolean;

  constructor(props: OnboardingProps) {
    super(props);
    this.steps = [];
    this.deeplinkInitialized = false;
    this.state = {
      step: OnboardingStep.SPLASH
    };
  }

  /**
   * If deeplinking params are present, makes sure they are valid, and fills in
   * the associated video download url into state.
   */
  initializeDeeplinkingParams = async () => {
    const deeplinkProps = [
      this.props.deeplinkVideoToken,
      this.props.deeplinkInvitingMember
    ];
    const presentDeeplinkProps = deeplinkProps.filter(p => !!p);
    if (presentDeeplinkProps.length === 0) {
      return;
    }

    // must provide all deeplink props or none of them
    if (presentDeeplinkProps.length !== deeplinkProps.length) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Unable to process deeplink. Please try signing up directly from your phone."
      );
      return;
    }

    const videoDownloadUrl = await extractDeeplinkVideoUrl(
      this.props.deeplinkInvitingMember,
      this.props.deeplinkVideoToken
    );
    // videoDownloadUrl must be present if using deeplinking
    if (!videoDownloadUrl) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Invite video doesn't exist or has expired. Please try signing up directly from your phone."
      );
      return;
    }
    this.setState({
      videoDownloadUrl
    });
  };

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

    if (!this.deeplinkInitialized) {
      this.deeplinkInitialized = true;
      this.initializeDeeplinkingParams();
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
    if (!this.props.isLoggedIn) {
      this.props.navigation.navigate(RouteName.LogIn, {
        redirectTo: RouteName.Onboarding,
        loginMessage:
          "Welcome to Raha! Please sign up with your\nmobile number to accept your invite."
      });
      return <Loading />;
    }

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
              this.state.verifiedName
                ? this.state.verifiedName
                : this.props.displayName
                  ? this.props.displayName
                  : undefined
            }
            onVerifiedName={(verifiedName: string) => {
              this.setState({
                verifiedName: verifiedName,
                step:
                  this.props.isJointVideo && this.state.videoDownloadUrl
                    ? OnboardingStep.CREATE_ACCOUNT
                    : OnboardingStep.CAMERA
              });
            }}
            onBack={this._handleBackPress}
          />
        );
      }
      // Note, as we have currently defined the onboarding flow, you will not have to take
      // a video if you're being invited via a joint invitation video. In other words,
      // the people who must take a video during onboarding are those who have been invited
      // via the async process or who were not invited at all.
      case OnboardingStep.CAMERA: {
        // Shouldn't happen, but if any required field is cleared or the onboarding
        // flow is screwed up, redirect to the correct step.
        const verifiedFullName = this._verifyFullName();
        if (!verifiedFullName) {
          return <React.Fragment />;
        }
        return (
          <OnboardingCamera
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
                step: OnboardingStep.CREATE_ACCOUNT
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
            fullScreen
          />
        );
      }
      case OnboardingStep.CREATE_ACCOUNT: {
        const fullName = this._verifyFullName();
        const videoDownloadUrl = this._verifyVideoDownloadUrl();
        if (!fullName || !videoDownloadUrl) {
          return <React.Fragment />;
        }
        return (
          <OnboardingCreateAccount
            verifiedName={fullName}
            invitingMember={this.props.deeplinkInvitingMember}
            isJointVideo={this.props.isJointVideo}
            videoToken={this.props.deeplinkVideoToken}
          />
        );
      }

      default:
        console.error(
          `We've reached an unknown OnboardingStep: ${this.state.step}.`
        );
        return undefined;
    }
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
    flex: 1
  }
});

async function extractDeeplinkVideoUrl(
  invitingMember?: Member,
  videoToken?: string
): Promise<string | undefined> {
  if (!videoToken || !invitingMember) {
    return undefined;
  }
  return await getInviteVideoRef(videoToken).getDownloadURL();
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const firebaseUser = getLoggedInFirebaseUser(state);
  const deeplinkInviterUsername = ownProps.navigation.getParam("r");
  const deeplinkInvitingMember = deeplinkInviterUsername
    ? getMemberByUsername(state, deeplinkInviterUsername)
    : undefined;
  const deeplinkVideoToken = ownProps.navigation.getParam("t");
  const deeplinkIsJointVideo = ownProps.navigation.getParam("j");

  return {
    displayName: firebaseUser ? firebaseUser.displayName : null,
    videoUploadRef: getPrivateVideoInviteRef(state),
    isLoggedIn:
      state.authentication.isLoaded && state.authentication.isLoggedIn,
    deeplinkVideoToken,
    deeplinkInvitingMember,
    isJointVideo: !!deeplinkIsJointVideo
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
