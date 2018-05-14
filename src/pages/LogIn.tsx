import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

type LogInProps = {
  navigation: any;
};

export default class LogIn extends React.Component<LogInProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text>This is the login page.</Text>
        <Button
          title="Go to Home"
          onPress={() => this.props.navigation.navigate("Home")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
