import * as React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { createStackNavigator } from "react-navigation";

import Home from "./src/pages/Home";
import LogIn from "./src/pages/LogIn";
import Onboarding from "./src/pages/Onboarding";
import createStore from "./src/store";

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
  },
  {
    initialRouteName: "Home"
  }
);

const store = createStore();
const App: React.StatelessComponent<{}> = () => {
  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
};

export default App;
