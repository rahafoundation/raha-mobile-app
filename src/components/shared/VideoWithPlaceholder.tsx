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
  View,
  ViewStyle,
  StyleProp
} from "react-native";
import {
  withNavigation,
  NavigationInjectedProps,
  NavigationEventSubscription
} from "react-navigation";
import Video from "react-native-video";

type Props = {
  uri: string;
  style?: StyleProp<ViewStyle>;
};

const initialState = {
  isPressed: false,
  videoLoaded: false,
  videoPaused: true
};

export class VideoWithPlaceholderView extends React.Component<
  Props & NavigationInjectedProps,
  typeof initialState
> {
  state = initialState;

  navSub?: NavigationEventSubscription;
  video: Video | null = null;

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

  onEnd = () => {
    if (this.video) this.video.seek(0);
    this.setState({
      videoPaused: true
    });
  };

  render() {
    const { isPressed, videoLoaded, videoPaused } = this.state;
    const imageProps = { source: { uri: this.props.uri + ".thumb.jpg" } };
    const videoProps = {
      source: { uri: this.props.uri },
      paused: videoPaused || !videoLoaded
    };
    const renderImage = !isPressed || !videoLoaded;
    // TODO would be nice to change blurRadius to an Animation
    const blurRadius = isPressed ? 10 : undefined;
    return (
      <TouchableHighlight style={[this.props.style]} onPress={this.onPress}>
        <View>
          {renderImage && (
            <Image
              blurRadius={blurRadius}
              {...imageProps}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%"
              }}
            />
          )}
          {isPressed && (
            <Video
              {...videoProps}
              onEnd={this.onEnd}
              onLoad={() => {
                this.setState({ videoLoaded: true });
              }}
              ref={r => (this.video = r)}
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%"
              }}
            />
          )}
        </View>
      </TouchableHighlight>
    );
  }
}

export const VideoWithPlaceholder = withNavigation<Props>(
  VideoWithPlaceholderView
);
