import * as React from "react";
import { Big } from "big.js";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle
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
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class TipView extends React.Component<TipProps, TipState> {
  state = {
    pendingTipAmount: undefined
  };

  // this.timerInterval = setInterval(this._updateTimeLeft, 1000);

  id?: string;
  componentDidUpdate() {
    console.log(
      "YOLO",
      "state is now " +
        (this.props.apiCallStatus ? this.props.apiCallStatus.status : undefined)
    );
  }

  private _onTipButtonPressed = () => {
    this.setState(state => {
      // TODO(tina): reset timer every time user presses up
      return {
        pendingTipAmount: state.pendingTipAmount
          ? state.pendingTipAmount.add(TIP_INCREMENT)
          : new Big(TIP_INCREMENT)
      };
    });
    // this.id = generateRandomIdentifier();
    // this.id = this.props.data.toMemberId + this.props.data.targetOperationId;
    // console.log("YOLO", "sending tip " + this.id);
    // this.props.tip(
    //   this.id,
    //   this.props.data.toMemberId,
    //   TIP_INCREMENT,
    //   this.props.data.targetOperationId
    // );
  };

  private _sendTip = () => {};

  render() {
    const { tipTotal, fromMemberIds } = this.props.data;
    const { pendingTipAmount } = this.state;
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "relative"
        }}
      >
        {/* <View style={{ position: "relative" }}> */}
        {pendingTipAmount && (
          //TODO(tina): first render is so slow
          <View style={styles.pendingTip}>
            {/* TODO(tina): animate countdown circle */}
            <Icon
              style={styles.pendingCancel}
              name="times-circle"
              color={palette.red}
              size={14}
              solid
            />
            <Currency
              style={{ ...fontSizes.small }}
              currencyValue={{
                value: pendingTipAmount,
                role: CurrencyRole.Transaction,
                currencyType: CurrencyType.Raha
              }}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.tipButton}
          onPress={this._onTipButtonPressed}
        >
          <Icon name="caret-up" color={palette.darkMint} solid />
          <Text style={styles.tipButtonText}>Tip</Text>
        </TouchableOpacity>
        {/* </View> */}

        {tipTotal.gt(0) && (
          <React.Fragment>
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
            </TouchableOpacity>
            <Currency
              style={{ ...fontSizes.small }}
              currencyValue={{
                value: new Big(tipTotal),
                role: CurrencyRole.Transaction,
                currencyType: CurrencyType.Raha
              }}
            />
          </React.Fragment>
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
  marginRight: 6,
  paddingHorizontal: 6,
  borderRadius: 3,
  borderWidth: 2,
  borderColor: palette.lightGray,
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

const pendingTipStyle: ViewStyle = {
  flexDirection: "row",
  position: "absolute",
  padding: 6,
  borderColor: palette.lightGray,
  borderRadius: 16,
  borderWidth: 2,
  bottom: "90%", // Slight overlap to associate with the tip button
  backgroundColor: palette.white,
  alignItems: "center",
  zIndex: 1, // Bring to front
  // TODO: Horizontally center. For now it's fixed to what looked nice because the
  // method I found was using translateX(-50%) which isn't available in RN.
  left: -8
};

const pendingCancelStyle: ViewStyle = {
  paddingRight: 4
};

export const styles = StyleSheet.create({
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
  const loggedInMember = getLoggedInMember(state);
  return {
    apiCallStatus: getStatusOfApiCall(
      state,
      ApiEndpointName.TIP,
      ownProps.data.toMemberId + ownProps.data.targetOperationId
    )
  };
};

export const Tip = connect(
  mapStateToProps,
  { tip }
)(TipView);
