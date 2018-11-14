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
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated
} from "react-native";
import { fontSizes } from "../../../../helpers/fonts";
import { palette } from "../../../../helpers/colors";
import Icon from "react-native-vector-icons/FontAwesome5";
import { CurrencyRole, CurrencyType, Currency } from "../../elements/Currency";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../../store";
import { tip } from "../../../../store/actions/wallet";
import {
  ApiCallStatus,
  ApiCallStatusType
} from "../../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import CountdownCircle from "../../elements/CountdownCircle";
import { TipData } from "../../../../store/selectors/stories/types";
import { DropdownType } from "../../../../store/reducers/dropdown";
import { displayDropdownMessage } from "../../../../store/actions/dropdown";
import { getMemberById } from "../../../../store/selectors/members";
import { Member } from "../../../../store/reducers/members";

type StateProps = {
  toMember: Member | undefined;
  apiCallStatus: ApiCallStatus | undefined;
};

type DispatchProps = {
  tip: typeof tip;
  displayDropdownMessage: (
    type: DropdownType,
    title: string,
    message: string
  ) => void;
};

type OwnProps = {
  data: TipData;

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

  componentDidMount() {
    this._schedulePendingTip();
  }

  componentDidUpdate(prevProps: TipProps) {
    const { apiCallStatus } = this.props;
    if (prevProps.apiCallStatus !== apiCallStatus) {
      if (apiCallStatus) {
        this._onApiStatusChanged(apiCallStatus.status);
      }
    }

    if (prevProps.pendingTipAmount !== this.props.pendingTipAmount) {
      this._schedulePendingTip();
    }
  }

  private _onApiStatusChanged = (status: ApiCallStatusType) => {
    switch (status) {
      // TODO(tina): Remove these temporary holds for animations
      case ApiCallStatusType.SUCCESS:
        setTimeout(() => {
          if (this.props.onSent) {
            this.props.onSent();
          }
        }, 2000);
        break;
      case ApiCallStatusType.FAILURE: {
        const toMember = this.props.toMember;
        if (toMember) {
          this.props.displayDropdownMessage(
            DropdownType.ERROR,
            "Error sending tip",
            "Tip to " +
              toMember.get("fullName") +
              " wasn't sent. Please try again."
          );
        }
        setTimeout(() => {
          if (this.props.onSendFailed) {
            this.props.onSendFailed();
          }
        }, 2000);
        break;
      }
      case ApiCallStatusType.STARTED:
      // No action; the callback gets called the moment the timer expires
      default:
    }
  };

  private _schedulePendingTip = () => {
    this._cancelPendingSendTip();
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
    if (this.props.onSending) {
      this.props.onSending();
    }
    this.props.tip(
      this.props.tipId,
      this.props.data.toMemberId,
      pendingTipAmount,
      this.props.data.targetOperationId
    );
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
        return (
          <Icon
            style={{ padding: 3 }}
            name="frown"
            color={palette.red}
            size={14}
            solid
          />
        );
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

export const styles = StyleSheet.create({
  pendingTip: pendingTipStyle,
  pendingCancel: pendingCancelStyle
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  const { tipId } = ownProps;
  return {
    toMember: getMemberById(state, ownProps.data.toMemberId),
    apiCallStatus: tipId
      ? getStatusOfApiCall(state, ApiEndpointName.TIP, tipId)
      : undefined
  };
};

export const PendingTip = connect(
  mapStateToProps,
  {
    tip,
    displayDropdownMessage
  }
)(PendingTipView);
