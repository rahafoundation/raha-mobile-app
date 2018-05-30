import "es6-symbol/implement";
import * as React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
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

const { store, persistor } = createStore();
const App: React.StatelessComponent<{}> = () => {
  return (
    <Provider store={store}>
      {/* TODO: decide if we should show a loading indicator here. */}
      <PersistGate loading={null} persistor={persistor}>
        <Navigator />
      </PersistGate>
    </Provider>
  );
};

export default App;
