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
  // Unique ID for the latest tip transaction, used to track the API call.
  tipId: string;

  // The pending amount. Whenever this is changed, the timer will restart.
  pendingTipAmount: Big;

  // Callbacks after sending completed and the pending tip component has faded out.
  onSending?: () => void;
  onSent?: () => void;
  onSendFailed?: () => void;
  onCanceled?: () => void;
};

type TipProps = OwnProps & DispatchProps & StateProps;

type TipState = {
  pendingTipId?: OperationId;
  fadeAnimation: Animated.Value;
};

const CANCEL_INTERVAL_MS = 5000;

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class PendingTipView extends React.PureComponent<TipProps, TipState> {
  pendingTimer?: any;
  countdownCircle: CountdownCircle | null;

  constructor(props: TipProps) {
    super(props);
    this.countdownCircle = null;
    this.state = {
      fadeAnimation: new Animated.Value(1)
    };
  }

  // TODO(tina): Don't update on API ID change
  // shouldComponentUpdate()
  componentDidMount() {
    this._schedulePendingTip();
  }

  componentDidUpdate(prevProps: TipProps) {
    if (prevProps.apiCallStatus !== this.props.apiCallStatus) {
      console.log("YOLO", "status changed ");
      // TODO(tina): send after animation
      // const status = this.props.apiCallStatus;
      // if (status) {
      //   switch (status.status) {
      //     case ApiCallStatusType.STARTED:
      //       if (this.props.onSending) {
      //         this.props.onSending();
      //       }
      //       break;
      //     case ApiCallStatusType.SUCCESS:
      //       if (this.props.onSent) {
      //         this.props.onSent();
      //       }
      //       break;
      //     case ApiCallStatusType.FAILURE:
      //       if (this.props.onSendFailed) {
      //         this.props.onSendFailed();
      //       }
      //   }
      // }
    }

    if (prevProps.pendingTipAmount !== this.props.pendingTipAmount) {
      this._schedulePendingTip();
    }
  }

  private _getInitialState(props: TipProps) {
    return {
      fadeAnimation: new Animated.Value(0)
    };
  }

  private _onApiCallCompleted = () => {
    // TODO(tina): animate out then call the callback
  };

  private _schedulePendingTip = () => {
    console.log("YOLO", "set timer for " + this.props.pendingTipAmount);
    if (this.countdownCircle) {
      this.countdownCircle.restartAnimation();
    }
    this.pendingTimer = setTimeout(
      this._sendTip,
      CANCEL_INTERVAL_MS,
      this.props.pendingTipAmount
    );
  };

  private _onCancelTipPressed = () => {
    this._cancelPendingSendTip();
    if (this.props.onCanceled) {
      this.props.onCanceled();
    }
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

  private _sendTip = (pendingTipAmount: Big) => {
    // TODO(tina): animation when sending, disable button
    console.log("YOLO", "sending tip for " + pendingTipAmount);
    if (this.props.onSending) {
      this.props.onSending();
    }
    // this.props.tip(
    //   tipCallApiId(this.props.data),
    //   this.props.data.toMemberId,
    //   TIP_INCREMENT,
    //   this.props.data.targetOperationId
    // );

    // TODO(tina): REMOVE test
    setTimeout(() => {
      if (this.props.onSent) {
        this.props.onSent();
      }
      // TODO: animate and then remove pendingTipAmount
    }, 5000);
  };

  private _renderIcon = () => {
    const tipApiCallStatus = this.props.apiCallStatus
      ? this.props.apiCallStatus.status
      : undefined;
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

  // TODO(tina): First render is so slow
  render() {
    const disableTipAction =
      !!this.props.apiCallStatus &&
      this.props.apiCallStatus.status !== ApiCallStatusType.SUCCESS;
    return (
      <Animated.View style={{ flexDirection: "row" }}>
        {/* TODO: Allow user to send custom amount by tapping on this */}
        <Currency
          style={styles.pendingTip}
          currencyValue={{
            value: this.props.pendingTipAmount,
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
  const { tipId } = ownProps;
  return {
    apiCallStatus: tipId
      ? getStatusOfApiCall(state, ApiEndpointName.TIP, tipId)
      : undefined
  };
};

export const PendingTip = connect(
  mapStateToProps,
  { tip }
)(PendingTipView);
