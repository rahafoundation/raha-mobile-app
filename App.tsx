import "es6-symbol/implement";
import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createStackNavigator } from "react-navigation";
import { AsyncStorage } from "react-native";

import Home from "./src/components/pages/Home";
import LogIn from "./src/components/pages/LogIn";
import OnboardingCamera from "./src/components/pages/OnboardingCamera";
import Onboarding from "./src/components/pages/Onboarding";
import { store, persistor } from "./src/store";
import { refreshMembers } from "./src/store/actions/members";
import VideoPreview from "./src/components/pages/VideoPreview";

export enum RouteName {
  Home = "Home",
  Onboarding = "Onboarding",
  OnboardingCamera = "OnboardingCamera",
  LogIn = "LogIn",
  VideoPreview = "VideoPreview"
}

const Navigator = createStackNavigator(
  {
    Home: {
      screen: Home
    },
    OnboardingCamera: {
      screen: OnboardingCamera
    },
    Onboarding: {
      screen: Onboarding
    },
    LogIn: {
      screen: LogIn
    },
    VideoPreview: {
      screen: VideoPreview
    }
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: "Home"
  }
);

// refresh the members/operations on app start
const onBeforeLift = async () => {
  store.dispatch(refreshMembers());
};

const App: React.StatelessComponent = () => {
  return (
    <Provider store={store}>
      {/* TODO: decide if we should show a loading indicator here. */}
      <PersistGate
        loading={null}
        persistor={persistor}
        onBeforeLift={onBeforeLift}
      >
        <Navigator />
      </PersistGate>
    </Provider>
  );
};
export default App;
