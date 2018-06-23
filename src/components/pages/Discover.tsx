import * as React from "react";
import { View, Text, TouchableHighlight, WebView } from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { NavigationScreenProp } from "react-navigation";
import { RouteName } from "../shared/Navigation";

export class Leaderboard extends React.Component {
  render() {
    return <WebView source={{ uri: "https://web.raha.app/leaderboard" }} />;
  }
}

type CardProps = {
  navigation: NavigationScreenProp<{}>;
  content: TouchableHighlight;
  onPress: () => void;
};

// export const Card: React.StatelessComponent<CardProps> = {
//   title: string
// };

type DiscoverProps = {
  navigation: NavigationScreenProp<{}>;
};

export const Discover: React.StatelessComponent<DiscoverProps> = ({
  navigation
}) => (
  <View>
    <MemberSearchBar
      keyboardShouldPersistTaps="always"
      onMemberSelected={member => {
        navigation.push(RouteName.Profile, { member: member });
      }}
    />
    <TouchableHighlight onPress={() => {}}>
      <Text>Cool thing 1</Text>
    </TouchableHighlight>
    <Text>Cool thing 2</Text>
  </View>
);
