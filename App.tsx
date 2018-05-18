import * as React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { createStackNavigator } from "react-navigation";

import Home from "./src/components/pages/Home";
import LogIn from "./src/components/pages/LogIn";
import Onboarding from "./src/components/pages/Onboarding";
import rootReducer from "./src/reducers";

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

const store = createStore(rootReducer);
const App: React.StatelessComponent<{}> = () => {
  return (
    <Provider store={store}>
      <Navigator />
    </Provider>
  );
};

export default App;
