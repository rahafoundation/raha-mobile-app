import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, StyleSheet, BackHandler } from "react-native";
import { connect, MapStateToProps } from "react-redux";
import DropdownAlert from "react-native-dropdownalert";
import { NavigationScreenProps } from "react-navigation";

import { RahaState } from "../../../store";
import { OnboardingSplash } from "./OnboardingSplash";
import { VerifyName } from "./VerifyName";
import {
  getLoggedInFirebaseUser,
  getAuthRestrictedVideoRef,
  getAuthRestrictedVideoThumbnailRef
} from "../../../store/selectors/authentication";
import { OnboardingCamera } from "./OnboardingCamera";
import { VideoUploader } from "../../shared/VideoUploader";
import { OnboardingCreateAccount } from "./OnboardingCreateAccount";
import { getMemberById } from "../../../store/selectors/members";
import { RouteName } from "../../shared/Navigation";
import { Loading } from "../../shared/Loading";
import { generateToken } from "../../../helpers/token";
import { IndependentPageContainer } from "../../shared/elements";
import { InputEmail } from "./InputEmail";

/**
 * Parent component for Onboarding flow.
 */
enum OnboardingStep {
  SPLASH,
  VERIFY_NAME,
  INPUT_EMAIL,

  CAMERA,
  VIDEO_PREVIEW,

  CREATE_ACCOUNT
}

interface OnboardingParams {
  t?: string; // invite token
}

type ReduxStateProps = {
  displayName: string | null;
  isLoggedIn: boolean;

  inviteToken?: string;
  inviteVideoToken?: string;
  invitingMember?: Member;
  inviteVideoIsJoint?: boolean;
  hasValidInviteToken: boolean;
};

type OwnProps = NavigationScreenProps<OnboardingParams>;

type OnboardingProps = ReduxStateProps & OwnProps;

type OnboardingState = {
  step: OnboardingStep;
  verifiedName?: string;
  emailAddress?: string;
  inviteVideoIsValid?: boolean;
  videoDownloadUrl?: string;
  videoUri?: string;
};

class OnboardingView extends React.Component<OnboardingProps, OnboardingState> {
  dropdown: any;
  steps: OnboardingStep[];
  deeplinkInitialized: boolean;
  videoToken: string;

  constructor(props: OnboardingProps) {
    super(props);
    this.steps = [];
    this.deeplinkInitialized = false;
    this.videoToken = generateToken();
    this.state = {
      step: OnboardingStep.SPLASH
    };

    if (this.props.hasValidInviteToken) {
      this.initializeDeeplinkingState();
    }
  }

  /**
   * If deeplinking params are present, makes sure they are valid, and fills in
   * the associated video download url into state.
   */
  initializeDeeplinkingState = async () => {
    if (!this.props.isLoggedIn) {
      return;
    }

    this.deeplinkInitialized = true;

    // We ask the user to sign up via the regular invite flow if the specified token is invalid for any reason.
    if (this.props.inviteToken && !this.props.hasValidInviteToken) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Unable to process deeplink invitation. Please sign up using the regular onboarding flow."
      );
      return;
    }

    const videoDownloadUrl = await extractDeeplinkVideoUrl(
      this.props.invitingMember,
      this.props.inviteVideoToken
    );
    // We must be able to access the video specified by the invite.
    if (!videoDownloadUrl) {
      this.dropdown.alertWithType(
        "error",
        "Error: Invalid Deeplink",
        "Invite video doesn't exist or has expired. Please try signing up directly from your phone."
      );
      this.setState({
        inviteVideoIsValid: false
      });
      return;
    }
    this.setState({
      videoDownloadUrl,
      inviteVideoIsValid: true
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

    if (this.props.hasValidInviteToken && !this.deeplinkInitialized) {
      this.initializeDeeplinkingState();
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

  _verifyEmailAddress = () => {
    const verifiedEmailAddress = this.state.emailAddress;
    if (!verifiedEmailAddress) {
      this.dropdown.alertWithType(
        "error",
        "Error: Missing email address",
        "Need to specify email address before this step."
      );
      this.setState({
        step: OnboardingStep.INPUT_EMAIL
      });
    }
    return verifiedEmailAddress;
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
        "Error: Could not verify video uploaded",
        "Invalid video. Please retry."
      );
      this.setState({
        step: OnboardingStep.VIDEO_PREVIEW
      });
    }
    return videoDownloadUrl;
  };

  _renderOnboardingStep() {
    if (this.props.hasValidInviteToken) {
      this.props.navigation.replace(RouteName.LogInPage, {
        redirectTo: RouteName.OnboardingPage,
        loginMessage:
          "Welcome to Raha! Please sign up with your\nmobile number to accept your invite.",
        redirectParams: this.props.navigation.state.params
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
                step: OnboardingStep.INPUT_EMAIL
              });
            }}
            onBack={this._handleBackPress}
          />
        );
      }
      case OnboardingStep.INPUT_EMAIL: {
        return (
          <InputEmail
            onInputEmail={(email: string) => {
              this.setState({
                emailAddress: email,
                step:
                  this.props.hasValidInviteToken &&
                  this.props.inviteVideoIsJoint &&
                  this.state.inviteVideoIsValid
                    ? // The new member does not need to take a verification video
                      // if they have a valid joint invite video.
                      OnboardingStep.CREATE_ACCOUNT
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
        const videoUploadRef = getAuthRestrictedVideoRef(this.videoToken);
        const thumbnailUploadRef = getAuthRestrictedVideoThumbnailRef(
          this.videoToken
        );
        if (!videoUri || !videoUploadRef) {
          return <React.Fragment />;
        }
        return (
          <IndependentPageContainer>
            <VideoUploader
              videoUri={videoUri}
              videoUploadRef={videoUploadRef}
              thumbnailUploadRef={thumbnailUploadRef}
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
            />
          </IndependentPageContainer>
        );
      }
      case OnboardingStep.CREATE_ACCOUNT: {
        const fullName = this._verifyFullName();
        const emailAddress = this._verifyEmailAddress();
        const videoDownloadUrl = this._verifyVideoDownloadUrl();
        if (!fullName || !emailAddress || !videoDownloadUrl) {
          return <React.Fragment />;
        }
        return (
          <OnboardingCreateAccount
            verifiedName={fullName}
            emailAddress={emailAddress}
            videoToken={
              this.props.hasValidInviteToken &&
              this.props.inviteVideoToken &&
              this.state.inviteVideoIsValid &&
              this.props.inviteVideoIsJoint
                ? this.props.inviteVideoToken
                : this.videoToken
            }
            inviteToken={
              this.props.hasValidInviteToken
                ? this.props.inviteToken
                : undefined
            }
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
      <View>
        {this._renderOnboardingStep()}
        <DropdownAlert ref={(ref: any) => (this.dropdown = ref)} />
      </View>
    );
  }
}

async function extractDeeplinkVideoUrl(
  invitingMember?: Member,
  videoToken?: string
): Promise<string | undefined> {
  if (!videoToken || !invitingMember) {
    return undefined;
  }
  return await getAuthRestrictedVideoRef(videoToken).getDownloadURL();
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const firebaseUser = getLoggedInFirebaseUser(state);
  // This token is provided when the user navigates via deep link.
  const deeplinkInviteToken = ownProps.navigation.getParam("t");

  const invitingOperation = deeplinkInviteToken
    ? state.invitations.byInviteToken.get(deeplinkInviteToken)
    : undefined;
  const invitingMember = invitingOperation
    ? getMemberById(state, invitingOperation.creator_uid)
    : undefined;
  const inviteVideoToken = invitingOperation
    ? invitingOperation.data.video_token
    : undefined;
  const inviteVideoIsJoint = invitingOperation
    ? invitingOperation.data.is_joint_video
    : undefined;

  // We have a valid invite token only if all these things are true. If not,
  // then we will throw an error in `initializeDeeplinkParams` and go through the
  // default uninvited onboarding flow.
  const hasValidInviteToken =
    !!deeplinkInviteToken &&
    !!invitingOperation &&
    !!invitingMember &&
    !!inviteVideoToken &&
    inviteVideoIsJoint !== undefined;

  return {
    displayName: firebaseUser ? firebaseUser.displayName : null,
    isLoggedIn:
      state.authentication.isLoaded && state.authentication.isLoggedIn,
    inviteToken: deeplinkInviteToken,
    hasValidInviteToken,
    inviteVideoToken,
    invitingMember,
    inviteVideoIsJoint
  };
};
export const Onboarding = connect(mapStateToProps)(OnboardingView);
