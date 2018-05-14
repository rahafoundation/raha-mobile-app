import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

type HomeProps = {
  navigation: any;
};

export default class Home extends React.Component<HomeProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text>This is the home page.</Text>
        <Button
          title="Go to LogIn"
          onPress={() => this.props.navigation.navigate("LogIn")}
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
