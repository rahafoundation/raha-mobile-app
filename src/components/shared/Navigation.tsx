import "es6-symbol/implement";
import * as React from "react";
import { TouchableOpacity, StyleSheet, Linking, TextStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import {
  createStackNavigator,
  NavigationContainer,
  NavigationRouteConfig,
  NavigationState,
  NavigationStateRoute,
  NavigationRoute,
  NavigationRouteConfigMap,
  StackNavigatorConfig
} from "react-navigation";
import { connect, MapStateToProps } from "react-redux";

import { app } from "../../firebaseInit";
import { Give as GiveScreen } from "../pages/Give";
import { Home } from "../pages/Home";
import { Mint } from "../pages/Mint";
import { LogIn } from "../pages/LogIn";
import { PendingInvites } from "../pages/PendingInvites";
import { Profile as ProfileScreen } from "../pages/Profile";
import { getMemberById } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { MemberList as MemberListScreen } from "../pages/MemberList";
import { Onboarding } from "../pages/Onboarding/Onboarding";
import { ReferralBonus } from "../pages/ReferralBonus";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button, Text } from "../shared/elements";
import { Discover, DiscoverWebView } from "../pages/Discover";
import { LeaderBoard } from "../pages/LeaderBoard";
import { Invite } from "../pages/Invite/Invite";
import { Account } from "../pages/Account";
import { colors } from "../../helpers/colors";
import { fonts } from "../../helpers/fonts";
import url from "url";

/**
 * Gets the current screen from navigation state.
 * Adapted from: https://reactnavigation.org/docs/en/screen-tracking.html
 */
function getActiveRouteName(navigationState: NavigationState): string | null {
  if (!navigationState) {
    return null;
  }

  let memoizedNavigationRoute: NavigationStateRoute<any> | NavigationRoute =
    navigationState.routes[navigationState.index];

  // dive into nested navigators
  //@ts-ignore kind of crappy way of figuring out route type
  while (memoizedNavigationRoute.routes) {
    memoizedNavigationRoute =
      //@ts-ignore kind of crappy way of figuring out route type
      memoizedNavigationRoute.routes[memoizedNavigationRoute.index];
  }

  return memoizedNavigationRoute.routeName;
}

/**
 * To track firebase analytics information in real time in a debug
 * environment, run: `adb shell setprop debug.firebase.analytics.app`.
 */
function trackPageChanges(
  prevState: NavigationState,
  currentState: NavigationState
) {
  const currentScreen = getActiveRouteName(currentState);
  const prevScreen = getActiveRouteName(prevState);

  if (currentScreen && prevScreen !== currentScreen) {
    app.analytics().setCurrentScreen(currentScreen);
  }
}

export enum RouteName {
  Account = "Account",
  Give = "Give",
  Home = "Home",
  HomeTab = "HomeTab",
  Invite = "Invite",
  LogIn = "LogIn",
  MemberList = "MemberList",
  Onboarding = "Onboarding",
  OtherProfile = "OtherProfile",
  Profile = "Profile",
  ProfileTab = "ProfileTab",
  Discover = "Discover",
  DiscoverTab = "DiscoverTab",
  DiscoverWebView = "DiscoverWebView",
  LeaderBoard = "LeaderBoard",
  Mint = "Mint",
  MintTab = "MintTab",
  ReferralBonus = "ReferralBonus",
  PendingInvites = "PendingInvites"
}

const DEEPLINK_ROUTES = {
  invite: RouteName.Onboarding
};

const styles = StyleSheet.create({
  headerStyle: {
    marginLeft: 12,
    fontSize: 32,
    ...fonts.Vollkorn.SemiBold
  },
  subHeaderStyle: {
    fontSize: 18
  }
});

const HeaderTitle: React.StatelessComponent<HeaderProps> = props => {
  return (
    <Text style={[styles.headerStyle, props.style]}>
      {props.title}
      {props.subtitle && (
        <Text style={styles.subHeaderStyle}> - {props.subtitle}</Text>
      )}
    </Text>
  );
};

const MemberList = {
  screen: MemberListScreen,
  navigationOptions: ({ navigation }: any) => {
    return {
      headerTitle: (
        <HeaderTitle title={navigation.getParam("title", "Member List")} />
      )
    };
  }
};

const Profile: NavigationRouteConfig = {
  screen: ProfileScreen,
  navigationOptions: ({ navigation }: any) => {
    const member = navigation.getParam("member");
    return {
      headerTitle: (
        <HeaderTitle title={member ? member.fullName : "Your Profile"} />
      ),
      headerRight: settingsButton(navigation),
      headerStyle: {
        backgroundColor: colors.darkAccent
      }
    };
  }
};

const Give = {
  screen: GiveScreen,
  navigationOptions: {
    headerTitle: <HeaderTitle title="Give Raha" />
  }
};

type HeaderProps = {
  title: string;
  subtitle?: string;
  style?: TextStyle;
};

function giveButton(navigation: any) {
  return (
    <Button
      title="Give"
      onPress={() => {
        navigation.navigate(RouteName.Give);
      }}
    />
  );
}

function settingsButton(navigation: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(RouteName.Account);
      }}
    >
      <Icon name="dots-vertical" size={25} />
    </TouchableOpacity>
  );
}

export function createTabNavigator(
  routeConfigMap: NavigationRouteConfigMap,
  stackConfig?: StackNavigatorConfig
): NavigationContainer {
  return createStackNavigator(
    {
      ...routeConfigMap,
      Profile,
      MemberList,
      Give
    },
    {
      ...stackConfig
    }
  );
}

function darkNavWithGive(title: string) {
  return ({ navigation }: any) => ({
    headerTitle: <HeaderTitle title={title} />,
    headerRight: giveButton(navigation),
    headerStyle: {
      backgroundColor: colors.darkAccent
    }
  })
}

const HomeTab = createTabNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: darkNavWithGive("Raha")
    }
  },
  {
    initialRouteName: RouteName.Home
  }
);

const DiscoverTab = createTabNavigator(
  {
    Discover: {
      screen: Discover,
      navigationOptions: darkNavWithGive("Discover")
    },
    DiscoverWebView,
    LeaderBoard
  },
  {
    initialRouteName: RouteName.Discover
  }
);

const MintTab = createTabNavigator(
  {
    Invite: {
      screen: Invite,
      navigationOptions: darkNavWithGive("Invite")
    },
    Mint: {
      screen: Mint,
      navigationOptions: darkNavWithGive("Mint Raha")
    },
    ReferralBonus: {
      screen: ReferralBonus,
      navigationOptions: darkNavWithGive("Bonus Mint")
    }
  },
  {
    initialRouteName: RouteName.Mint,
    navigationOptions: darkNavWithGive("Discover")
  }
);

const ProfileTab = createTabNavigator(
  {
    Account,
    PendingInvites
  },
  {
    initialRouteName: RouteName.Profile
  }
);

const SignedInNavigator: NavigationContainer = createMaterialBottomTabNavigator(
  {
    HomeTab,
    DiscoverTab,
    MintTab,
    ProfileTab
  },
  {
    initialRouteName: RouteName.DiscoverTab,
    labeled: false,
    navigationOptions: ({ navigation }: any) => ({
      tabBarIcon: ({ focused }: any) => {
        const { routeName } = navigation.state;
        let iconName;
        let IconType = Icon;
        switch (routeName) {
          case RouteName.ProfileTab:
            iconName = "account";
            break;
          case RouteName.HomeTab:
            iconName = "home";
            break;
          case RouteName.MintTab:
            iconName = "gift";
            break;
          case RouteName.DiscoverTab:
            iconName = "ios-search";
            IconType = Ionicons;
            break;
          default:
            throw Error(`Unrecognized route ${routeName}`);
        }
        const isMint = routeName === RouteName.MintTab;
        if (!focused && !isMint) {
          iconName += "-outline";
        }
        return <IconType name={iconName} size={25} />;
      },
      headerStyle: {
        backgroundColor: colors.lightBackground
      },
      labelStyle: {
        color: colors.bodyText
      },
      tabBarColor: colors.lightAccent
    })
  }
);

const SignedOutNavigator = createStackNavigator(
  {
    Onboarding: {
      screen: Onboarding
    },
    LogIn,
    Profile
  },
  {
    headerMode: "screen",
    initialRouteName: RouteName.LogIn,
    navigationOptions: {
      headerTitle: <HeaderTitle title="Raha" subtitle="Basic Income Network" />,
      headerStyle: {
        backgroundColor: colors.darkBackground
      }
    }
  }
);

type OwnProps = {};

type StateProps = {
  isLoaded: boolean;
  isLoggedIn: boolean;
  hasAccount: boolean;
};

type Props = OwnProps & StateProps;

class NavigationView extends React.Component<Props> {
  navigator: any;

  componentDidMount() {
    // Process deeplink -- we don't use react-navigation for this since it
    // doesn't support HTTPS links.
    Linking.getInitialURL()
      .then(link => {
        if (link) {
          const deeplinkUrl = url.parse(link, true, true);
          if (!deeplinkUrl.pathname) {
            return;
          }
          const pathname = deeplinkUrl.pathname.replace(
            "/",
            ""
          ) as keyof typeof DEEPLINK_ROUTES;
          this.navigator._navigation.navigate(
            DEEPLINK_ROUTES[pathname],
            deeplinkUrl.query
          );
        }
      })
      .catch(err =>
        console.error("An error occurred while deep linking:", err)
      );
  }

  render() {
    const { hasAccount } = this.props;

    if (hasAccount) {
      return (
        <SignedInNavigator
          ref={(navigator: any) => (this.navigator = navigator)}
          onNavigationStateChange={trackPageChanges}
        />
      );
    } else {
      return (
        <SignedOutNavigator
          ref={(navigator: any) => (this.navigator = navigator)}
          onNavigationStateChange={trackPageChanges}
        />
      );
    }
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const isLoaded = state.authentication.isLoaded;
  const loggedInMemberId = getLoggedInFirebaseUserId(state);
  const isLoggedIn =
    state.authentication.isLoaded && state.authentication.isLoggedIn;
  const hasAccount =
    isLoggedIn &&
    !!loggedInMemberId &&
    getMemberById(state, loggedInMemberId) !== undefined;
  return {
    isLoaded,
    isLoggedIn,
    hasAccount
  };
};

export const Navigation = connect(
  mapStateToProps,
  {}
)(NavigationView);
