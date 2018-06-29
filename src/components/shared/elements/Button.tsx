import * as React from "react";
import { Button as NativeButton, ButtonProps } from "react-native-elements";

import { display } from "./displayConstants";

export const Button: React.StatelessComponent<ButtonProps> = props => {
  return <NativeButton fontFamily={display.font} {...props} />;
};
