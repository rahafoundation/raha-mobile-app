import { BackHandler } from "react-native";
import * as React from "react";
import { Container } from "../../shared/elements";
import { InviteCamera } from "./InviteCamera";
import DropdownAlert from "react-native-dropdownalert";
import { VideoPreview } from "../Camera/VideoPreview";
import { MapStateToProps, connect } from "react-redux";
import {
  getLoggedInMember,
  getInviteVideoRef
} from "../../../store/selectors/authentication";
import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { generateToken } from "../../../helpers/token";
import { SendInvite } from "./SendInvite";

enum InviteStep {
  CAMERA,
  VIDEO_PREVIEW,
  SEND_INVITE
}

type ReduxStateProps = {
  loggedInMember?: Member;
};

type OwnProps = {};

type InviteProps = ReduxStateProps & OwnProps;

type InviteState = {
  step: InviteStep;
  videoUri?: string;
  videoDownloadUrl?: string;
};

export class InviteView extends React.Component<InviteProps, InviteState> {
  inviteToken: string;
  videoUploadRef: firebase.storage.Reference;
  dropdown: any;

  constructor(props: InviteProps) {
    super(props);
    this.inviteToken = generateToken();
    this.videoUploadRef = getInviteVideoRef(this.inviteToken);
    this.state = {
      step: InviteStep.CAMERA
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this._handleBackPress);
  }

  _handleBackPress = () => {
    const index = this.state.step.valueOf();
    if (index === 0) {
      // Exit out of Invite flow.
      return false;
    } else {
      const previousStepKey = InviteStep[index - 1];
      this.setState({
        step: InviteStep[previousStepKey as keyof typeof InviteStep]
      });
      return true;
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
        step: InviteStep.CAMERA
      });
    }
    return videoUri;
  };

  _renderStep() {
    switch (this.state.step) {
      case InviteStep.CAMERA: {
        return (
          <InviteCamera
            onVideoRecorded={(videoUri: string) => {
              this.setState({
                videoUri: videoUri,
                step: InviteStep.VIDEO_PREVIEW
              });
            }}
          />
        );
      }
      case InviteStep.VIDEO_PREVIEW: {
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
                step: InviteStep.SEND_INVITE
              })
            }
            onRetakeClicked={() => {
              this.setState({ step: InviteStep.CAMERA });
            }}
            onVideoPlaybackError={(errorMessage: string) => {
              this.dropdown.alertWithType(
                "error",
                "Error: Video Playback",
                errorMessage
              );
              this.setState({
                step: InviteStep.CAMERA
              });
            }}
          />
        );
      }
      case InviteStep.SEND_INVITE: {
        return <SendInvite videoToken={this.inviteToken} />;
      }

      default:
    }
    console.error("Unexpected step " + this.state.step);
    return undefined;
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

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const member = getLoggedInMember(state);
  return {
    loggedInMember: member
  };
};
export const Invite = connect(mapStateToProps)(InviteView);
