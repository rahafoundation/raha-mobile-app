import * as React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import { connect, MapStateToProps } from "react-redux";

import { RahaState } from "../../store";
import { SearchBar } from "../shared/SearchBar";
import { ActivityFeed } from "../shared/ActivityFeed";
import { RouteName } from "../../../App";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  loggedInUserId?: string;
};

type HomeProps = OwnProps & StateProps;

const HomeView: React.StatelessComponent<HomeProps> = props => {
  return (
    <View style={styles.container}>
      <Text>Give Raha to:</Text>
      <SearchBar />
      <ActivityFeed />
      <View style={styles.spacer} />
      {!props.loggedInUserId ? (
        <Button
          title="Log In"
          onPress={() => props.navigation.navigate(RouteName.LogIn)}
        />
      ) : (
        <Text>{props.loggedInUserId}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  spacer: {
    flexGrow: 1
  }
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    loggedInUserId: firebaseUser ? firebaseUser.uid : undefined
  };
};
export const Home = connect(mapStateToProps)(HomeView);
