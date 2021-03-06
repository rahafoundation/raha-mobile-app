import "es6-symbol/implement";
import * as React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  TextStyle,
  ViewStyle
} from "react-native";
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
import firebase from "react-native-firebase";
import { NotificationOpen } from "react-native-firebase/notifications";

import { analytics } from "../../../firebaseInit";
import { Give as GiveScreen } from "../../pages/Give";
import { Feed } from "../../pages/Feed";
import { Wallet } from "../../pages/Wallet";
import { LogIn } from "../../pages/LogIn";
import { PendingInvites } from "../../pages/PendingInvites";
import { Profile as ProfileScreen } from "../../pages/Profile";
import { getMemberById } from "../../../store/selectors/members";
import { RahaState } from "../../../store";
import { MemberList as MemberListScreen } from "../../pages/MemberList";
import { StoryList as StoryListScreen } from "../../pages/StoryList";
import { Onboarding } from "../../pages/Onboarding/Onboarding";
import { ReferralBonus } from "../../pages/ReferralBonus";
import { getLoggedInFirebaseUserId } from "../../../store/selectors/authentication";
import { Text } from "../elements";
import { Discover } from "../../pages/Discover";
import { LeaderBoard } from "../../pages/LeaderBoard";
import { Invite } from "../../pages/Invite/Invite";
import { colors, palette } from "../../../helpers/colors";
import { fonts, fontSizes } from "../../../helpers/fonts";
import { InitializationRouter } from "../../pages/InitializationRouter";
import { Member } from "../../../store/reducers/members";
import { Verify } from "../../pages/Verify";
import { processDeeplink, routeToPath } from "../../../helpers/deeplinking";
import branch from "react-native-branch";
import { AccountSettingsPage } from "../../pages/AccountSettings/AccountSettings";
import { EditMemberPage } from "../../pages/AccountSettings/EditMember";
import { GovernancePage } from "../../pages/AccountSettings/Governance";
import { AccountRecoveryPage } from "../../pages/AccountSettings/AccountRecovery";
import { CurrencySettingsPage } from "../../pages/AccountSettings/CurrencySettings";
import { SignOutPage } from "../../pages/AccountSettings/SignOut";
import { FlagMemberPage } from "../../pages/Flagging/FlagMember";
import { generateRandomIdentifier } from "../../../helpers/identifiers";
import { FlagFeedPage } from "../../pages/Flagging/FlagFeed";
import { ResolveFlagMemberPage } from "../../pages/Flagging/ResolveFlagMember";
import { RouteName } from ".";
import { TipperList } from "../../pages/TipperList";

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
    analytics.setCurrentScreen(currentScreen);
  }
}

const subHeaderStyle: TextStyle = {
  fontSize: 18
};

const headerStyle: ViewStyle = {
  paddingHorizontal: 12,
  backgroundColor: colors.darkAccent
};

const headerTextStyle: TextStyle = {
  ...fontSizes.medium,
  ...fonts.Lato.Bold
};

const navIconStyle: TextStyle = {
  fontSize: 25
};

const navIconFocusedStyle: TextStyle = {
  color: colors.navFocusTint
};

const labelStyle: TextStyle = {
  ...fonts.Lato.Bold,
  ...fontSizes.small
};

const headerButtonLabelStyle: TextStyle = {
  color: palette.purple,
  paddingLeft: 3,
  paddingRight: 3,
  ...fonts.Lato.Bold,
  ...fontSizes.medium
};

const headerButtonStyle: TextStyle = {
  flexDirection: "row",
  alignItems: "center"
};

const flagButtonStyle: TextStyle = {
  color: palette.purple
};

const styles = StyleSheet.create({
  header: headerStyle,
  headerText: headerTextStyle,
  subHeader: subHeaderStyle,
  navIcon: navIconStyle,
  navIconFocused: navIconFocusedStyle,
  label: labelStyle,
  headerButton: headerButtonStyle,
  headerButtonLabel: headerButtonLabelStyle,
  flagButton: flagButtonStyle
});

const HeaderTitle: React.StatelessComponent<HeaderProps> = props => {
  return (
    <Text style={[styles.headerText, props.style]}>
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
      ),
      headerStyle: styles.header
    };
  }
};

const StoryList = {
  screen: StoryListScreen,
  navigationOptions: ({ navigation }: any) => {
    return {
      headerTitle: (
        <HeaderTitle title={navigation.getParam("title", "Stories")} />
      ),
      headerStyle: styles.header
    };
  }
};

const OWN_PROFILE = Symbol("OWN_PROFILE");
const Profile: NavigationRouteConfig = {
  screen: ProfileScreen,
  navigationOptions: ({ navigation }: any) => {
    const member = navigation.getParam("member", OWN_PROFILE) as
      | Member
      | typeof OWN_PROFILE;

    const title =
      member !== OWN_PROFILE ? member.get("fullName") : "Your Profile";
    const headerRight =
      member === OWN_PROFILE
        ? settingsButton(navigation)
        : flagButton(navigation, member);

    return {
      headerTitle: <HeaderTitle title={title} />,
      headerRight,
      headerLeft: undefined,
      headerStyle: styles.header
    };
  }
};

const Give = {
  screen: GiveScreen,
  navigationOptions: createHeaderNavigationOptions("Give Raha", true)
};

const FlagMember = {
  screen: FlagMemberPage,
  navigationOptions: createHeaderNavigationOptions("Flag Member", true)
};

const FlagFeed = {
  screen: FlagFeedPage,
  navigationOptions: ({ navigation }: any) => {
    const member = navigation.getParam("member", OWN_PROFILE) as
      | Member
      | typeof OWN_PROFILE;

    const title = `Flags on ${
      member !== OWN_PROFILE
        ? `${member.get("fullName")}'s Profile`
        : "Your Profile"
    }`;
    return createHeaderNavigationOptions(title, true)({ navigation });
  }
};

const ResolveFlagMember = {
  screen: ResolveFlagMemberPage,
  navigationOptions: createHeaderNavigationOptions("Resolve Flag", true)
};

type HeaderProps = {
  title: string;
  subtitle?: string;
  style?: TextStyle;
};

function inviteButton(navigation: any) {
  return (
    <React.Fragment>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => {
          navigation.navigate(RouteName.InvitePage);
        }}
      >
        <Icon style={styles.headerButtonLabel} name="envelope" solid />
        <Text style={styles.headerButtonLabel}>Invite</Text>
      </TouchableOpacity>
    </React.Fragment>
  );
}

function giveButton(navigation: any) {
  return (
    <React.Fragment>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => {
          navigation.navigate(RouteName.GivePage);
        }}
      >
        <Text style={styles.headerButtonLabel}>Give</Text>
        <Icon style={styles.headerButtonLabel} name="paper-plane" solid />
      </TouchableOpacity>
    </React.Fragment>
  );
}

function flagButton(navigation: any, member: Member) {
  return (
    <TouchableOpacity>
      <Icon
        name="flag"
        size={20}
        style={styles.flagButton}
        onPress={() =>
          navigation.navigate(RouteName.FlagMemberPage, {
            memberToFlag: member,
            apiCallId: generateRandomIdentifier()
          })
        }
      />
    </TouchableOpacity>
  );
}

function settingsButton(navigation: any) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(RouteName.AccountPage);
      }}
    >
      <Icon name="ellipsis-h" size={20} />
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
      [RouteName.FlagFeed]: FlagFeed,
      [RouteName.MemberListPage]: MemberList,
      [RouteName.StoryListPage]: StoryList,
      [RouteName.GivePage]: Give,
      [RouteName.FlagMemberPage]: FlagMember,
      [RouteName.ResolveFlagMemberPage]: ResolveFlagMember,
      [RouteName.TipperListPage]: TipperList,
      [RouteName.InvitePage]: {
        // Not needed for Profile tab, but does not hurt
        screen: Invite,
        navigationOptions: {
          header: null
        }
      },
      [RouteName.Verify]: {
        screen: Verify,
        navigationOptions: {
          header: null
        }
      }
    },
    {
      ...stackConfig
    }
  );
}

function createHeaderNavigationOptions(
  title?: string,
  excludeActionButtons?: boolean
) {
  return ({ navigation }: any) => ({
    headerTitle: title ? <HeaderTitle title={title} /> : undefined,
    headerStyle: styles.header,
    ...(excludeActionButtons
      ? {
          headerRight: undefined,
          headerLeft: undefined
        }
      : {
          headerRight: giveButton(navigation),
          headerLeft: inviteButton(navigation)
        })
  });
}

const FeedTab = createNavigatorForTab(
  {
    [RouteName.FeedPage]: {
      screen: Feed,
      navigationOptions: createHeaderNavigationOptions()
    }
  },
  {
    initialRouteName: RouteName.FeedPage
  }
);

const DiscoverTab = createNavigatorForTab(
  {
    [RouteName.DiscoverPage]: {
      screen: Discover,
      navigationOptions: createHeaderNavigationOptions()
    },
    LeaderBoard
  },
  {
    initialRouteName: RouteName.DiscoverPage
  }
);

const WalletTab = createNavigatorForTab(
  {
    [RouteName.WalletPage]: {
      screen: Wallet,
      navigationOptions: createHeaderNavigationOptions()
    },
    [RouteName.ReferralBonusPage]: {
      screen: ReferralBonus,
      navigationOptions: createHeaderNavigationOptions("Referrals", true)
    }
  },
  {
    initialRouteName: RouteName.WalletPage,
    navigationOptions: createHeaderNavigationOptions()
  }
);

const ProfileTab = createNavigatorForTab(
  {
    [RouteName.ProfileTab]: Profile,
    [RouteName.EditMemberPage]: {
      screen: EditMemberPage,
      navigationOptions: createHeaderNavigationOptions("Edit profile", true)
    },
    [RouteName.AccountPage]: {
      screen: AccountSettingsPage,
      navigationOptions: createHeaderNavigationOptions("Account", true)
    },
    [RouteName.Governance]: {
      screen: GovernancePage,
      navigationOptions: createHeaderNavigationOptions(
        "Governance settings",
        true
      )
    },
    [RouteName.AccountRecovery]: {
      screen: AccountRecoveryPage,
      navigationOptions: createHeaderNavigationOptions("Account recovery", true)
    },
    [RouteName.CurrencySettings]: {
      screen: CurrencySettingsPage,
      navigationOptions: createHeaderNavigationOptions("Currency", true)
    },
    [RouteName.SignOut]: {
      screen: SignOutPage,
      navigationOptions: createHeaderNavigationOptions("Sign out", true)
    },
    [RouteName.PendingInvitesPage]: PendingInvites
  },
  {
    initialRouteName: RouteName.ProfileTab
  }
);

const tabRoutes = {
  [RouteName.FeedTab]: FeedTab,
  [RouteName.DiscoverTab]: DiscoverTab,
  [RouteName.WalletTab]: WalletTab,
  [RouteName.ProfileTab]: ProfileTab
};
const tabIcons: { [k in keyof typeof tabRoutes]: string } = {
  [RouteName.ProfileTab]: "user",
  [RouteName.FeedTab]: "list-alt",
  [RouteName.DiscoverTab]: "search",
  [RouteName.WalletTab]: "coins"
};

const SignedInNavigator = createSwitchNavigator(
  {
    [RouteName.InitializationRouter]: {
      screen: (props: NavigationScreenProps) => (
        <InitializationRouter {...props} defaultRoute={RouteName.FeedTab} />
      ),
      navigationOptions: { header: null }
    },
    App: createBottomTabNavigator(tabRoutes, {
      initialRouteName: RouteName.DiscoverTab,
      labeled: true,
      navigationOptions: ({ navigation }: any) => ({
        tabBarIcon: ({ focused }: any) => {
          const routeName = navigation.state
            .routeName as keyof typeof tabRoutes;
          const iconName = tabIcons[routeName];
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
        headerStyle: [
          styles.header,
          {
            backgroundColor: colors.pageBackground
          }
        ],
        tabBarOptions: {
          activeTintColor: colors.navFocusTint,
          labelStyle: styles.label
        },
        tabBarColor: palette.lightGray,
        tabBarOnPress: ({ navigation, defaultHandler }: any) => {
          // If the tab is pressed while there's only one page on the stack, see
          // if the child navigation declared any pageReset function (e.g.
          // scroll feed to the top).
          if (navigation.isFocused() && navigation.state.routes.length === 1) {
            const currentRouteKey = navigation.state.routes[0].key;
            const childNavigation = navigation.getChildNavigation(
              currentRouteKey
            );
            if (childNavigation) {
              const pageReset = childNavigation.getParam("pageReset");
              if (pageReset && typeof pageReset === "function") {
                pageReset();
                return;
              }
            }
          }
          defaultHandler();
        }
      })
    })
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
        initialRouteName: RouteName.LogInPage,
        headerMode: "screen",
        navigationOptions: {
          headerTitle: <HeaderTitle title="Raha" subtitle="Identity Network" />,
          headerStyle: styles.header
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

  // Callback when the tab button is clicked when already highlighted and there
  // are no stacked pages.
  pageReset?: () => void;
};

type Props = OwnProps & StateProps;

type BranchParams = {
  error?: string;
  params?: any;
};

class NavigationView extends React.Component<Props> {
  navigation: any;
  _unsubscribeFromBranch?: () => void;
  _unsubscribeFromNotificationOpen?: () => void;

  componentWillUnmount() {
    if (this._unsubscribeFromBranch) {
      this._unsubscribeFromBranch();
      this._unsubscribeFromBranch = undefined;
    }
    if (this._unsubscribeFromNotificationOpen) {
      this._unsubscribeFromNotificationOpen();
      this._unsubscribeFromNotificationOpen = undefined;
    }
  }

  _processBranchDeeplink = (branchParams: BranchParams) => {
    const { error, params } = branchParams;
    // ({ error, params }) => {
    if (error) {
      console.error("Error from Branch: " + error);
      return;
    }

    if (!params) {
      // params will never be null if error is null, but satisfy Typescript
      return;
    }

    if (params["+non_branch_link"]) {
      const nonBranchUrl = params["+non_branch_link"];
      // Route non-Branch URL if appropriate.
      processDeeplink(nonBranchUrl, this.navigation);
      return;
    }

    if (!params["+clicked_branch_link"]) {
      // Indicates initialization success and some other conditions.
      // No link was opened.
      return;
    }

    if (!params["path"]) {
      console.error("No path was found in Branch deeplink.");
      return;
    }

    // A Branch link was opened.
    // Route link based on data in params.
    routeToPath(params["path"], this.navigation, params);
  };

  async componentDidMount() {
    this._unsubscribeFromBranch = branch.subscribe(this._processBranchDeeplink);
    this._unsubscribeFromNotificationOpen = firebase
      .notifications()
      .onNotificationOpened(this.handleNotificationOpen);
    this.handleNotificationOpen(
      await firebase.notifications().getInitialNotification()
    );
  }

  /**
   * Takes an action based on a notification being opened.
   */
  handleNotificationOpen = async (
    notificationOpen: NotificationOpen | undefined
  ) => {
    if (notificationOpen) {
      const notification = notificationOpen.notification;
      if (notification.data) {
        const { deeplinkUrl } = notification.data;
        if (deeplinkUrl) {
          processDeeplink(deeplinkUrl, this.navigation);
        }
      }
    }
  };

  _setNavigationRef = (ref: any) => {
    // Check ref exists -- on Android, if Activity is popping off via backspace,
    // ref still gets called with an undefined ref.
    if (ref) {
      this.navigation = ref._navigation;
    }
  };

  render() {
    const { hasAccount } = this.props;

    if (hasAccount) {
      return (
        <SignedInNavigator
          ref={this._setNavigationRef}
          onNavigationStateChange={trackPageChanges}
        />
      );
    } else {
      return (
        <SignedOutNavigator
          ref={this._setNavigationRef}
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
