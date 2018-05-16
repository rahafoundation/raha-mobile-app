import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps } from "react-redux";
import { logIn as logInAction } from "../actions/authentication";

type OwnProps = {
  navigation: any;
};

type DispatchProps = {
  logIn: (userId: string) => void;
};

type LogInProps = OwnProps & DispatchProps;

const LogIn: React.StatelessComponent<LogInProps> = props => {
  return (
    <View style={styles.container}>
      <Text>This is the login page.</Text>
      <Button
        title="Cancel"
        onPress={() => props.navigation.navigate("Home")}
      />
      <Button title="Log In as Omar" onPress={() => props.logIn("omar")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => {
  return {
    logIn: (userId: string) => dispatch(logInAction(userId))
  };
};

export default connect(undefined, mapDispatchToProps)(LogIn);
