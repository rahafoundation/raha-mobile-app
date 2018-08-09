/**
 * Renders the video camera preview screen after recording a video then allows the user the upload it.
 */

// Firebase API getDownloadURL call has a setTimeout call that triggers a developer
// warning. https://github.com/facebook/react-native/issues/12981
console.ignoredYellowBox = ["Setting a timer"];

import * as React from "react";
import { RNFirebase } from "react-native-firebase";
import { View, StyleSheet, Dimensions } from "react-native";
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
  fullScreen: boolean;
};

type VideoStateProps = {
  uploadStatus: UploadStatus;
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
      uploadStatus: UploadStatus.NOT_STARTED
    };
  }

  compressAndUploadVideo = async () => {
    const options = {
      width: 480,
      height: 640,
      bitrateMultiplier: 5
    };
    try {
      this.setState({
        uploadStatus: UploadStatus.UPLOADING
      });
      const newSource = await this.videoPlayerRef.compress(options);
      this.uploadVideo(this.props.videoUploadRef, newSource);
    } catch (error) {
      this.props.onError("Error: Video Upload", error);
      this.setState({
        uploadStatus: UploadStatus.NOT_STARTED
      });
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
    const uploadTask = videoUploadRef.put(videoUri, metadata);
    await uploadTask;
    const videoDownloadUrl = await videoUploadRef.getDownloadURL();
    if (videoDownloadUrl) {
      this.setState({ uploadStatus: UploadStatus.UPLOADED });
      this.props.onVideoUploaded(videoDownloadUrl);
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
    const videoUri = this.props.videoUri;
    return (
      videoUri && (
        <VideoPlayer
          style={[
            styles.video,
            this.props.fullScreen ? {} : styles.videoWithHeaderAndNavBar
          ]}
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
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-around"
  },
  video: {
    width: "100%",
    aspectRatio: 3 / 4
  },
  videoWithHeaderAndNavBar: {
    maxHeight: Dimensions.get("window").height - 200
  },
  actionRow: {
    height: 75,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  }
});
