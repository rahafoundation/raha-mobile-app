import * as React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
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
        <View style={styles.spacer} />
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
    minHeight: "100%",
    flex: 1,
    backgroundColor: "#fff"
  },
  spacer: {
    flexGrow: 1
  }
});
