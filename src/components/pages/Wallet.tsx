import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  TextStyle,
  ViewStyle,
  ScrollView,
  ImageStyle
} from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/navigation";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import {
  getUnclaimedReferrals,
  getMintableAmount
} from "../../store/selectors/me";
import { MintButton } from "../shared/MintButton";
import { Button, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import {
  Currency,
  CurrencyRole,
  CurrencyType
} from "../shared/elements/Currency";
import { fontSizes, fonts } from "../../helpers/fonts";
import { TextLink, LinkType } from "../shared/elements/TextLink";
import { Big } from "big.js";
import { MixedText } from "../shared/elements/MixedText";
import { FlaggedNotice } from "../shared/Cards/FlaggedNotice";
import { EnforcePermissionsButton } from "../shared/elements/EnforcePermissionsButton";
import { OperationType } from "@raha/api-shared/dist/models/Operation";
import { Config } from "@raha/api-shared/dist/helpers/Config";

type OwnProps = NavigationScreenProps<{}>;

type StateProps = {
  loggedInMember: Member;
  mintableAmount?: Big;
  unclaimedReferralIds?: MemberId[];
};

type Props = OwnProps & StateProps;

const MoneySection: React.StatelessComponent<Props> = ({ loggedInMember }) => {
  return (
    <React.Fragment>
      <View style={styles.financesSection}>
        <View>
          <Currency
            style={styles.balanceValue}
            currencyValue={{
              value: loggedInMember.get("balance"),
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>balance</Text>
        </View>
        <View style={styles.donationSection}>
          <View>
            <Currency
              style={styles.donationValue}
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
    </React.Fragment>
  );
};

const Actions: React.StatelessComponent<Props> = props => {
  const {
    loggedInMember,
    mintableAmount,
    unclaimedReferralIds,
    navigation
  } = props;
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

  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;

  // Show one action at a time: Mint or Invite.
  const canMint = mintableAmount && mintableAmount.gt(0);
  return (
    <View style={styles.actionsSection}>
      <FlaggedNotice restrictedFrom="minting" />
      {canMint ? (
        <MintButton style={styles.mintButton} />
      ) : (
        <Invite {...props} />
      )}
      {hasUnclaimedReferrals && (
        <EnforcePermissionsButton
          operationType={OperationType.MINT}
          style={styles.button}
          title={"Mint Invite Bonuses!"}
          onPress={() => {
            navigation.push(RouteName.ReferralBonusPage, {
              unclaimedReferralIds
            });
          }}
        />
      )}
      <View style={styles.pushDownSpacer} />
      <Image
        resizeMode="contain"
        style={styles.actionImage}
        source={require("../../assets/img/Mint.png")}
      />
    </View>
  );
};

const Invite: React.StatelessComponent<Props> = props => {
  const { navigation } = props;

  return (
    <React.Fragment>
      <View style={styles.section}>
        <Button
          style={styles.button}
          disabled={true}
          onPress={() => {}}
          title={"Come back soon to mint your basic income"}
        />
      </View>
      <View style={[styles.section, styles.sectionSpacer]}>
        <Text style={styles.header}>Want to mint more Raha?</Text>
        <MixedText
          content={[
            "Earn",
            {
              currencyType: CurrencyType.Raha,
              value: Config.getReferralBonus(),
              role: CurrencyRole.Transaction
            },
            "when friends you invite join Raha."
          ]}
        />
        <EnforcePermissionsButton
          operationType={OperationType.INVITE}
          style={styles.button}
          title="Invite a Friend"
          onPress={() => {
            navigation.push(RouteName.InvitePage);
          }}
        />
      </View>
    </React.Fragment>
  );
};

const WalletView: React.StatelessComponent<Props> = props => {
  return (
    <ScrollView bounces={false} contentContainerStyle={styles.page}>
      <MoneySection {...props} />
      <Actions {...props} />
    </ScrollView>
  );
};

const donationTextStyle: TextStyle = {
  ...fontSizes.xlarge
};

const balanceTextStyle: TextStyle = {
  ...fontSizes.xlarge
};

const numberLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};

const buttonStyle: ViewStyle = {
  marginVertical: 12
};

const sectionStyle: ViewStyle = {
  flexDirection: "column",
  alignItems: "stretch"
};

// shared to create consistent spacing
const sectionSpacerStyle: ViewStyle = {
  marginTop: 15
};

// pushes content on mint page down so image shows up on bottom rather than
// right after mint button.
const pushDownSpacerStyle: ViewStyle = {
  flex: 1
};

const financesSectionStyle: ViewStyle = {
  flex: 0, // don't expand to fill space
  alignSelf: "stretch", // take full width
  marginBottom: 10,

  // balance on left side, other financial info pushed to right.
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const donationSectionStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center"
};
const mintButtonStyle: ViewStyle = { ...sectionSpacerStyle, ...buttonStyle };

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  minHeight: "100%",
  padding: 20,
  flexDirection: "column",
  alignItems: "center"
};

const actionsSectionStyle: ViewStyle = {
  ...sectionSpacerStyle,
  ...sectionStyle,
  flex: 1
};

const actionsSectionGetVerifiedTextBlockStyle: TextStyle = {
  textAlign: "center",
  margin: 12
};

const actionImageStyle: ImageStyle = {
  marginTop: 8,
  flex: -1, // allow the image to shrink up to the min height
  flexBasis: 200,
  maxHeight: 200,
  minHeight: 150,
  maxWidth: "100%"
};

const headerStyle: TextStyle = {
  ...fonts.Lato.Semibold,
  ...fontSizes.large,
  textAlign: "center",
  marginBottom: 14
};

const styles = StyleSheet.create({
  page: pageStyle,
  sectionSpacer: sectionSpacerStyle,
  section: sectionStyle,
  mintButton: mintButtonStyle,
  financesSection: financesSectionStyle,
  donationSection: donationSectionStyle,
  actionImage: actionImageStyle,
  actionsSection: actionsSectionStyle,
  actionsSectionGetVerifiedTextBlock: actionsSectionGetVerifiedTextBlockStyle,
  balanceValue: balanceTextStyle,
  donationValue: donationTextStyle,
  numberLabel: numberLabelStyle,
  header: headerStyle,
  pushDownSpacer: pushDownSpacerStyle,
  button: buttonStyle
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
    mintableAmount: getMintableAmount(state, loggedInMember),
    unclaimedReferralIds: getUnclaimedReferrals(
      state,
      loggedInMember.get("memberId")
    )
  };
};

export const Wallet = connect(mapStateToProps)(WalletView);
