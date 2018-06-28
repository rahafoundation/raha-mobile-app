/**
 * The discover tab is where members can learn more about
 * systemic inequality and how solutions like UBI can
 * help prevent it! More information about Raha and
 * partnerships can be pushed here.
 */
import * as React from "react";
import {
  View,
  TouchableHighlight,
  WebView as WebViewNative,
  TextProps,
  ScrollView,
  Linking
} from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { NavigationScreenProp, withNavigation } from "react-navigation";
import { RouteName } from "../shared/Navigation";

import { Container } from "../display/Container";
import { Text } from "../display/Text";

export const DiscoverWebView: React.StatelessComponent = ({
  navigation
}: any) => {
  return <WebViewNative source={{ uri: navigation.getParam("uri") }} />;
};

type DiscoverCardRaw = {
  header?: string;
  bodyChoices: string[];
  footer?: string;
  uri: string;
};

type DiscoverCard = {
  header?: string;
  body: string;
  footer?: string;
  uri: (navigation: NavigationScreenProp<{}>) => void;
};

function convertUriToCallback(uri: string) {
  if (uri.startsWith("https:")) {
    return (navigation: NavigationScreenProp<{}>) => {
      navigation.navigate(RouteName.DiscoverWebView, { uri });
    };
  }
  if (uri.startsWith("mailto:")) {
    return (navigation: NavigationScreenProp<{}>) => {
      // TODO test on device. Display proper error or use Linking.canOpen
      Linking.openURL(uri);
    };
  }
  console.error(`Invalid uri ${uri}, unsupported protocol`);
  return (navigation: NavigationScreenProp<{}>) => {};
}

function pickRandomFromArr(arr?: any[]) {
  if (!arr || arr.length === 0) {
    return undefined;
  }
  return arr[Math.floor(arr.length * Math.random())];
}

function convertCard(discoverCard: DiscoverCardRaw): DiscoverCard {
  return {
    header: discoverCard.header,
    body: pickRandomFromArr(discoverCard.bodyChoices),
    footer: discoverCard.footer,
    uri: convertUriToCallback(discoverCard.uri)
  };
}

function convertCardArr(cardArr: DiscoverCardRaw[]): DiscoverCard[] {
  return cardArr.map(convertCard);
}

// TODO below JSON should be available from website.
const DISCOVER_INFO = convertCardArr([
  {
    bodyChoices: [
      "Any feedback or questions? Contact Raha team at hi@raha.app!"
    ],
    uri: "mailto:hi@raha.app"
  },
  {
    bodyChoices: [
      "Give people Raha in exchange for posters, resume review, and more!"
    ],
    footer: "Check out the Raha Marketplace",
    uri: "https://discuss.raha.app/c/marketplace"
  },
  {
    header: "Did you know?",
    bodyChoices: [
      '"Cash transfers have positive impacts, including on children."',
      '"Cash transfers have long-term impacts."',
      '"The poor do not systematically abuse cash transfers (e.g. on alcohol)."'
    ],
    footer: "Read more at GiveDirectly.org",
    uri: "https://www.givedirectly.org/research-on-cash-transfers"
  },
  {
    bodyChoices: ["View your position in the invite leaderboard!"],
    uri: "https://web.raha.app/leaderboard"
  },
  {
    bodyChoices: ["Discuss UBI on the Raha Forum!"],
    uri: "https://discuss.raha.app/"
  },
  {
    bodyChoices: [
      "Universal Basic Income to End Extreme Poverty.",
      "Trusted Identities for Safe and Secure Payments.",
      "Delegative Democracy and Values-Based Development."
    ],
    header: "Raha supports",
    footer: "Read the Raha Manifesto",
    uri: "https://raha.app"
  }
]);

type DiscoverProps = {
  navigation: NavigationScreenProp<{}>;
};

const LargeText: React.StatelessComponent<TextProps> = props => (
  <Text style={{ fontSize: 18, color: "white" }} {...props} />
);

const COLORS = ["darkseagreen", "darkturquoise"];

function getCardColor(index: number): string {
  return COLORS[index % COLORS.length];
}

function getCard(
  info: DiscoverCard,
  index: number,
  navigation: NavigationScreenProp<{}>
) {
  return (
    <TouchableHighlight
      style={{
        minHeight: 100,
        margin: 7,
        backgroundColor: getCardColor(index)
      }}
      key={index}
      onPress={() => info.uri(navigation)}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {info.header && <LargeText>{info.header}</LargeText>}
        <LargeText>{info.body}</LargeText>
        {info.footer && <LargeText>{info.footer}</LargeText>}
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
    <Container>
      <MemberSearchBar
        lightTheme
        placeholderText="Search Members"
        keyboardShouldPersistTaps="always"
        onMemberSelected={member => {
          navigation.push(RouteName.Profile, { member: member });
        }}
      />
      <ScrollView>{cards}</ScrollView>
    </Container>
  );
};
