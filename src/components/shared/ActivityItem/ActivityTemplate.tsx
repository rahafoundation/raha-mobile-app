/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { format } from "date-fns";
import { Big } from "big.js";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";
import Video from "react-native-video";

import { Member } from "../../../store/reducers/members";
import { RouteName } from "../Navigation";

import { Text } from "../../display/Text";

interface ActivityTemplateOwnProps {
  from: Member;
  to?: Member;
  amount?: Big;
  donationAmount?: Big;
  message: string;
  timestamp: Date;
  videoUri?: string;
}
type ActivityTemplateProps = ActivityTemplateOwnProps & NavigationInjectedProps;

interface ActivityTemplateState {
  videoPlaying: boolean;
  videoPressed: boolean; // true if video is unmuted and has user focus. no longer loops.
  videoPlaybackFinished: boolean; // true if video has completed after pressed, not when it loops.
}

export class ActivityTemplateView extends React.Component<
  ActivityTemplateProps,
  ActivityTemplateState
> {
  state = {
    videoPressed: false,
    videoPlaybackFinished: false
  } as ActivityTemplateState;
  videoElem: Video | undefined;

  /**
   * Start video playback
   */
  public startVideo = async () => {
    this.setState({
      videoPlaying: true
    });
  };

  /**
   * Reset video playback state, stop it
   */
  public resetVideo = async () => {
    if (!this.videoElem) return;
    this.videoElem.seek(0);
    this.setState({
      videoPlaying: false,
      videoPressed: false,
      videoPlaybackFinished: false
    });
  };

  private handleVideoPress = async () => {
    if (!this.videoElem) return;

    if (this.state.videoPlaybackFinished) {
      this.videoElem.seek(0);
      this.setState({ videoPlaybackFinished: false, videoPlaying: true });
    } else if (!this.state.videoPlaying) {
      // unpause if paused
      this.setState({ videoPlaying: true });
    } else if (this.state.videoPressed) {
      // just pause it if pressed while playing with sound
      this.setState({ videoPlaying: false });
    }

    this.setState({ videoPressed: true });
  };

  private handleVideoEnded = async () => {
    if (this.state.videoPressed) {
      // don't bother if not pressed, since it'll be looping
      this.setState({ videoPlaybackFinished: true, videoPlaying: false });
    }
  };

  render() {
    const {
      to,
      from,
      navigation,
      videoUri,
      timestamp,
      message,
      amount,
      donationAmount
    } = this.props;

    const totalAmount =
      amount && donationAmount ? amount.plus(donationAmount) : amount;
    const donationIntroText = amount
      ? [",", ...[to ? [to.fullName] : []], "donated"].join(" ")
      : "Donated ";
    return (
      <View style={styles.card}>
        <View style={styles.metadataRow}>
          <View>
            {to && (
              <TouchableOpacity
                onPress={() =>
                  navigation.push(RouteName.Profile, { member: to })
                }
              >
                <Text>To {to.fullName}:</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.timestamp}>
            {format(timestamp, "MMM D, YYYY h:mm a")}
          </Text>
        </View>
        <View style={styles.bodyRow}>
          <Text>{message}</Text>
          <TouchableOpacity
            onPress={() => navigation.push(RouteName.Profile, { member: from })}
          >
            <Text style={styles.fromText}>From: {from.fullName}</Text>
          </TouchableOpacity>
        </View>
        <View>
          {videoUri && (
            <TouchableOpacity onPress={this.handleVideoPress} delayPressIn={20}>
              {/* TODO: make own playback controls for smoother customization */}
              <Video
                ref={(elem: any) => {
                  this.videoElem = elem;
                }}
                style={styles.video}
                rate={1.0}
                volume={1.0}
                repeat={!this.state.videoPressed}
                resizeMode="cover"
                muted={!this.state.videoPressed}
                paused={!this.state.videoPlaying}
                source={{ uri: videoUri }}
                onEnd={this.handleVideoEnded}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.moneyRow}>
          <View style={styles.amountDetail}>
            {totalAmount && (
              <Text style={styles.amount}>ℝ{totalAmount.toFixed(2)}</Text>
            )}
            {donationAmount && (
              <React.Fragment>
                <Text>{donationIntroText} </Text>
                <Text style={[styles.amount, styles.donationAmount]}>
                  ℝ{donationAmount.toFixed(2)}
                </Text>
              </React.Fragment>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginVertical: 10
  },
  metadataRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10
  },
  bodyRow: {
    marginHorizontal: 20,
    marginVertical: 10
  },
  amountDetail: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "baseline"
  },
  amount: {
    color: "green"
  },
  donationAmount: {
    color: "purple"
  },
  fromText: {
    marginTop: 10,
    textAlign: "right"
  },
  moneyRow: {
    marginHorizontal: 10,
    marginTop: 10
  },
  video: {
    width: "100%",
    aspectRatio: 4 / 3
  },
  timestamp: {
    fontSize: 12,
    color: "#666"
  }
});

export const ActivityTemplate = withNavigation<ActivityTemplateOwnProps>(
  ActivityTemplateView
);
