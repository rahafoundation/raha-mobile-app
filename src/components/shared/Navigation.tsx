import "es6-symbol/implement";
import * as React from "react";
import { TouchableOpacity, StyleSheet, TextStyle } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { createBottomTabNavigator } from "react-navigation-tabs";
import {
  createStackNavigator,
  NavigationContainer,
  NavigationRouteConfig,
  NavigationState,
  NavigationStateRoute,
  NavigationRoute,
  NavigationRouteConfigMap,
  StackNavigatorConfig,
  createSwitchNavigator,
  NavigationScreenProps
} from "react-navigation";
import { connect, MapStateToProps } from "react-redux";

import { app } from "../../firebaseInit";
import { Give as GiveScreen } from "../pages/Give";
import { Home } from "../pages/Home";
import { Mint } from "../pages/Mint";
import { LogIn } from "../pages/LogIn";
import { PendingInvites } from "../pages/PendingInvites";
import { Profile as ProfileScreen } from "../pages/Profile";
import { getMemberById } from "../../store/selectors/members";
import { RahaState } from "../../store";
import { MemberList as MemberListScreen } from "../pages/MemberList";
import { Onboarding } from "../pages/Onboarding/Onboarding";
import { ReferralBonus } from "../pages/ReferralBonus";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button, Text } from "./elements";
import { Discover } from "../pages/Discover";
import { LeaderBoard } from "../pages/LeaderBoard";
import { Invite } from "../pages/Invite/Invite";
import { Account } from "../pages/Account";
import { colors, palette } from "../../helpers/colors";
import { fonts } from "../../helpers/fonts";
import { InitializationRouter } from "../pages/InitializationRouter";

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
  InitializationRouter = "InitializationRouter",
  AccountPage = "Account",
  GivePage = "Give",
  HomePage = "Home Page",
  HomeTab = "Home",
  InvitePage = "Invite",
  LogInPage = "LogIn",
  MemberListPage = "Member List",
  OnboardingPage = "Onboarding",
  ProfilePage = "Profile Page",
  ProfileTab = "Profile",
  DiscoverPage = "DiscoverPage",
  DiscoverTab = "Discover",
  LeaderboardPage = "Leaderboard",
  MintPage = "MintPage",
  MintTab = "Mint",
  ReferralBonusPage = "Referral Bonus",
  PendingInvitesPage = "Pending Invites"
}

export const DEEPLINK_ROUTES = {
  invite: RouteName.OnboardingPage
};

const subHeaderStyle: TextStyle = {
  fontSize: 18
};

const headerStyle: TextStyle = {
  marginLeft: 12,
  fontSize: 32,
  ...fonts.Lato.Semibold
};

const navIconStyle: TextStyle = {
  fontSize: 25
};

const navIconFocusedStyle: TextStyle = {
  color: palette.mint
};

const styles = StyleSheet.create({
  header: headerStyle,
  subHeader: subHeaderStyle,
  navIcon: navIconStyle,
  navIconFocused: navIconFocusedStyle
});

const HeaderTitle: React.StatelessComponent<HeaderProps> = props => {
  return (
    <Text style={[styles.header, props.style]}>
      {props.title}
      {props.subtitle && (
        <Text style={styles.subHeader}> - {props.subtitle}</Text>
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
        navigation.navigate(RouteName.GivePage);
      }}
    />
  );
}

function settingsButton(navigation: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(RouteName.AccountPage);
      }}
    >
      <Icon name="ellipsis-h" size={25} />
    </TouchableOpacity>
  );
}

export function createNavigatorForTab(
  routeConfigMap: NavigationRouteConfigMap,
  stackConfig?: StackNavigatorConfig
): NavigationContainer {
  return createStackNavigator(
    {
      ...routeConfigMap,
      [RouteName.ProfilePage]: Profile,
      [RouteName.MemberListPage]: MemberList,
      [RouteName.GivePage]: Give
    },
    {
      ...stackConfig
    }
  );
}

function createHeaderNavigationOptions(title: string) {
  return ({ navigation }: any) => ({
    headerTitle: <HeaderTitle title={title} />,
    headerRight: giveButton(navigation),
    headerStyle: {
      backgroundColor: colors.darkAccent
    }
  });
}

const HomeTab = createNavigatorForTab(
  {
    [RouteName.HomePage]: {
      screen: Home,
      navigationOptions: createHeaderNavigationOptions("Raha")
    }
  },
  {
    initialRouteName: RouteName.HomePage
  }
);

const DiscoverTab = createNavigatorForTab(
  {
    [RouteName.DiscoverPage]: {
      screen: Discover,
      navigationOptions: createHeaderNavigationOptions("Discover")
    },
    LeaderBoard
  },
  {
    initialRouteName: RouteName.DiscoverPage
  }
);

const MintTab = createNavigatorForTab(
  {
    [RouteName.InvitePage]: {
      screen: Invite,
      navigationOptions: {
        header: null
      }
    },
    [RouteName.MintPage]: {
      screen: Mint,
      navigationOptions: createHeaderNavigationOptions("Mint Raha")
    },
    [RouteName.ReferralBonusPage]: {
      screen: ReferralBonus,
      navigationOptions: createHeaderNavigationOptions("Bonus Mint")
    }
  },
  {
    initialRouteName: RouteName.MintPage,
    navigationOptions: createHeaderNavigationOptions("Discover")
  }
);

const ProfileTab = createNavigatorForTab(
  {
    [RouteName.AccountPage]: Account,
    [RouteName.PendingInvitesPage]: PendingInvites
  },
  {
    initialRouteName: RouteName.ProfilePage
  }
);

function getIconForRoute(routeName: RouteName): string {
  switch (routeName) {
    case RouteName.ProfileTab:
      return "user";
    case RouteName.HomeTab:
      return "list-alt";
    case RouteName.MintTab:
      return "gem";
    case RouteName.DiscoverTab:
      return "newspaper";
    default:
      throw Error(`Unrecognized route ${routeName}`);
  }
}

const SignedInNavigator = createSwitchNavigator(
  {
    [RouteName.InitializationRouter]: {
      screen: (props: NavigationScreenProps) => (
        <InitializationRouter {...props} defaultRoute={RouteName.HomeTab} />
      ),
      navigationOptions: { header: null }
    },
    App: createBottomTabNavigator(
      {
        [RouteName.HomeTab]: HomeTab,
        [RouteName.DiscoverTab]: DiscoverTab,
        [RouteName.MintTab]: MintTab,
        [RouteName.ProfileTab]: ProfileTab
      },
      {
        initialRouteName: RouteName.DiscoverTab,
        labeled: true,
        navigationOptions: ({ navigation }: any) => ({
          tabBarIcon: ({ focused }: any) => {
            const { routeName } = navigation.state;
            const iconName = getIconForRoute(routeName);
            return (
              <Icon
                name={iconName}
                solid
                style={[
                  styles.navIcon,
                  ...(focused ? [styles.navIconFocused] : [])
                ]}
              />
            );
          },
          headerStyle: {
            backgroundColor: colors.pageBackground
          },
          labelStyle: {
            color: colors.bodyText
          },
          tabBarColor: palette.lightGray
        })
      }
    )
  },
  {
    initialRouteName: RouteName.InitializationRouter
  }
);

const SignedOutNavigator = createSwitchNavigator(
  {
    [RouteName.InitializationRouter]: {
      screen: (props: NavigationScreenProps) => (
        <InitializationRouter {...props} defaultRoute={RouteName.LogInPage} />
      ),
      navigationOptions: { header: null }
    },
    App: createStackNavigator(
      {
        [RouteName.OnboardingPage]: {
          screen: Onboarding,
          navigationOptions: { header: null }
        },
        [RouteName.LogInPage]: LogIn,
        [RouteName.ProfilePage]: Profile
      },
      {
        headerMode: "screen",
        navigationOptions: {
          headerTitle: (
            <HeaderTitle title="Raha" subtitle="Basic Income Network" />
          ),
          headerStyle: {
            backgroundColor: colors.darkBackground
          }
        }
      }
    )
  },
  {
    initialRouteName: RouteName.InitializationRouter
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
  render() {
    const { hasAccount } = this.props;

    if (hasAccount) {
      return <SignedInNavigator onNavigationStateChange={trackPageChanges} />;
    } else {
      return <SignedOutNavigator onNavigationStateChange={trackPageChanges} />;
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
