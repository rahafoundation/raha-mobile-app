import { BackHandler } from "react-native";
import * as React from "react";
import { Container } from "../../shared/elements";
import { InviteCamera } from "./InviteCamera";
import DropdownAlert from "react-native-dropdownalert";
import { VideoPreview } from "../Camera/VideoPreview";
import { MapStateToProps, connect } from "react-redux";
import {
  getLoggedInMember,
  getPrivateVideoInviteRef
} from "../../../store/selectors/authentication";
import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { v4 as uuid } from "uuid";

enum InviteStep {
  CAMERA,
  VIDEO_PREVIEW,
  SEND_INVITE
}

type ReduxStateProps = {
  loggedInMember?: Member;
};

type OwnProps = {
  videoUploadRef: firebase.storage.Reference;
};

type InviteProps = ReduxStateProps & OwnProps;

type InviteState = {
  step: InviteStep;
  verifiedName?: string;
  videoUri?: string;
  videoDownloadUrl?: string;
};

export class InviteView extends React.Component<InviteProps, InviteState> {
  inviteId: string;
  dropdown: any;

  constructor(props: InviteProps) {
    super(props);
    this.inviteId = uuid();
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
          return <React.Fragment />;
        }
        return (
          <VideoPreview
            videoUri={videoUri}
            videoUploadRef={this.props.videoUploadRef}
            onVideoUploaded={(videoDownloadUrl: string) =>
              this.setState({
                videoDownloadUrl: videoDownloadUrl
                // TODO: step: InviteStep.SEND_INVITE
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
      default:
    }
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
