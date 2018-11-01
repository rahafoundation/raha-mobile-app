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
  ScrollView,
  Linking,
  StyleSheet,
  ViewStyle,
  Image,
  ImageSourcePropType
} from "react-native";

import { MemberSearchBar } from "../shared/MemberSearchBar";
import { NavigationScreenProp } from "react-navigation";
import { RouteName } from "../shared/Navigation";
import { Text } from "../shared/elements";
import { sharedStyles } from "../shared/sharedStyles";
import { colors, palette } from "../../helpers/colors";
import { fonts, fontSizes } from "../../helpers/fonts";

const INTERNAL_ROUTE_PROTOCOL = "route:";

// require only allows string literals. Once we move everything to server, we
// won't need this
const CARD_IMAGE_IMPORTS = {
  marketplace: require("../../assets/img/Market.png"),
  question: require("../../assets/img/Question.png"),
  community: require("../../assets/img/Community.png"),
  support: require("../../assets/img/Support.png"),
  hi: require("../../assets/img/Hi.png"),
  trophy: require("../../assets/img/Trophy.png")
};

type DiscoverCardRaw = {
  header?: string;
  bodyChoices: string[];
  action?: string;
  uri: string;
  image_uri?: string;
};

type DiscoverCard = {
  header?: string;
  body: string;
  action?: string;
  image_source?: ImageSourcePropType;
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
    uri: convertUriToCallback(discoverCard.uri),
    image_source: discoverCard.image_uri
      ? CARD_IMAGE_IMPORTS[
          discoverCard.image_uri as keyof typeof CARD_IMAGE_IMPORTS
        ]
      : undefined
  };
}

function convertCardArr(cardArr: DiscoverCardRaw[]): DiscoverCard[] {
  return cardArr.map(convertCard);
}

// TODO below JSON should be available from website.
// image_uri are just placeholders to work with local assets, replace with actual URI
const DISCOVER_INFO = convertCardArr([
  {
    header: "Check out Raha Marketplace",
    bodyChoices: [
      "Find a personal trainer, get your resume reviewed, and more!"
    ],
    action: "Visit the marketplace",
    uri: "https://discuss.raha.app/c/marketplace",
    image_uri: "marketplace"
  },
  {
    header: "Climb the leaderboard",
    bodyChoices: [
      "Invite more people to get to the top of the leaderboard ranks!"
    ],
    action: "View the leaderboard",
    uri: INTERNAL_ROUTE_PROTOCOL + "LeaderBoard", // Why does RouteName.LeaderBoard break?
    image_uri: "trophy"
  },
  {
    header: "Frequently Asked Questions",
    bodyChoices: ["Find answers to common questions"],
    action: "View FAQ",
    uri: "https://raha.app/faq",
    image_uri: "question"
  },
  {
    header: "Feedback or questions?",
    bodyChoices: ["Contact the Raha team at hi@raha.app!"],
    action: "Send us an email",
    uri: "mailto:hi@raha.app",
    image_uri: "hi"
  },
  {
    header: "Raha supports...",
    bodyChoices: [
      "Universal Basic Income to end extreme poverty.",
      "Trusted identities for safe and secure payments.",
      "Delegative democracy and values-based development."
    ],
    action: "Read the Raha Manifesto",
    uri: "https://raha.app/what-is-raha/",
    image_uri: "support"
  },
  {
    header: "Did you know?",
    bodyChoices: [
      '"Cash transfers have positive impacts, including on children."',
      '"Cash transfers have long-term impacts."',
      '"The poor do not systematically abuse cash transfers (e.g. on alcohol)."'
    ],
    action: "Read more at GiveDirectly.org",
    uri: "https://www.givedirectly.org/research-on-cash-transfers",
    image_uri: "lightbulb"
  },
  {
    header: "Meet the Raha Community",
    bodyChoices: ["Join discussions in the Raha Forums!"],
    action: "Check out the forums",
    uri: "https://discuss.raha.app/",
    image_uri: "community"
  }
]);

type DiscoverProps = {
  navigation: NavigationScreenProp<{}>;
};

function getCard(
  info: DiscoverCard,
  index: number,
  navigation: NavigationScreenProp<{}>
) {
  return (
    <TouchableHighlight
      key={index}
      style={styles.card}
      underlayColor={palette.veryLightGray}
      delayPressIn={0} // Looks like there's a default 130ms delay within
      onPress={() => info.uri(navigation)}
    >
      <View>
        {info.header && <Text style={styles.headerText}>{info.header}</Text>}
        <View style={{ flexDirection: "row" }}>
          {info.image_source && (
            <Image
              justifyContent="flex-start"
              resizeMode="contain"
              style={{ flex: 1, height: "auto" }}
              source={info.image_source}
            />
          )}
          <View style={{ flex: 2 }}>
            <Text style={[styles.bodyText]}>{info.body}</Text>
            {info.action && (
              <Text style={styles.actionText}>{info.action}</Text>
            )}
          </View>
        </View>
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
  backgroundColor: palette.mint
};
const styles = StyleSheet.create({
  page: pageStyle,
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.cardBorder,
    borderRadius: sharedStyles.borderRadius,
    borderWidth: 1,
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    justifyContent: "space-between"
  },
  actionText: {
    textAlign: "right",
    color: palette.purple,
    ...fonts.Lato.Bold
  },
  headerText: {
    marginBottom: 8,
    ...fontSizes.large,
    ...fonts.Lato.Semibold
  },
  bodyText: {
    marginBottom: 8,
    ...fontSizes.medium
  }
});
