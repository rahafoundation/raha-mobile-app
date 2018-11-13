import * as React from "react";
import { Big } from "big.js";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableHighlight
} from "react-native";
import { fontSizes, fonts } from "../../../helpers/fonts";
import { palette } from "../../../helpers/colors";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Text } from "../elements";
import { TipData } from "../../../store/selectors/stories/types";
import { CurrencyRole, CurrencyType, Currency } from "../elements/Currency";
import { connect, MapStateToProps } from "react-redux";
import { RahaState } from "../../../store";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { tip } from "../../../store/actions/wallet";
import { generateRandomIdentifier } from "../../../helpers/identifiers";
import { OperationId } from "@raha/api-shared/dist/models/identifiers";
import { ApiCallStatus } from "../../../store/reducers/apiCalls";
import { getStatusOfApiCall } from "../../../store/selectors/apiCalls";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

type StateProps = {
  // loggedInMember?: Member;
  // getMemberById: (memberId: MemberId) => Member | undefined;
  apiCallStatus: ApiCallStatus | undefined;
};

type DispatchProps = {
  tip: typeof tip;
};

type OwnProps = {
  data: TipData;
};

type TipProps = OwnProps & DispatchProps & StateProps;

type TipState = {
  // Independent tip button presses are batched and sent every 5 seconds or on
  // unmount to give the user a chance to cancel.
  pendingTipAmount?: Big;
  pendingTipId?: OperationId;
};

const TIP_INCREMENT = new Big(0.1);
const CANCEL_INTERVAL_MS = 3000;

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
export class TipView extends React.Component<TipProps, TipState> {
  pendingTimer?: any;

  constructor(props: TipProps) {
    super(props);
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
        // TODO(tina): reset timer every time user presses up
        const newAmount = state.pendingTipAmount
          ? state.pendingTipAmount.add(TIP_INCREMENT)
          : new Big(TIP_INCREMENT);
        console.log("YOLO", "setting the tip to " + newAmount);
        return {
          pendingTipAmount: newAmount
        };
      },
      () => {
        console.log("YOLO", "set timer for " + this.state.pendingTipAmount);
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
        pendingTipAmount: undefined
      };
    });
  };

  render() {
    const { tipTotal, fromMemberIds } = this.props.data;
    const { pendingTipAmount } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.tipButton}
            onPressIn={this._onTipButtonPressIn}
            onPressOut={this._onTipButtonPressOut}
            onPress={this._onTipButtonPressed}
          >
            <Icon name="caret-up" size={20} color={palette.darkMint} solid />
            <Text style={styles.tipButtonText}>Tip</Text>
          </TouchableOpacity>

          {pendingTipAmount && (
            //TODO(tina): first render is so slow
            // {/* TODO(tina): animate countdown circle */}
            <React.Fragment>
              <Currency
                style={styles.pendingTip}
                currencyValue={{
                  value: pendingTipAmount,
                  role: CurrencyRole.Transaction,
                  currencyType: CurrencyType.Raha
                }}
              />
              <Icon
                style={styles.pendingCancel}
                name="times-circle"
                color={palette.red}
                size={20}
                onPress={this._onCancelTipPressed}
                solid
              />
            </React.Fragment>
          )}
        </View>
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
  alignItems: "center"
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
  marginRight: 8,
  paddingVertical: 8
};

const pendingCancelStyle: ViewStyle = {
  paddingRight: 4,
  paddingVertical: 8
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
  return {
    apiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.TIP,
      tipCallApiId(ownProps.data)
    )
  };
};

export const Tip = connect(
  mapStateToProps,
  { tip }
)(TipView);
