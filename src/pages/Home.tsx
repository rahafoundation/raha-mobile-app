import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-elements";

import SearchBar from "../shared/SearchBar";

type HomeProps = {
  navigation: any;
};

export default class Home extends React.Component<HomeProps> {
  render() {
    return (
      <View style={styles.container}>
        <SearchBar />
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
