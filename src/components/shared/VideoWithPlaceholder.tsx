/*
 * This component assumes the uri given is a video, and there is a thumbnail
 * for this video that can be found by appending .thumb.jpg.
 * 
 * Very helpful for performance if showing many videos.
 */

import * as React from "react";
import {
  Image,
  TouchableHighlight,
  ImageProperties,
  TouchableHighlightProperties,
  View
} from "react-native";
import {
  withNavigation,
  NavigationInjectedProps,
  NavigationEventSubscription
} from "react-navigation";
import Video, { VideoProperties } from "react-native-video";

interface OwnProps {
  uri: string;
}

type Props = OwnProps & NavigationInjectedProps;

const initialState = {
  isPressed: false,
  videoLoaded: false,
  videoPaused: true
};

export class VideoWithPlaceholderView extends React.Component<
  Props,
  typeof initialState
> {
  state = initialState;

  navSub?: NavigationEventSubscription;

  componentDidMount() {
    this.navSub = this.props.navigation.addListener("willBlur", this.reset);
  }

  componentWillUnmount() {
    if (this.navSub) this.navSub.remove();
  }

  onPress = () => {
    this.setState(prevState => ({
      isPressed: true,
      videoPaused: !prevState.videoPaused
    }));
  };

  reset = () => {
    this.setState(initialState);
  };

  render() {
    const { isPressed, videoLoaded, videoPaused } = this.state;
    const imageProps = { source: { uri: this.props.uri + ".thumb.jpg" } };
    const videoProps = { source: { uri: this.props.uri } };
    videoProps.paused = videoPaused || !videoLoaded;
    const renderImage = !isPressed || !videoLoaded;
    const displayVideo = "flex"; //videoLoaded ? "none" : "flex";
    const videoSize = videoLoaded ? "100%" : 0;
    // TODO would be nice to change blurRadius to an Animation
    const blurRadius = isPressed ? 10 : undefined;
    return (
      <TouchableHighlight onPress={this.onPress}>
        <View>
          {renderImage && (
            <Image
              blurRadius={blurRadius}
              {...imageProps}
              style={{
                height: "100%",
                width: "100%"
              }}
            />
          )}
          {isPressed && (
            <Video
              {...videoProps}
              onLoad={() => {
                this.setState({ videoLoaded: true });
              }}
              style={{
                width: videoSize,
                height: videoSize
              }}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

export const VideoWithPlaceholder = withNavigation<OwnProps>(
  VideoWithPlaceholderView
);
