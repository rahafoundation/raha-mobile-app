import "es6-symbol/implement";
import * as React from "react";
import { Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Give } from "../pages/Give";
import { Home } from "../pages/Home";
import { Mint } from "../pages/Mint";
import { LogIn } from "../pages/LogIn";
import { Profile } from "../pages/Profile";
import { InviteVideoPreview } from "../pages/Onboarding/InviteVideoPreview";
import { getMembersByIds } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { createStackNavigator } from "react-navigation";
import { connect, MapStateToProps } from "react-redux";
import { MemberList } from "../pages/MemberList";
import { OnboardingCamera } from "../pages/Onboarding/OnboardingCamera";
import { OnboardingSplash } from "../pages/Onboarding/OnboardingSplash";
import { OnboardingInvite } from "../pages/Onboarding/OnboardingInvite";
import { getLoggedInMemberId } from "../../store/selectors/authentication";

export enum RouteName {
  Home = "Home",
  HomeTab = "HomeTab",
  InviteVideoPreview = "InviteVideoPreview",
  OnboardingSplash = "OnboardingSplash",
  OnboardingCamera = "OnboardingCamera",
  OnboardingInvite = "OnboardingInvite",
  LogIn = "LogIn",
  MemberList = "MemberList",
  OtherProfile = "OtherProfile",
  Profile = "Profile",
  ProfileTab = "ProfileTab",
  Discover = "Discover",
  Mint = "Mint",
  Give = "Give"
}

const MemberListRouteConfig = {
  screen: MemberList,
  navigationOptions: ({ navigation }: any) => {
    return {
      title: navigation.getParam("title", "Member List")
    };
  }
};

const ProfileRouteConfig = {
  screen: Profile,
  navigationOptions: ({ navigation }: any) => {
    const member = navigation.getParam("member");
    return {
      title: member ? member.fullName : "Your Profile"
    };
  }
};

const HomeTab = createStackNavigator(
  {
    Profile: ProfileRouteConfig,
    MemberList: MemberListRouteConfig,
    Home: {
      screen: Home,
      navigationOptions: ({ navigation }: any) => {
        return {
          title: "Raha"
        };
      }
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.Home,
    headerMode: "float"
  }
);

const ProfileTab = createStackNavigator(
  {
    Profile: ProfileRouteConfig,
    MemberList: MemberListRouteConfig
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.Profile,
    headerMode: "float"
  }
);

const SignedInNavigator = createMaterialBottomTabNavigator(
  {
    HomeTab: {
      screen: HomeTab
    },
    Discover: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    Mint: {
      // TODO: Implement page
      screen: Mint
    },
    ProfileTab: {
      screen: ProfileTab
    },
    Give: {
      screen: Give
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.Mint,
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
          case RouteName.Give:
            iconName = "star";
            break;
          case RouteName.HomeTab:
            iconName = "home";
            break;
          case RouteName.OnboardingCamera:
            iconName = "account-multiple-plus";
            break;
          case RouteName.Mint:
            iconName = "gift";
            break;
          case RouteName.Discover:
            iconName = "ios-search";
            IconType = Ionicons;
            break;
          default:
            throw Error(`Unrecognized route ${routeName}`);
            break;
        }
        const isMint = routeName === RouteName.Mint;
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
    OnboardingCamera: {
      screen: OnboardingCamera
    },
    OnboardingSplash: {
      screen: OnboardingSplash
    },
    OnboardingInvite: {
      screen: OnboardingInvite
    },
    LogIn: {
      screen: LogIn
    },
    Profile: {
      screen: Profile
    },
    InviteVideoPreview: {
      screen: InviteVideoPreview
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
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
  const loggedInMemberId = getLoggedInMemberId(state);
  const isLoggedIn =
    state.authentication.isLoaded && state.authentication.isLoggedIn;
  const hasAccount =
    isLoggedIn &&
    !!loggedInMemberId &&
    getMembersByIds(state, [loggedInMemberId])[0] !== undefined;
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
