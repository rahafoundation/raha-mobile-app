import * as React from "react";
import { createStackNavigator } from "react-navigation";

import Home from "./src/pages/Home";
import LogIn from "./src/pages/LogIn";
import Onboarding from "./src/pages/Onboarding";

export default createStackNavigator(
  {
    Home: {
      screen: Home
    },
    Onboarding: {
      screen: Onboarding
    },
    LogIn: {
      screen: LogIn
    }
  },
  {
    initialRouteName: "Home"
  }
);
