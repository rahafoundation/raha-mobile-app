import "es6-symbol/implement";
import * as React from "react";
import { Provider } from "react-redux";
import { createStackNavigator } from "react-navigation";

import Home from "./src/components/pages/Home";
import LogIn from "./src/components/pages/LogIn";
import Onboarding from "./src/components/pages/Onboarding";
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
