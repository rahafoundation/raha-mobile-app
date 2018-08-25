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
  WebView,
  ScrollView,
  Linking,
  StyleSheet,
  TextStyle,
  ViewStyle
} from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { NavigationScreenProp } from "react-navigation";
import { RouteName } from "../shared/Navigation";
import { Button, Text } from "../shared/elements";
import { colors } from "../../helpers/colors";
import { fonts } from "../../helpers/fonts";

const INTERNAL_ROUTE_PROTOCOL = "route:";

type DiscoverCardRaw = {
  header?: string;
  bodyChoices: string[];
  action?: string;
  uri: string;
};

type DiscoverCard = {
  header?: string;
  body: string;
  action?: string;
  uri: (navigation: NavigationScreenProp<{}>) => void;
};

function convertUriToCallback(uri: string) {
  if (uri.startsWith("https:")) {
    return (navigation: NavigationScreenProp<{}>) => {
      Linking.openURL(uri);
    };
  }
  if (uri.startsWith("mailto:")) {
    return (navigation: NavigationScreenProp<{}>) => {
      // TODO test on device. Display proper error or use Linking.canOpen
      Linking.openURL(uri);
    };
  }
  if (uri.startsWith(INTERNAL_ROUTE_PROTOCOL)) {
    return (navigation: NavigationScreenProp<{}>) => {
      navigation.navigate(uri.substr(INTERNAL_ROUTE_PROTOCOL.length));
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
    action: discoverCard.action,
    uri: convertUriToCallback(discoverCard.uri)
  };
}

function convertCardArr(cardArr: DiscoverCardRaw[]): DiscoverCard[] {
  return cardArr.map(convertCard);
}

// TODO below JSON should be available from website.
const DISCOVER_INFO = convertCardArr([
  {
    header: "Did you know?",
    bodyChoices: [
      '"Cash transfers have positive impacts, including on children."',
      '"Cash transfers have long-term impacts."',
      '"The poor do not systematically abuse cash transfers (e.g. on alcohol)."'
    ],
    action: "Read more at GiveDirectly.org",
    uri: "https://www.givedirectly.org/research-on-cash-transfers"
  },
  // TODO in-app marketplace
  // {
  //   header: "Check out the Raha Marketplace",
  //   bodyChoices: [
  //     "Buy everything from books and posters to instruments, get your resume reviewed, and more!"
  //   ],
  //   action: "Visit the marketplace",
  //   uri: "https://discuss.raha.app/c/marketplace"
  // },
  {
    header: "Climb the leaderboard",
    bodyChoices: [
      "Invite more people to get to the top of the leaderboard ranks!"
    ],
    action: "View the leaderboard",
    uri: INTERNAL_ROUTE_PROTOCOL + "LeaderBoard" // Why does RouteName.LeaderBoard break?
  },
  {
    header: "Feedback or questions?",
    bodyChoices: ["Contact the Raha team at hi@raha.app!"],
    action: "Send us an email",
    uri: "mailto:hi@raha.app"
  },
  {
    header: "Meet the Raha Community",
    bodyChoices: ["Join discussions in the Raha Forums!"],
    action: "Check out the forums",
    uri: "https://discuss.raha.app/"
  }
  // TODO point to /what-is-raha/? Ensure does not try to deep link?
  // {
  //   header: "Raha supports...",
  //   bodyChoices: [
  //     "Universal Basic Income to end extreme poverty.",
  //     "Trusted identities for safe and secure payments.",
  //     "Delegative democracy and values-based development."
  //   ],
  //   action: "Read the Raha Manifesto",
  //   uri: "https://raha.app"
  // },
]);

type DiscoverProps = {
  navigation: NavigationScreenProp<{}>;
};

const BG_COLORS = [colors.secondaryBackground1, colors.secondaryBackground2];
const BORDER_COLORS = [colors.border1, colors.border2];

function getCardColor(index: number): string {
  return BG_COLORS[index % BG_COLORS.length];
}

function getBorderColor(index: number): string {
  return BORDER_COLORS[index % BORDER_COLORS.length];
}

function getCard(
  info: DiscoverCard,
  index: number,
  navigation: NavigationScreenProp<{}>
) {
  return (
    <TouchableHighlight
      style={[
        styles.card,
        {
          backgroundColor: getCardColor(index),
          borderColor: getBorderColor(index),
          borderRadius: 4,
          borderWidth: 4
        }
      ]}
      key={index}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {info.header && <Text style={styles.headerText}>{info.header}</Text>}
        <Text style={styles.bodyText}>{info.body}</Text>
        {info.action && (
          <Button title={info.action} onPress={() => info.uri(navigation)} />
        )}
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
    <View style={styles.page}>
      <View style={{ marginTop: 8 }}>
        <MemberSearchBar
          lightTheme
          placeholderText="Search Members"
          keyboardShouldPersistTaps="always"
          onMemberSelected={member => {
            navigation.push(RouteName.ProfilePage, { member: member });
          }}
        />
      </View>
      <ScrollView>{cards}</ScrollView>
    </View>
  );
};

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};
const styles = StyleSheet.create({
  page: pageStyle,
  card: {
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    borderRadius: 3
  },
  headerText: {
    fontSize: 24,
    marginBottom: 6,
    ...fonts.Lato.Semibold
  },
  bodyText: {
    fontSize: 16,
    marginBottom: 8
  }
});
