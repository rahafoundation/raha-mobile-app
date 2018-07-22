import * as React from "react";
import { StyleSheet, View, Image } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { MemberId } from "@raha/api/dist/shared/models/identifiers";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { NavigationScreenProps } from "react-navigation";
import { getUnclaimedReferrals } from "../../store/selectors/me";
import { MintButton } from "../shared/MintButton";
import { Button, Container, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";

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
  let net = loggedInMember.balance.minus(loggedInMember.totalMinted).toString();
  let netColor;
  if (net.substr(0, 1) === "-") {
    netColor = colors.danger;
  } else {
    netColor = colors.darkAccent;
    net = `+${net}`;
  }

  const hasUnclaimedReferrals = unclaimedReferralIds
    ? unclaimedReferralIds.length > 0
    : false;

  const navigateToReferralBonuses = hasUnclaimedReferrals
    ? () => {
        navigation.navigate(RouteName.ReferralBonus, { unclaimedReferralIds });
      }
    : () => {};

  return (
    <Container>
      <View style={styles.centerFlex}>
        <Text style={{ fontSize: 36 }}>
          ℝ{loggedInMember.balance.toString()}
        </Text>
        <Text style={styles.numberLabel}>balance</Text>
      </View>
      <View
        style={[
          styles.centerFlex,
          { flexDirection: "row", marginHorizontal: 10 }
        ]}
      >
        <View style={styles.centerFlex}>
          <Text style={styles.subStat}>
            ℝ{loggedInMember.totalMinted.toString()}
          </Text>
          <Text style={styles.numberLabel}>minted</Text>
        </View>
        <View style={styles.centerFlex}>
          <Text style={[styles.subStat, { color: netColor }]}>ℝ{net}</Text>
          <Text style={styles.numberLabel}>transactions</Text>
        </View>
        <View style={styles.centerFlex}>
          <Text style={styles.subStat}>
            ℝ{loggedInMember.totalDonated.toString()}
          </Text>
          <Text style={styles.numberLabel}>donated</Text>
        </View>
      </View>
      <View style={[styles.centerFlex, { marginBottom: 60 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1 }}
          source={require("../../assets/img/Mint.png")}
        />
        <MintButton />
      </View>
      <View style={[styles.centerFlex, { marginBottom: 60 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1 }}
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
            title="Invite +ℝ60"
            onPress={() => {
              navigation.navigate(RouteName.Invite);
            }}
          />
          {hasUnclaimedReferrals ? (
            <Button
              title="Claim bonuses!"
              onPress={() => {
                navigation.navigate(RouteName.ReferralBonus, {
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

const styles = StyleSheet.create({
  centerFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  subStat: {
    fontSize: 22
  },
  numberLabel: {
    color: colors.text,
    fontSize: 14
  }
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    // TODO Throw an error.
    return {} as Props;
  }
  return {
    loggedInMember,
    unclaimedReferralIds: getUnclaimedReferrals(state, loggedInMember.memberId)
  };
};

export const Mint = connect(mapStateToProps)(MintView);
