import "es6-symbol/implement";
import * as React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import {
  createStackNavigator,
  NavigationContainer,
  NavigationRouteConfig,
  NavigationScreenConfigProps
} from "react-navigation";
import { connect, MapStateToProps } from "react-redux";

import { Give as GiveScreen } from "../pages/Give";
import { Home } from "../pages/Home";
import { Mint } from "../pages/Mint";
import { LogIn } from "../pages/LogIn";
import { Profile as ProfileScreen } from "../pages/Profile";
import { getMemberById } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { MemberList as MemberListScreen } from "../pages/MemberList";
import { Onboarding } from "../pages/Onboarding/Onboarding";
import { ReferralBonus } from "../pages/ReferralBonus";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { Button } from "../shared/elements";
import { Discover, DiscoverWebView } from "../pages/Discover";

export enum RouteName {
  Home = "Home",
  HomeTab = "HomeTab",
  Onboarding = "Onboarding",
  LogIn = "LogIn",
  MemberList = "MemberList",
  OtherProfile = "OtherProfile",
  Profile = "Profile",
  ProfileTab = "ProfileTab",
  Discover = "Discover",
  DiscoverTab = "DiscoverTab",
  DiscoverWebView = "DiscoverWebView",
  Mint = "Mint",
  MintTab = "MintTab",
  ReferralBonus = "ReferralBonus",
  Give = "Give"
}

const MemberList = {
  screen: MemberListScreen,
  navigationOptions: ({ navigation }: any) => {
    return {
      title: navigation.getParam("title", "Member List")
    };
  }
};

const Profile: NavigationRouteConfig = {
  screen: ProfileScreen,
  navigationOptions: ({ navigation }: NavigationScreenConfigProps) => {
    const member = navigation.getParam("member");
    return {
      title: member ? member.fullName : "Your Profile"
    };
  }
};

const Give = {
  screen: GiveScreen,
  navigationOptions: {
    title: "Give Raha"
  }
};

const HomeTab = createStackNavigator(
  {
    Profile,
    MemberList,
    Give,
    Home: {
      screen: Home,
      navigationOptions: ({ navigation }: any) => ({
        title: "Raha",
        headerRight: (
          <Button
            title="Give"
            onPress={() => {
              navigation.navigate(RouteName.Give);
            }}
            buttonStyle={{ backgroundColor: "#2196F3" }}
            //@ts-ignore Because Button does have a rounded property
            rounded
          />
        )
      })
    }
  },
  {
    initialRouteName: RouteName.Home
  }
);

const DiscoverTab = createStackNavigator(
  {
    Discover: {
      screen: Discover,
      navigationOptions: { title: "Discover" }
    },
    DiscoverWebView
  },
  {
    initialRouteName: RouteName.Discover
  }
);

const MintTab = createStackNavigator(
  {
    Mint: {
      screen: Mint,
      navigationOptions: {
        title: "Mint Raha"
      }
    },
    ReferralBonus: {
      screen: ReferralBonus,
      navigationOptions: {
        title: "Bonus Mint!"
      }
    },
    Profile,
    MemberList
  },
  {
    initialRouteName: RouteName.Mint
  }
);

const ProfileTab = createStackNavigator(
  {
    Profile,
    MemberList
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
    initialRouteName: RouteName.MintTab,
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
        return (
          <IconType
            name={iconName}
            size={25}
            color={focused && isMint ? "green" : "black"}
          />
        );
      },
      labelStyle: {
        color: "black"
      },
      tabBarColor: "#eeeeee"
    })
  }
);

const SignedOutNavigator = createStackNavigator(
  {
    Onboarding,
    LogIn,
    Profile
  },
  {
    headerMode: "screen",
    initialRouteName: RouteName.LogIn
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
      return <SignedInNavigator />;
    } else {
      return <SignedOutNavigator />;
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
    hasAccount,
    existingAuthMethod: state.authentication.isLoaded
      ? undefined
      : state.authentication.existingAuthMethod
  };
};

export const Navigation = connect(
  mapStateToProps,
  {}
)(NavigationView);
