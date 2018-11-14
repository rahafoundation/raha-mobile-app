/**
 * Renders the tip action button. When pressed, the tip is incremented and
 * batched after some time interval. During that time, the user is allowed to
 * cancel the pending tip. If the pending tip isn't canceled, it's sent and
 * displayed until the action component fades out.
 */
import * as React from "react";
import { Big } from "big.js";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated
} from "react-native";
import { fontSizes, fonts } from "../../../../helpers/fonts";
import { palette } from "../../../../helpers/colors";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Text } from "../../elements";
import { CurrencyRole, CurrencyType, Currency } from "../../elements/Currency";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../../store";
import { tip } from "../../../../store/actions/wallet";
import { OperationId } from "@raha/api-shared/dist/models/identifiers";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import CountdownCircle from "../../elements/CountdownCircle";

type StateProps = {
  // getMemberById: (memberId: MemberId) => Member | undefined;
  apiCallStatus: ApiCallStatus | undefined;
};

type DispatchProps = {
  tip: typeof tip;
};

type OwnProps = {
  sendTip: (amount: Big) => void;
  apiCallId?: string;
};

type TipProps = OwnProps & DispatchProps & StateProps;

type TipState = {
  // Independent tip button presses are batched and sent every 5 seconds or on
  // unmount to give the user a chance to cancel.
  pendingTipAmount?: Big;
  pendingTipId?: OperationId;

  // TODO(tina): REMOVE TEXT
  callStatus?: ApiCallStatusType;
};

const TIP_INCREMENT = new Big(0.1);
const CANCEL_INTERVAL_MS = 1000; // TODO(tina): increase timeout

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class TipActionView extends React.Component<TipProps, TipState> {
  pendingTimer?: any;
  countdownCircle: CountdownCircle | null;

  constructor(props: TipProps) {
    super(props);
    this.countdownCircle = null;
    this.state = {
      pendingTipAmount: undefined
    };
  }

  private _onCancelTipPressed = () => {
    this._cancelPendingSendTip();
    this.setState({
      pendingTipAmount: undefined
    });
  };

  private _cancelPendingSendTip = () => {
    if (!this.pendingTimer) {
      return;
    }
    clearTimeout(this.pendingTimer);
    if (this.countdownCircle) {
      this.countdownCircle.pauseAnimation();
    }
    this.pendingTimer = undefined;
  };

  private _onTipButtonPressIn = () => {
    console.log("YOLO", "press in");
    // TODO(tina): Long-press should keep incrementing
  };

  private _onTipButtonPressOut = () => {
    console.log("YOLO", "press out");
  };

  private _onTipButtonPressed = () => {
    this._cancelPendingSendTip();
    this.setState(
      state => {
        const newAmount = state.pendingTipAmount
          ? state.pendingTipAmount.add(TIP_INCREMENT)
          : new Big(TIP_INCREMENT);
        return {
          pendingTipAmount: newAmount
        };
      },
      () => {
        console.log("YOLO", "set timer for " + this.state.pendingTipAmount);
        if (this.countdownCircle) {
          this.countdownCircle.restartAnimation();
        }
        this.pendingTimer = setTimeout(
          this._sendTip,
          CANCEL_INTERVAL_MS,
          this.state.pendingTipAmount
        );
      }
    );
  };

  private _sendTip = (pendingTipAmount: Big) => {
    // TODO(tina): animation when sending, disable button
    console.log("YOLO", "sending tip for " + pendingTipAmount);

    // this.props.tip(
    //   tipCallApiId(this.props.data),
    //   this.props.data.toMemberId,
    //   TIP_INCREMENT,
    //   this.props.data.targetOperationId
    // );
    this.setState(state => {
      if (
        !state.pendingTipAmount ||
        !pendingTipAmount.eq(state.pendingTipAmount)
      ) {
        console.warn(
          "Current state amount " +
            state.pendingTipAmount +
            " does not match expected sent amount " +
            pendingTipAmount
        );
      }
      return {
        // pendingTipAmount: undefined,
        // TODO(tina): REMOVE test
        callStatus: ApiCallStatusType.STARTED
      };
    });

    // TODO(tina): REMOVE test
    setTimeout(() => {
      this.setState({
        callStatus: ApiCallStatusType.SUCCESS
      });

      // TODO: animate and then remove pendingTipAmount
    }, 5000);
  };

  // TODO(tina): First render is so slow
  private _renderPendingTip = () => {
    const pendingTipAmount = this.state.pendingTipAmount;
    if (!pendingTipAmount) {
      return undefined;
    }
    const disableTipAction =
      !!this.props.apiCallStatus &&
      this.props.apiCallStatus.status !== ApiCallStatusType.SUCCESS;
    return (
      <Animated.View style={{ flexDirection: "row" }}>
        {/* TODO: Allow user to send custom amount by tapping on this */}
        <Currency
          style={styles.pendingTip}
          currencyValue={{
            value: pendingTipAmount,
            role: CurrencyRole.Transaction,
            currencyType: CurrencyType.Raha
          }}
        />
        <TouchableWithoutFeedback
          onPress={this._onCancelTipPressed}
          disabled={disableTipAction}
        >
          <View style={styles.pendingCancel}>{this._renderIcon()}</View>
        </TouchableWithoutFeedback>
      </Animated.View>
    );
  };

  private _renderIcon = () => {
    const tipApiCallStatus = this.state.callStatus;
    if (!tipApiCallStatus) {
      return (
        <CountdownCircle
          ref={ref => (this.countdownCircle = ref)}
          millis={CANCEL_INTERVAL_MS}
          radius={10}
          color={palette.red}
          bgColor={palette.white}
          shadowColor={palette.lightGray}
          borderWidth={2}
        >
          <Icon name="times-circle" color={palette.red} size={14} solid />
        </CountdownCircle>
      );
    }

    switch (tipApiCallStatus) {
      case ApiCallStatusType.STARTED:
        return <ActivityIndicator />;
      case ApiCallStatusType.FAILURE:
        // TODO(tina): Display dropdown.
        <Icon name="check-frown" color={palette.red} size={14} solid />;
      case ApiCallStatusType.SUCCESS:
        return (
          <Icon
            style={{ padding: 3 }}
            name="check-circle"
            color={palette.darkMint}
            size={14}
            solid
          />
        );
    }
  };

  render() {
    const disableTipAction =
      !!this.props.apiCallStatus &&
      this.props.apiCallStatus.status !== ApiCallStatusType.SUCCESS;
    return (
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.tipButton} // TODO(tina): disabled style
          disabled={disableTipAction}
          onPressIn={this._onTipButtonPressIn}
          onPressOut={this._onTipButtonPressOut}
          onPress={this._onTipButtonPressed}
        >
          <Icon name="caret-up" size={20} color={palette.darkMint} solid />
          <Text style={styles.tipButtonText}>Tip</Text>
        </TouchableOpacity>
        {this._renderPendingTip()}
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

const pendingTipStyle: TextStyle = {
  ...fontSizes.small,
  marginLeft: 8,
  paddingVertical: 8
};

const pendingCancelStyle: ViewStyle = {
  paddingVertical: 8,
  paddingHorizontal: 6,
  justifyContent: "center"
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

export const styles = StyleSheet.create({
  container: containerStyle,
  actionContainer: actionContainerStyle,
  pendingTip: pendingTipStyle,
  pendingCancel: pendingCancelStyle,
  tipButtonText: tipButtonTextStyle,
  tipButton: tipButtonStyle,
  tippersContainer: tippersContainerStyle,
  tippersIcon: tippersIconStyle,
  tippersText: tippersTextStyle
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const { apiCallId } = ownProps;
  return {
    apiCallStatus: apiCallId
      ? getStatusOfApiCall(state, ApiEndpointName.TIP, apiCallId)
      : undefined
  };
};

export const TipAction = connect(
  mapStateToProps,
  { tip }
)(TipActionView);
