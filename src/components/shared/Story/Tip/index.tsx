/**
 * Tipping call to action row that displays tipping action and how many tips the
 * Story had received.
 */

import * as React from "react";
import { Big } from "big.js";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle
} from "react-native";
import { fontSizes, fonts } from "../../../../helpers/fonts";
import { palette } from "../../../../helpers/colors";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Text } from "../../elements";
import { TipData } from "../../../../store/selectors/stories/types";
import { CurrencyRole, CurrencyType, Currency } from "../../elements/Currency";
import { PendingTip } from "./PendingTip";
import { generateRandomIdentifier } from "../../../../helpers/identifiers";

type TipCallToActionProps = {
  data: TipData;
};

type TipCallToActionState = {
  // While the latest pending tip is sending, tip button is disabled
  isTipSending?: boolean;

  // Current pending tip amount to be sent. Whenever this is changed, the timer
  // within PendingTip will be restarted.
  pendingTipAmount?: Big;
};

const TIP_INCREMENT = new Big(0.1);

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class TipCallToAction extends React.Component<
  TipCallToActionProps,
  TipCallToActionState
> {
  // A unique ID for the next tip action. This is used to check the API call
  // status within PendingTip.
  tipId: string;

  constructor(props: TipCallToActionProps) {
    super(props);
    this.tipId = generateRandomIdentifier();
    this.state = {
      pendingTipAmount: undefined
    };
  }

  // TODO(tina): When navigating to another page, it won't call unmount
  // componentWillUnmount() {
  //   console.log(
  //     "YOLO",
  //     "tip component will unmount " +
  //       this.props.data.toMemberId +
  //       " maybe send " +
  //       this.state.pendingTipAmount
  //   );
  //   this._cancelPendingSendTip();
  //   const pendingTip = this.state.pendingTipAmount;
  //   if (pendingTip) {
  //     this._sendTip(pendingTip);
  //   }
  // }

  private _onTipButtonPressIn = () => {
    // TODO(tina): Long-press should keep incrementing
  };

  private _onTipButtonPressOut = () => {
    // TODO(tina): Long-press should keep incrementing
  };

  private _onTipButtonPressed = () => {
    this.setState(state => {
      const newAmount = state.pendingTipAmount
        ? state.pendingTipAmount.add(TIP_INCREMENT)
        : new Big(TIP_INCREMENT);
      return {
        pendingTipAmount: newAmount
      };
    });
  };

  private _onTipSending = () => {
    this.setState({
      isTipSending: true
    });
  };

  private _onClearPendingTip = () => {
    // Set a new ID for the next tip
    this.tipId = generateRandomIdentifier();
    this.setState({
      isTipSending: false,
      pendingTipAmount: undefined
    });
  };

  private _viewTippers = () => {};

  render() {
    const { tipTotal, fromMemberIds } = this.props.data;
    const { pendingTipAmount } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.tipButton}
            disabled={this.state.isTipSending}
            onPressIn={this._onTipButtonPressIn}
            onPressOut={this._onTipButtonPressOut}
            onPress={this._onTipButtonPressed}
          >
            <Icon
              name="caret-up"
              size={20}
              color={
                this.state.isTipSending ? palette.lightGray : palette.darkMint
              }
              solid
            />
            <Text
              style={[
                styles.tipButtonText,
                this.state.isTipSending ? styles.disabledText : undefined
              ]}
            >
              Tip
            </Text>
          </TouchableOpacity>
          {pendingTipAmount && (
            <PendingTip
              data={this.props.data}
              onCanceled={this._onClearPendingTip}
              onSendFailed={this._onClearPendingTip}
              onSending={this._onTipSending}
              onSent={this._onClearPendingTip}
              pendingTipAmount={pendingTipAmount}
              tipId={this.tipId}
            />
          )}
        </View>
        {tipTotal.gt(0) && (
          <TouchableOpacity
            style={styles.tippersContainer}
            onPress={this._viewTippers}
          >
            <Text style={styles.tippersText}>{fromMemberIds.size}</Text>
            <Icon
              name="user"
              style={styles.tippersIcon}
              color={palette.darkGray}
              solid
            />
            <Currency
              style={{ ...fontSizes.small }}
              currencyValue={{
                value: new Big(tipTotal),
                role: CurrencyRole.Transaction,
                currencyType: CurrencyType.Raha
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const tipButtonIconStyle: ViewStyle = {
  marginLeft: 4
};

const tipButtonTextStyle: TextStyle = {
  ...fontSizes.small,
  ...fonts.Lato.Bold,
  marginLeft: 4,
  color: palette.darkMint,
  textAlign: "center"
};

const disabledTextStyle: TextStyle = {
  color: palette.lightGray
};

const tipButtonStyle: ViewStyle = {
  flexDirection: "row",
  paddingVertical: 8,
  paddingRight: 12,
  // paddingHorizontal: 12,
  alignItems: "center",
  // borderWidth: 2,
  // borderColor: palette.darkMint,
  // backgroundColor: palette.veryLightGray,
  borderRadius: 8
};

const actionContainerStyle: ViewStyle = {
  flexDirection: "row"
};

const containerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  position: "relative",
  justifyContent: "space-between",
  minHeight: 40,
  marginRight: 12
};

const tippersContainerStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center"
};

const tippersTextStyle: TextStyle = {
  ...fontSizes.small,
  ...fonts.Lato.Bold,
  marginRight: 2,
  color: palette.darkGray
};

const tippersIconStyle: ViewStyle = {
  marginRight: 6
};

export const styles = StyleSheet.create({
  container: containerStyle,
  actionContainer: actionContainerStyle,
  tipButtonText: tipButtonTextStyle,
  tipButton: tipButtonStyle,
  tippersContainer: tippersContainerStyle,
  tippersIcon: tippersIconStyle,
  tippersText: tippersTextStyle,
  disabledText: disabledTextStyle
});
