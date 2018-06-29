/**
 * Renders the video camera preview screen after recording a video then allows the user the upload it.
 */

// Firebase API getDownloadURL call has a setTimeout call that triggers a developer
// warning. https://github.com/facebook/react-native/issues/12981
console.ignoredYellowBox = ["Setting a timer"];

import * as React from "react";
import firebase from "firebase";
import { View, StyleSheet } from "react-native";
import Video from "react-native-video";

import { Button, Text } from "../../shared/elements";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_MB = 60;
const MAX_VIDEO_SIZE = MAX_MB * BYTES_PER_MIB;

type VideoPreviewProps = {
  videoUri: string;
  videoUploadRef: firebase.storage.Reference;
  onVideoUploaded: (videoDownloadUrl: string) => any;
  onVideoPlaybackError: (errorMessage: string) => any;
  onRetakeClicked: () => any;
};

type VideoStateProps = {
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

export class VideoPreview extends React.Component<
  VideoPreviewProps,
  VideoStateProps
> {
  constructor(props: VideoPreviewProps) {
    super(props);
    this.state = {
      uploadStatus: UploadStatus.NOT_STARTED,
      uploadedBytes: 0,
      totalBytes: 0
    };
  }

  uploadVideo = async (videoUploadRef: firebase.storage.Reference) => {
    const response = await fetch(this.props.videoUri);
    const blob = await response.blob();
    //@ts-ignore Blob does not have data type
    if (blob.data.size > MAX_VIDEO_SIZE) {
      this.props.onVideoPlaybackError(
        "The video size is larger than " +
          MAX_MB +
          "MB. Please retake your video."
      );
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
        this.props.onVideoPlaybackError(
          "Could not upload. Please try again.\n" + err.message
        );
        this.setState({
          uploadStatus: UploadStatus.NOT_STARTED
        });
      },
      async () => {
        const videoDownloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
        if (videoDownloadUrl) {
          this.setState({ uploadStatus: UploadStatus.UPLOADED });
          this.props.onVideoUploaded(videoDownloadUrl);
        } else {
          this.props.onVideoPlaybackError(
            "Could not retrieve download URL. Please try again."
          );
          this.setState({
            uploadStatus: UploadStatus.NOT_STARTED
          });
        }
      }
    );
  };

  renderButtonsOrStatus() {
    if (this.state.uploadStatus === UploadStatus.NOT_STARTED) {
      return (
        <React.Fragment>
          {this.props.videoUri && (
            <Button
              title="Upload Video"
              onPress={() => {
                this.uploadVideo(this.props.videoUploadRef);
              }}
            />
          )}
          <Button
            title="Retake"
            onPress={() => {
              this.props.onRetakeClicked();
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
        </React.Fragment>
      );
    }
  }

  renderVideo() {
    const videoUri = this.props.videoUri;
    return (
      videoUri && (
        <Video
          source={{
            uri: videoUri
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
