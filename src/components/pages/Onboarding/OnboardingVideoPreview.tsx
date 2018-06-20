/**
 * Renders the video camera preview screen after recording a video for onboarding.
 */

import * as React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Video } from "expo";
import { RouteName } from "../../shared/Navigation";

type OnboardingVideoPreviewProps = {
  navigation: any;
};

export class OnboardingVideoPreview extends React.Component<
  OnboardingVideoPreviewProps
> {
  render() {
    const videoUri = this.props.navigation.getParam("videoUri", null);
    if (videoUri) {
      return (
        <View style={styles.container}>
          <Video
            source={{
              uri: videoUri
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
              this.props.navigation.navigate(RouteName.OnboardingCamera);
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Text>Need a valid video. Please retry.</Text>
          <Button
            title="Retake"
            onPress={() => {
              this.props.navigation.navigate(RouteName.OnboardingCamera);
            }}
          />
        </View>
      );
    }
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
