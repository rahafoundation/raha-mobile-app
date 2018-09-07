import * as React from "react";
import { NavigationScreenProps, NavigationActions } from "react-navigation";
import { Linking } from "react-native";
import { Loading } from "../shared/Loading";
import { RouteName } from "../shared/Navigation";
import { processDeeplink } from "../shared/Deeplinking";

type Props = { defaultRoute: RouteName } & NavigationScreenProps;

export class InitializationRouter extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    // Process deeplink -- we don't use react-navigation for this since it
    // doesn't support HTTPS links.
    Linking.getInitialURL()
      .then(link => {
        if (link) {
          processDeeplink(link, this.props.navigation);
        } else {
          const defaultRoute = this.props.defaultRoute;
          if (defaultRoute) {
            this.props.navigation.navigate(
              "App",
              {},
              NavigationActions.navigate({ routeName: defaultRoute })
            );
          } else {
            console.error("No default route defined for LoadingSplash page.");
          }
        }
      })
      .catch(err =>
        console.error("An error occurred while deep linking:", err)
      );
  }

  public render() {
    return <Loading />;
  }
}
