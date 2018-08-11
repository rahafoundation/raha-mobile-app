/**
 * General purpose component that displays all types of activities. Specific
 * Activities like GiveOperationActivity ultimately output this component.
 */
import * as React from "react";
import { format } from "date-fns";
import { Big } from "big.js";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { withNavigation, NavigationInjectedProps } from "react-navigation";

import { Member } from "../../../store/reducers/members";
import { Text } from "../../shared/elements";
import { RouteName } from "../Navigation";
import { colors } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";
import {
  VideoWithPlaceholder,
  VideoWithPlaceholderView
} from "../../shared/VideoWithPlaceholder";

type Props = {
  from: Member;
  to?: Member;
  amount?: Big;
  donationAmount?: Big;
  message: string;
  timestamp: Date;
  videoUri?: string;
};

export class ActivityTemplateView extends React.Component<
  Props & NavigationInjectedProps,
  {}
> {
  videoElem: VideoWithPlaceholderView | null = null;

  /**
   * Reset video playback state, stop it
   */
  public resetVideo = () => {
    if (this.videoElem) this.videoElem.reset();
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
      ? [",", ...[to ? [to.get("fullName")] : []], "donated"].join(" ")
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
                <Text style={styles.toText}>To {to.get("fullName")}:</Text>
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
            <Text style={styles.fromText}>From: {from.get("fullName")}</Text>
          </TouchableOpacity>
        </View>
        {videoUri && (
          <View style={styles.video}>
            <VideoWithPlaceholder
              onRef={e => {
                this.videoElem = e as any;
              }}
              uri={videoUri}
            />
          </View>
        )}
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
    borderBottomColor: colors.primaryBorder,
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
    color: colors.positive
  },
  donationAmount: {
    color: colors.donation
  },
  toText: {
    fontSize: 16,
    ...fonts.Lato.Semibold
  },
  fromText: {
    marginTop: 10,
    textAlign: "right",
    fontSize: 14,
    ...fonts.Lato.Semibold
  },
  moneyRow: {
    marginHorizontal: 10,
    marginTop: 10
  },
  video: {
    aspectRatio: 1
  },
  timestamp: {
    fontSize: 12,
    color: colors.darkAccent
  }
});

export const ActivityTemplate = withNavigation<Props>(ActivityTemplateView);
