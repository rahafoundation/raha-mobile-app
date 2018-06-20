import * as React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { connect, MapStateToProps } from "react-redux";

import { Member } from "../../store/reducers/members";
import { RahaState } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInMember } from "../../store/selectors/authentication";
import { SafeAreaView } from "../../shared/SafeAreaView";
import { Button } from "../shared/Button";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  loggedInMember: Member;
};

type Props = OwnProps & StateProps;

const MintView: React.StatelessComponent<Props> = ({ loggedInMember }) => {
  let net = loggedInMember.balance.minus(loggedInMember.totalMinted).toString();
  let netColor;
  if (net.substr(0, 1) === "-") {
    netColor = "red";
  } else {
    netColor = "green";
    net = `+${net}`;
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={[
          styles.centerFlex,
          { flexDirection: "row", marginHorizontal: 50 }
        ]}
      >
        <View style={styles.centerFlex}>
          <Text style={styles.number}>
            {loggedInMember.totalMinted.toString()}
          </Text>
          <Text style={styles.numberLabel}>minted</Text>
        </View>
        <View style={styles.centerFlex}>
          <Text style={[styles.number, { color: netColor }]}>{net}</Text>
          <Text style={styles.numberLabel}>net</Text>
        </View>
        <View style={styles.centerFlex}>
          <Text style={styles.number}>
            ℝ{loggedInMember.balance.toString()}
          </Text>
          <Text style={styles.numberLabel}>balance</Text>
        </View>
      </View>
      <View style={[styles.centerFlex, { marginBottom: 60 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1 }}
          source={require("../../assets/img/Mint.png")}
        />
        <Button text="Mint +ℝ10" onPress={() => {}} backgroundColor="#2196F3" />
      </View>
      <View style={[styles.centerFlex, { marginBottom: 60 }]}>
        <Image
          resizeMode="contain"
          style={{ flex: 1 }}
          source={require("../../assets/img/Invite.png")}
        />
        <Button
          text="Invite +ℝ60"
          onPress={() => {}}
          backgroundColor="#2196F3"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centerFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  number: {
    fontSize: 25
  },
  numberLabel: {
    color: "#666"
  }
});

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RahaState> = (
  state,
  props
) => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    props.navigation.navigate(RouteName.LogIn);
    return {} as Props;
  }
  return {
    loggedInMember
  };
};

export const Mint = connect(mapStateToProps)(MintView);
