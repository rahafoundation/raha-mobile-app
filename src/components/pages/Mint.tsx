import * as React from "react";
import { Big } from "big.js";
import { StyleSheet, View, Image, TextStyle, ViewStyle } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import { getUnclaimedReferrals } from "../../store/selectors/me";
import { MintButton } from "../shared/MintButton";
import { Button, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import {
  Currency,
  CurrencyRole,
  CurrencyType
} from "../shared/elements/Currency";
import { fontSizes } from "../../helpers/fonts";

type OwnProps = NavigationScreenProps<{}>;

type StateProps = {
  loggedInMember: Member;
  unclaimedReferralIds?: MemberId[];
};

type Props = OwnProps & StateProps;

const MoneySection: React.StatelessComponent<Props> = ({ loggedInMember }) => {
  const net = loggedInMember
    .get("balance")
    .minus(loggedInMember.get("totalMinted"));
  return (
    <React.Fragment>
      <View style={styles.balanceSection}>
        <View style={styles.moneyElement}>
          <Currency
            style={styles.currencyValue}
            currencyValue={{
              value: loggedInMember.get("balance"),
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>balance</Text>
        </View>
      </View>
      <View style={styles.donationSection}>
        <View style={styles.moneyElement}>
          <Currency
            style={styles.currencyValue}
            currencyValue={{
              value: loggedInMember.get("totalMinted"),
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>minted</Text>
        </View>
        <View style={styles.moneyElement}>
          <Currency
            style={styles.currencyValue}
            currencyValue={{
              value: net,
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>transactions</Text>
        </View>
        <View style={styles.moneyElement}>
          <Currency
            style={styles.currencyValue}
            currencyValue={{
              value: loggedInMember.get("totalDonated"),
              role: CurrencyRole.Donation,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>donated</Text>
        </View>
      </View>
    </React.Fragment>
  );
};

const Actions: React.StatelessComponent<Props> = props => {
  const { loggedInMember, unclaimedReferralIds, navigation } = props;
  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;

  if (loggedInMember.get("verifiedBy").size === 0) {
    return (
      <Text style={{ textAlign: "center", margin: 12 }}>
        You must be verified before you can mint Raha or invite new people.
      </Text>
    );
  }

  return (
    <View style={styles.actionsSection}>
      <Image
        resizeMode="contain"
        style={styles.actionImage}
        source={require("../../assets/img/Mint.png")}
      />
      <MintButton style={styles.mintButton} />
      <Image
        resizeMode="contain"
        style={[styles.actionImage, styles.sectionSpacer]}
        source={require("../../assets/img/Invite.png")}
      />
      <View style={styles.inviteSectionButtons}>
        <Button
          title="Invite"
          onPress={() => {
            navigation.navigate(RouteName.InvitePage);
          }}
        />
        <Button
          title={
            hasUnclaimedReferrals ? "Claim bonuses!" : "No bonuses available"
          }
          onPress={() => {
            navigation.navigate(RouteName.ReferralBonusPage, {
              unclaimedReferralIds
            });
          }}
          disabled={!hasUnclaimedReferrals}
        />
      </View>
    </View>
  );
};

const MintView: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.container}>
      <MoneySection {...props} />
      <Actions {...props} />
    </View>
  );
};

const currencyValueStyle: TextStyle = {
  ...fontSizes.large
};

const numberLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};

const sectionSpacer: ViewStyle = {
  marginTop: 20
};

const donationSectionStyle: ViewStyle = {
  ...sectionSpacer,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start"
};

const balanceSectionStyle: ViewStyle = {};

const moneyElementStyle: ViewStyle = { marginRight: 20 };

const mintButtonStyle: ViewStyle = { ...sectionSpacer };
const inviteSectionButtonsStyle: ViewStyle = {
  ...sectionSpacer,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-evenly"
};

const containerStyle: ViewStyle = {
  padding: 20
};

const actionsSectionStyle: ViewStyle = {
  marginTop: 20
};

const actionImageStyle: ViewStyle = {
  // shrink images to ensure screen doesn't overflow
  maxWidth: "100%",
  maxHeight: 150
};

const styles = StyleSheet.create({
  container: containerStyle,
  sectionSpacer,
  mintButton: mintButtonStyle,
  balanceSection: balanceSectionStyle,
  donationSection: donationSectionStyle,
  moneyElement: moneyElementStyle,
  actionImage: actionImageStyle,
  actionsSection: actionsSectionStyle,
  inviteSectionButtons: inviteSectionButtonsStyle,
  currencyValue: currencyValueStyle,
  numberLabel: numberLabelStyle
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    // TODO: gracefully deal with this situation.
    console.error("Member not logged in, should not have gotten here.");
    return {} as StateProps;
  }
  return {
    loggedInMember,
    unclaimedReferralIds: getUnclaimedReferrals(
      state,
      loggedInMember.get("memberId")
    )
  };
};

export const Mint = connect(mapStateToProps)(MintView);
