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
  ScrollView,
  Linking
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

type DiscoverCardRaw = {
  header?: string | string[];
  title: string | string[];
  footer?: string | string[];
  uri: string;
};

type DiscoverCard = {
  header?: string;
  title: string;
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
      Linking.openURL(uri); // TODO check canOpen
    };
  }
  throw Error(`Invalid uri ${uri}, unsupported protocol`);
}

function convertCard(discoverCard: DiscoverCardRaw): DiscoverCard {
  return Object.entries(discoverCard).reduce(
    (res, keyValue) => {
      let [key, origVal] = keyValue;
      let val: any = origVal;
      if (Array.isArray(val)) {
        val = val[Math.floor(val.length * Math.random())];
      }
      if (key === "uri") {
        if (typeof val === "string") {
          val = convertUriToCallback(val);
        } else {
          throw Error(`Invalid value for uri ${val}`);
        }
      }
      res[key as keyof DiscoverCard] = val;
      return res;
    },
    {} as DiscoverCard
  );
}

function convertCardArr(cardArr: DiscoverCardRaw[]): DiscoverCard[] {
  return cardArr.map(convertCard);
}

// TODO below JSON should be available from website.
const DISCOVER_INFO = convertCardArr([
  {
    title: "Any feedback or questions? Contact Raha team at hi@raha.app!",
    uri: "mailto:hi@raha.app"
  },
  {
    title: "Give people Raha in exchange for posters, resume review, and more!",
    footer: "Check out the Raha Marketplace",
    uri: "https://discuss.raha.app/c/marketplace"
  },
  {
    header: "Did you know?",
    title: [
      '"Cash transfers have positive impacts, including on children."',
      '"Cash transfers have long-term impacts."',
      '"The poor do not systematically abuse cash transfers (e.g. on alcohol)."'
    ],
    footer: "Read more at GiveDirectly.org",
    uri: "https://www.givedirectly.org/research-on-cash-transfers"
  },
  {
    title: "View your position in the invite leaderboard!",
    uri: "https://web.raha.app/leaderboard"
  },
  {
    title: "Discuss UBI on the Raha Forum!",
    uri: "https://discuss.raha.app/"
  },
  {
    header: "Raha supports",
    title: [
      "Universal Basic Income to End Extreme Poverty.",
      "Trusted Identities for Safe and Secure Payments.",
      "Delegative Democracy and Values-Based Development."
    ],
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

const COLORS = ["darkseagreen", "darkturquoise"]

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
      style={{ minHeight: 100, margin: 7, backgroundColor: getCardColor(index) }}
      key={index}
      onPress={() => info.uri(navigation)}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {info.header && <LargeText>{info.header}</LargeText>}
        <LargeText>{info.title}</LargeText>
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
    <SafeAreaView>
      <MemberSearchBar
        lightTheme
        placeholderText="Search Members"
        keyboardShouldPersistTaps="always"
        onMemberSelected={member => {
          navigation.push(RouteName.Profile, { member: member });
        }}
      />
      <ScrollView>{cards}</ScrollView>
    </SafeAreaView>
  );
};
