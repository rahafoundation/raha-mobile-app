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
import { TipAction } from "./TipAction";

type StateProps = {
  // getMemberById: (memberId: MemberId) => Member | undefined;
  apiCallStatus: ApiCallStatus | undefined;
};

type DispatchProps = {
  tip: typeof tip;
};

type OwnProps = {
  data: TipData;
};

type TipCallToActionProps = OwnProps & DispatchProps & StateProps;

type TipCallToActionState = {
  // Independent tip button presses are batched and sent every 5 seconds or on
  // unmount to give the user a chance to cancel.
  pendingTipAmount?: Big;
  pendingTipId?: OperationId;

  // TODO(tina): REMOVE TEXT
  callStatus?: ApiCallStatusType;
};

const TIP_INCREMENT = new Big(0.1);
const CANCEL_INTERVAL_SEC = 3;
const CANCEL_INTERVAL_MS = CANCEL_INTERVAL_SEC * 1000;

/**
 * ID used for the tip API call so that we can check on the status
 */
function tipCallApiId(data: TipData): string {
  return data.toMemberId + data.targetOperationId;
}

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class TipCallToActionView extends React.Component<
  TipCallToActionProps,
  TipCallToActionState
> {
  pendingTimer?: any;
  countdownCircle: CountdownCircle | null;

  constructor(props: TipCallToActionProps) {
    super(props);
    this.countdownCircle = null;
    this.state = {
      pendingTipAmount: undefined
    };
  }

  // TODO(tina): When navigating to another page, it won't call unmount
  componentWillUnmount() {
    console.log(
      "YOLO",
      "tip component will unmount " +
        this.props.data.toMemberId +
        " maybe send " +
        this.state.pendingTipAmount
    );
    this._cancelPendingSendTip();
    const pendingTip = this.state.pendingTipAmount;
    if (pendingTip) {
      this._sendTip(pendingTip);
    }
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

  render() {
    const { tipTotal, fromMemberIds } = this.props.data;
    return (
      <View style={styles.container}>
        <TipAction sendTip={this._sendTip} apiCallId={this.state.callStatus} />
        {tipTotal.gt(0) && (
          <TouchableOpacity
            style={styles.tippersContainer}
            onPress={() => {
              // TODO(tina): Go to TipList
            }}
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
  tippersContainer: tippersContainerStyle,
  tippersIcon: tippersIconStyle,
  tippersText: tippersTextStyle
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  ownProps
) => {
  return {
    apiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.TIP,
      tipCallApiId(ownProps.data)
    )
  };
};

export const TipCallToAction = connect(
  mapStateToProps,
  { tip }
)(TipCallToActionView);
