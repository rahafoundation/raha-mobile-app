/**
 * Renders the video camera preview screen after recording an invite video then
 * allows the user the upload it.
 */

// Firebase API getDownloadURL call has a setTimeout call that triggers a developer
// warning. https://github.com/facebook/react-native/issues/12981
console.ignoredYellowBox = ["Setting a timer"];

import * as React from "react";
import * as firebase from "firebase";
import { View, Text, StyleSheet, Button } from "react-native";
import { Video } from "expo";
import { RouteName } from "../../shared/Navigation";
import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { connect, MapStateToProps, MergeProps } from "react-redux";
import { getPrivateVideoInviteRef } from "../../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import { requestInviteFromMember } from "../../../store/actions/members";
import { MemberId } from "../../../identifiers";
import { getUsername } from "../../../helpers/username";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { ApiEndpoint } from "../../../api";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../store/reducers/apiCalls";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_MB = 60;
const MAX_VIDEO_SIZE = MAX_MB * BYTES_PER_MIB;

type ReduxStateProps = {
  videoUploadRef?: firebase.storage.Reference;
  firebaseMemberId?: MemberId;
  requestInviteStatus?: ApiCallStatus;
};

interface NavParams {
  invitingMember?: Member;
  verifiedName?: string;
  videoUri?: string;
}

type DispatchProps = {
  requestInviteFromMember: typeof requestInviteFromMember;
};

type OwnProps = NavigationScreenProps<NavParams>;

type InviteVideoPreviewProps = ReduxStateProps &
  OwnProps & {
    requestInvite: (videoDownloadUrl: string) => void;
  };

type InviteVideoStateProps = {
  errorMessage?: string;
  uploadStatus: UploadStatus;
  uploadedBytes: number;
  totalBytes: number;
  videoDownloadUrl?: string;
};

enum UploadStatus {
  NOT_STARTED,
  UPLOADING,
  UPLOADED
}

class InviteVideoPreviewView extends React.Component<
  InviteVideoPreviewProps,
  InviteVideoStateProps
> {
  videoUri?: string;

  constructor(props: InviteVideoPreviewProps) {
    super(props);
    this.state = {
      uploadStatus: UploadStatus.NOT_STARTED,
      uploadedBytes: 0,
      totalBytes: 0
    };
  }

  navigateToCamera() {
    this.props.navigation.navigate(RouteName.OnboardingCamera, {
      invitingMember: this.props.navigation.getParam("invitingMember"),
      verifiedName: this.props.navigation.getParam("verifiedName")
    });
  }

  uploadVideo = async (videoUploadRef: firebase.storage.Reference) => {
    const videoUri = this.props.navigation.getParam("videoUri");
    if (!videoUri) {
      console.warn("videoUri missing from navigator when uploading video.");
      return;
    }
    this.setState({ uploadStatus: UploadStatus.UPLOADING });
    const response = await fetch(videoUri);
    const blob = await response.blob();
    //@ts-ignore Expo Blob does not have data type
    if (blob.data.size > MAX_VIDEO_SIZE) {
      this.setState({
        errorMessage:
          "The video size is larger than " +
          MAX_VIDEO_SIZE +
          "MB. Please retake your video."
      });
      return;
    }

    // TODO: Transcode video to make it smaller.
    const metadata = {
      //@ts-ignore Expo Blob does not have data type
      contentType: blob.data.type
    };
    const uploadTask = videoUploadRef.put(blob, metadata);
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      s => {
        const snapshot = s as firebase.storage.UploadTaskSnapshot;
        this.setState({
          uploadedBytes: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        });
      },
      () =>
        this.setState({
          errorMessage: "Could not upload. Please try again.",
          uploadStatus: UploadStatus.NOT_STARTED
        }),
      async () => {
        this.setState({ uploadStatus: UploadStatus.UPLOADED });
        const videoDownloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
        if (videoDownloadUrl) {
          this.sendInviteRequest(videoDownloadUrl);
        } else {
          this.setState({
            errorMessage: "Could not retrieve download URL. Please try again.",
            uploadStatus: UploadStatus.NOT_STARTED
          });
        }
      }
    );
  };

  sendInviteRequest(videoDownloadUrl: string) {
    this.setState({
      videoDownloadUrl: videoDownloadUrl
    });
    this.props.requestInvite(videoDownloadUrl);
    // TODO: When completed, redirect to profile
  }

  componentWillMount() {
    this.videoUri = this.props.navigation.getParam("videoUri");

    // Validate video state.
    if (!this.videoUri) {
      console.warn(
        "videoUri missing from navigator when mounting video preview."
      );
      this.setState({
        errorMessage: "Invalid video. Please try again."
      });
    } else if (!this.props.videoUploadRef) {
      this.setState({
        errorMessage:
          "Could not find storage to upload video to. Please contact the Raha team."
      });
    }
  }

  renderButtonsOrStatus() {
    const videoUploadRef = this.props.videoUploadRef;
    if (this.state.uploadStatus === UploadStatus.NOT_STARTED) {
      return (
        <React.Fragment>
          {videoUploadRef &&
            this.videoUri && (
              <Button
                title="Upload Video"
                onPress={() => {
                  this.uploadVideo(videoUploadRef);
                }}
              />
            )}
          <Button
            title="Retake"
            onPress={() => {
              this.navigateToCamera();
            }}
          />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {this.state.uploadStatus === UploadStatus.UPLOADING && (
            <Text>
              Uploading...{" "}
              {Math.round(
                (100.0 * this.state.uploadedBytes) / this.state.totalBytes
              )}%
            </Text>
          )}
          {this.state.uploadStatus === UploadStatus.UPLOADED && (
            <Text>Upload success!</Text>
          )}
          {this.props.requestInviteStatus === ApiCallStatusType.STARTED && (
            <Text>Requesting invite...</Text>
          )}
          {this.props.requestInviteStatus === ApiCallStatusType.SUCCESS && (
            <Text>Request successful!</Text>
          )}
          {this.props.requestInviteStatus === ApiCallStatusType.FAILURE && (
            <React.Fragment>
              <Text>Invite request failed.</Text>
              <Button
                title="Retry"
                onPress={() => {
                  const videoDownloadUrl = this.state.videoDownloadUrl;
                  if (videoDownloadUrl) {
                    this.sendInviteRequest(videoDownloadUrl);
                  } else {
                    console.error(
                      "Missing download URL during request invite."
                    );
                  }
                }}
              />
            </React.Fragment>
          )}
        </React.Fragment>
      );
    }
  }

  renderErrorMessage() {
    return this.state.errorMessage && <Text>{this.state.errorMessage}</Text>;
  }

  renderVideo() {
    return (
      this.videoUri && (
        <Video
          source={{
            uri: this.videoUri
          }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          usePoster={true}
          resizeMode={Video.RESIZE_MODE_COVER}
          shouldPlay
          isLooping
          // @ts-ignore Expo typing for Video is missing `style`
          style={styles.video}
        />
      )
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderErrorMessage()}
        {this.renderVideo()}
        {this.renderButtonsOrStatus()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  video: {
    width: "100%",
    aspectRatio: 3 / 4
  }
});

const mapStateToProps: MapStateToProps<ReduxStateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const inviter = ownProps.navigation.getParam("invitingMember");
  const requestInviteStatus = inviter
    ? getStatusOfApiCall(state, ApiEndpoint.REQUEST_INVITE, inviter.memberId)
    : undefined;
  return {
    videoUploadRef: getPrivateVideoInviteRef(state),
    requestInviteStatus: requestInviteStatus
  };
};

const mergeProps: MergeProps<
  ReduxStateProps,
  DispatchProps,
  OwnProps,
  InviteVideoPreviewProps
> = (stateProps, dispatchProps, ownProps) => {
  return {
    ...stateProps,
    requestInvite: (videoUrl: string) => {
      const inviter = ownProps.navigation.getParam("invitingMember");
      const verifiedName = ownProps.navigation.getParam("verifiedName");
      if (inviter && verifiedName) {
        dispatchProps.requestInviteFromMember(
          inviter.memberId,
          verifiedName,
          videoUrl,
          getUsername(verifiedName)
        );
      }
    },
    ...ownProps
  };
};

export const InviteVideoPreview = connect(
  mapStateToProps,
  { requestInviteFromMember },
  mergeProps
)(InviteVideoPreviewView);
