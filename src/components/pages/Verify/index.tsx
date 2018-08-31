import { BackHandler } from "react-native";
import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { MapStateToProps, connect } from "react-redux";
import DropdownAlert from "react-native-dropdownalert";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { IndependentPageContainer } from "../../shared/elements";
import { VerifyCamera } from "./VerifyCamera";
import { VideoUploader } from "../../shared/VideoUploader";
import {
  getLoggedInMember,
  getAuthRestrictedVideoRef,
  getAuthRestrictedVideoThumbnailRef
} from "../../../store/selectors/authentication";
import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { generateToken } from "../../../helpers/token";
import { SubmitVerification } from "./SubmitVerification";
import { VerifySplash } from "./VerifySplash";
import { getMemberById } from "../../../store/selectors/members";
import { getRequestVerificationOperation } from "../../../store/selectors/operations";
import { ConfirmExistingVerificationVideo } from "./ConfirmExistingVerificationVideo";

enum VerifyStep {
  SPLASH,
  CONFIRM_EXISTING_VIDEO,
  CAMERA,
  CONFIRM_RECORDED_VIDEO,
  CONFIRM_VERIFICATION
}

type ReduxStateProps = {
  loggedInMember?: Member;
  toMember?: Member;
  inviteVideoToken?: string;
};

type OwnProps = NavigationScreenProps<{ toMemberId: MemberId }>;

type VerifyProps = OwnProps & ReduxStateProps;

interface BaseVerifyState {
  // necessary for handling back button presses.
  previousSteps: CurrentVerifyState[];
}

/**
 * Current state of the verification flow.
 *
 * There are two flows. In either case, you are logged in and verifying someone
 * else. They are:
 *
 * ## You invited someone to Raha, and therefore a video of you verifying the
 *    other person should already exist
 *
 * 1. CONFIRM_EXISTING_VIDEO. Video is present, you can confirm it or retake. If
 *    you confirm it:
 * 2. CONFIRM_VERIFICATION: All necessary information is present. Complete the
 *    verification process.
 *
 * Else, go to the CAMERA step, and follow the flow as though you don't have an
 * existent video.
 *
 * ## You are verifying someone you didn't invite, and therefore a video of you
 *    verifying the other person does not exist.
 *
 * 1. SPLASH: Informational page
 * 2. CAMERA: Take a video verifying the other person.
 * 3. CONFIRM_RECORDED_VIDEO: Confirm that the video is acceptable, or retake
 *    (go back to CAMERA step). If it's good, then proceeding to the next
 *    step uploads it.
 * 4. CONFIRM_VERIFICATION: See above.
 */
type CurrentVerifyState =
  | {
      // in the case of CONFIRM_EXISTING_VIDEO, we get the remote video token
      // from props.
      step:
        | VerifyStep.CONFIRM_EXISTING_VIDEO
        | VerifyStep.SPLASH
        | VerifyStep.CAMERA;
    }
  | {
      step: VerifyStep.CONFIRM_RECORDED_VIDEO;
      localVideoUri: string;
      // video not yet committed to the bucket named after this token.
      localVideoToken: string;
    }
  | {
      step: VerifyStep.CONFIRM_VERIFICATION;
      remoteVideoToken: string;
    };

type VerifyState = {
  previousSteps: CurrentVerifyState[];
  currentStep: CurrentVerifyState;
};

class VerifyView extends React.Component<VerifyProps, VerifyState> {
  dropdown: any;

  constructor(props: VerifyProps) {
    super(props);
    const initialStep = props.inviteVideoToken
      ? VerifyStep.CONFIRM_EXISTING_VIDEO
      : VerifyStep.SPLASH;

    this.state = {
      currentStep: {
        step: initialStep
      },
      previousSteps: []
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handlePreviousStep);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this._handlePreviousStep
    );
  }

  /**
   * Handles forward state transitions.
   *
   * Use this to transition states rather than calling this.setState directly
   * in this component, because we need to keep track of previous steps to
   * properly handle back button presses.
   */
  _handleNextStep(newStep: CurrentVerifyState) {
    this.setState({
      currentStep: newStep,
      previousSteps: [...this.state.previousSteps, this.state.currentStep]
    });
  }

  /**
   * Handles backwards state transitions.
   *
   * Use this to transition states rather than calling this.setState directly
   * in this component, because we need to keep track of previous steps to
   * properly handle back button presses.
   *
   * Returns true if a previous step existed, or false if we are backing out
   * from the first step.
   */
  _handlePreviousStep = () => {
    const { previousSteps } = this.state;
    if (previousSteps.length === 0) {
      // Should exit out of Onboarding flow.
      return false;
    }

    this.setState({
      currentStep: previousSteps[previousSteps.length - 1],
      previousSteps: previousSteps.slice(0, -1)
    });
    return true;
  };

  _handleExit = () => {
    this.props.navigation.goBack();
  };

  /**
   * A handler for software back button press.
   */
  _handleSoftBackPress = () => {
    if (!this._handlePreviousStep()) {
      this._handleExit();
    }
  };

  _renderStep() {
    if (!this.props.toMember || !this.props.loggedInMember) {
      console.error(
        "At least one of the required members for verification is not present."
      );
      return <React.Fragment />;
    }
    switch (this.state.currentStep.step) {
      case VerifyStep.SPLASH: {
        return (
          <VerifySplash
            onContinue={() => {
              this._handleNextStep({
                step: VerifyStep.CAMERA
              });
            }}
            onBack={this._handleSoftBackPress}
          />
        );
      }
      case VerifyStep.CONFIRM_EXISTING_VIDEO: {
        const { inviteVideoToken } = this.props;
        if (inviteVideoToken) {
          return (
            <ConfirmExistingVerificationVideo
              inviteVideoToken={inviteVideoToken}
              onBack={this._handleSoftBackPress}
              onConfirm={() =>
                this._handleNextStep({
                  step: VerifyStep.CONFIRM_VERIFICATION,
                  remoteVideoToken: inviteVideoToken
                })
              }
              onRetake={() => this._handleNextStep({ step: VerifyStep.CAMERA })}
              toVerifyMemberFullName={this.props.toMember.get("fullName")}
            />
          );
        } else {
          console.error(
            "Attempting to confirm verification video when none exists."
          );
          return <React.Fragment />;
        }
      }
      case VerifyStep.CAMERA: {
        return (
          <VerifyCamera
            onVideoRecorded={(videoUri: string) => {
              this._handleNextStep({
                localVideoUri: videoUri,
                step: VerifyStep.CONFIRM_RECORDED_VIDEO,
                localVideoToken: generateToken()
              });
            }}
            ownFullName={this.props.loggedInMember.get("fullName")}
            toFullName={this.props.toMember.get("fullName")}
          />
        );
      }
      case VerifyStep.CONFIRM_RECORDED_VIDEO: {
        const { localVideoToken, localVideoUri } = this.state.currentStep;
        console.warn("token", localVideoToken);

        return (
          <VideoUploader
            videoUri={localVideoUri}
            videoUploadRef={getAuthRestrictedVideoRef(localVideoToken)}
            thumbnailUploadRef={getAuthRestrictedVideoThumbnailRef(
              localVideoToken
            )}
            onVideoUploaded={() =>
              this._handleNextStep({
                step: VerifyStep.CONFIRM_VERIFICATION,
                remoteVideoToken: localVideoToken
              })
            }
            onRetakeClicked={() => {
              this._handleNextStep({ step: VerifyStep.CAMERA });
            }}
            onError={(errorType: string, errorMessage: string) => {
              this.dropdown.alertWithType("error", errorType, errorMessage);
              this._handleNextStep({ step: VerifyStep.CAMERA });
            }}
          />
        );
      }
      case VerifyStep.CONFIRM_VERIFICATION: {
        return (
          <SubmitVerification
            videoToken={this.state.currentStep.remoteVideoToken}
            toMemberId={this.props.toMember.get("memberId")}
            toMemberFullName={this.props.toMember.get("fullName")}
            onBack={this._handleSoftBackPress}
            onExit={this._handleExit}
          />
        );
      }
      default:
        console.error(
          "Unexpected step " +
            // type suggestion since TypeScript agrees this is impossible
            (this.state.currentStep as CurrentVerifyState).step
        );
        return undefined;
    }
  }

  render() {
    return (
      <IndependentPageContainer>
        {this._renderStep()}
        <DropdownAlert ref={(ref: any) => (this.dropdown = ref)} />
      </IndependentPageContainer>
    );
  }
}

function _getVerificationRequestIfPresent(
  state: RahaState,
  member: Member | undefined,
  toMember: Member | undefined
) {
  if (member && toMember) {
    if (
      toMember.get("requestedVerificationFrom").contains(member.get("memberId"))
    ) {
      const operations = getRequestVerificationOperation(
        state.operations,
        // Remember, in this verify flow, the "toMember will be the creator of the VerificationRequest
        toMember.get("memberId"),
        member.get("memberId")
      );
      if (operations.count() === 0) {
        return undefined;
      } else {
        return operations.get(0);
      }
    }
  }
  return undefined;
}

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const member = getLoggedInMember(state);
  if (!member) {
    console.error("No logged in member.");
  }
  const toMemberId = props.navigation.getParam("toMemberId");
  if (!toMemberId) {
    console.error("No toMemberId specified!");
  }
  const toMember = getMemberById(state, toMemberId);
  if (!toMember) {
    console.error("Could not find Member to verify with id:", toMemberId);
  }

  const requestVerificationOperation = _getVerificationRequestIfPresent(
    state,
    member,
    toMember
  );
  const inviteOperation =
    requestVerificationOperation &&
    requestVerificationOperation.data.invite_token
      ? state.invitations.byInviteToken.get(
          requestVerificationOperation.data.invite_token
        )
      : undefined;
  const inviteVideoToken = inviteOperation
    ? inviteOperation.data.video_token
    : undefined;

  return {
    loggedInMember: member,
    toMember,
    inviteVideoToken
  };
};
export const Verify = connect(mapStateToProps)(VerifyView);
