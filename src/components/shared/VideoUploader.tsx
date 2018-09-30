/**
 * Renders the video camera preview screen after recording a video then allows the user the upload it.
 */

// Firebase API getDownloadURL call has a setTimeout call that triggers a developer
// warning. https://github.com/facebook/react-native/issues/12981
console.ignoredYellowBox = ["Setting a timer"];

import * as React from "react";
import { RNFirebase } from "react-native-firebase";
import { View, StyleSheet, ViewStyle } from "react-native";
import { ProcessingManager } from "react-native-video-processing";

import { Button, Text } from "./elements";
import { VideoWithPlaceholder } from "./VideoWithPlaceholder";

const BYTES_PER_MIB = 1024 * 1024;
const MAX_MB = 60;
const MAX_VIDEO_SIZE = MAX_MB * BYTES_PER_MIB;

interface VideoUploaderProps {
  videoUri: string;
  thumbnailUri?: string;
  videoUploadRef: RNFirebase.storage.Reference;
  thumbnailUploadRef: RNFirebase.storage.Reference;
  onVideoUploaded: (
    videoDownloadUrl: string,
    thumbnailDownloadUrl: string
  ) => void;
  onError: (errorType: string, errorMessage: string) => any;
  onRetakeClicked: () => any;
}

type VideoUploaderState = {
  uploadStatus: UploadStatus;
  videoDownloadUrl?: string;
};

enum UploadStatus {
  NOT_STARTED,
  UPLOADING,
  UPLOADED
}

export class VideoUploader extends React.Component<
  VideoUploaderProps,
  VideoUploaderState
> {
  constructor(props: VideoUploaderProps) {
    super(props);
    this.state = {
      uploadStatus: UploadStatus.NOT_STARTED
    };
  }

  compressAndUploadVideo = async () => {
    // TODO: just default to square videos for simplicity
    const options = {
      width: 480,
      height: 640,
      bitrateMultiplier: 5
    };
    try {
      this.setState({
        uploadStatus: UploadStatus.UPLOADING
      });
      const [compressedVideoSource, thumbnailSource] = await Promise.all([
        ProcessingManager.compress(this.props.videoUri, options),
        ProcessingManager.getPreviewForSecond(
          this.props.videoUri,
          0,
          options, // use same width and height as actual video
          "JPEG" // Already low res, so might as well compress to smaller format than PNG
        )
      ]);
      const thumbnailUri = thumbnailSource.uri;

      // Bug-hack. React-native-video-processing returns a { source: uri } object in Android, and a plain string on iOS.
      // https://github.com/shahen94/react-native-video-processing/issues/162
      const compressedVideoUri =
        typeof compressedVideoSource === "string"
          ? compressedVideoSource
          : compressedVideoSource.source;

      this.uploadVideo(
        this.props.videoUploadRef,
        this.props.thumbnailUploadRef,
        compressedVideoUri,
        thumbnailUri
      );
    } catch (error) {
      this.props.onError("Error: Video Upload", error);
      this.setState({
        uploadStatus: UploadStatus.NOT_STARTED
      });
    }
  };

  uploadVideo = async (
    videoUploadRef: RNFirebase.storage.Reference,
    thumbnailUploadRef: RNFirebase.storage.Reference,
    videoUri: string,
    thumbnailUri: string
  ) => {
    // TODO figure out why local fetch is broken.
    // const response = await fetch(videoUri);
    // const blob = await response.blob();
    // (@)ts-ignore Blob does not have data type
    // if (blob.data.size > MAX_VIDEO_SIZE) {
    //   this.props.onError(
    //     "Error: Video Upload",
    //     "The video size is larger than " +
    //       MAX_MB +
    //       "MB. Please retake your video."
    //   );
    //   return;
    // }

    // const metadata = {
    //   // (@)ts-ignore Expo Blob does not have data type
    //   contentType: blob.data.type
    // };

    const videoUploadTask = videoUploadRef.putFile(videoUri, {
      contentType: "video/mp4"
    });
    const thumbnailUploadTask = thumbnailUploadRef.putFile(thumbnailUri, {
      contentType: "image/jpeg"
    });
    await Promise.all([videoUploadTask, thumbnailUploadTask]);
    const [videoDownloadUrl, thumbnailDownloadUrl] = await Promise.all([
      videoUploadRef.getDownloadURL(),
      thumbnailUploadRef.getDownloadURL()
    ]);
    if (videoDownloadUrl) {
      this.setState({ uploadStatus: UploadStatus.UPLOADED });
      this.props.onVideoUploaded(videoDownloadUrl, thumbnailDownloadUrl);
    } else {
      this.props.onError(
        "Error: Video Upload",
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
        <View style={styles.actionRow}>
          <Button
            title="Retake"
            onPress={() => {
              this.props.onRetakeClicked();
            }}
          />
          {this.props.videoUri && (
            <Button
              title="Upload Video"
              onPress={() => {
                this.compressAndUploadVideo();
              }}
            />
          )}
        </View>
      );
    } else {
      return (
        <View style={styles.actionRow}>
          {this.state.uploadStatus === UploadStatus.UPLOADING && (
            <Text>Uploading...</Text>
          )}
          {this.state.uploadStatus === UploadStatus.UPLOADED && (
            <Text>Upload success!</Text>
          )}
        </View>
      );
    }
  }

  renderVideo() {
    const { videoUri, thumbnailUri } = this.props;
    return (
      videoUri && (
        <View style={styles.videoContainer}>
          <VideoWithPlaceholder
            videoUri={videoUri}
            placeholderUri={thumbnailUri}
            autoplay={true}
          />
        </View>
      )
    );
  }

  render() {
    return (
      <View>
        {this.renderVideo()}
        {this.renderButtonsOrStatus()}
      </View>
    );
  }
}

const videoContainerStyle: ViewStyle = {
  width: "100%",
  aspectRatio: 1
};

const actionRowStyle: ViewStyle = {
  // center buttons
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",

  marginTop: 20
};

const styles = StyleSheet.create({
  videoContainer: videoContainerStyle,
  actionRow: actionRowStyle
});
