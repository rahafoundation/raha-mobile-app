import "es6-symbol/implement";
import * as React from "react";
import { Button } from "react-native";
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

import { Give } from "../pages/Give";
import { Home } from "../pages/Home";
import { Mint } from "../pages/Mint";
import { LogIn } from "../pages/LogIn";
import { Profile } from "../pages/Profile";
import { InviteVideoPreview } from "../pages/Onboarding/InviteVideoPreview";
import { getMembersByIds } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { MemberList } from "../pages/MemberList";
import { OnboardingCamera } from "../pages/Onboarding/OnboardingCamera";
import { OnboardingSplash } from "../pages/Onboarding/OnboardingSplash";
import { OnboardingInvite } from "../pages/Onboarding/OnboardingInvite";
import { ReferralBonus } from "../pages/ReferralBonus";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";

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
  MintTab = "MintTab",
  ReferralBonus = "ReferralBonus",
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

const ProfileRouteConfig: NavigationRouteConfig = {
  screen: Profile,
  navigationOptions: ({ navigation }: NavigationScreenConfigProps) => {
    const member = navigation.getParam("member");
    return {
      title: member ? member.fullName : "Your Profile"
    };
  }
};

const MintRouteConfig: NavigationRouteConfig = {
  screen: Mint
};

const ReferralBonusRouteConfig: NavigationRouteConfig = {
  screen: ReferralBonus
};

const HomeTab = createStackNavigator(
  {
    Profile: ProfileRouteConfig,
    MemberList: MemberListRouteConfig,
    Give: {
      screen: Give,
      navigationOptions: {
        title: "Give Raha"
      }
    },
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
          />
        )
      })
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

const MintTab = createStackNavigator(
  {
    Mint: MintRouteConfig,
    ReferralBonus: ReferralBonusRouteConfig
  } as { [key in RouteName]: any },
  {
    initialRouteName: RouteName.Mint,
    headerMode: "float"
  }
);

const SignedInNavigator: NavigationContainer = createMaterialBottomTabNavigator(
  {
    HomeTab: {
      screen: HomeTab
    },
    Discover: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    MintTab: {
      screen: MintTab
    },
    ProfileTab: {
      screen: ProfileTab
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
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
          case RouteName.OnboardingCamera:
            iconName = "account-multiple-plus";
            break;
          case RouteName.MintTab:
            iconName = "gift";
            break;
          case RouteName.Discover:
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
  const loggedInMemberId = getLoggedInFirebaseUserId(state);
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
