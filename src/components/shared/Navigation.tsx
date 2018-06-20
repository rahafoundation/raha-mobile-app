import "es6-symbol/implement";
import * as React from "react";
import { Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Give } from "../pages/Give";
import { Home } from "../pages/Home";
import { LogIn } from "../pages/LogIn";
import { Profile } from "../pages/Profile";
import { VideoPreview } from "../pages/VideoPreview";
import { getMembersByIds } from "../../../src/store/selectors/members";
import { RahaState } from "../../../src/store";
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";
import { createStackNavigator } from "react-navigation";
import { connect, MapStateToProps } from "react-redux";
import { MemberList } from "../pages/MemberList";
import { OnboardingCamera } from "../pages/Onboarding/OnboardingCamera";
import { OnboardingSplash } from "../pages/Onboarding/OnboardingSplash";
import { OnboardingInvite } from "../pages/Onboarding/OnboardingInvite";

export enum RouteName {
  Home = "Home",
  OnboardingSplash = "OnboardingSplash",
  OnboardingCamera = "OnboardingCamera",
  OnboardingInvite = "OnboardingInvite",
  LogIn = "LogIn",
  MemberList = "MemberList",
  OtherProfile = "OtherProfile",
  Profile = "Profile",
  VideoPreview = "VideoPreview",
  Search = "Search",
  Invite = "Invite",
  Give = "Give"
}

const ProfileNavigator = createStackNavigator(
  {
    Profile: {
      screen: Profile,
      navigationOptions: ({ navigation }: any) => {
        const member = navigation.getParam("member");
        const person = member ? `${member.fullName}'s` : "My";
        return {
          title: `${person} Profile`
        };
      }
    },
    MemberList: {
      screen: MemberList,
      navigationOptions: ({ navigation }: any) => {
        return {
          title: navigation.getParam("title", "Member List")
        };
      }
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.Profile,
    headerMode: "float"
  }
);

const SignedInNavigator = createMaterialBottomTabNavigator(
  {
    Home: {
      screen: Home
    },
    Search: {
      // TODO: Implement page
      screen: OnboardingCamera
    },
    Invite: {
      // TODO: Implement page
      screen: OnboardingSplash
    },
    Profile: {
      screen: ProfileNavigator
    },
    Give: {
      screen: Give
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: RouteName.Home,
    labeled: false,
    navigationOptions: ({ navigation }: any) => ({
      tabBarIcon: ({ focused }: any) => {
        const { routeName } = navigation.state;
        let iconName;
        let IconType = Icon;
        switch (routeName) {
          case RouteName.Profile:
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
            iconName = "gift";
            break;
          case RouteName.Search:
            iconName = "ios-search";
            IconType = Ionicons;
            break;
          default:
            throw Error(`Unrecognized route ${routeName}`);
            break;
        }
        const isInvite = routeName === RouteName.Invite;
        if (!focused && !isInvite) {
          iconName += "-outline";
        }
        return (
          <IconType
            name={iconName}
            size={25}
            color={focused && isInvite ? "pink" : "black"}
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
