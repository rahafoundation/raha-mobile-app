/**
 * The discover tab is where members can learn more about
 * systemic inequality and how solutions like UBI can
 * help prevent it! More information about Raha and
 * partnerships can be pushed here.
 */
import * as React from "react";
import {
  View,
  Text,
  TouchableHighlight,
  WebView as WebViewNative,
  TextProps,
  ScrollView
} from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { NavigationScreenProp, withNavigation } from "react-navigation";
import { RouteName } from "../shared/Navigation";
import { SafeAreaView } from "../../shared/SafeAreaView";

export const DiscoverWebView: React.StatelessComponent = ({
  navigation
}: any) => {
  return <WebViewNative source={{ uri: navigation.getParam("uri") }} />;
};

type DiscoverCard = {
  header?: string | string[];
  main: string | string[];
  sub?: string | string[];
  uri?: string;
};

function mutateAndFlattenArray(objArr: DiscoverCard[]) {
  for (let obj of objArr) {
    for (let [prop, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        obj[prop as keyof typeof obj] =
          val[Math.floor(val.length * Math.random())];
      }
    }
  }
  return objArr;
}

const DISCOVER_INFO = mutateAndFlattenArray([
  {
    main: "Give people Raha in exchange for posters, resume review, and more!",
    sub: "Check out the Raha Marketplace",
    uri: "https://discuss.raha.app/c/marketplace"
  },
  {
    header: "Did you know?",
    main: [
      '"Cash transfers have positive impacts, including on children."',
      '"Cash transfers have long-term impacts."',
      '"The poor do not systematically abuse cash transfers (e.g. on alcohol)."'
    ],
    sub: "Read the research compiled by GiveDirectly",
    uri: "https://www.givedirectly.org/research-on-cash-transfers"
  },
  {
    main: "View your position in the invite leaderboard!",
    uri: "https://web.raha.app/leaderboard"
  },
  {
    header: "Raha supports",
    main: [
      "Universal Basic Income to End Extreme Poverty.",
      "Trusted Identities for Safe and Secure Payments.",
      "Delegative Democracy and Values-Based Development."
    ],
    sub: "Read the Raha Manifesto",
    uri: "https://raha.app"
  }
]);

type DiscoverProps = {
  navigation: NavigationScreenProp<{}>;
};

const LargeText: React.StatelessComponent<TextProps> = props => (
  <Text style={{ fontSize: 20 }} {...props} />
);

function getCard(
  info: DiscoverCard,
  index: number,
  navigation: NavigationScreenProp<{}>
) {
  return (
    <TouchableHighlight
      style={{ height: 100, marginVertical: 10, marginHorizontal: 5 }}
      key={index}
      onPress={() =>
        info.uri &&
        navigation.navigate(RouteName.DiscoverWebView, {
          uri: info.uri
        })
      }
    >
      <View>
        {info.header && <LargeText>{info.header}</LargeText>}
        <LargeText>{info.main}</LargeText>
        {info.sub && <LargeText>{info.sub}</LargeText>}
      </View>
    </TouchableHighlight>
  );
}

export const Discover: React.StatelessComponent<DiscoverProps> = ({
  navigation
}) => {
  const cards = DISCOVER_INFO.map((info: any, index: number) =>
    getCard(info, index, navigation)
  );
  // Add padding so last card does not end up hidden by tab bar
  cards.push(<View key="end_padding" style={{ height: 75 }} />);
  return (
    <SafeAreaView>
      <MemberSearchBar
        keyboardShouldPersistTaps="always"
        onMemberSelected={member => {
          navigation.push(RouteName.Profile, { member: member });
        }}
      />
      <ScrollView>{cards}</ScrollView>
    </SafeAreaView>
  );
};
