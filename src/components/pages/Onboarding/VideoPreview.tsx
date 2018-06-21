/**
 * Renders the video camera preview screen after recording a video for onboarding.
 */

import * as React from "react";
import { View, StyleSheet, Button } from "react-native";
import { Video } from "expo";

type VideoPreviewProps = {
  videoUri: string;
  retakeVideo: (errorMessage?: string) => void;
};

export class VideoPreview extends React.Component<VideoPreviewProps> {
  render() {
    return (
      <View style={styles.container}>
        <Video
          source={{
            uri: this.props.videoUri
          }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          usePoster={true}
          resizeMode={Video.RESIZE_MODE_COVER}
          shouldPlay
          isLooping
          style={styles.video}
        />
        <Button
          title="Upload Video"
          onPress={() => {
            this.uploadVideo();
          }}
        />
        <Button
          title="Retake"
          onPress={() => {
            this.props.retakeVideo();
          }}
        />
      </View>
    );
  }

  uploadVideo = () => {
    console.log("uploading video now");
  };
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
