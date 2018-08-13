import { BackHandler } from "react-native";
import * as React from "react";
import { NavigationScreenProps } from "react-navigation";
import { MapStateToProps, connect } from "react-redux";
import { RNFirebase } from "react-native-firebase";
import DropdownAlert from "react-native-dropdownalert";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Container } from "../../shared/elements";
import { VerifyCamera } from "./VerifyCamera";
import { VideoPreview } from "../Camera/VideoPreview";
import {
  getLoggedInMember,
  getGenericPrivateVideoRef
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
  VIDEO_PREVIEW,
  CONFIRM_VERIFICATION
}

type ReduxStateProps = {
  loggedInMember?: Member;
  toMember?: Member;
  requestVerificationOperationVideoUrl?: string;
};

type OwnProps = NavigationScreenProps<{ toMemberId: MemberId }>;

type VerifyProps = OwnProps & ReduxStateProps;

type VerifyState = {
  step: VerifyStep;
  videoUri?: string;
  videoDownloadUrl?: string;
};

class VerifyView extends React.Component<VerifyProps, VerifyState> {
  steps: VerifyStep[];
  inviteToken: string;
  videoUploadRef: RNFirebase.storage.Reference;
  dropdown: any;

  constructor(props: VerifyProps) {
    super(props);
    this.steps = [];
    this.inviteToken = generateToken();
    this.videoUploadRef = getGenericPrivateVideoRef(this.inviteToken);
    this.state = {
      step: props.requestVerificationOperationVideoUrl
        ? VerifyStep.CONFIRM_EXISTING_VIDEO
        : VerifyStep.SPLASH
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentDidUpdate(prevProps: VerifyProps, prevState: VerifyState) {
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

  _handleExit = () => {
    this.props.navigation.goBack();
  };

  /**
   * A handler for software back button press.
   */
  _handleSoftBackPress = () => {
    if (!this._handleBackPress()) {
      this._handleExit();
    }
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
        step: VerifyStep.CAMERA
      });
    }
    return videoUri;
  };

  _renderStep() {
    if (!this.props.toMember || !this.props.loggedInMember) {
      console.error(
        "At least one of the required members for verification is not present."
      );
      return <React.Fragment />;
    }
    switch (this.state.step) {
      case VerifyStep.SPLASH: {
        return (
          <VerifySplash
            onContinue={() => {
              this.setState({
                step: VerifyStep.CAMERA
              });
            }}
            onBack={this._handleSoftBackPress}
          />
        );
      }
      case VerifyStep.CONFIRM_EXISTING_VIDEO: {
        if (this.props.requestVerificationOperationVideoUrl) {
          return (
            <ConfirmExistingVerificationVideo
              videoUri={this.props.requestVerificationOperationVideoUrl}
              onBack={this._handleSoftBackPress}
              onConfirm={() =>
                this.setState({ step: VerifyStep.CONFIRM_VERIFICATION })
              }
              onRetake={() => this.setState({ step: VerifyStep.CAMERA })}
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
              this.setState({
                videoUri: videoUri,
                step: VerifyStep.VIDEO_PREVIEW
              });
            }}
            ownFullName={this.props.loggedInMember.get("fullName")}
            toFullName={this.props.toMember.get("fullName")}
          />
        );
      }
      case VerifyStep.VIDEO_PREVIEW: {
        const videoUri = this._verifyVideoUri();
        if (!videoUri) {
          console.error("Missing video URI for VideoPreview step");
          return <React.Fragment />;
        }
        return (
          <VideoPreview
            videoUri={videoUri}
            videoUploadRef={this.videoUploadRef}
            onVideoUploaded={(videoDownloadUrl: string) =>
              this.setState({
                videoDownloadUrl: videoDownloadUrl,
                step: VerifyStep.CONFIRM_VERIFICATION
              })
            }
            onRetakeClicked={() => {
              this.setState({ step: VerifyStep.CAMERA });
            }}
            onError={(errorType: string, errorMessage: string) => {
              this.dropdown.alertWithType("error", errorType, errorMessage);
              this.setState({
                step: VerifyStep.CAMERA
              });
            }}
            fullScreen={false}
          />
        );
      }
      case VerifyStep.CONFIRM_VERIFICATION: {
        const video = this.props.requestVerificationOperationVideoUrl
          ? { videoUrl: this.props.requestVerificationOperationVideoUrl }
          : { videoToken: this.inviteToken };
        return (
          <SubmitVerification
            video={video}
            toMemberId={this.props.toMember.get("memberId")}
            toMemberFullName={this.props.toMember.get("fullName")}
            onBack={this._handleSoftBackPress}
            onExit={this._handleExit}
          />
        );
      }
      default:
        console.error("Unexpected step " + this.state.step);
        return undefined;
    }
  }

  render() {
    return (
      <Container>
        {this._renderStep()}
        <DropdownAlert ref={(ref: any) => (this.dropdown = ref)} />
      </Container>
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
  const requestVerificationOperationVideoUrl = requestVerificationOperation
    ? requestVerificationOperation.data.video_url
    : undefined;

  return {
    loggedInMember: member,
    toMember,
    requestVerificationOperationVideoUrl
  };
};
export const Verify = connect(mapStateToProps)(VerifyView);
