import "es6-symbol/implement";
import * as React from "react";
import { Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Home } from "../pages/Home";
import { LogIn } from "../pages/LogIn";
import { OnboardingCamera } from "../pages/Onboarding/OnboardingCamera";
import { OnboardingSplash } from "../pages/Onboarding/OnboardingSplash";
import { MyProfile } from "../pages/MyProfile";
import { VideoPreview } from "../pages/VideoPreview";
import { getMembersByIds } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { createStackNavigator } from "react-navigation";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { OnboardingInvite } from "../pages/Onboarding/OnboardingInvite";

export enum RouteName {
  Home = "Home",
  OnboardingSplash = "OnboardingSplash",
  OnboardingCamera = "OnboardingCamera",
  OnboardingInvite = "OnboardingInvite",
  LogIn = "LogIn",
  MyProfile = "MyProfile",
  VideoPreview = "VideoPreview",
  Search = "Search",
  Invite = "Invite",
  Give = "Give"
}

const SignedInNavigator = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: Home
    },
    Search: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    Give: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    Invite: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    MyProfile: {
      screen: MyProfile
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.MyProfile,
    labeled: false,
    navigationOptions: ({ navigation }: any) => ({
      tabBarIcon: ({ focused }: any) => {
        const { routeName } = navigation.state;
        let iconName;
        let IconType = Icon;
        switch (routeName) {
          case RouteName.MyProfile:
            iconName = "account";
            break;
          case RouteName.Give:
            iconName = "star";
            break;
          case RouteName.Home:
            iconName = "home";
            break;
          case RouteName.OnboardingCamera:
            iconName = "account-multiple-plus";
            break;
          case RouteName.Invite:
            iconName = "account-multiple-plus";
            break;
          case RouteName.Search:
            iconName = "ios-search";
            IconType = Ionicons;
            break;
          default:
            console.error(`Unrecognized route ${routeName}`);
            break;
        }
        return (
          <IconType
            name={`${iconName}${focused ? "" : "-outline"}`}
            size={25}
            color="black"
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
    MyProfile: {
      screen: MyProfile
    },
    VideoPreview: {
      screen: VideoPreview
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
    const { isLoaded, hasAccount } = this.props;

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
  const firebaseUser = state.authentication.firebaseUser;
  const isLoggedIn =
    state.authentication.isLoaded && !!state.authentication.firebaseUser;
  const hasAccount =
    isLoggedIn &&
    !!state.authentication.firebaseUser &&
    getMembersByIds(state, [state.authentication.firebaseUser.uid])[0] !==
      undefined;
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
