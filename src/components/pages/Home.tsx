import * as React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Button } from "react-native-elements";
import { connect, MapStateToProps } from "react-redux";

import { AppState } from "../../store";
import SearchBar from "../shared/SearchBar";
import ActivityFeed from "../shared/ActivityFeed";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  loggedInUserId?: string;
};

type HomeProps = OwnProps & StateProps;

const Home: React.StatelessComponent<HomeProps> = props => {
  return (
    <View style={styles.container}>
      <Text>Give Raha to:</Text>
      <SearchBar />
      <ActivityFeed />
      <View style={styles.spacer} />
      {!props.loggedInUserId ? (
        <Button
          title="Log In"
          onPress={() => props.navigation.navigate("LogIn")}
        />
      ) : (
        <Text>{props.loggedInUserId}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
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
  AppState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    loggedInUserId: firebaseUser ? firebaseUser.uid : undefined
  };
};
export default connect(mapStateToProps)(Home);