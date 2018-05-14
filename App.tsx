import * as React from "react";
import { createStackNavigator } from "react-navigation";
import Home from "./src/Home";

export default createStackNavigator({
  Home: {
    screen: Home
  }
});
