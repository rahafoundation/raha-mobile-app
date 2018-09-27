import * as React from "react";
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
import { TextLink, LinkType } from "../shared/elements/TextLink";

type OwnProps = NavigationScreenProps<{}>;

type StateProps = {
  loggedInMember: Member;
  unclaimedReferralIds?: MemberId[];
};

type Props = OwnProps & StateProps;

const MoneySection: React.StatelessComponent<Props> = ({ loggedInMember }) => {
  return (
    <View style={styles.financesSection}>
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
              value: loggedInMember.get("totalDonated"),
              role: CurrencyRole.Donation,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>donated</Text>
        </View>
      </View>
    </View>
  );
};

const Actions: React.StatelessComponent<Props> = props => {
  const { loggedInMember, unclaimedReferralIds, navigation } = props;
  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;
  if (!loggedInMember.get("isVerified")) {
    return (
      <View style={[styles.actionsSection, { justifyContent: "center" }]}>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          You must be verified before you can mint Raha or invite new people.
        </Text>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          If you already know someone else in the Raha network, ask them to
          verify your account.
        </Text>
        <Text style={styles.actionsSectionGetVerifiedTextBlock}>
          Otherwise, the Raha team is currently helping those who aren't
          connected to other people in the network get verified. Email us at{" "}
          <TextLink
            destination={{
              type: LinkType.Website,
              url: "mailto:hello@raha.app"
            }}
          >
            hello@raha.app
          </TextLink>
          !
        </Text>
      </View>
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

const WalletView: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.page}>
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

// shared to create consistent spacing
const sectionSpacer: ViewStyle = {
  marginTop: 20
};

const financesSectionStyle: ViewStyle = {
  flex: 0, // don't expand to fill space
  alignSelf: "stretch", // take full width
  marginBottom: 20,

  // balance on left side, other financial info pushed to right.
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const donationSectionStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start"
};
const balanceSectionStyle: ViewStyle = {};
const moneyElementStyle: ViewStyle = { marginRight: 20 };
const mintButtonStyle: ViewStyle = { ...sectionSpacer };

const inviteSectionButtonsStyle: ViewStyle = {
  ...sectionSpacer,

  alignSelf: "stretch",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-evenly"
};

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  height: "100%",
  padding: 20,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between"
};

const actionsSectionStyle: ViewStyle = {
  ...sectionSpacer,
  flex: 1,

  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between"
};

const actionsSectionGetVerifiedTextBlockStyle: TextStyle = {
  textAlign: "center",
  margin: 12
};

const actionImageStyle: ViewStyle = {
  // shrink images to ensure screen doesn't overflow
  flex: -1,
  flexBasis: 200,
  maxWidth: "100%"
};

const styles = StyleSheet.create({
  page: pageStyle,
  sectionSpacer,
  mintButton: mintButtonStyle,
  financesSection: financesSectionStyle,
  balanceSection: balanceSectionStyle,
  donationSection: donationSectionStyle,
  moneyElement: moneyElementStyle,
  actionImage: actionImageStyle,
  actionsSection: actionsSectionStyle,
  actionsSectionGetVerifiedTextBlock: actionsSectionGetVerifiedTextBlockStyle,
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

export const Wallet = connect(mapStateToProps)(WalletView);
