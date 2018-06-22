/**
 * Renders the video camera preview screen after recording an invite video then
 * allows the user the upload it.
 */

import * as React from "react";
import firebase from "firebase";
import { View, Text, StyleSheet, Button } from "react-native";
import Video from "react-native-video";
import { RouteName } from "../../shared/Navigation";
import { Member } from "../../../store/reducers/members";
import { RahaState } from "../../../store";
import { connect, MapStateToProps } from "react-redux";
import { getPrivateVideoInviteRef } from "../../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_MB = 60;
const MAX_VIDEO_SIZE = MAX_MB * BYTES_PER_MIB;

type ReduxStateProps = {
  videoUploadRef?: firebase.storage.Reference;
};

interface NavParams {
  invitingMember?: Member;
  verifiedName?: string;
  videoUri?: string;
}

type OwnProps = NavigationScreenProps<NavParams>;

type InviteVideoPreviewProps = ReduxStateProps & OwnProps;

type InviteVideoStateProps = {
  errorMessage?: string;
  uploadStatus: UploadStatus;
  inviteStatus: InviteStatus;
  uploadedBytes: number;
  totalBytes: number;
};

enum UploadStatus {
  NOT_STARTED,
  UPLOADING,
  UPLOADED
}

enum InviteStatus {
  NOT_REQUESTED,
  REQUESTING,
  REQUESTED
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
      totalBytes: 0,
      inviteStatus: InviteStatus.NOT_REQUESTED
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
    const response = await fetch(videoUri);
    const blob = await response.blob();
    //@ts-ignore Blob does not have data type
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
      (s: any) => {
        const snapshot = s as firebase.storage.UploadTaskSnapshot;
        this.setState({
          uploadStatus: UploadStatus.UPLOADING,
          uploadedBytes: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        });
      },
      err => {
        this.setState({
          errorMessage: "Could not upload. Please try again.",
          uploadStatus: UploadStatus.NOT_STARTED
        });
      },
      () => {
        this.setState({ uploadStatus: UploadStatus.UPLOADED });
        this.requestInvite();
      }
    );
  };

  requestInvite() {
    this.setState({
      inviteStatus: InviteStatus.REQUESTING
    });
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
          {this.state.inviteStatus === InviteStatus.REQUESTING && (
            <Text>Requesting invite...</Text>
          )}
          {this.state.inviteStatus === InviteStatus.REQUESTED && (
            <Text>Request successful!</Text>
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
          muted={false}
          resizeMode="cover"
          repeat
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

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    videoUploadRef: getPrivateVideoInviteRef(state)
  };
};
export const InviteVideoPreview = connect(mapStateToProps)(
  InviteVideoPreviewView
);
