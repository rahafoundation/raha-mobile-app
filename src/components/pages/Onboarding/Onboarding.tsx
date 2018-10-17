import * as React from "react";
import { Member } from "../../../store/reducers/members";
import { View, BackHandler, TouchableHighlight } from "react-native";
import { connect, MapStateToProps } from "react-redux";
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
import { IndependentPageContainer, Text } from "../../shared/elements";
import { InputEmail } from "./InputEmail";
import { InputInviteToken } from "./InputInviteToken";
import { fontSizes } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";
import { displayDropdownMessage } from "../../../store/actions/dropdown";
import { DropdownType } from "../../../store/reducers/dropdown";

/**
 * Parent component for Onboarding flow.
 */
enum OnboardingStep {
  SPLASH,
  VERIFY_NAME,
  INPUT_EMAIL,

  CAMERA,
  INPUT_INVITE_TOKEN,
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

interface DispatchProps {
  displayDropdownMessage: (
    type: DropdownType,
    title: string,
    message: string
  ) => void;
}

type OwnProps = NavigationScreenProps<OnboardingParams>;

type OnboardingProps = ReduxStateProps & OwnProps & DispatchProps;

type OnboardingState = {
  step: OnboardingStep;
} & OnboardingStateParams;

type OnboardingStateParams = {
  verifiedName?: string;
  emailAddress?: string;
  inviteVideoIsValid?: boolean;
  videoDownloadUrl?: string;
  videoUri?: string;
};

class OnboardingView extends React.Component<OnboardingProps, OnboardingState> {
  steps: OnboardingStep[];
  videoToken: string;
  lastInviteToken?: string;

  subscribeToNewsletter?: boolean;

  constructor(props: OnboardingProps) {
    super(props);
    this.steps = [];
    this.videoToken = generateToken();
    this.state = {
      step: OnboardingStep.SPLASH
    };
    this.extractVideoUrlForLatestInviteToken();
  }

  _displayDropdownError = (title: string, message: string) => {
    this.props.displayDropdownMessage(DropdownType.ERROR, title, message);
  };

  /**
   * Idempotently extracts the video download URL for latest invite token.
   *  If deeplinking params are present,
   * makes sure they are valid, and fills in the associated video download url into state.
   */
  extractVideoUrlForLatestInviteToken = async () => {
    if (!this.props.isLoggedIn) {
      return;
    }

    if (this.lastInviteToken === this.props.inviteToken) {
      // We already processed this invite token; don't do anything.
      return;
    }

    // We ask the user to sign up via the regular invite flow if the specified
    // token is invalid for any reason.
    if (this.props.inviteToken && !this.props.hasValidInviteToken) {
      this._displayDropdownError(
        "Error: Invalid Deeplink",
        "Unable to process deeplink invitation. Please sign up using the regular onboarding flow."
      );
      return;
    }

    // Don't pull parameters from invalid invite tokens. Note that this should
    // be after giving user feedback of invite token rejection.
    if (!this.props.hasValidInviteToken) {
      return;
    }

    this.lastInviteToken = this.props.inviteToken;

    const videoDownloadUrl = await extractDeeplinkVideoUrl(
      this.props.invitingMember,
      this.props.inviteVideoToken
    );
    // We must be able to access the video specified by the invite.
    if (!videoDownloadUrl) {
      this._displayDropdownError(
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

    this.extractVideoUrlForLatestInviteToken();

    // If the video download URL has been validated for the first time and the
    // user can be advanced to CAMERA or CREATE_ACCOUNT, do so. This will happen
    // if the user manually entered an invite token.
    if (
      !prevState.inviteVideoIsValid &&
      this.state.inviteVideoIsValid &&
      this.state.verifiedName &&
      this.state.emailAddress
    ) {
      this._goToStep(this._validatedCameraStep());
    }
  }

  /**
   * User is about to navigate to the given step. Clear any variables necessary
   * and returns state parameters to be set.
   */
  _initForStep(step: OnboardingStep) {
    switch (step) {
      case OnboardingStep.INPUT_INVITE_TOKEN:
        this.lastInviteToken = undefined;
        this.props.navigation.setParams({
          t: undefined
        });
        return {
          inviteVideoIsValid: undefined
        };
      default:
        return {};
    }
  }

  /**
   * Takes the user to the given OnboardingStep with additional state
   * parameters after clearing any existing state related to that step.
   */
  _goToStep(step: OnboardingStep, additionalParams?: OnboardingStateParams) {
    this.setState({
      step,
      ...this._initForStep(step),
      ...(additionalParams ? additionalParams : undefined)
    });
  }

  _handleBackPress = () => {
    const previousStep = this.steps.pop();
    if (previousStep === undefined) {
      // Exit out of Onboarding flow.
      return false;
    } else {
      this._goToStep(previousStep);
      return true;
    }
  };

  _verifyFullName = () => {
    const verifiedFullName = this.state.verifiedName;
    if (!verifiedFullName) {
      this._displayDropdownError(
        "Error: Missing full name",
        "Need to verify full name before this step."
      );
      this._goToStep(OnboardingStep.VERIFY_NAME);
    }
    return verifiedFullName;
  };

  _verifyEmailAddress = () => {
    const verifiedEmailAddress = this.state.emailAddress;
    if (!verifiedEmailAddress) {
      this._displayDropdownError(
        "Error: Missing email address",
        "Need to specify email address before this step."
      );
      this._goToStep(OnboardingStep.INPUT_EMAIL);
    }
    return verifiedEmailAddress;
  };

  _verifyVideoUri = () => {
    const videoUri = this.state.videoUri;
    if (!videoUri) {
      this._displayDropdownError(
        "Error: Can't show video",
        "Invalid video. Please retake your video."
      );
      this._goToStep(OnboardingStep.CAMERA);
    }
    return videoUri;
  };

  _verifyVideoDownloadUrl = () => {
    const videoDownloadUrl = this.state.videoDownloadUrl;
    if (!videoDownloadUrl) {
      this._displayDropdownError(
        "Error: Could not verify video uploaded",
        "Invalid video. Please retry."
      );
      this._goToStep(OnboardingStep.VIDEO_PREVIEW);
    }
    return videoDownloadUrl;
  };

  /**
   * Checks whether the user needs to record a video and returns the CAMERA
   * OnboardingStep. Otherwise, returns CREATE_ACCOUNT to skip the step.
   */
  _validatedCameraStep() {
    return this.props.hasValidInviteToken &&
      this.props.inviteVideoIsJoint &&
      this.state.inviteVideoIsValid
      ? // The new member does not need to take a verification video
        // if they have a valid joint invite video.
        OnboardingStep.CREATE_ACCOUNT
      : OnboardingStep.CAMERA;
  }

  _renderOnboardingStep() {
    if (!this.props.isLoggedIn) {
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
              this._goToStep(OnboardingStep.VERIFY_NAME);
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
              this._goToStep(OnboardingStep.INPUT_EMAIL, {
                verifiedName: verifiedName
              });
            }}
            onBack={this._handleBackPress}
          />
        );
      }
      case OnboardingStep.INPUT_EMAIL: {
        return (
          <InputEmail
            onInputEmail={(email: string, subscribeToNewsletter: boolean) => {
              this.subscribeToNewsletter = subscribeToNewsletter;
              this._goToStep(this._validatedCameraStep(), {
                emailAddress: email
              });
            }}
            onBack={this._handleBackPress}
          />
        );
      }
      case OnboardingStep.INPUT_INVITE_TOKEN: {
        return (
          <InputInviteToken
            onInputInviteToken={(token: string) => {
              this.props.navigation.setParams({
                t: token
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
          <IndependentPageContainer>
            <OnboardingCamera
              verifiedFullName={verifiedFullName}
              inviterFullName={
                this.props.invitingMember &&
                this.props.invitingMember.get("fullName")
                  ? this.props.invitingMember.get("fullName")
                  : undefined
              }
              onVideoRecorded={(videoUri: string) => {
                this._goToStep(OnboardingStep.VIDEO_PREVIEW, { videoUri });
              }}
            />
            {
              <TouchableHighlight
                onPress={() => {
                  this._goToStep(OnboardingStep.INPUT_INVITE_TOKEN);
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: colors.link,
                    ...fontSizes.small
                  }}
                >
                  {!this.props.hasValidInviteToken
                    ? "Use invite code"
                    : "Use different invite code"}
                </Text>
              </TouchableHighlight>
            }
          </IndependentPageContainer>
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
            <Text style={{ textAlign: "center", margin: 12 }}>
              This video will be shown publicly to show that you are a real
              person.
            </Text>
            <VideoUploader
              videoUri={videoUri}
              videoUploadRef={videoUploadRef}
              thumbnailUploadRef={thumbnailUploadRef}
              onVideoUploaded={(videoDownloadUrl: string) =>
                this._goToStep(OnboardingStep.CREATE_ACCOUNT, {
                  videoDownloadUrl
                })
              }
              onRetakeClicked={() => {
                this._goToStep(OnboardingStep.CAMERA);
              }}
              onError={(errorType: string, errorMessage: string) => {
                this._displayDropdownError(errorType, errorMessage);
                this._goToStep(OnboardingStep.CAMERA);
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
            subscribeToNewsletter={!!this.subscribeToNewsletter}
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
    return <View>{this._renderOnboardingStep()}</View>;
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
  // then we will throw an error in `initializeDeeplinkingState` and go through the
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
export const Onboarding = connect(
  mapStateToProps,
  { displayDropdownMessage }
)(OnboardingView);
