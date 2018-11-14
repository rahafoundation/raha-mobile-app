/**
 * Tipping call to action row that displays tipping action and how many tips the
 * Story had received.
 */
// TODO TODAY: Send tip fadeout and restart, TipList, clean up components
// TODO TOMORROW: polish on navigation away, press and hold
// TODO P1: Edit text for amount

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
import { generateRandomIdentifier } from "../../../../helpers/identifiers";

type StateProps = {
  // getMemberById: (memberId: MemberId) => Member | undefined;
  // apiCallStatus: ApiCallStatus | undefined;
};

type DispatchProps = {
  tip: typeof tip;
};

type OwnProps = {
  data: TipData;
};

type TipCallToActionProps = OwnProps & DispatchProps & StateProps;

type TipCallToActionState = {
  isTipSending?: boolean;

  // TODO(tina): REMOVE TEXT
  callStatus?: ApiCallStatusType;

  pendingTipAmount?: Big;
};

const TIP_INCREMENT = new Big(0.1);
const CANCEL_INTERVAL_SEC = 3;
const CANCEL_INTERVAL_MS = CANCEL_INTERVAL_SEC * 1000;

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class TipCallToActionView extends React.Component<
  TipCallToActionProps,
  TipCallToActionState
> {
  constructor(props: TipCallToActionProps) {
    super(props);
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
    console.log("YOLO", "press in");
    // TODO(tina): Long-press should keep incrementing
  };

  private _onTipButtonPressOut = () => {
    console.log("YOLO", "press out");
  };

  private _onTipButtonPressed = () => {
    // // this._cancelPendingSendTip();
    this.setState(state => {
      const newAmount = state.pendingTipAmount
        ? state.pendingTipAmount.add(TIP_INCREMENT)
        : new Big(TIP_INCREMENT);
      return {
        pendingTipAmount: newAmount
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
            style={styles.tipButton} // TODO(tina): disabled style
            disabled={this.state.isTipSending}
            onPressIn={this._onTipButtonPressIn}
            onPressOut={this._onTipButtonPressOut}
            onPress={this._onTipButtonPressed}
          >
            <Icon name="caret-up" size={20} color={palette.darkMint} solid />
            <Text style={styles.tipButtonText}>Tip</Text>
          </TouchableOpacity>
          {pendingTipAmount && (
            <TipAction
              pendingTipAmount={pendingTipAmount}
              // TODO(tina): clean
              id={
                this.props.data.targetOperationId + this.props.data.toMemberId
              }
              // id={generateRandomIdentifier()}
            />
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
  return {};
};

export const TipCallToAction = connect(
  mapStateToProps,
  { tip }
)(TipCallToActionView);
