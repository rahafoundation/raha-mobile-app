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

type TipProps = {
  data: TipData;
};

/**
 * Call-to-action that is rendered in the feed below actors to allow the logged
 * in user to tip them.
 */
export class Tip extends React.Component<TipProps> {
  render() {
    const { tipTotal, fromMemberIds } = this.props.data;
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.tipButton}>
          <Icon name="caret-up" color={palette.darkMint} solid />
          <Text style={styles.tipButtonText}>Tip</Text>
        </View>
        {tipTotal.gt(0) && (
          <React.Fragment>
            <TouchableOpacity
              style={styles.tippersContainer}
              onPress={() => {
                // TODO: Go to TipList
              }}
            >
              <Text style={styles.tippersText}>{fromMemberIds.length}</Text>
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

export const styles = StyleSheet.create({
  tipButtonText: tipButtonTextStyle,
  tipButton: tipButtonStyle,
  tippersContainer: tippersContainerStyle,
  tippersIcon: tippersIconStyle,
  tippersText: tippersTextStyle
});
