import "es6-symbol/implement";
import * as React from "react";
import { Provider } from "react-redux";
import { createStackNavigator } from "react-navigation";

import Home from "./src/components/pages/Home";
import LogIn from "./src/components/pages/LogIn";
import Onboarding from "./src/components/pages/Onboarding";
import createStore from "./src/store";
import { refreshMembers } from "./src/store/actions/members";

export enum RouteName {
  Home = "Home",
  Onboarding = "Onboarding",
  LogIn = "LogIn"
}

const Navigator = createStackNavigator(
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
  } as { [key in RouteName]: any }, // TODO: once react-nav types in, edit
  {
    initialRouteName: "Home"
  }
);

const store = createStore();
export default class App extends React.Component<{}> {
  public componentDidMount() {
    store.dispatch(refreshMembers());
  }

  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}
