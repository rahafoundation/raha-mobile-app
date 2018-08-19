import * as React from "react";
import { Big } from "big.js";
import { StyleSheet, View, Image, TextStyle } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import { getUnclaimedReferrals } from "../../store/selectors/me";
import { MintButton } from "../shared/MintButton";
import { Button, Container, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import { Currency, CurrencyRole, CurrencyType } from "../shared/elements/Currency";
import { fontSizes } from "../../helpers/fonts";

type OwnProps = NavigationScreenProps<{}>;

type StateProps = {
  loggedInMember: Member;
  unclaimedReferralIds?: MemberId[];
};

type Props = OwnProps & StateProps;

const MintView: React.StatelessComponent<Props> = ({
  loggedInMember,
  unclaimedReferralIds,
  navigation
}) => {
  let net = loggedInMember
    .get("balance")
    .minus(loggedInMember.get("totalMinted"));

  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;

  const navigateToReferralBonuses = hasUnclaimedReferrals
    ? () => {
        navigation.navigate(RouteName.ReferralBonusPage, {
          unclaimedReferralIds
        });
      }
    : () => {};

  return (
    <Container>
      <View style={styles.centerFlex}>
        <Currency
          style={fontSizes.large}
          currencyValue={{
            value: loggedInMember.get("balance"),
            role: CurrencyRole.Transaction,
            currencyType: CurrencyType.Raha
          }}
        />
        <Text style={styles.numberLabel}>balance</Text>
      </View>
      <View
        style={[
          styles.centerFlex,
          { flexDirection: "row", marginHorizontal: 10 }
        ]}
      >
        <View style={styles.centerFlex}>
          <Currency
            style={styles.subStat}
            currencyValue={{
              value: loggedInMember.get("totalMinted"),
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>minted</Text>
        </View>
        <View style={styles.centerFlex}>
          <Currency
            style={styles.subStat}
            currencyValue={{
              value: net,
              role: CurrencyRole.Transaction,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>transactions</Text>
        </View>
        <View style={styles.centerFlex}>
          <Currency
            style={styles.subStat}
            currencyValue={{
              value: loggedInMember.get("totalDonated"),
              role: CurrencyRole.Donation,
              currencyType: CurrencyType.Raha
            }}
          />
          <Text style={styles.numberLabel}>donated</Text>
        </View>
      </View>
      <View style={[styles.centerFlex, { marginBottom: 12, flex: 2 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1, margin: 8 }}
          source={require("../../assets/img/Mint.png")}
        />
        <MintButton />
      </View>
      <View style={[styles.centerFlex, { marginBottom: 12, flex: 2 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1, margin: 8 }}
          source={require("../../assets/img/Invite.png")}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "90%"
          }}
        >
          <Button
            title={[
              "Invite",
              {
                value: new Big(60),
                role: CurrencyRole.None,
                currencyType: CurrencyType.Raha
              }
            ]}
            onPress={() => {
              navigation.navigate(RouteName.InvitePage);
            }}
          />
          {hasUnclaimedReferrals ? (
            <Button
              title="Claim bonuses!"
              onPress={() => {
                navigation.navigate(RouteName.ReferralBonusPage, {
                  unclaimedReferralIds
                });
              }}
            />
          ) : (
            undefined
          )}
        </View>
      </View>
    </Container>
  );
};

const subStatStyle: TextStyle = fontSizes.large;
const numberLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};
const styles = StyleSheet.create({
  centerFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  subStat: subStatStyle,
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
