/**
 * Renders the video camera preview screen after recording a video then allows the user the upload it.
 */

// Firebase API getDownloadURL call has a setTimeout call that triggers a developer
// warning. https://github.com/facebook/react-native/issues/12981
console.ignoredYellowBox = ["Setting a timer"];

import * as React from "react";
import { RNFirebase } from "react-native-firebase";
import { View, StyleSheet } from "react-native";
import { VideoPlayer } from "react-native-video-processing";

import { Button, Text } from "../../shared/elements";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_MB = 60;
const MAX_VIDEO_SIZE = MAX_MB * BYTES_PER_MIB;

type VideoPreviewProps = {
  videoUri: string;
  videoUploadRef: RNFirebase.storage.Reference;
  onVideoUploaded: (videoDownloadUrl: string) => any;
  onError: (errorType: string, errorMessage: string) => any;
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
  videoPlayerRef?: any;

  constructor(props: VideoPreviewProps) {
    super(props);
    this.state = {
      uploadStatus: UploadStatus.NOT_STARTED,
      uploadedBytes: 0,
      totalBytes: 0
    };
  }

  compressAndUploadVideo = async () => {
    const options = {
      width: 480,
      height: 640,
      bitrateMultiplier: 3,
      minimumBitrate: 300000
    };
    try {
      const newSource = await this.videoPlayerRef.compress(options);
      this.uploadVideo(this.props.videoUploadRef, newSource);
    } catch (error) {
      this.props.onError("Error: Video Upload", error);
    }
  };

  uploadVideo = async (
    videoUploadRef: RNFirebase.storage.Reference,
    videoUri: string
  ) => {
    const response = await fetch(videoUri);
    const blob = await response.blob();
    //@ts-ignore Blob does not have data type
    if (blob.data.size > MAX_VIDEO_SIZE) {
      this.props.onError(
        "Error: Video Upload",
        "The video size is larger than " +
          MAX_MB +
          "MB. Please retake your video."
      );
      return;
    }

    const metadata = {
      //@ts-ignore Expo Blob does not have data type
      contentType: blob.data.type
    };
    const uploadTask = videoUploadRef.put(this.props.videoUri, metadata);
    uploadTask.on(
      "state_changed",
      (s: any) => {
        const snapshot = s as RNFirebase.storage.UploadTaskSnapshot;
        this.setState({
          uploadStatus: UploadStatus.UPLOADING,
          uploadedBytes: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes
        });
      },
      err => {
        this.props.onError(
          "Error: Video Upload",
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
          this.props.onError(
            "Error: Video Upload Error",
            "Could not retrieve download URL. Please try again."
          );
          this.setState({
            uploadStatus: UploadStatus.NOT_STARTED
          });
        }
      }
    );
    const snapshot = await uploadTask;
    const videoDownloadUrl = await videoUploadRef.getDownloadURL();
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
  };

  renderButtonsOrStatus() {
    if (this.state.uploadStatus === UploadStatus.NOT_STARTED) {
      return (
        <React.Fragment>
          {this.props.videoUri && (
            <Button
              title="Upload Video"
              onPress={() => {
                this.compressAndUploadVideo();
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
        <VideoPlayer
          style={styles.video}
          ref={(ref: any) => (this.videoPlayerRef = ref)}
          play={true}
          replay={true}
          source={videoUri}
          resizeMode={VideoPlayer.Constants.resizeMode.COVER}
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
