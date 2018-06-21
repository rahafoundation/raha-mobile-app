/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { format } from "date-fns";
import { Big } from "big.js";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { withNavigation } from "react-navigation";
import { Video, PlaybackObject, PlaybackStatus } from "expo";

import { Member } from "../../../store/reducers/members";
import { RouteName } from "../Navigation";

interface ActivityTemplateProps {
  from: Member;
  to?: Member;
  amount?: Big;
  donationAmount?: Big;
  message: string;
  timestamp: Date;
  videoUri?: string;
}

interface ActivityTemplateState {
  videoPressed: boolean; // true if video is unmuted and has user focus. no longer loops.
  videoPlaybackFinished: boolean; // true if video has completed after pressed, not when it loops.
}

class ActivityTemplateView extends React.Component<
  ActivityTemplateProps,
  ActivityTemplateState
> {
  state = {
    videoPressed: false,
    videoPlaybackFinished: false
  } as ActivityTemplateState;
  videoElem: PlaybackObject | undefined;

  /**
   * Start video playback
   */
  public startVideo = async () => {
    if (!this.videoElem) return;
    await this.videoElem.playAsync();
  };

  /**
   * Reset video playback state, stop it
   */
  public resetVideo = async () => {
    if (!this.videoElem) return;
    await this.videoElem.stopAsync();
    this.videoElem.setPositionAsync(0);
    this.setState({
      videoPressed: false,
      videoPlaybackFinished: false
    });
  };

  private handleVideoPress = async () => {
    if (!this.videoElem) return;
    const playbackStatus = await this.videoElem.getStatusAsync();
    if (!playbackStatus.isLoaded) return;

    if (this.state.videoPlaybackFinished) {
      await this.videoElem.playFromPositionAsync(0);
      this.setState({ videoPlaybackFinished: false });
    } else {
      this.setState({ videoPressed: true });
    }
  };

  private handlePlaybackStatusUpdate = (status: PlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.didJustFinish && this.state.videoPressed) {
      this.setState({ videoPlaybackFinished: true });
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
            <TouchableOpacity
              onPress={this.handleVideoPress}
              delayPressIn={20}
              disabled={this.state.videoPressed}
            >
              {/* TODO: make own playback controls for smoother customization */}
              <Video
                ref={(elem: any) => {
                  this.videoElem = elem;
                }}
                style={styles.video}
                rate={1.0}
                volume={1.0}
                usePoster={true}
                isLooping={!this.state.videoPressed}
                resizeMode={Video.RESIZE_MODE_COVER}
                isMuted={!this.state.videoPressed}
                useNativeControls={
                  this.state.videoPressed && !this.state.videoPlaybackFinished
                }
                source={{ uri: videoUri }}
                onPlaybackStatusUpdate={this.handlePlaybackStatusUpdate}
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

export const ActivityTemplate = withNavigation(ActivityTemplateView);